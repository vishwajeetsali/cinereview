export default function SentimentChart({ sentimentBreakdown }) {
    const { positive = 0, negative = 0, mixed = 0 } = sentimentBreakdown
    const total = positive + negative + mixed
    if (total === 0) return null

    const bars = [
        { label: 'Positive', value: positive, color: 'bg-emerald-500' },
        { label: 'Negative', value: negative, color: 'bg-rose-500' },
        { label: 'Mixed', value: mixed, color: 'bg-yellow-500' },
    ]

    return (
        <div className="space-y-2 pt-2">
            {bars.map((bar) => {
                const pct = Math.round((bar.value / total) * 100)
                return (
                    <div key={bar.label} className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500 w-16 shrink-0">{bar.label}</span>
                        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${bar.color}`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <span className="text-xs text-zinc-400 w-8 text-right shrink-0">{pct}%</span>
                    </div>
                )
            })}
        </div>
    )
}