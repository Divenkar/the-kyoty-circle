import { getCurrentUser } from '@/lib/auth-server';
import { INTEREST_TAG_OPTIONS, MAX_INTEREST_TAGS } from '@/lib/interest-options';

const INTEREST_TAG_SET = new Set<string>(INTEREST_TAG_OPTIONS);

export function sanitizeInterestTags(tags: string[] | null | undefined): string[] {
    const cleaned = (tags ?? [])
        .map((tag) => tag.trim())
        .filter((tag) => INTEREST_TAG_SET.has(tag));

    return [...new Set(cleaned)].slice(0, MAX_INTEREST_TAGS);
}

export async function getCurrentUserInterestTags(): Promise<string[]> {
    const user = await getCurrentUser();
    return sanitizeInterestTags(user?.interest_tags);
}
