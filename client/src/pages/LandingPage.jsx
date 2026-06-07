import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PageTransition from '../components/PageTransition';

// ─── Data ───────────────────────────────────────────────────────────────────

const FEATURES = [
    {
        icon: '✍️',
        title: 'Write & analyse reviews',
        span: 'lg',
        desc: 'Rate any film and write your take. Every review is instantly analysed by AI for tone and sentiment.',
        mock: 'review',
    },
    {
        icon: '🤖',
        title: 'AI community verdicts',
        span: 'sm',
        desc: 'Every 10 reviews auto-generates a verdict — a distilled summary of what the community truly thinks.',
        mock: 'verdict',
    },
    {
        icon: '📡',
        title: 'Social feed',
        span: 'sm',
        desc: 'Follow critics and friends. Their latest reviews show up right in your personal feed.',
        mock: 'feed',
    },
    {
        icon: '⚡',
        title: 'Live comments & notifications',
        span: 'lg',
        desc: 'Discuss scenes in real-time with Socket.io-powered live comments. Get instant notifications for likes, follows, and replies.',
        mock: 'notif',
    },
    {
        icon: '🔖',
        title: 'Watchlist',
        span: 'half',
        desc: "Save movies to watch later. Track what you've already seen. Never forget a recommendation again.",
        mock: null,
    },
    {
        icon: '🎬',
        title: 'Movie discovery',
        span: 'half',
        desc: 'Trending, popular, similar films, cast pages — all powered by TMDB. Find your next obsession in seconds.',
        mock: null,
    },
];

const STEPS = [
    { num: '01', title: 'Create your account', desc: 'Sign up free with email or Google OAuth. No credit card. No catch.' },
    { num: '02', title: 'Find a film', desc: 'Search millions of movies powered by TMDB. Trending, popular, or deep cuts.' },
    { num: '03', title: 'Write your review', desc: 'Rate it, write your take, and let AI instantly analyse your sentiment.' },
    { num: '04', title: 'Join the community', desc: 'Follow critics, comment live, get verdicts, and build your film identity.' },
];

const MARQUEE_ITEMS = [
    'Write Reviews', 'AI Sentiment Analysis', 'Community Verdicts', 'Live Comments',
    'Follow Critics', 'Watchlists', 'Movie Discovery', 'Cast Pages',
    'Real-time Notifications', 'Google OAuth', 'Trending Films', 'Social Feed',
];

const FEED_ITEMS = [
    { initials: 'AR', color: '#7c3aed', name: 'Arjun', action: 'reviewed Dune: Part Two', time: '2m' },
    { initials: 'PS', color: '#0891b2', name: 'Priya', action: 'added Oppenheimer to watchlist', time: '14m' },
    { initials: 'RN', color: '#059669', name: 'Rahul', action: 'liked your review of Interstellar', time: '1h' },
];

const NOTIF_ITEMS = [
    { icon: '❤️', text: <><b>Sneha</b> liked your review of The Dark Knight</>, unread: true },
    { icon: '💬', text: <><b>Vikram</b> replied to your comment</>, unread: true },
    { icon: '👥', text: <><b>Meera</b> started following you</>, unread: false },
];

// ─── Mock UI sub-components ──────────────────────────────────────────────────

function MockReview() {
    return (
        <div className="mt-5 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="text-yellow-400 text-sm mb-1">★★★★☆</div>
            <p className="text-zinc-400 text-xs leading-relaxed">
                "A masterclass in tension. Nolan's direction keeps you on edge every second — the ending hit differently than I expected."
            </p>
            {[
                { label: 'Positive', w: '72%', color: '#22c55e' },
                { label: 'Neutral', w: '18%', color: '#d4a853' },
                { label: 'Negative', w: '10%', color: '#e11d48' },
            ].map(({ label, w, color }) => (
                <div key={label} className="flex items-center gap-2 mt-2">
                    <span className="text-zinc-600 text-[10px] uppercase tracking-wider w-14 shrink-0">{label}</span>
                    <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: w, background: color }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

function MockVerdict() {
    return (
        <div className="mt-5 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/25 text-green-300 text-[10px] uppercase tracking-wider mb-2">
                ✦ Auto-generated verdict
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed italic">
                "Audiences overwhelmingly praise the visceral direction and career-best performance, while a vocal minority finds the pacing uneven in the second act."
            </p>
        </div>
    );
}

function MockFeed() {
    return (
        <div className="mt-5 flex flex-col gap-2">
            {FEED_ITEMS.map((item) => (
                <div key={item.name} className="flex items-center gap-2.5 bg-zinc-900 rounded-lg px-3 py-2.5 border border-zinc-800">
                    <div
                        className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-[10px] font-medium"
                        style={{ background: item.color }}
                    >
                        {item.initials}
                    </div>
                    <p className="text-zinc-400 text-xs flex-1">
                        <span className="text-zinc-100 font-medium">{item.name}</span> {item.action}
                    </p>
                    <span className="text-zinc-600 text-[10px] shrink-0">{item.time}</span>
                </div>
            ))}
        </div>
    );
}

function MockNotif() {
    return (
        <div className="mt-5 flex flex-col gap-2">
            {NOTIF_ITEMS.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-zinc-900 rounded-lg px-3 py-2.5 border border-zinc-800">
                    <span className="text-sm">{item.icon}</span>
                    <p className="text-zinc-400 text-xs flex-1">{item.text}</p>
                    {item.unread && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />}
                </div>
            ))}
        </div>
    );
}

// ─── BentoCard ───────────────────────────────────────────────────────────────

function BentoCard({ icon, title, desc, span, mock }) {
    const spanClass =
        span === 'lg' ? 'col-span-12 md:col-span-7' :
            span === 'sm' ? 'col-span-12 md:col-span-5' :
    /* half */        'col-span-12 md:col-span-6';

    return (
        <div className={`${spanClass} group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-7 overflow-hidden transition-colors hover:border-rose-600/30`}>
            {/* hover glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(225,29,72,0.04),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="w-10 h-10 rounded-xl bg-rose-600/10 border border-rose-600/20 flex items-center justify-center text-lg mb-5">
                {icon}
            </div>
            <h3 className="font-serif text-xl text-zinc-100 mb-2">{title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed font-light">{desc}</p>
            {mock === 'review' && <MockReview />}
            {mock === 'verdict' && <MockVerdict />}
            {mock === 'feed' && <MockFeed />}
            {mock === 'notif' && <MockNotif />}
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function LandingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [posters, setPosters] = useState([]);

    useEffect(() => {
        if (user) navigate('/home');
    }, [user]);

    useEffect(() => {
        const fetchPosters = async () => {
            try {
                const [r1, r2] = await Promise.all([
                    api.get('/api/movies/trending'),
                    api.get('/api/movies/popular'),
                ]);
                const all = [
                    ...(r1.data.results || []),
                    ...(r2.data.results || []),
                ].filter((m) => m.poster_path);
                setPosters(all.slice(0, 24));
            } catch { }
        };
        fetchPosters();
    }, []);

    // Split into 4 columns
    const cols = [0, 1, 2, 3].map((ci) => posters.filter((_, i) => i % 4 === ci));

    const colOffsets = ['', '-mt-14', '-mt-7', '-mt-20'];

    return (
        <PageTransition>
            {/* Google Fonts — add to index.html instead if you prefer */}
            <style>{`
    
        .font-serif  { font-family: 'DM Serif Display', serif; }
        .font-bebas  { font-family: 'Bebas Neue', sans-serif; }
        .font-dm     { font-family: 'DM Sans', sans-serif; }
        @keyframes slowScroll { to { transform: translateY(-50%); } }
        @keyframes marquee    { to { transform: translateX(-50%); } }
        @keyframes badgePulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .animate-scroll  { animation: slowScroll var(--dur,40s) linear infinite; }
        .animate-marquee { animation: marquee 22s linear infinite; }
        .badge-pulse     { animation: badgePulse 2s infinite; }
        .rose-top-line::before {
          content:'';
          position:absolute; top:-1px; left:40px; right:40px; height:1px;
          background:linear-gradient(to right,transparent,#e11d48,transparent);
        }
      `}</style>

            <div className="bg-zinc-950 text-zinc-100 font-dm overflow-x-hidden">

                {/* ── NAV ─────────────────────────────────────────────────────────── */}
                <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5
                        bg-gradient-to-b from-zinc-950/90 to-transparent backdrop-blur-sm">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-rose-600 rounded-sm rotate-12"></div>
                        <span className="text-zinc-100 text-xl font-black tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            CINE<span className="text-rose-600">REVIEW</span>
                        </span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-zinc-400 hover:text-zinc-100 text-sm tracking-wide transition-colors">Features</a>
                        <a href="#how" className="text-zinc-400 hover:text-zinc-100 text-sm tracking-wide transition-colors">How it works</a>
                        <a href="#ai" className="text-zinc-400 hover:text-zinc-100 text-sm tracking-wide transition-colors">AI Verdicts</a>
                        <Link to="/login" className="text-zinc-400 hover:text-zinc-100 text-sm tracking-wide transition-colors">Sign in</Link>
                        <Link to="/register" className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors">
                            Get started
                        </Link>
                    </div>
                </nav>

                {/* ── HERO ────────────────────────────────────────────────────────── */}
                <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

                    {/* Poster grid */}
                    <div className="absolute inset-0 flex gap-2.5 px-2.5 opacity-[0.22] pointer-events-none overflow-hidden">
                        {cols.map((col, ci) => (
                            <div
                                key={ci}
                                className={`flex-1 flex flex-col gap-2.5 ${colOffsets[ci]}`}
                            >
                                {/* duplicate for seamless loop */}
                                <div
                                    className="flex flex-col gap-2.5 animate-scroll"
                                    style={{ '--dur': `${38 + ci * 4}s` }}
                                >
                                    {[...col, ...col].map((m, i) => (
                                        <img
                                            key={`${m.id}-${i}`}
                                            src={`${import.meta.env.VITE_TMDB_IMAGE_BASE}${m.poster_path}`}
                                            alt=""
                                            className="w-full rounded-lg object-cover aspect-[2/3]"
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sprocket strip */}
                    <div className="absolute top-0 left-0 right-0 h-4 bg-white/[0.02] border-b border-white/[0.05] flex items-center gap-6 px-4 pointer-events-none overflow-hidden">
                        {Array.from({ length: 50 }).map((_, i) => (
                            <div key={i} className="w-2.5 h-2.5 rounded-sm border border-white/[0.08] shrink-0" />
                        ))}
                    </div>

                    {/* Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/75 via-zinc-950/40 to-zinc-950 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-zinc-950/80 pointer-events-none" />

                    {/* Rose glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse, rgba(225,29,72,0.12) 0%, transparent 70%)' }} />

                    {/* Content */}
                    <div className="relative z-10 text-center px-6 max-w-3xl mx-auto pt-20">

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-rose-500/40 rounded-full
                            bg-rose-500/[0.07] text-rose-400 text-[11px] tracking-widest uppercase mb-8">
                            <span className="badge-pulse w-1.5 h-1.5 rounded-full bg-rose-500" />
                            AI-Powered Reviews
                        </div>

                        <span className="block font-bebas text-sm tracking-[0.35em] text-yellow-500/80 mb-1 uppercase">
                            The Cinephile's Platform
                        </span>

                        <h1 className="font-serif text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] mb-6 text-zinc-100">
                            Cinema lives<br />
                            <em className="text-rose-500">in community.</em>
                        </h1>

                        <p className="text-zinc-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed font-light">
                            Discover films, write reviews powered by AI sentiment analysis, get community verdicts,
                            and connect with people who live for the movies.
                        </p>

                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            <Link to="/register"
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white
                           font-medium rounded-lg transition-all hover:-translate-y-0.5 text-[0.95rem] tracking-wide">
                                Start for free →
                            </Link>
                            <Link to="/login"
                                className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/15 hover:border-white/35
                           text-zinc-400 hover:text-zinc-100 rounded-lg transition-all text-[0.95rem]">
                                Sign in
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="mt-12 pt-8 border-t border-white/[0.06] flex justify-center gap-10 flex-wrap">
                            {[
                                { num: '10K+', label: 'Movies' },
                                { num: 'AI', label: 'Verdicts' },
                                { num: 'Live', label: 'Comments' },
                                { num: 'Free', label: 'Always' },
                            ].map(({ num, label }) => (
                                <div key={label} className="text-center">
                                    <span className="block font-bebas text-3xl tracking-wide text-zinc-100">{num}</span>
                                    <span className="text-[10px] tracking-widest uppercase text-zinc-600">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── MARQUEE ─────────────────────────────────────────────────────── */}
                <div className="py-4 border-y border-white/[0.05] bg-zinc-900 overflow-hidden">
                    <div className="flex gap-8 w-max animate-marquee">
                        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                            <span key={i} className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-zinc-600 shrink-0">
                                <span className="w-1 h-1 rounded-full bg-rose-500" />
                                {item}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ── FEATURES ────────────────────────────────────────────────────── */}
                <section className="py-24 px-6 bg-zinc-950" id="features">
                    <div className="max-w-6xl mx-auto">
                        <span className="block text-[11px] tracking-[0.2em] uppercase text-rose-500 mb-3">What you get</span>
                        <h2 className="font-serif text-[clamp(2rem,4vw,3.2rem)] leading-tight text-zinc-100 mb-3">
                            Everything a cinephile needs
                        </h2>
                        <p className="text-zinc-400 text-base max-w-md leading-relaxed font-light">
                            Built for people who take movies seriously. Not just a list — a living, breathing film community.
                        </p>

                        <div className="grid grid-cols-12 gap-3 mt-14">
                            {FEATURES.map((f) => (
                                <BentoCard key={f.title} {...f} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
                <section className="py-24 px-6 bg-zinc-900 border-y border-zinc-800" id="how">
                    <div className="max-w-6xl mx-auto">
                        <span className="block text-[11px] tracking-[0.2em] uppercase text-rose-500 mb-3">Getting started</span>
                        <h2 className="font-serif text-[clamp(2rem,4vw,3.2rem)] text-zinc-100 mb-14">Up in seconds</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                            {STEPS.map((step, i) => (
                                <div key={step.num} className={`py-8 px-7 ${i !== 0 ? 'border-l border-zinc-800' : ''}`}>
                                    <span className="font-bebas text-6xl text-rose-600/12 leading-none block mb-3">{step.num}</span>
                                    <div className="text-zinc-100 font-medium text-sm mb-2">{step.title}</div>
                                    <div className="text-zinc-400 text-sm leading-relaxed font-light">{step.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── AI SECTION ──────────────────────────────────────────────────── */}
                <section className="py-24 px-6 bg-zinc-950" id="ai">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                        <div>
                            <span className="block text-[11px] tracking-[0.2em] uppercase text-rose-500 mb-3">Powered by Groq AI</span>
                            <h2 className="font-serif text-[clamp(2rem,4vw,3.2rem)] leading-tight text-zinc-100 mb-4">
                                Reviews that think back
                            </h2>
                            <p className="text-zinc-400 text-base leading-relaxed font-light max-w-md">
                                Every review is analysed for positive, neutral, and negative sentiment in real time.
                                When a film hits 10 reviews, our AI distills the community consensus into a single definitive verdict.
                            </p>
                        </div>

                        {/* AI verdict card */}
                        <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-7 rose-top-line">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md
                              bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] tracking-widest uppercase mb-4">
                                ✦ Live verdict
                            </div>
                            <div className="font-serif text-lg text-zinc-100">Oppenheimer (2023)</div>
                            <div className="text-zinc-600 text-xs mb-5">Based on 24 community reviews</div>

                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="font-bebas text-6xl text-yellow-400 tracking-wide">4.3</span>
                                <span className="text-zinc-500 text-sm">/ 5</span>
                            </div>
                            <div className="text-yellow-400 text-lg mb-6">★★★★☆</div>

                            <div className="grid grid-cols-3 gap-2.5 mb-6">
                                {[
                                    { pct: '78%', label: 'Positive', color: '#22c55e' },
                                    { pct: '14%', label: 'Neutral', color: '#d4a853' },
                                    { pct: '8%', label: 'Negative', color: '#e11d48' },
                                ].map(({ pct, label, color }) => (
                                    <div key={label} className="bg-zinc-950 rounded-xl p-3 border border-zinc-800 text-center">
                                        <span className="font-bebas text-2xl block" style={{ color }}>{pct}</span>
                                        <span className="text-[10px] tracking-widest uppercase text-zinc-600">{label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-rose-500/[0.06] border border-rose-500/15 rounded-xl p-4">
                                <div className="text-[10px] tracking-widest uppercase text-rose-500 mb-2">Community Verdict</div>
                                <p className="text-zinc-400 text-xs leading-relaxed italic">
                                    "A monumental achievement in cinema. The community celebrates Nolan's audacious vision
                                    and Cillian Murphy's defining performance, calling it a generational masterpiece."
                                </p>
                            </div>
                        </div>

                    </div>
                </section>

                {/* ── CTA ─────────────────────────────────────────────────────────── */}
                <section className="relative py-28 px-6 bg-zinc-900 border-t border-zinc-800 text-center overflow-hidden">
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[280px] pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse, rgba(225,29,72,0.1), transparent 70%)' }} />
                    <div className="relative z-10 max-w-xl mx-auto">
                        <span className="block text-[11px] tracking-[0.2em] uppercase text-rose-500 mb-3">Join CineReview</span>
                        <h2 className="font-serif text-[clamp(2rem,4vw,3.5rem)] leading-tight text-zinc-100 mb-4">
                            Ready to watch differently?
                        </h2>
                        <p className="text-zinc-400 mb-10 leading-relaxed font-light">
                            Free forever. No ads. Just cinema and the people who love it.
                        </p>
                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            <Link to="/register"
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white
                           font-medium rounded-lg transition-all hover:-translate-y-0.5 text-[0.95rem]">
                                Create free account →
                            </Link>
                            <Link to="/login"
                                className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/15 hover:border-white/35
                           text-zinc-400 hover:text-zinc-100 rounded-lg transition-all text-[0.95rem]">
                                Sign in instead
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ──────────────────────────────────────────────────────── */}
                <footer className="bg-zinc-950 border-t border-zinc-800 px-10 py-6 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-rose-600 rounded-sm rotate-12"></div>
                        <span className="text-zinc-100 text-xl font-black tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            CINE<span className="text-rose-600">REVIEW</span>
                        </span>
                    </div>
                    <span className="text-zinc-600 text-xs">© 2026 CineReview · Built by Vishwajeet</span>
                    <div className="flex gap-6">
                        {['Privacy', 'Terms', 'GitHub'].map((link) => (
                            <a key={link} href="#" className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">{link}</a>
                        ))}
                    </div>
                </footer>

            </div>
        </PageTransition>
    );
}