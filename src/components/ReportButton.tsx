'use client';

import React from 'react';
import { submitReportAction } from '@/server/actions/review.actions';
import { Flag, X } from 'lucide-react';

interface ReportButtonProps {
    targetType: string;
    targetId: number;
}

const REPORT_REASONS = [
    'Inappropriate content',
    'Spam or scam',
    'Harassment or abuse',
    'Misleading information',
    'Safety concern',
    'Other',
];

export function ReportButton({ targetType, targetId }: ReportButtonProps) {
    const [open, setOpen] = React.useState(false);
    const [reason, setReason] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [done, setDone] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason) return;
        setLoading(true);
        const result = await submitReportAction(targetType, targetId, reason, description);
        if (result.success) {
            setDone(true);
            setTimeout(() => { setOpen(false); setDone(false); }, 2000);
        }
        setLoading(false);
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-400 hover:text-red-500 transition-colors rounded"
                title="Report"
            >
                <Flag size={12} />
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-neutral-900">Report {targetType}</h3>
                            <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                                <X size={20} />
                            </button>
                        </div>

                        {done ? (
                            <div className="py-6 text-center">
                                <p className="text-green-600 font-medium">✓ Report submitted. Thank you!</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <p className="text-sm text-neutral-600 mb-3">Why are you reporting this?</p>
                                <div className="space-y-2 mb-4">
                                    {REPORT_REASONS.map((r) => (
                                        <label key={r} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="reason"
                                                value={r}
                                                checked={reason === r}
                                                onChange={() => setReason(r)}
                                                className="text-primary-600"
                                            />
                                            <span className="text-sm text-neutral-700">{r}</span>
                                        </label>
                                    ))}
                                </div>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Additional details (optional)..."
                                    rows={3}
                                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 outline-none resize-none mb-4"
                                />
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setOpen(false)}
                                        className="flex-1 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!reason || loading}
                                        className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Submitting...' : 'Submit Report'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
