'use client';

import React from 'react';
import { createEventAction } from '@/server/actions/event.actions';
import { getMyCommunitiesAction } from '@/server/actions/community.actions';
import { CoverImageUploader } from '@/components/CoverImageUploader';
import type { Community } from '@/types';
import { EVENT_CATEGORIES } from '@/types';
import { toast } from 'sonner';
import { Calendar, ArrowLeft, Globe, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const TODAY = new Date().toISOString().split('T')[0];

export default function CreateEventPage() {
    const [communities, setCommunities] = React.useState<Community[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState(false);
    const [coverImageUrl, setCoverImageUrl] = React.useState('');
    const [visibility, setVisibility] = React.useState('public');

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
                // Accept communities that are live ('active' is the default after creation, 'approved' is after admin approval)
                const live = res.data.filter(c => ['active', 'approved', 'open'].includes(c.status));
                setCommunities(live);
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        if (coverImageUrl) formData.set('cover_image_url', coverImageUrl);
        formData.set('visibility', visibility);
        const result = await createEventAction(formData);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error || 'Failed to create event');
            toast.error(result.error || 'Failed to create event');
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
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">Event is live!</h2>
                    <p className="text-neutral-500 text-sm mb-6">
                        Your event is now visible to the community. Share it to get RSVPs.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href="/communities"
                            className="inline-flex px-6 py-3 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors"
                        >
                            View communities
                        </Link>
                        <Link
                            href="/create-event"
                            className="inline-flex px-6 py-3 text-sm font-semibold text-neutral-700 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
                        >
                            Create another event
                        </Link>
                    </div>
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

                {communities.length === 0 && !loading && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-800">No communities available</p>
                            <p className="text-xs text-amber-700 mt-1">
                                You need to create or manage a community before you can create events.{' '}
                                <Link href="/create-community" className="font-semibold underline hover:text-amber-900">Create a community</Link>
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-5">
                    {/* Cover Photo */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Cover Photo <span className="text-neutral-400 font-normal">(optional)</span>
                        </label>
                        <CoverImageUploader
                            currentUrl={null}
                            onUpload={url => setCoverImageUrl(url)}
                            onRemove={() => setCoverImageUrl('')}
                        />
                    </div>

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
                                name="date"
                                type="date"
                                required
                                min={TODAY}
                                className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label htmlFor="event_time" className="block text-sm font-medium text-neutral-700 mb-1.5">
                                    Start Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="event_time"
                                    name="start_time"
                                    type="time"
                                    required
                                    className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="end_time" className="block text-sm font-medium text-neutral-700 mb-1.5">
                                    End Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="end_time"
                                    name="end_time"
                                    type="time"
                                    required
                                    className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Location
                        </label>
                        <input
                            id="location"
                            name="location_text"
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

                    {/* Visibility */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Visibility
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setVisibility('public')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${visibility === 'public' ? 'border-primary-400 bg-primary-50 text-primary-700 font-semibold' : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300'}`}
                            >
                                <Globe size={16} />
                                <div className="text-left">
                                    <div className="font-medium">Public</div>
                                    <div className="text-xs text-neutral-400 font-normal">Anyone can see it</div>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setVisibility('members_only')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${visibility === 'members_only' ? 'border-primary-400 bg-primary-50 text-primary-700 font-semibold' : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300'}`}
                            >
                                <Lock size={16} />
                                <div className="text-left">
                                    <div className="font-medium">Members only</div>
                                    <div className="text-xs text-neutral-400 font-normal">Community members only</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* City is derived from the selected community's city */}

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
