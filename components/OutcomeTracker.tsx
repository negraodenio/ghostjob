'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OutcomeTrackerProps {
    applicationId: string;
    initialStatus: string;
    ghostScore?: number;
    compact?: boolean; // Dashboard card mode (smaller)
}

const STATUS_CONFIG = {
    pending: { label: 'Pending', emoji: '⏳', color: 'text-gray-400', bg: 'bg-white/5' },
    applied: { label: 'Applied', emoji: '🚀', color: 'text-blue-400', bg: 'bg-blue-900/20' },
    responded: { label: 'Got Response', emoji: '📧', color: 'text-cyan-400', bg: 'bg-cyan-900/20' },
    interviewing: { label: 'Interviewing', emoji: '📞', color: 'text-indigo-400', bg: 'bg-indigo-900/20' },
    offer: { label: 'Offer!', emoji: '🎉', color: 'text-green-400', bg: 'bg-green-900/20' },
    rejected: { label: 'Rejected', emoji: '❌', color: 'text-red-400', bg: 'bg-red-900/20' },
    ghosted: { label: 'No Response', emoji: '👻', color: 'text-gray-500', bg: 'bg-white/5' },
    withdrawn: { label: 'Withdrawn', emoji: '🚫', color: 'text-gray-400', bg: 'bg-white/5' },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

const CLOSED_STATUSES: StatusKey[] = ['offer', 'rejected', 'ghosted', 'withdrawn'];

const ACTION_BUTTONS: { status: StatusKey; label: string; emoji: string; from: StatusKey[] }[] = [
    { status: 'applied', label: 'I Applied', emoji: '🚀', from: ['pending'] },
    { status: 'responded', label: 'Got a Response', emoji: '📧', from: ['applied'] },
    { status: 'interviewing', label: 'Interview Scheduled', emoji: '📞', from: ['applied', 'responded'] },
    { status: 'offer', label: 'Received Offer!', emoji: '🎉', from: ['applied', 'responded', 'interviewing'] },
    { status: 'rejected', label: 'Rejected', emoji: '❌', from: ['applied', 'responded', 'interviewing'] },
    { status: 'ghosted', label: 'No Response (Ghost)', emoji: '👻', from: ['applied', 'responded'] },
];

export default function OutcomeTracker({ applicationId, initialStatus, ghostScore, compact = false }: OutcomeTrackerProps) {
    const [status, setStatus] = useState<StatusKey>((initialStatus as StatusKey) || 'pending');
    const [isLoading, setIsLoading] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const router = useRouter();

    const handleUpdate = async (e: React.MouseEvent, newStatus: StatusKey) => {
        e.preventDefault();
        e.stopPropagation();
        if (isLoading) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/applications/${applicationId}/outcome`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setStatus(newStatus);
                setShowUpdate(false);
                router.refresh();
            }
        } catch (err) {
            console.error('Outcome update error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const current = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const isClosed = CLOSED_STATUSES.includes(status);
    const availableActions = ACTION_BUTTONS.filter(a => a.from.includes(status));

    if (compact) {
        return (
            <div className="mt-3 pt-3 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                {/* Current Status Badge */}
                <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${current.bg} ${current.color}`}>
                        {current.emoji} {current.label}
                    </span>
                    {!isClosed && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowUpdate(v => !v); }}
                            className="text-[10px] text-text-secondary hover:text-white underline"
                        >
                            Update
                        </button>
                    )}
                </div>

                {/* Ghost confirmation message */}
                {status === 'ghosted' && ghostScore && ghostScore >= 61 && (
                    <p className="text-[10px] text-gray-500 italic">
                        Your report confirms the {ghostScore}% ghost prediction. Thanks!
                    </p>
                )}

                {/* Action buttons (collapsible) */}
                {showUpdate && availableActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {availableActions.map(({ status: s, label, emoji }) => (
                            <button
                                key={s}
                                onClick={(e) => handleUpdate(e, s)}
                                disabled={isLoading}
                                className={`text-[10px] px-2.5 py-1 rounded-full border transition
                                    ${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color}
                                    border-white/10 hover:border-white/30 disabled:opacity-50`}
                            >
                                {emoji} {label}
                            </button>
                        ))}
                    </div>
                )}

                <p className="mt-1.5 text-[9px] text-text-secondary italic">
                    Outcomes improve ghost detection for all users.
                </p>
            </div>
        );
    }

    // Full mode (used in analysis page)
    return (
        <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${current.bg} ${current.color}`}>
                    {current.emoji} {current.label}
                </span>
                {!isClosed && (
                    <button
                        onClick={() => setShowUpdate(v => !v)}
                        className="text-xs text-text-secondary hover:text-white underline"
                    >
                        {showUpdate ? 'Hide' : 'Update Status'}
                    </button>
                )}
            </div>

            {showUpdate && availableActions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {availableActions.map(({ status: s, label, emoji }) => (
                        <button
                            key={s}
                            onClick={(e) => handleUpdate(e, s)}
                            disabled={isLoading}
                            className={`text-xs px-4 py-2 rounded-lg border transition
                                ${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color}
                                border-white/10 hover:border-white/30 disabled:opacity-50 font-semibold`}
                        >
                            {emoji} {label}
                        </button>
                    ))}
                </div>
            )}

            {status === 'ghosted' && ghostScore && (
                <p className="text-xs text-gray-500 mt-2 italic">
                    Model predicted {ghostScore}% ghost probability — confirmed by your report.
                </p>
            )}
        </div>
    );
}
