export default function ProfileLoading() {
    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                <div className="h-7 w-24 bg-neutral-200 rounded-lg animate-pulse mb-8" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-6 space-y-6">
                        {/* Avatar */}
                        <div className="flex items-center gap-5">
                            <div className="h-20 w-20 rounded-2xl bg-neutral-200 animate-pulse" />
                            <div>
                                <div className="h-5 w-32 bg-neutral-200 rounded animate-pulse" />
                                <div className="h-3 w-40 bg-neutral-100 rounded mt-2 animate-pulse" />
                            </div>
                        </div>
                        {/* Fields */}
                        <div>
                            <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse mb-2" />
                            <div className="h-11 w-full bg-neutral-100 rounded-xl animate-pulse" />
                        </div>
                        <div>
                            <div className="h-4 w-12 bg-neutral-200 rounded animate-pulse mb-2" />
                            <div className="h-11 w-full bg-neutral-100 rounded-xl animate-pulse" />
                        </div>
                        <div className="h-11 w-32 bg-neutral-200 rounded-xl animate-pulse" />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-4">
                            <div className="h-5 w-24 bg-neutral-200 rounded animate-pulse" />
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="h-4 w-28 bg-neutral-100 rounded animate-pulse" />
                                    <div className="h-6 w-8 bg-neutral-200 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-3">
                            <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-4 w-36 bg-neutral-100 rounded animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
