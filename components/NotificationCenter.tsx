'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Notification {
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    action_url?: string;
}

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const supabase = createClient();

    const fetchNotifications = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (!error && data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
    }, [supabase]);

    useEffect(() => {
        fetchNotifications();

        // Setup real-time subscription
        const channel = supabase
            .channel('notifications_realtime')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                () => {
                    fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, fetchNotifications]);

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-text-secondary hover:text-white transition flex items-center justify-center h-10 w-10 rounded-xl hover:bg-white/5"
            >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-bg-primary shadow-lg shadow-danger/20">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-4 w-80 bg-bg-card border border-gray-800 rounded-3xl shadow-2xl z-50 overflow-hidden divide-y divide-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-5 flex justify-between items-center bg-white/5">
                            <h4 className="font-bold text-sm uppercase tracking-widest text-text-secondary">Notifications</h4>
                            {unreadCount > 0 && (
                                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                                    {unreadCount} New
                                </span>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-10 text-center">
                                    <div className="text-3xl mb-2 opacity-20">🔇</div>
                                    <p className="text-text-secondary text-xs italic">All clear! No alerts.</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-5 hover:bg-white/5 transition relative cursor-pointer group ${!notif.is_read ? 'bg-primary/5' : ''}`}
                                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h5 className={`text-sm font-bold ${!notif.is_read ? 'text-white' : 'text-text-secondary'}`}>
                                                {notif.title}
                                            </h5>
                                            <span className="text-[10px] text-text-secondary whitespace-nowrap ml-2">
                                                {new Date(notif.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-secondary leading-relaxed mb-3">
                                            {notif.message}
                                        </p>
                                        {notif.action_url && (
                                            <Link
                                                href={notif.action_url}
                                                className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-primary group-hover:gap-2 transition-all"
                                                onClick={() => markAsRead(notif.id)}
                                            >
                                                Take Action <span className="ml-1 transition-all">→</span>
                                            </Link>
                                        )}
                                        {!notif.is_read && (
                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-1 bg-primary rounded-full shadow-glow"></div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-3 bg-white/5 text-center">
                            <button className="text-[10px] font-bold text-text-secondary hover:text-white uppercase tracking-widest">
                                Clear All
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
