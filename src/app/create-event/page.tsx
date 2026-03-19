'use client';

import React from 'react';
import { createEventAction } from '@/server/actions/event.actions';
import { getMyCommunitiesAction } from '@/server/actions/community.actions';
import type { Community } from '@/types';
import { EVENT_CATEGORIES } from '@/types';
import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateEventPage() {
    const [communities, setCommunities] = React.useState<Community[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState(false);

    // Dynamic Ticket State
    const [pricingModel, setPricingModel] = React.useState('free');
    const [ticketTiers, setTicketTiers] = React.useState([{ id: 1, name: 'General', capacity: '', price: '' }]);

    const addTier = () => setTicketTiers(prev => [...prev, { id: Date.now(), name: '', capacity: '', price: '' }]);
    const removeTier = (id: number) => setTicketTiers(prev => prev.filter(t => t.id !== id));
    const updateTier = (id: number, field: string, value: string) => {
        setTicketTiers(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    React.useEffect(() => {
        getMyCommunitiesAction().then(res => {
            if (res.success && res.data) {
                const approved = res.data.filter(c => c.status === 'approved');
                setCommunities(approved);
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await createEventAction(formData);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error || 'Failed to create event');
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                        <Calendar size={28} className="text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">Event Created!</h2>
                    <p className="text-neutral-500 text-sm mb-6">
                        Your event has been submitted for review. You&apos;ll be notified when it&apos;s approved.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex px-6 py-3 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>

                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Create Event</h1>
                <p className="text-neutral-500 text-sm mb-8">
                    Fill in the details below. Your event will be reviewed before going live.
                </p>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-5">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Event Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            required
                            placeholder="e.g. Weekend Photography Walk"
                            className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                        />
                    </div>

                    {/* Community */}
                    <div>
                        <label htmlFor="community_id" className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Community <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="community_id"
                            name="community_id"
                            required
                            className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                        >
                            <option value="">Select a community</option>
                            {communities.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Category
                        </label>
                        <select
                            id="category"
                            name="category"
                            className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                        >
                            {EVENT_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="event_date" className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="event_date"
                                name="event_date"
                                type="date"
                                required
                                className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label htmlFor="event_time" className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Time
                            </label>
                            <input
                                id="event_time"
                                name="event_time"
                                type="time"
                                className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Location
                        </label>
                        <input
                            id="location"
                            name="location"
                            type="text"
                            placeholder="e.g. Sector 62, Noida"
                            className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                        />
                    </div>

                    {/* Pricing Model & Tiers */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Pricing Model <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="pricing_model" value="free" checked={pricingModel === 'free'} onChange={(e) => setPricingModel(e.target.value)} className="text-primary-600 focus:ring-primary-500" />
                                    <span className="text-sm">Free</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="pricing_model" value="fixed" checked={pricingModel === 'fixed'} onChange={(e) => setPricingModel(e.target.value)} className="text-primary-600 focus:ring-primary-500" />
                                    <span className="text-sm">Fixed Price</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="pricing_model" value="tiered" checked={pricingModel === 'tiered'} onChange={(e) => setPricingModel(e.target.value)} className="text-primary-600 focus:ring-primary-500" />
                                    <span className="text-sm">Tiered</span>
                                </label>
                            </div>
                        </div>

                        {pricingModel !== 'tiered' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="capacity" className="block text-sm font-medium text-neutral-700 mb-1.5">
                                        Total Capacity <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="capacity"
                                        name="capacity"
                                        type="number"
                                        required
                                        min={1}
                                        max={5000}
                                        placeholder="e.g. 50"
                                        className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                                    />
                                </div>
                                {pricingModel === 'fixed' && (
                                    <div>
                                        <label htmlFor="cost" className="block text-sm font-medium text-neutral-700 mb-1.5">
                                            Cost (₹) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="cost"
                                            name="cost"
                                            type="number"
                                            required
                                            min={0}
                                            defaultValue={0}
                                            className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {pricingModel === 'tiered' && (
                            <div className="space-y-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                                <label className="block text-sm font-medium text-neutral-700">Ticket Tiers <span className="text-red-500">*</span></label>
                                {ticketTiers.map((tier, index) => (
                                    <div key={tier.id} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-start">
                                        <div className="sm:col-span-1">
                                            <input
                                                type="text"
                                                placeholder="Tier Name"
                                                required
                                                value={tier.name}
                                                onChange={(e) => updateTier(tier.id, 'name', e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500/20 outline-none"
                                            />
                                        </div>
                                        <div className="sm:col-span-1">
                                            <input
                                                type="number"
                                                placeholder="Capacity"
                                                required
                                                min={1}
                                                value={tier.capacity}
                                                onChange={(e) => updateTier(tier.id, 'capacity', e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500/20 outline-none"
                                            />
                                        </div>
                                        <div className="sm:col-span-1">
                                            <input
                                                type="number"
                                                placeholder="Price ₹"
                                                required
                                                min={0}
                                                value={tier.price}
                                                onChange={(e) => updateTier(tier.id, 'price', e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500/20 outline-none"
                                            />
                                        </div>
                                        <div className="sm:col-span-1 pt-0.5">
                                            {ticketTiers.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTier(tier.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addTier}
                                    className="text-sm text-primary-600 font-medium hover:text-primary-700"
                                >
                                    + Add another tier
                                </button>

                                {/* Hidden field to hold JSON of tiers */}
                                <input type="hidden" name="ticket_tiers" value={JSON.stringify(ticketTiers)} />
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            placeholder="Tell people what to expect..."
                            className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Hidden city field */}
                    <input type="hidden" name="city" value="Noida" />

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create Event'}
                    </button>
                </form>
            </div>
        </div>
    );
}
