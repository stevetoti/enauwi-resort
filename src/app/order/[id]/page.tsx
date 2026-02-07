'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Order {
  id: string;
  order_number: number;
  guest_name: string;
  room_number: string;
  status: string;
  delivery_location: string | null;
  total_amount: number;
  created_at: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  menu_items: {
    name: string;
  };
}

const statusSteps = [
  { key: 'pending', label: 'Order Received', emoji: '📝' },
  { key: 'accepted', label: 'Accepted', emoji: '✅' },
  { key: 'preparing', label: 'Preparing', emoji: '👨‍🍳' },
  { key: 'ready', label: 'Ready', emoji: '🍽️' },
  { key: 'delivering', label: 'Bringing to Room', emoji: '🚶' },
  { key: 'delivered', label: 'Delivered', emoji: '✨' },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setDeliveryChoice] = useState<string | null>(null);

  useEffect(() => {
    loadOrder();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('order-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      }, payload => {
        setOrder(payload.new as Order);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  async function loadOrder() {
    const [orderRes, itemsRes] = await Promise.all([
      supabase.from('orders').select('*').eq('id', orderId).single(),
      supabase.from('order_items').select('*, menu_items(name)').eq('order_id', orderId)
    ]);
    
    if (orderRes.data) setOrder(orderRes.data);
    if (itemsRes.data) setItems(itemsRes.data);
    setLoading(false);
  }

  async function selectDeliveryLocation(location: 'restaurant' | 'room') {
    setDeliveryChoice(location);
    await supabase
      .from('orders')
      .update({ delivery_location: location })
      .eq('id', orderId);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center">
        <div className="text-xl">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h1>
          <Link href="/menu" className="text-sky-600 hover:underline">Back to Menu</Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);
  const showDeliveryChoice = order.status === 'ready' && !order.delivery_location;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-bold text-sky-800">
            🏝️ E&apos;Nauwi
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">
              {statusSteps[currentStepIndex]?.emoji || '📝'}
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              {statusSteps[currentStepIndex]?.label || 'Processing'}
            </h1>
            <p className="text-gray-500">Order #{order.order_number}</p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {statusSteps.slice(0, order.delivery_location === 'restaurant' ? 4 : 6).map((step, index) => (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mb-1 ${
                  index <= currentStepIndex 
                    ? 'bg-sky-600 text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {index < currentStepIndex ? '✓' : step.emoji}
                </div>
                <span className={`text-xs text-center ${
                  index <= currentStepIndex ? 'text-sky-800 font-semibold' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Delivery Choice */}
          {showDeliveryChoice && (
            <div className="bg-sky-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-center mb-3">Where would you like to eat?</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => selectDeliveryLocation('restaurant')}
                  className="bg-white border-2 border-sky-600 text-sky-800 py-3 rounded-xl font-semibold hover:bg-sky-50 transition"
                >
                  🍽️ Restaurant
                </button>
                <button
                  onClick={() => selectDeliveryLocation('room')}
                  className="bg-sky-600 text-white py-3 rounded-xl font-semibold hover:bg-sky-700 transition"
                >
                  🛏️ Room Delivery
                </button>
              </div>
            </div>
          )}

          {order.delivery_location && (
            <div className="bg-green-50 rounded-xl p-3 mb-6 text-center">
              <span className="text-green-800">
                {order.delivery_location === 'room' 
                  ? '🛏️ Delivering to Room ' + order.room_number
                  : '🍽️ Please collect at Restaurant'}
              </span>
            </div>
          )}

          {/* Order Details */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Order Details</h3>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.menu_items?.name} × {item.quantity}</span>
                  <span>{(item.unit_price * item.quantity).toLocaleString()} VT</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold mt-4 pt-4 border-t">
              <span>Total</span>
              <span>{order.total_amount?.toLocaleString()} VT</span>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Guest: {order.guest_name}</p>
            <p>Room: {order.room_number}</p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/menu" className="text-sky-600 hover:underline">
            ← Order More
          </Link>
        </div>
      </main>
    </div>
  );
}
