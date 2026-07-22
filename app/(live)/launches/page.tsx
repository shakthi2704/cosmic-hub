import { getUpcomingLaunches } from '@/lib/services/live.service'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LaunchList from '@/components/live/LaunchList'

export const revalidate = 300 // revalidate every 5 minutes

export default async function LaunchesPage() {
    let launches: Awaited<ReturnType<typeof getUpcomingLaunches>> = []

    try {
        launches = await getUpcomingLaunches()
    } catch {
        launches = []
    }

    return (
        <div className="min-h-screen bg-black">
            <Navbar />

            {/* Header */}
            <div className="border-b border-white/[0.06] pt-20">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">
                                Live Data
                            </p>
                            <h1 className="text-2xl font-semibold text-white mb-1 flex items-center gap-3">
                                Upcoming Launches
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-dot" />
                                    LIVE
                                </span>
                            </h1>
                            <p className="text-white/40 text-sm">
                                Real-time launch schedule from Space Launch Library
                            </p>
                        </div>
                        <div className="hidden sm:flex flex-col items-end gap-1">
                            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                                Next launch in
                            </p>
                            <CountdownBadge launches={launches} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Launch list */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                <LaunchList launches={launches} />
            </div>

            <Footer />
        </div>
    )
}

// Simple server-side next launch display
function CountdownBadge({ launches }: { launches: Awaited<ReturnType<typeof getUpcomingLaunches>> }) {
    const next = launches[0]
    if (!next?.net) return null
    return (
        <p className="text-white/60 text-sm font-mono">
            {new Date(next.net).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
            })}
        </p>
    )
}