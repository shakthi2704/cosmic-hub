import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import NEOTracker from '@/components/live/NEOTracker'

export const dynamic = 'force-dynamic'

export default function NEOPage() {
    return (
        <div className="min-h-screen bg-black">
            <Navbar />

            <div className="border-b border-white/[0.06] pt-20">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">
                        Live Data
                    </p>
                    <h1 className="text-2xl font-semibold text-white mb-1 flex items-center gap-3">
                        Near-Earth Objects
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-dot" />
                            LIVE
                        </span>
                    </h1>
                    <p className="text-white/40 text-sm">
                        Asteroids making close approaches to Earth, tracked by NASA JPL
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">
                <NEOTracker />
            </div>

            <Footer />
        </div>
    )
}