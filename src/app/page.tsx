import Link from 'next/link';
import { ArrowRight, Calendar, CheckCircle, Compass, MapPin, Shield, Sparkles, Users, Rss, Bell, LayoutDashboard, Search, Star, Zap } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth-server';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { EventParticipantRepository } from '@/lib/repositories/event-participant-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';

const CITIES = [
  { name: 'Noida', status: 'active' as const, href: '/explore?city=Noida', blurb: 'Live now with curated communities and meetups.' },
  { name: 'Delhi', status: 'coming_soon' as const, href: '/communities?city=Delhi', blurb: 'Interest list open for launch partners.' },
  { name: 'Gurgaon', status: 'coming_soon' as const, href: '/communities?city=Gurgaon', blurb: 'Great for founder, fitness, and hobby circles.' },
  { name: 'Bangalore', status: 'coming_soon' as const, href: '/communities?city=Bangalore', blurb: 'Tech, creator, and culture communities next.' },
];

const VALUE_PROPS = [
  {
    icon: Shield,
    title: 'Verified social proof',
    desc: 'Every organizer links their LinkedIn or Instagram, so you know exactly who is hosting before you show up.',
    gradient: 'from-primary-500 to-primary-700',
  },
  {
    icon: Users,
    title: 'Community-led experiences',
    desc: 'Events come from real communities with recurring members — not one-off listings from strangers.',
    gradient: 'from-violet-500 to-primary-600',
  },
  {
    icon: Calendar,
    title: 'Curated event discovery',
    desc: 'Filter by interest, price, and date to find events that match your schedule and energy — no noise.',
    gradient: 'from-amber-400 to-orange-500',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Browse communities',
    desc: 'Explore verified communities across categories like fitness, tech, arts, and more — all in your city.',
    icon: Search,
  },
  {
    step: '02',
    title: 'Apply to join',
    desc: 'Request to join communities you love. Organizers review and approve members to keep quality high.',
    icon: Users,
  },
  {
    step: '03',
    title: 'Attend real events',
    desc: 'RSVP for community-hosted events, meet like-minded people, and build your offline social life.',
    icon: Star,
  },
];

// ─── Personalized Home (authenticated) ───────────────────────────────────────

async function PersonalizedHome({ user }: { user: Awaited<ReturnType<typeof getCurrentUser>> & object }) {
    const displayName = (user as any).name?.split(' ')[0] || 'there';
    const interestTags: string[] = (user as any).interest_tags ?? [];

    const [upcomingRSVPs, memberships] = await Promise.all([
        EventParticipantRepository.listUpcomingByUser((user as any).id),
        CommunityMemberRepository.listByUser((user as any).id),
    ]);

    const approvedMemberships = memberships.filter((m: any) => m.status === 'approved');

    // Suggested communities based on interests
    let suggestedCommunities: any[] = [];
    if (interestTags.length > 0) {
        const all = await CommunityRepository.search({ city: 'all', query: '', category: 'all' });
        const lowerTags = interestTags.map((t) => t.toLowerCase());
        const memberIds = new Set(approvedMemberships.map((m: any) => m.community_id || m.communities?.id));
        suggestedCommunities = all
            .filter((c) => !memberIds.has(c.id) && lowerTags.some((t) => c.category?.toLowerCase().includes(t)))
            .slice(0, 3);
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Personalized Hero */}
            <div className="border-b border-neutral-200 bg-[radial-gradient(ellipse_at_top_left,_rgba(108,71,255,0.1),_transparent_50%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
                <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Welcome back</p>
                            <h1 className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl">
                                Hey, {displayName}
                            </h1>
                            {interestTags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {interestTags.slice(0, 4).map((tag) => (
                                        <span key={tag} className="rounded-lg bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                                            {tag}
                                        </span>
                                    ))}
                                    {interestTags.length > 4 && (
                                        <span className="rounded-lg bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-500">
                                            +{interestTags.length - 4}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-primary-300"
                            >
                                <LayoutDashboard size={15} />
                                Dashboard
                            </Link>
                            <Link
                                href="/activity"
                                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-primary-300"
                            >
                                <Bell size={15} />
                                Activity
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-10">

                {/* Suggested Communities */}
                {suggestedCommunities.length > 0 && (
                    <section>
                        <div className="mb-4 flex items-center gap-2">
                            <Sparkles size={16} className="text-primary-600" />
                            <h2 className="text-base font-bold text-neutral-900">Suggested for you</h2>
                            <span className="ml-1 text-xs text-neutral-400">based on your interests</span>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {suggestedCommunities.map((c: any) => (
                                <Link
                                    key={c.id}
                                    href={`/community/${c.slug || c.id}`}
                                    className="group flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-primary-300 hover:shadow-md"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-sm font-bold text-primary-700">
                                            {(c.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-neutral-900 group-hover:text-primary-700">{c.name}</p>
                                            <p className="text-xs text-neutral-500">{c.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-neutral-500">
                                        <span>{c.member_count || 0} members</span>
                                        <span className="text-primary-600 font-medium">View &rarr;</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="mt-3 text-right">
                            <Link href="/communities" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                                Browse all communities &rarr;
                            </Link>
                        </div>
                    </section>
                )}

                {/* My Communities */}
                {approvedMemberships.length > 0 && (
                    <section>
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-primary-600" />
                                <h2 className="text-base font-bold text-neutral-900">My Communities</h2>
                            </div>
                            <Link href="/dashboard" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                                View all &rarr;
                            </Link>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {approvedMemberships.slice(0, 4).map((m: any) => {
                                const community = m.communities;
                                if (!community) return null;
                                const slug = community.slug || m.community_id;
                                return (
                                    <Link
                                        key={m.id}
                                        href={`/community/${slug}/feed`}
                                        className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm transition hover:border-primary-300 hover:shadow-md"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-sm font-bold text-primary-700">
                                            {(community.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-neutral-900">{community.name}</p>
                                            <p className="text-xs text-neutral-400 flex items-center gap-1">
                                                <Rss size={10} />
                                                Open feed
                                            </p>
                                        </div>
                                        <ArrowRight size={13} className="shrink-0 text-neutral-300" />
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Upcoming Events */}
                {upcomingRSVPs.length > 0 && (
                    <section>
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-primary-600" />
                                <h2 className="text-base font-bold text-neutral-900">Upcoming Events</h2>
                            </div>
                            <Link href="/explore" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                                Find more &rarr;
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {upcomingRSVPs.slice(0, 4).map((r: any) => {
                                const event = r.events;
                                if (!event) return null;
                                const dateStr = new Date(event.date).toLocaleDateString('en-IN', {
                                    weekday: 'short', day: 'numeric', month: 'short',
                                });
                                return (
                                    <Link
                                        key={r.id}
                                        href={`/event/${event.id}`}
                                        className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-white px-4 py-3.5 transition hover:border-primary-200 hover:shadow-sm"
                                    >
                                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-50 text-center">
                                            <span className="text-[10px] font-semibold uppercase leading-none text-primary-500">
                                                {new Date(event.date).toLocaleDateString('en-IN', { month: 'short' })}
                                            </span>
                                            <span className="mt-0.5 text-base font-extrabold leading-none text-primary-700">
                                                {new Date(event.date).getDate()}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold text-neutral-900">{event.title}</span>
                                            <span className="text-xs text-neutral-500">{dateStr}</span>
                                        </div>
                                        <ArrowRight size={14} className="shrink-0 text-neutral-300" />
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Empty state */}
                {approvedMemberships.length === 0 && upcomingRSVPs.length === 0 && suggestedCommunities.length === 0 && (
                    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-10 text-white text-center">
                        <Sparkles size={32} className="mx-auto mb-4 opacity-80" />
                        <h3 className="text-xl font-bold">Your feed is empty for now</h3>
                        <p className="mt-2 text-sm text-primary-100/80 max-w-sm mx-auto">
                            Join communities and RSVP to events to see your personalized home here.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3 justify-center">
                            <Link
                                href="/communities"
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
                            >
                                <Users size={15} />
                                Browse communities
                            </Link>
                            <Link
                                href="/explore"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                            >
                                <Calendar size={15} />
                                Explore events
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default async function LandingPage() {
  const user = await getCurrentUser();

  if (user && user.onboarding_completed) {
      return <PersonalizedHome user={user} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(108,71,255,0.3),_transparent_40%),linear-gradient(135deg,#0f172a_0%,#1e1b4b_52%,#4338ca_100%)] text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 right-[-6rem] h-80 w-80 rounded-full bg-primary-400/20 blur-3xl" />
          <div className="absolute bottom-[-8rem] left-[-5rem] h-72 w-72 rounded-full bg-fuchsia-400/15 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Zap size={16} className="text-amber-300" />
              The most trusted way to discover communities in your city
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Discover real-world
              <span className="block bg-gradient-to-r from-primary-200 to-violet-200 bg-clip-text text-transparent">
                communities & events.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75 sm:text-xl">
              Find verified communities, join curated gatherings, and build an offline social life around shared interests.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/explore?city=Noida"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-semibold text-primary-700 shadow-xl shadow-primary-900/20 transition-all hover:-translate-y-0.5 hover:bg-primary-50"
              >
                Explore live events
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/communities"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-7 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15"
              >
                Browse communities
                <Compass size={18} />
              </Link>
            </div>
          </div>

          {/* City cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {CITIES.map((city) => (
              city.status === 'active' ? (
                <Link
                  key={city.name}
                  href={city.href}
                  className="group rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white/15"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white">
                    <MapPin size={20} />
                  </div>
                  <h2 className="text-lg font-semibold">{city.name}</h2>
                  <p className="mt-1.5 text-sm text-white/70">{city.blurb}</p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-400/20 px-3 py-1 text-xs font-semibold text-green-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
                    Live now
                  </div>
                </Link>
              ) : (
                <div
                  key={city.name}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/80 backdrop-blur-sm"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <MapPin size={20} />
                  </div>
                  <h2 className="text-lg font-semibold text-white">{city.name}</h2>
                  <p className="mt-1.5 text-sm text-white/60">{city.blurb}</p>
                  <div className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                    Coming soon
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* Why Kyoty */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Why Kyoty works</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            A calmer, cleaner way to discover offline social experiences
          </h2>
          <p className="mt-4 text-base leading-7 text-neutral-500">
            We believe the best social experiences happen offline, in trusted spaces, with people who share your interests.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {VALUE_PROPS.map((item) => (
            <div key={item.title} className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-lg`}>
                <item.icon size={22} />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-6 text-neutral-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Simple by design</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900">How Kyoty works</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                {/* Connector line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="absolute left-[calc(50%+2rem)] top-7 hidden h-px w-[calc(100%-4rem)] bg-neutral-200 md:block" />
                )}
                <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
                  <item.icon size={24} className="text-primary-600" />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">{item.title}</h3>
                <p className="mt-2.5 text-sm leading-6 text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">What you get</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900">Everything you need to build a great social life</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                'Browse events by city and category',
                'Join trusted, members-only communities',
                'RSVP for curated, real-world gatherings',
                'Start your own community and host events',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl bg-neutral-50 p-4">
                  <CheckCircle size={16} className="mt-0.5 shrink-0 text-primary-500" />
                  <span className="text-sm font-medium text-neutral-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white shadow-xl sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-100/80">Get started today</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Join Kyoty and find your people in Noida.</h2>
            <p className="mt-4 text-sm leading-7 text-primary-100/80 sm:text-base">
              Explore live communities and events, RSVP instantly, or start your own community and shape local culture.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-primary-700 transition hover:bg-primary-50">
                Create account
                <ArrowRight size={18} />
              </Link>
              <Link href="/communities" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
                Browse communities
                <Users size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
