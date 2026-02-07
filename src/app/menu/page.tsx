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

  // Order Success Screen - Mobile Optimized
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="text-7xl mb-4 animate-bounce">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Sent!</h1>
          <p className="text-gray-600 mb-8">Your order is on its way to the kitchen</p>
          <Link 
            href={`/order/${orderSuccess}`}
            className="block w-full bg-sky-600 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-sky-700 transition mb-4"
          >
            Track Order 📍
          </Link>
          <button 
            onClick={() => setOrderSuccess(null)}
            className="w-full text-sky-600 py-3 font-semibold hover:underline"
          >
            Order More Food
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏝️</span>
            <span className="font-bold text-sky-800">E&apos;Nauwi</span>
          </Link>
          <div className="text-sm text-gray-500">
            Room Service
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white px-4 py-6">
        <h1 className="text-2xl font-bold mb-1">Restaurant Menu</h1>
        <p className="text-sky-100 text-sm">Fresh local flavors • Delivered to your room</p>
      </div>

      {/* Menu Content */}
      <main className="px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">🍽️</div>
            <p className="text-gray-500">Loading menu...</p>
          </div>
        ) : (
          categories.map(category => (
            <section key={category.id} className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                {category.name === 'Breakfast' && '🌅'}
                {category.name === 'Main Courses' && '🍛'}
                {category.name === 'Drinks' && '🥤'}
                {category.name === 'Desserts' && '🍨'}
                {category.name}
              </h2>
              <div className="space-y-3">
                {menuItems
                  .filter(item => item.category_id === category.id)
                  .map(item => {
                    const inCart = cart.find(c => c.id === item.id);
                    return (
                      <div 
                        key={item.id} 
                        className="bg-white rounded-2xl shadow-sm p-4 active:scale-[0.98] transition"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 text-lg">
                              {item.name}
                              {item.is_vegetarian && <span className="ml-2 text-green-600">🌱</span>}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="font-bold text-sky-700 text-lg">{item.price.toLocaleString()} VT</span>
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                ⏱️ {item.prep_time_mins}min
                              </span>
                            </div>
                          </div>
                          
                          {/* Add/Remove Buttons */}
                          <div className="flex flex-col items-center">
                            {inCart ? (
                              <div className="flex items-center gap-2 bg-sky-50 rounded-full p-1">
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-lg font-bold text-gray-600 active:bg-gray-100"
                                >
                                  −
                                </button>
                                <span className="w-6 text-center font-bold text-sky-800">{inCart.quantity}</span>
                                <button
                                  onClick={() => addToCart(item)}
                                  className="w-10 h-10 bg-sky-600 rounded-full shadow-sm flex items-center justify-center text-lg font-bold text-white active:bg-sky-700"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(item)}
                                className="w-12 h-12 bg-sky-600 rounded-full shadow-md flex items-center justify-center text-xl font-bold text-white active:bg-sky-700 transition"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Fixed Bottom Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
          <button
            onClick={() => setShowCart(true)}
            className="w-full bg-sky-600 text-white py-4 rounded-2xl font-semibold text-lg flex items-center justify-between px-6 active:bg-sky-700 transition"
          >
            <span className="flex items-center gap-2">
              <span className="bg-white text-sky-600 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
                {cartCount}
              </span>
              <span>View Cart</span>
            </span>
            <span>{cartTotal.toLocaleString()} VT</span>
          </button>
        </div>
      )}

      {/* Full Screen Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* Cart Header */}
          <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between">
            <button 
              onClick={() => setShowCart(false)} 
              className="text-sky-600 font-semibold text-lg"
            >
              ← Back
            </button>
            <h2 className="text-lg font-bold">Your Order</h2>
            <div className="w-16" />
          </div>

          <div className="overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
            <div className="p-4">
              {/* Cart Items */}
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <div className="space-y-4 mb-6">
                  {cart.map(item => (
                    <div key={item.id} className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-sky-700 font-bold">{(item.price * item.quantity).toLocaleString()} VT</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => removeFromCart(item.id)} 
                            className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-xl active:bg-gray-100"
                          >
                            −
                          </button>
                          <span className="font-bold text-lg w-6 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => addToCart(item)} 
                            className="w-10 h-10 bg-sky-600 text-white rounded-full shadow-sm flex items-center justify-center text-xl active:bg-sky-700"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Guest Details Form */}
              {cart.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-700">Your Details</h3>
                  <input
                    type="text"
                    placeholder="Your Name *"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-sky-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Room Number *"
                    value={roomNumber}
                    onChange={e => setRoomNumber(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-sky-500 focus:outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-sky-500 focus:outline-none"
                  />
                  <textarea
                    placeholder="Special requests (allergies, etc.)"
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-sky-500 focus:outline-none"
                    rows={2}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Fixed Bottom Checkout */}
          {cart.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">Total</span>
                <span className="text-2xl font-bold text-sky-800">{cartTotal.toLocaleString()} VT</span>
              </div>
              <button
                onClick={submitOrder}
                disabled={submitting || !guestName || !roomNumber}
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed active:bg-green-700 transition"
              >
                {submitting ? 'Sending...' : 'Send Order 🍽️'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
