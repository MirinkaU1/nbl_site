"use client"

export function LiveTicker() {
  return (
    <div className="flex items-center gap-3 bg-nbl-surface border-b border-nbl-border px-4 py-2.5">
      <div className="flex items-center gap-2 shrink-0">
        <span className="live-dot w-2 h-2 rounded-full bg-nbl-orange inline-block" />
        <span className="text-nbl-orange text-xs font-bold tracking-widest">LIVE</span>
      </div>
      <div className="flex items-center gap-2 text-xs font-semibold text-nbl-white overflow-hidden">
        <span className="shrink-0">ABIDJAN HEAT</span>
        <span className="font-barlow text-nbl-orange font-black">86</span>
        <span className="text-nbl-gray">–</span>
        <span className="font-barlow text-nbl-orange font-black">82</span>
        <span className="shrink-0">TREICHVILLE</span>
        <span className="text-nbl-gray shrink-0">(Q4 4:21)</span>
      </div>
      <span className="ml-auto live-dot w-2 h-2 rounded-full bg-nbl-orange inline-block shrink-0" />
    </div>
  )
}
