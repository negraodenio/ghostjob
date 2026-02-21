'use client';

import { useState } from 'react';

interface SubscriptionStatusProps {
    plan: string;
    analysesCount: number;
}

export default function SubscriptionStatus({ plan, analysesCount }: SubscriptionStatusProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: 'pro' }),
            });
            const { url, error } = await res.json();
            if (url) {
                window.location.href = url;
            } else if (error) {
                alert(error);
            }
        } catch (err) {
            console.error('Upgrade error:', err);
            alert('Failed to initiate upgrade');
        } finally {
            setIsLoading(false);
        }
    };

    const handleManage = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/stripe/portal', { method: 'POST' });
            const { url, error } = await res.json();
            if (url) {
                window.location.href = url;
            } else if (error) {
                alert(error);
            }
        } catch (err) {
            console.error('Portal error:', err);
            alert('Failed to open billing portal');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-primary/10 to-bg-card p-6 rounded-xl border border-primary mb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold mb-2">
                        {plan === 'free' ? '🆓 Free Plan' :
                            plan === 'pro' ? '⭐ Pro Plan' :
                                '💎 Premium Plan'}
                    </h3>
                    <p className="text-text-secondary">
                        {plan === 'free'
                            ? `${analysesCount} / 3 analyses used this month`
                            : 'Unlimited analyses'}
                    </p>
                </div>
                <div className="flex space-x-4">
                    {plan === 'free' ? (
                        <button
                            onClick={handleUpgrade}
                            disabled={isLoading}
                            className="px-8 py-3 gradient-purple rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : 'Upgrade to Pro'}
                        </button>
                    ) : (
                        <button
                            onClick={handleManage}
                            disabled={isLoading}
                            className="px-8 py-3 bg-bg-primary border border-gray-700 rounded-lg font-semibold hover:border-primary transition disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : 'Manage Subscription'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
