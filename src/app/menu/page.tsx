'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  is_vegetarian: boolean;
  prep_time_mins: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu() {
    const [catRes, itemRes] = await Promise.all([
      supabase.from('menu_categories').select('*').order('sort_order'),
      supabase.from('menu_items').select('*').eq('is_available', true).order('sort_order')
    ]);
    
    if (catRes.data) setCategories(catRes.data);
    if (itemRes.data) setMenuItems(itemRes.data);
    setLoading(false);
  }

  function addToCart(item: MenuItem) {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function removeFromCart(itemId: string) {
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== itemId);
    });
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  async function submitOrder() {
    if (!guestName || !roomNumber) {
      alert('Please enter your name and room number');
      return;
    }
    
    setSubmitting(true);
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        guest_name: guestName,
        room_number: roomNumber,
        phone: phone,
        special_instructions: instructions,
        total_amount: cartTotal,
        status: 'pending'
      })
      .select()
      .single();
    
    if (orderError || !order) {
      alert('Error creating order. Please try again.');
      setSubmitting(false);
      return;
    }
    
    const orderItems = cart.map(item => ({
      order_id: order.id,
      menu_item_id: item.id,
      quantity: item.quantity,
      unit_price: item.price
    }));
    
    await supabase.from('order_items').insert(orderItems);
    
    setOrderSuccess(order.id);
    setCart([]);
    setSubmitting(false);
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Submitted!</h1>
          <p className="text-gray-600 mb-6">Your order has been sent to our kitchen.</p>
          <Link 
            href={`/order/${orderSuccess}`}
            className="block w-full bg-sky-600 text-white py-3 rounded-xl font-semibold hover:bg-sky-700 transition mb-4"
          >
            Track Your Order 📍
          </Link>
          <button 
            onClick={() => setOrderSuccess(null)}
            className="text-sky-600 hover:underline"
          >
            Order More
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-sky-800">
            🏝️ E&apos;Nauwi
          </Link>
          <button 
            onClick={() => setShowCart(true)}
            className="relative bg-sky-600 text-white px-4 py-2 rounded-full font-semibold"
          >
            🛒 Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Restaurant Menu</h1>
        <p className="text-gray-600 mb-8">Fresh local flavors delivered to your room or enjoy at our restaurant</p>

        {loading ? (
          <div className="text-center py-12">Loading menu...</div>
        ) : (
          categories.map(category => (
            <section key={category.id} className="mb-10">
              <h2 className="text-2xl font-bold text-sky-800 mb-4">{category.name}</h2>
              <div className="grid gap-4">
                {menuItems
                  .filter(item => item.category_id === category.id)
                  .map(item => (
                    <div key={item.id} className="bg-white rounded-xl shadow-md p-4 flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {item.name}
                          {item.is_vegetarian && <span className="ml-2 text-green-600">🌱</span>}
                        </h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                        <p className="text-xs text-gray-400 mt-1">⏱️ {item.prep_time_mins} mins</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-sky-800 mb-2">{item.price.toLocaleString()} VT</p>
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-sky-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-sky-700 transition"
                        >
                          Add +
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          ))
        )}
      </main>

      {showCart && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Order</h2>
                <button onClick={() => setShowCart(false)} className="text-2xl">✕</button>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-3 border-b">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.price.toLocaleString()} VT × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 bg-gray-200 rounded-full">-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => addToCart(item)} className="w-8 h-8 bg-sky-600 text-white rounded-full">+</button>
                      </div>
                    </div>
                  ))}

                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between text-xl font-bold mb-6">
                      <span>Total</span>
                      <span>{cartTotal.toLocaleString()} VT</span>
                    </div>

                    <input
                      type="text"
                      placeholder="Your Name *"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      className="w-full border rounded-lg px-4 py-2 mb-3"
                    />
                    <input
                      type="text"
                      placeholder="Room Number *"
                      value={roomNumber}
                      onChange={e => setRoomNumber(e.target.value)}
                      className="w-full border rounded-lg px-4 py-2 mb-3"
                    />
                    <input
                      type="tel"
                      placeholder="Phone (optional)"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full border rounded-lg px-4 py-2 mb-3"
                    />
                    <textarea
                      placeholder="Special instructions..."
                      value={instructions}
                      onChange={e => setInstructions(e.target.value)}
                      className="w-full border rounded-lg px-4 py-2 mb-4"
                      rows={2}
                    />

                    <button
                      onClick={submitOrder}
                      disabled={submitting}
                      className="w-full bg-sky-600 text-white py-3 rounded-xl font-semibold hover:bg-sky-700 transition disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Order 🍽️'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
