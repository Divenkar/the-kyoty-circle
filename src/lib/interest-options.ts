import { EVENT_CATEGORIES, type EventCategory } from '@/types';

export const INTEREST_TAG_OPTIONS = EVENT_CATEGORIES.filter(
    (category): category is Exclude<EventCategory, 'All'> => category !== 'All'
);
export const MAX_INTEREST_TAGS = 5;
