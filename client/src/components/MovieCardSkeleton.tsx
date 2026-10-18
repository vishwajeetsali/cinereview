export default function MovieCardSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="w-full aspect-[2/3] rounded-lg bg-zinc-800" />
            <div className="h-4 bg-zinc-800 rounded mt-2 w-3/4" />
            <div className="h-3 bg-zinc-800 rounded mt-1 w-1/4" />
        </div>
    )
}