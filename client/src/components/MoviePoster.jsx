const Fallback = ({ title, className }) => (
    <div className={`rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center gap-2 p-3 ${className}`}>
        <div className="w-8 h-8 bg-rose-600/20 border border-rose-600/30 rounded-md flex items-center justify-center">
            <span className="text-rose-500 text-sm">🎬</span>
        </div>
        <span className="text-zinc-500 text-[11px] text-center leading-tight line-clamp-3">{title}</span>
    </div>
);

export default function MoviePoster({ path, title, className = "w-full aspect-[2/3]" }) {
    const url = path ? `${import.meta.env.VITE_TMDB_IMAGE_BASE}${path}` : null;

    if (!url) return <Fallback title={title} className={className} />;

    return (
        <img
            src={url}
            alt={title}
            loading="lazy"
            className={`rounded-lg object-cover ${className}`}
            onError={(e) => {
                const fallback = document.createElement('div');
                fallback.className = `rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center gap-2 p-3 ${className}`;
                fallback.innerHTML = `
                    <div style="width:32px;height:32px;background:rgba(225,29,72,0.2);border:1px solid rgba(225,29,72,0.3);border-radius:6px;display:flex;align-items:center;justify-content:center">
                        <span style="color:#f43f5e;font-size:14px">🎬</span>
                    </div>
                    <span style="color:#71717a;font-size:11px;text-align:center;line-height:1.4">${title}</span>
                `;
                e.target.replaceWith(fallback);
            }}
        />
    );
}