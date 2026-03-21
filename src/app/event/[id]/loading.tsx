export default function EventLoading() {
    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Hero image */}
            <div className="h-64 bg-neutral-200 animate-pulse w-full" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <div className="h-3 w-20 bg-neutral-100 rounded animate-pulse mb-3" />
                            <div className="h-8 w-3/4 bg-neutral-200 rounded-lg animate-pulse" />
                            <div className="h-4 w-1/2 bg-neutral-100 rounded mt-3 animate-pulse" />
                        </div>

                        {/* Description */}
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-3">
                            <div className="h-5 w-28 bg-neutral-200 rounded animate-pulse" />
                            <div className="h-3 w-full bg-neutral-100 rounded animate-pulse" />
                            <div className="h-3 w-5/6 bg-neutral-100 rounded animate-pulse" />
                            <div className="h-3 w-4/5 bg-neutral-100 rounded animate-pulse" />
                            <div className="h-3 w-2/3 bg-neutral-100 rounded animate-pulse" />
                        </div>

                        {/* Attendees */}
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <div className="h-5 w-24 bg-neutral-200 rounded animate-pulse mb-4" />
                            <div className="flex gap-2">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-9 w-9 rounded-full bg-neutral-200 animate-pulse" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-neutral-200 animate-pulse shrink-0" />
                                    <div>
                                        <div className="h-3 w-16 bg-neutral-100 rounded animate-pulse" />
                                        <div className="h-4 w-24 bg-neutral-200 rounded mt-1.5 animate-pulse" />
                                    </div>
                                </div>
                            ))}
                            <div className="h-12 w-full bg-neutral-200 rounded-xl animate-pulse mt-2" />
                        </div>

                        {/* Organiser card */}
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse mb-4" />
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-neutral-200 animate-pulse" />
                                <div>
                                    <div className="h-4 w-28 bg-neutral-200 rounded animate-pulse" />
                                    <div className="h-3 w-20 bg-neutral-100 rounded mt-1.5 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
