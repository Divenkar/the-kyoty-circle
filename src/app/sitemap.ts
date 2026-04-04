import type { MetadataRoute } from 'next';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { EventRepository } from '@/lib/repositories/event-repo';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kyoty.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [communities, events] = await Promise.all([
        CommunityRepository.search({ city: 'all', query: '', category: 'all' }),
        EventRepository.search({ query: '' }),
    ]);

    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${BASE_URL}/explore`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${BASE_URL}/communities`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
        { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
        { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ];

    const communityPages: MetadataRoute.Sitemap = communities.map((c) => ({
        url: `${BASE_URL}/community/${c.slug || c.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const eventPages: MetadataRoute.Sitemap = events.map((e) => ({
        url: `${BASE_URL}/event/${e.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [...staticPages, ...communityPages, ...eventPages];
}
