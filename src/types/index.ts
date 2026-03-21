/* ───── City ───── */
export interface City {
    id: number;
    name: string;
    state: string;
    slug: string;
    is_active: boolean;
    created_at: string;
}

/* ───── User ───── */
export type UserRole = 'participant' | 'community_admin' | 'kyoty_admin' | 'admin';

export interface User {
    id: number;
    name: string;
    email: string;
    auth_id: string;
    role: UserRole;
    default_city_id: number | null;
    verification_status: string;
    social_proof_type: 'linkedin' | 'instagram' | null;
    social_proof_link: string | null;
    avatar_url?: string;
    created_at: string;
}

/* ───── Community ───── */
export type CommunityStatus = 'active' | 'pending' | 'approved' | 'rejected' | 'disabled';

export interface Community {
    id: number;
    name: string;
    slug: string;
    description: string;
    category: string;
    city_id: number;
    is_travel: boolean;
    visibility: string;
    organizer_id: number;
    rating_avg: number;
    rating_count: number;
    member_count: number;
    status: CommunityStatus;
    cover_image_url: string | null;
    created_at: string;
    /* joined from cities table */
    city_name?: string;
    /* joined organizer */
    organizer?: User;
}

/* ───── Community Member ───── */
export type MemberStatus = 'pending' | 'approved' | 'rejected';

export interface CommunityMember {
    id: number;
    community_id: number;
    user_id: number;
    status: MemberStatus;
    approved_by: number | null;
    join_reason?: string | null;
    social_proof_link?: string | null;
    created_at: string;
}

export interface CommunityMemberWithUser extends CommunityMember {
    kyoty_users?: User;
}

/* ───── Event ───── */
export type EventStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'open' | 'full' | 'completed' | 'cancelled';

export const EVENT_CATEGORIES = [
    'All', 'Sports', 'Food', 'Networking', 'Learning', 'Arts', 'Travel', 'Music', 'Photography', 'Gaming', 'Fitness', 'Wellness',
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export interface KyotyEvent {
    id: number;
    community_id: number;
    city_id: number;
    title: string;
    description: string;
    date: string;
    start_time: string;
    end_time: string;
    location_text: string;
    max_participants: number;
    registered_count: number;
    status: EventStatus;
    pricing_model: string;
    price_per_person: number | null;
    total_fixed_cost: number | null;
    per_person_estimate: number | null;
    is_paid: boolean;
    created_by: number;
    created_at: string;
}

export interface EventWithCommunity extends KyotyEvent {
    communities?: Community;
}

/* ───── Event Participant ───── */
export type ParticipantStatus = 'registered' | 'waitlisted' | 'cancelled' | 'removed';

export interface EventParticipant {
    id: number;
    event_id: number;
    user_id: number;
    status: ParticipantStatus;
    waitlist_position?: number | null;
    checked_in_at?: string | null;
    joined_at: string;
}

export interface EventParticipantWithUser extends EventParticipant {
    kyoty_users?: User;
}

/* ───── Ticket Tier ───── */
export interface TicketTier {
    id: number;
    event_id: number;
    name: string;
    capacity: number;
    price: number;
    created_at: string;
}

/* ───── Admin Log ───── */
export interface AdminLog {
    id: number;
    admin_id: number | null;
    action: string;
    target_type: string;
    target_id: number;
    metadata: Record<string, unknown> | null;
    created_at: string;
}

/* ───── Community Role (tier-2 permission) ───── */
export type CommunityRoleLevel = 'owner' | 'admin' | 'moderator';

export interface CommunityRole {
    id: number;
    community_id: number;
    user_id: number;
    role: CommunityRoleLevel;
    assigned_by: number | null;
    created_at: string;
    /* joined */
    kyoty_users?: Pick<User, 'id' | 'name' | 'email' | 'avatar_url'>;
}

/* ───── Community Message (chat) ───── */
export type MessageType = 'text' | 'image' | 'link' | 'system';

export interface CommunityMessage {
    id: number;
    community_id: number;
    user_id: number;
    content: string;
    type: MessageType;
    reply_to_id: number | null;
    is_deleted: boolean;
    edited_at: string | null;
    created_at: string;
    /* joined */
    kyoty_users?: Pick<User, 'id' | 'name' | 'avatar_url'>;
    reply_to?: Pick<CommunityMessage, 'id' | 'content' | 'user_id'>;
    reactions?: MessageReaction[];
}

/* ───── Message Reaction ───── */
export interface MessageReaction {
    id: number;
    message_id: number;
    user_id: number;
    emoji: string;
    created_at: string;
}

/* ───── Community Media ───── */
export interface CommunityMedia {
    id: number;
    community_id: number;
    uploaded_by: number;
    url: string;
    caption: string | null;
    created_at: string;
    /* joined */
    kyoty_users?: Pick<User, 'id' | 'name'>;
}

/* ───── Server Action Response ───── */
export interface ActionResponse<T = undefined> {
    success: boolean;
    data?: T;
    error?: string;
}
