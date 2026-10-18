export default function ReviewCardSkeleton() {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex gap-4 animate-pulse">
            {/* Poster */}
            <div className="w-14 h-20 rounded-lg bg-zinc-800 shrink-0" />
            <div className="flex-1 space-y-2">
                {/* Title */}
                <div className="h-4 bg-zinc-800 rounded w-2/3" />
                {/* Username */}
                <div className="h-3 bg-zinc-800 rounded w-1/4" />
                {/* Text lines */}
                <div className="h-3 bg-zinc-800 rounded w-full" />
                <div className="h-3 bg-zinc-800 rounded w-4/5" />
                {/* Badge + date */}
                <div className="flex justify-between pt-1">
                    <div className="h-4 bg-zinc-800 rounded w-16" />
                    <div className="h-3 bg-zinc-800 rounded w-20" />
                </div>
            </div>
        </div>
    )
}