import Link from 'next/link';
import { MapPin, ArrowRight, Shield, Users, Calendar } from 'lucide-react';
import Image from 'next/image';

const CITIES = [
  { name: 'Noida', status: 'active' as const, image: null },
  { name: 'Delhi', status: 'coming_soon' as const, image: null },
  { name: 'Gurgaon', status: 'coming_soon' as const, image: null },
  { name: 'Bangalore', status: 'coming_soon' as const, image: null },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-primary-300/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Now live in Noida
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
              Discover Real
              <br />
              Communities
              <br />
              <span className="text-primary-200">in Your City</span>
            </h1>

            <p className="text-lg sm:text-xl text-primary-100/90 mb-10 max-w-lg leading-relaxed">
              Join curated events hosted by trusted communities. Meet real people, do real things.
            </p>

            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl text-base group"
            >
              Explore Noida
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* City Selection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CITIES.map((city) => (
            <div key={city.name} className="relative group">
              {city.status === 'active' ? (
                <Link
                  href="/explore"
                  className="block bg-white p-5 rounded-2xl shadow-lg border border-neutral-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300 text-center"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-3 shadow-sm">
                    <MapPin size={24} className="text-white" />
                  </div>
                  <span className="text-base font-semibold text-neutral-900 block">{city.name}</span>
                  <span className="text-xs font-medium text-green-600 mt-1 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Active
                  </span>
                </Link>
              ) : (
                <div className="bg-white/80 p-5 rounded-2xl shadow-lg border border-neutral-200 text-center opacity-75">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-200 flex items-center justify-center mb-3">
                    <MapPin size={24} className="text-neutral-400" />
                  </div>
                  <span className="text-base font-semibold text-neutral-600 block">{city.name}</span>
                  <span className="text-xs font-medium text-neutral-400 mt-1 block">Coming Soon</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">
            Why Kyoty?
          </h2>
          <p className="text-neutral-500 max-w-lg mx-auto">
            A trusted platform for real community experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: 'Social Proof Verified',
              desc: 'Every member shares LinkedIn or Instagram. Know who you\'re meeting.',
              gradient: 'from-primary-500 to-primary-600',
            },
            {
              icon: Users,
              title: 'Community-First',
              desc: 'Events are run by real, admin-approved communities. No random hosts.',
              gradient: 'from-primary-400 to-primary-500',
            },
            {
              icon: Calendar,
              title: 'Curated Events',
              desc: 'Every event goes through platform review before going live.',
              gradient: 'from-primary-500 to-primary-700',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 bg-white border border-neutral-200 rounded-2xl hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <item.icon size={22} className="text-white" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 mb-2">{item.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-10 sm:p-14 text-center text-white relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 relative">
            Ready to explore your city?
          </h2>
          <p className="text-primary-100 mb-8 max-w-md mx-auto relative">
            Join thousands of people discovering new communities and events in Noida.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-lg text-base relative group"
          >
            Get Started
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-neutral-400">
            © {new Date().getFullYear()} Kyoty. Community events across India.
          </p>
        </div>
      </footer>
    </div>
  );
}
