export default function CommunityLoading() {
    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Hero */}
            <div className="h-56 bg-neutral-200 animate-pulse w-full" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8">
                {/* Card overlay */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="h-7 w-2/3 bg-neutral-200 rounded-lg animate-pulse" />
                            <div className="flex gap-3 mt-3">
                                <div className="h-4 w-20 bg-neutral-100 rounded animate-pulse" />
                                <div className="h-4 w-24 bg-neutral-100 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="h-10 w-32 bg-neutral-200 rounded-xl animate-pulse shrink-0" />
                    </div>

                    {/* Tab nav skeleton */}
                    <div className="mt-6 flex gap-1 border-b border-neutral-200 pb-0">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-9 w-20 bg-neutral-100 rounded-t-lg animate-pulse" />
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
                    <div className="h-5 w-32 bg-neutral-200 rounded animate-pulse mb-4" />
                    <div className="space-y-2">
                        <div className="h-3 w-full bg-neutral-100 rounded animate-pulse" />
                        <div className="h-3 w-5/6 bg-neutral-100 rounded animate-pulse" />
                        <div className="h-3 w-3/4 bg-neutral-100 rounded animate-pulse" />
                    </div>
                </div>

                {/* Events */}
                <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
                    <div className="h-5 w-28 bg-neutral-200 rounded animate-pulse mb-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="rounded-xl border border-neutral-200 overflow-hidden">
                                <div className="h-36 bg-neutral-200 animate-pulse" />
                                <div className="p-4 space-y-2">
                                    <div className="h-4 w-3/4 bg-neutral-200 rounded animate-pulse" />
                                    <div className="h-3 w-1/2 bg-neutral-100 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
