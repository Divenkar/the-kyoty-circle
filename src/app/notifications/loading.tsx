export default function NotificationsLoading() {
    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
                <div className="h-7 w-36 bg-neutral-200 rounded-lg animate-pulse mb-6" />

                <div className="rounded-2xl border border-neutral-200 bg-white divide-y divide-neutral-100 overflow-hidden">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-4 px-5 py-4">
                            <div className="h-9 w-9 rounded-full bg-neutral-200 animate-pulse shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 bg-neutral-200 rounded animate-pulse" />
                                <div className="h-3 w-1/2 bg-neutral-100 rounded animate-pulse" />
                            </div>
                            <div className="h-3 w-12 bg-neutral-100 rounded animate-pulse shrink-0 mt-1" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
