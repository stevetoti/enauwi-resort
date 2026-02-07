'use client';

import { useState, useEffect, useCallback } from 'react';
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

const statusConfig: Record<string, { label: string; emoji: string; bg: string; text: string; action: string; actionBg: string }> = {
  pending: { 
    label: 'New Order', 
    emoji: '🔔', 
    bg: 'bg-amber-50 border-amber-300', 
    text: 'text-amber-800',
    action: '✓ Accept Order',
    actionBg: 'bg-green-500 hover:bg-green-600 active:bg-green-700'
  },
  accepted: { 
    label: 'Accepted', 
    emoji: '✅', 
    bg: 'bg-blue-50 border-blue-300', 
    text: 'text-blue-800',
    action: '👨‍🍳 Start Cooking',
    actionBg: 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700'
  },
  preparing: { 
    label: 'Cooking', 
    emoji: '👨‍🍳', 
    bg: 'bg-orange-50 border-orange-300', 
    text: 'text-orange-800',
    action: '🍽️ Mark Ready',
    actionBg: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700'
  },
  ready: { 
    label: 'Ready!', 
    emoji: '🍽️', 
    bg: 'bg-emerald-50 border-emerald-400', 
    text: 'text-emerald-800',
    action: '🚶 Start Delivery',
    actionBg: 'bg-purple-500 hover:bg-purple-600 active:bg-purple-700'
  },
  delivering: { 
    label: 'Delivering', 
    emoji: '🚶', 
    bg: 'bg-purple-50 border-purple-300', 
    text: 'text-purple-800',
    action: '✨ Delivered',
    actionBg: 'bg-sky-500 hover:bg-sky-600 active:bg-sky-700'
  },
  delivered: { 
    label: 'Done', 
    emoji: '✨', 
    bg: 'bg-gray-100 border-gray-300', 
    text: 'text-gray-600',
    action: '',
    actionBg: ''
  },
};

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('active');
  const [updating, setUpdating] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
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
  }, [filter]);

  useEffect(() => {
    loadOrders();
    
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

    const interval = setInterval(loadOrders, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [loadOrders]);

  async function updateStatus(orderId: string, currentStatus: string) {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex < statusFlow.length - 1) {
      setUpdating(orderId);
      
      const nextStatus = statusFlow[currentIndex + 1];
      const updateData: Record<string, unknown> = { status: nextStatus };
      
      const timestampKey = `${nextStatus}_at`;
      updateData[timestampKey] = new Date().toISOString();
      
      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);
      
      if (error) {
        console.error('Error updating order:', error);
        alert('Error updating order. Please try again.');
      } else {
        // Immediately update local state for instant feedback
        setOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, status: nextStatus } : o
        ));
      }
      
      setUpdating(null);
    }
  }

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  function getTimeAgo(dateStr: string) {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">🍳</span>
                Kitchen Dashboard
              </h1>
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold animate-pulse shadow-lg shadow-red-500/30">
                  {pendingCount} NEW
                </span>
              )}
            </div>
            
            {/* Filter Tabs */}
            <div className="flex bg-slate-700/50 rounded-xl p-1">
              {[
                { key: 'active', label: `Active (${activeOrders.length})` },
                { key: 'completed', label: 'Completed' },
                { key: 'all', label: 'All' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === tab.key 
                      ? 'bg-sky-500 text-white shadow-lg' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Orders Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin text-6xl mb-4">🍳</div>
            <p className="text-slate-400 text-lg">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🍽️</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Orders Yet</h2>
            <p className="text-slate-400">Orders will appear here when guests place them</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {orders.map(order => {
              const config = statusConfig[order.status] || statusConfig.pending;
              const isUpdating = updating === order.id;
              const waitingForGuest = order.status === 'ready' && !order.delivery_location;
              
              return (
                <div 
                  key={order.id} 
                  className={`rounded-2xl border-2 overflow-hidden transition-all hover:scale-[1.02] ${
                    order.status === 'pending' 
                      ? 'border-amber-400 shadow-lg shadow-amber-500/20 animate-pulse' 
                      : 'border-slate-600/50 hover:border-slate-500'
                  } bg-slate-800/80 backdrop-blur`}
                >
                  {/* Order Header */}
                  <div className={`px-5 py-4 border-b-2 ${config.bg} ${config.text}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{config.emoji}</span>
                          <span className="font-bold text-lg">{config.label}</span>
                        </div>
                        <div className="text-2xl font-black">
                          #{order.order_number}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">🚪 {order.room_number}</div>
                        <div className="text-sm opacity-75">{getTimeAgo(order.created_at)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-5">
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-white">
                          <span className="bg-sky-500 text-white text-sm font-bold w-7 h-7 rounded-lg flex items-center justify-center">
                            {item.quantity}
                          </span>
                          <span className="flex-1">{item.menu_items?.name}</span>
                        </div>
                      ))}
                    </div>

                    {/* Guest Name */}
                    <div className="text-slate-400 text-sm mb-3">
                      👤 {order.guest_name}
                    </div>

                    {/* Special Instructions */}
                    {order.special_instructions && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4">
                        <div className="text-amber-400 text-sm font-semibold mb-1">📝 Special Request:</div>
                        <div className="text-amber-200 text-sm">{order.special_instructions}</div>
                      </div>
                    )}

                    {/* Delivery Location */}
                    {order.delivery_location && (
                      <div className={`rounded-xl p-3 mb-4 text-center font-semibold ${
                        order.delivery_location === 'room' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {order.delivery_location === 'room' 
                          ? `🛏️ Deliver to Room ${order.room_number}`
                          : '🍽️ Guest will collect'}
                      </div>
                    )}

                    {/* Waiting for guest choice */}
                    {waitingForGuest && (
                      <div className="bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl p-3 mb-4 text-center">
                        <div className="animate-pulse">⏳ Waiting for guest to choose delivery...</div>
                      </div>
                    )}

                    {/* Footer with total and action */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                      <div className="text-white">
                        <span className="text-slate-400 text-sm">Total: </span>
                        <span className="text-xl font-bold">{order.total_amount?.toLocaleString()} VT</span>
                      </div>
                      
                      {order.status !== 'delivered' && order.status !== 'cancelled' && !waitingForGuest && (
                        <button
                          onClick={() => updateStatus(order.id, order.status)}
                          disabled={isUpdating}
                          className={`px-5 py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${config.actionBg}`}
                        >
                          {isUpdating ? (
                            <span className="flex items-center gap-2">
                              <span className="animate-spin">⏳</span>
                              Updating...
                            </span>
                          ) : (
                            config.action
                          )}
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

      {/* Refresh indicator */}
      <div className="fixed bottom-4 right-4 text-slate-500 text-sm">
        Auto-refreshes every 30s
      </div>
    </div>
  );
}
