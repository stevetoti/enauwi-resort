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
  { key: 'pending', label: 'Order Received', emoji: '📝', desc: 'We got your order' },
  { key: 'accepted', label: 'Accepted', emoji: '✅', desc: 'Kitchen confirmed' },
  { key: 'preparing', label: 'Preparing', emoji: '👨‍🍳', desc: 'Cooking your food' },
  { key: 'ready', label: 'Ready', emoji: '🍽️', desc: 'Food is ready!' },
  { key: 'delivering', label: 'On the Way', emoji: '🚶', desc: 'Coming to your room' },
  { key: 'delivered', label: 'Delivered', emoji: '✨', desc: 'Enjoy your meal!' },
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🍽️</div>
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center p-4">
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
  
  // Filter steps based on delivery location
  const visibleSteps = order.delivery_location === 'restaurant' 
    ? statusSteps.filter(s => !['delivering'].includes(s.key))
    : statusSteps;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/menu" className="text-sky-600 font-semibold">
            ← Menu
          </Link>
          <span className="text-sm text-gray-500">Order #{order.order_number}</span>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Current Status Hero */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center">
          <div className="text-6xl mb-3 animate-bounce">
            {statusSteps[currentStepIndex]?.emoji || '📝'}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            {statusSteps[currentStepIndex]?.label || 'Processing'}
          </h1>
          <p className="text-gray-500">
            {statusSteps[currentStepIndex]?.desc}
          </p>
        </div>

        {/* Delivery Choice - Full Width Mobile Buttons */}
        {showDeliveryChoice && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 mb-6">
            <h3 className="font-bold text-center text-orange-800 mb-4 text-lg">
              🍽️ Where would you like to eat?
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => selectDeliveryLocation('restaurant')}
                className="w-full bg-white border-2 border-sky-600 text-sky-800 py-4 rounded-xl font-semibold text-lg hover:bg-sky-50 transition flex items-center justify-center gap-3"
              >
                <span className="text-2xl">🍽️</span>
                <span>Eat at Restaurant</span>
              </button>
              <button
                onClick={() => selectDeliveryLocation('room')}
                className="w-full bg-sky-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-sky-700 transition flex items-center justify-center gap-3"
              >
                <span className="text-2xl">🛏️</span>
                <span>Deliver to Room {order.room_number}</span>
              </button>
            </div>
          </div>
        )}

        {/* Delivery Location Banner */}
        {order.delivery_location && (
          <div className={`rounded-xl p-4 mb-6 text-center ${
            order.delivery_location === 'room' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            <span className="text-lg font-semibold">
              {order.delivery_location === 'room' 
                ? `🛏️ Delivering to Room ${order.room_number}`
                : '🍽️ Collect at Restaurant'}
            </span>
          </div>
        )}

        {/* Vertical Progress Steps - Mobile Optimized */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <h2 className="font-bold text-gray-700 mb-4">Order Progress</h2>
          <div className="space-y-1">
            {visibleSteps.map((step, index) => {
              const stepIndex = statusSteps.findIndex(s => s.key === step.key);
              const isCompleted = stepIndex < currentStepIndex;
              const isCurrent = stepIndex === currentStepIndex;
              const isPending = stepIndex > currentStepIndex;

              return (
                <div key={step.key} className="flex items-start gap-4">
                  {/* Step indicator line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isCurrent 
                        ? 'bg-sky-600 text-white ring-4 ring-sky-200' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {isCompleted ? '✓' : step.emoji}
                    </div>
                    {/* Connecting line */}
                    {index < visibleSteps.length - 1 && (
                      <div className={`w-0.5 h-8 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  
                  {/* Step content */}
                  <div className={`flex-1 pb-6 ${isPending ? 'opacity-50' : ''}`}>
                    <p className={`font-semibold ${
                      isCurrent ? 'text-sky-800' : isCompleted ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary - Collapsible for Mobile */}
        <details className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <summary className="p-4 font-bold text-gray-700 cursor-pointer hover:bg-gray-50">
            📋 Order Details ({items.length} items)
          </summary>
          <div className="px-4 pb-4 border-t">
            <div className="py-3 space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-gray-700">
                    <span className="font-semibold text-sky-600">{item.quantity}×</span> {item.menu_items?.name}
                  </span>
                  <span className="text-gray-600">{(item.unit_price * item.quantity).toLocaleString()} VT</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-lg pt-3 border-t">
              <span>Total</span>
              <span className="text-sky-800">{order.total_amount?.toLocaleString()} VT</span>
            </div>
          </div>
        </details>

        {/* Guest Info */}
        <div className="text-center text-sm text-gray-500 mb-6">
          <p>{order.guest_name} • Room {order.room_number}</p>
        </div>

        {/* Action Button */}
        <Link 
          href="/menu"
          className="block w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold text-center hover:bg-gray-200 transition"
        >
          ← Order More Food
        </Link>
      </main>
    </div>
  );
}
