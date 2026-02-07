'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

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
  special_instructions: string;
  total_amount: number;
  created_at: string;
}

interface OrderWithItems extends Order {
  items: {
    quantity: number;
    menu_items: { name: string };
  }[];
}

const statusFlow = ['pending', 'accepted', 'preparing', 'ready', 'delivering', 'delivered'];

const statusLabels: Record<string, { label: string; emoji: string; color: string }> = {
  pending: { label: 'New Order', emoji: '🔔', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  accepted: { label: 'Accepted', emoji: '✅', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  preparing: { label: 'Cooking', emoji: '👨‍🍳', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  ready: { label: 'Ready', emoji: '🍽️', color: 'bg-green-100 text-green-800 border-green-300' },
  delivering: { label: 'Delivering', emoji: '🚶', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  delivered: { label: 'Completed', emoji: '✨', color: 'bg-gray-100 text-gray-600 border-gray-300' },
};

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('active');

  useEffect(() => {
    loadOrders();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('kitchen-orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders'
      }, () => {
        loadOrders();
      })
      .subscribe();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadOrders, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [filter]);

  async function loadOrders() {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (filter === 'active') {
      query = query.not('status', 'eq', 'delivered').not('status', 'eq', 'cancelled');
    } else if (filter === 'completed') {
      query = query.eq('status', 'delivered');
    }

    const { data: ordersData } = await query;
    
    if (ordersData) {
      // Load items for each order
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('quantity, menu_items(name)')
            .eq('order_id', order.id);
          return { ...order, items: items || [] };
        })
      );
      setOrders(ordersWithItems);
    }
    
    setLoading(false);
  }

  async function updateStatus(orderId: string, currentStatus: string) {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIndex + 1];
      const updateData: Record<string, unknown> = { status: nextStatus };
      
      // Add timestamp for the status change
      const timestampKey = `${nextStatus}_at`;
      updateData[timestampKey] = new Date().toISOString();
      
      await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);
    }
  }

  function getNextAction(status: string): string {
    const actions: Record<string, string> = {
      pending: 'Accept Order',
      accepted: 'Start Cooking',
      preparing: 'Mark Ready',
      ready: 'Start Delivery',
      delivering: 'Mark Delivered',
    };
    return actions[status] || '';
  }

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">🍳 Kitchen Dashboard</h1>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                {pendingCount} NEW
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'active' ? 'bg-sky-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Active ({activeOrders.length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'completed' ? 'bg-sky-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'all' ? 'bg-sky-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </header>

      {/* Orders Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-gray-400">No orders yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map(order => {
              const statusInfo = statusLabels[order.status] || statusLabels.pending;
              
              return (
                <div 
                  key={order.id} 
                  className={`rounded-xl border-2 overflow-hidden ${
                    order.status === 'pending' ? 'border-yellow-500 animate-pulse' : 'border-gray-700'
                  } bg-gray-800`}
                >
                  {/* Order Header */}
                  <div className={`px-4 py-3 ${statusInfo.color} border-b`}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">
                        #{order.order_number} • Room {order.room_number}
                      </span>
                      <span className="text-2xl">{statusInfo.emoji}</span>
                    </div>
                    <div className="text-sm opacity-80">
                      {order.guest_name} • {new Date(order.created_at).toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4">
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span>
                            <span className="font-bold text-sky-400">{item.quantity}×</span>{' '}
                            {item.menu_items?.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.special_instructions && (
                      <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-2 mb-4 text-sm">
                        <span className="font-semibold">📝 Note:</span> {order.special_instructions}
                      </div>
                    )}

                    {order.delivery_location && (
                      <div className="bg-gray-700 rounded-lg p-2 mb-4 text-sm text-center">
                        {order.delivery_location === 'room' 
                          ? `🛏️ Room Delivery to ${order.room_number}`
                          : '🍽️ Restaurant Pickup'}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                      <span className="font-bold">{order.total_amount?.toLocaleString()} VT</span>
                      
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => updateStatus(order.id, order.status)}
                          disabled={order.status === 'ready' && !order.delivery_location}
                          className={`px-4 py-2 rounded-lg font-semibold transition ${
                            order.status === 'pending'
                              ? 'bg-green-600 hover:bg-green-700'
                              : order.status === 'ready' && !order.delivery_location
                              ? 'bg-gray-600 cursor-not-allowed'
                              : 'bg-sky-600 hover:bg-sky-700'
                          }`}
                        >
                          {order.status === 'ready' && !order.delivery_location
                            ? 'Waiting for guest...'
                            : getNextAction(order.status)}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Sound notification for new orders */}
      {pendingCount > 0 && (
        <audio autoPlay loop>
          <source src="/notification.mp3" type="audio/mpeg" />
        </audio>
      )}
    </div>
  );
}
