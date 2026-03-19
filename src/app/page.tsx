import Link from 'next/link';
import { ArrowRight, Calendar, Compass, MapPin, Shield, Sparkles, Users } from 'lucide-react';

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
    desc: 'Profiles can include LinkedIn or Instagram proof so every meetup feels more trusted and intentional.',
    gradient: 'from-primary-500 to-primary-700',
  },
  {
    icon: Users,
    title: 'Community-led experiences',
    desc: 'Events come from actual communities, not random listings, which improves relevance and repeat engagement.',
    gradient: 'from-violet-500 to-primary-600',
  },
  {
    icon: Calendar,
    title: 'Curated event discovery',
    desc: 'Browse by interest, price, and date to quickly find experiences that fit your energy and schedule.',
    gradient: 'from-amber-400 to-orange-500',
  },
];

const STATS = [
  { label: 'City launch focus', value: 'Noida first' },
  { label: 'Discovery-first UX', value: 'Events + communities' },
  { label: 'Designed for trust', value: 'Verified hosts' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.25),_transparent_35%),linear-gradient(135deg,#111827_0%,#312e81_52%,#4338ca_100%)] text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 right-[-6rem] h-80 w-80 rounded-full bg-primary-300/20 blur-3xl" />
          <div className="absolute bottom-[-8rem] left-[-5rem] h-72 w-72 rounded-full bg-fuchsia-400/15 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Sparkles size={16} className="text-amber-300" />
              Building the most trusted way to discover communities in your city
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Discover beautiful,
              <span className="block text-primary-200">real-world communities and events.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-primary-50/85 sm:text-xl">
              Kyoty helps people find verified communities, join curated gatherings, and build an offline social life around shared interests.
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

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {STATS.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-lg font-bold text-white">{item.value}</div>
                  <div className="mt-1 text-sm text-primary-100/80">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {CITIES.map((city) => (
              city.status === 'active' ? (
                <Link
                  key={city.name}
                  href={city.href}
                  className="group rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white/15"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white">
                    <MapPin size={22} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold">{city.name}</h2>
                      <p className="mt-2 text-sm text-primary-100/80">{city.blurb}</p>
                    </div>
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-400/20 px-3 py-1 text-xs font-semibold text-green-100">
                    <span className="h-2 w-2 rounded-full bg-green-300" />
                    Live now
                  </div>
                </Link>
              ) : (
                <div
                  key={city.name}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white/80 backdrop-blur-sm"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <MapPin size={22} />
                  </div>
                  <h2 className="text-xl font-semibold text-white">{city.name}</h2>
                  <p className="mt-2 text-sm text-primary-100/70">{city.blurb}</p>
                  <div className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-primary-100/85">
                    Coming soon
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Why Kyoty works</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">A calmer, cleaner way to discover offline social experiences</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-neutral-500 sm:text-base">
            The product already has the right foundations—communities, events, onboarding, and admin review. The biggest opportunity is making discovery feel premium and reducing dead ends in the browsing flow.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {VALUE_PROPS.map((item) => (
            <div key={item.title} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-lg`}>
                <item.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-neutral-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Current product strengths</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900">The core flows are already meaningful</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                'Explore upcoming events by city and category',
                'Join communities and RSVP for hosted experiences',
                'Create communities and events through dashboard flows',
                'Admin review and moderation tooling for safer launches',
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-neutral-50 p-4 text-sm font-medium text-neutral-700">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white shadow-xl shadow-primary-900/10 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-100">Next step</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Open the app and start exploring Noida.</h2>
            <p className="mt-4 text-sm leading-7 text-primary-100/85 sm:text-base">
              The browse experience is the heart of the product. Once users can confidently search, compare, and join, the platform feels dramatically more complete.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/explore?city=Noida" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-primary-700 transition hover:bg-primary-50">
                Explore events
                <ArrowRight size={18} />
              </Link>
              <Link href="/create-community" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
                Start a community
                <Users size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
