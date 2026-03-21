import Link from 'next/link';
import { ArrowRight, Calendar, CheckCircle, Compass, MapPin, Shield, Sparkles, Users } from 'lucide-react';

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
  },
  {
    step: '02',
    title: 'Apply to join',
    desc: 'Request to join communities you love. Organizers review and approve members to keep quality high.',
  },
  {
    step: '03',
    title: 'Attend real events',
    desc: 'RSVP for community-hosted events, meet like-minded people, and build your offline social life.',
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
      {/* Hero */}
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

      {/* Why Kyoty */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Why Kyoty works</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">A calmer, cleaner way to discover offline social experiences</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-neutral-500 sm:text-base">
            We believe the best social experiences happen offline, in trusted spaces, with people who share your interests. Kyoty makes finding those people effortless.
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

      {/* How it works */}
      <section className="bg-white border-y border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Simple by design</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">How Kyoty works</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-2xl font-extrabold text-primary-600">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">What you get</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900">Everything you need to build a great social life</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                'Browse events by city and category',
                'Join trusted, members-only communities',
                'RSVP for curated, real-world gatherings',
                'Start your own community and host events',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-neutral-50 p-4">
                  <CheckCircle size={18} className="mt-0.5 shrink-0 text-primary-500" />
                  <span className="text-sm font-medium text-neutral-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white shadow-xl shadow-primary-900/10 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-100">Get started today</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Join Kyoty and find your people in Noida.</h2>
            <p className="mt-4 text-sm leading-7 text-primary-100/85 sm:text-base">
              Explore live communities and events, RSVP instantly, or start your own community and shape local culture.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-primary-700 transition hover:bg-primary-50">
                Create account
                <ArrowRight size={18} />
              </Link>
              <Link href="/communities" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
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
