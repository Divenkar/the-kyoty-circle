export default function CommunitiesLoading() {
    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Filter bar */}
            <div className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                    <div className="h-8 w-40 bg-neutral-200 rounded-lg animate-pulse" />
                    <div className="flex gap-2 mt-5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-9 w-20 bg-neutral-200 rounded-full animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Cards grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                            <div className="h-40 bg-neutral-200 animate-pulse" />
                            <div className="p-5 space-y-3">
                                <div className="h-5 w-3/4 bg-neutral-200 rounded animate-pulse" />
                                <div className="h-3 w-1/3 bg-neutral-100 rounded animate-pulse" />
                                <div className="h-3 w-full bg-neutral-100 rounded animate-pulse" />
                                <div className="h-3 w-2/3 bg-neutral-100 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
