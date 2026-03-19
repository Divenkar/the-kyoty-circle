import { CommunityRepository } from '@/lib/repositories/community-repo';
import { CommunityCard } from '@/components/CommunityCard';
import { MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Communities | Kyoty',
    description: 'Discover and join communities near you on Kyoty',
};

interface CommunitiesPageProps {
    searchParams: Promise<{ city?: string }>;
}

export default async function CommunitiesPage({ searchParams }: CommunitiesPageProps) {
    const params = await searchParams;
    const city = params.city || 'all';

    const communities = city === 'all'
        ? await CommunityRepository.findAll()
        : await CommunityRepository.findByCity(city);

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 flex items-center gap-2">
                                <Users size={24} className="text-primary-600" />
                                {city === 'all' ? 'All Communities' : `${city} Communities`}
                            </h1>
                            <p className="text-neutral-500 mt-1">
                                {communities.length} communit{communities.length !== 1 ? 'ies' : 'y'} available
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/communities?city=all"
                                className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${city === 'all'
                                        ? 'bg-primary-600 text-white border-primary-600'
                                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300'
                                    }`}
                            >
                                All Cities
                            </Link>
                            <Link
                                href="/communities?city=Noida"
                                className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${city === 'Noida'
                                        ? 'bg-primary-600 text-white border-primary-600'
                                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300'
                                    }`}
                            >
                                <MapPin size={14} className="inline mr-1" />
                                Noida
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Communities Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {communities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {communities.map((community) => (
                            <CommunityCard
                                key={community.id}
                                community={community}
                                memberCount={community.member_count || 0}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-100 flex items-center justify-center mb-4">
                            <Users size={28} className="text-primary-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-900 mb-2">No communities found</h3>
                        <p className="text-neutral-500 text-sm max-w-sm mx-auto">
                            Be the first to create a community in your area!
                        </p>
                        <Link
                            href="/create-community"
                            className="inline-flex mt-4 px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-all"
                        >
                            Create Community
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
