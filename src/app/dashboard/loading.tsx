export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-neutral-200 animate-pulse" />
                        <div>
                            <div className="h-6 w-40 bg-neutral-200 rounded-lg animate-pulse" />
                            <div className="h-3 w-24 bg-neutral-100 rounded mt-2 animate-pulse" />
                        </div>
                    </div>
                    {/* Stats strip */}
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                                <div className="h-7 w-10 bg-neutral-200 rounded animate-pulse" />
                                <div className="h-3 w-24 bg-neutral-100 rounded mt-2 animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
                {/* Communities I manage */}
                <div>
                    <div className="h-5 w-48 bg-neutral-200 rounded animate-pulse mb-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5">
                                <div className="h-5 w-3/4 bg-neutral-200 rounded animate-pulse" />
                                <div className="h-3 w-1/2 bg-neutral-100 rounded mt-2 animate-pulse" />
                                <div className="mt-4 flex gap-2">
                                    {Array.from({ length: 3 }).map((_, j) => (
                                        <div key={j} className="h-8 w-20 bg-neutral-100 rounded-lg animate-pulse" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Communities joined */}
                <div>
                    <div className="h-5 w-44 bg-neutral-200 rounded animate-pulse mb-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5">
                                <div className="h-5 w-3/4 bg-neutral-200 rounded animate-pulse" />
                                <div className="h-3 w-1/2 bg-neutral-100 rounded mt-2 animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming events */}
                <div>
                    <div className="h-5 w-36 bg-neutral-200 rounded animate-pulse mb-4" />
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
                                <div className="h-12 w-12 rounded-xl bg-neutral-200 animate-pulse shrink-0" />
                                <div className="flex-1">
                                    <div className="h-4 w-2/3 bg-neutral-200 rounded animate-pulse" />
                                    <div className="h-3 w-1/3 bg-neutral-100 rounded mt-2 animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
