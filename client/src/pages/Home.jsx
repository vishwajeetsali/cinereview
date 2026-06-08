import { useEffect, useState } from "react";
import api from '../api/axios'
import { useNavigate, Link } from "react-router-dom";
import { useDebounce } from 'use-debounce'
import MovieCardSkeleton from "../components/MovieCardSkeleton";
import PageTransition from '../components/PageTransition'
import MovieCard from '../components/MovieCard'


export default function Home() {
    const [query, setQuery] = useState("");
    const [popularMovies, setPopularMovies] = useState([]);
    const [nowPlaying, setNowPlaying] = useState([]);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [pageLoading, setPageLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)


    const navigate = useNavigate();
    const [debouncedQuery] = useDebounce(query, 500)

    useEffect(() => {
        document.title = 'CineReview'
    }, [])


    useEffect(() => {
        const fetchMovies = async (retries = 1) => {
            try {
                setPageLoading(true);
                const [popularRes, nowPlayingRes, trendingRes] = await Promise.all([
                    api.get("/api/movies/popular"),
                    api.get("/api/movies/now-playing"),
                    api.get("/api/movies/trending"),
                ]);
                setTrendingMovies(trendingRes.data.results?.slice(0, 10) || []);
                setPopularMovies(popularRes.data.results?.slice(0, 10) || []);
                setNowPlaying(nowPlayingRes.data.results?.slice(0, 10) || []);
            } catch (error) {
                console.error("Error fetching movies:", error);
                if (retries > 0) {
                    await new Promise(r => setTimeout(r, 2000))
                    return fetchMovies(retries - 1)
                }
            } finally {
                setPageLoading(false);
            }
        };
        fetchMovies();
    }, []);

    useEffect(() => {
        if (debouncedQuery.trim().length < 2) {
            setSuggestions([])
            return
        }
        const fetchSuggestions = async () => {
            try {
                const res = await api.get(`/api/movies/search?q=${encodeURIComponent(debouncedQuery)}`)
                setSuggestions(res.data.results?.slice(0, 5) || [])
            } catch (err) {
                console.error(err)
            }
        }
        fetchSuggestions()
    }, [debouncedQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setShowSuggestions(false);
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    return (
        <PageTransition>
            <div className="bg-zinc-950 min-h-screen text-zinc-100 overflow-x-hidden">

                {/* Hero */}

                <section className="relative py-20 px-6 text-center">
                    {/* Background poster collage */}
                    {trendingMovies.length > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none">
                            {trendingMovies.slice(0, 8).map((m, i) => (
                                <img
                                    key={m.id}
                                    src={`${import.meta.env.VITE_TMDB_IMAGE_BASE}${m.poster_path}`}
                                    className={`h-72 w-auto rounded-lg object-cover shrink-0 opacity-20 ${i % 2 === 0 ? 'rotate-2' : '-rotate-2'}`}
                                    alt=""
                                />
                            ))}
                        </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950/70 to-zinc-950" />

                    {/* Content */}
                    <div className="relative z-10">
                        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl mb-3 leading-tight">
                            Discover Movies You'll Love
                        </h1>
                        <p className="text-zinc-400 text-lg mb-8">Search, review and explore cinema with your community.</p>

                        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Search movies..."
                                    value={query}
                                    onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true) }}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    className="w-full bg-zinc-900 border border-zinc-700 hover:border-zinc-600 focus:border-rose-500 text-zinc-100 px-4 py-3 rounded-lg focus:outline-none transition-colors placeholder-zinc-600"
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 bg-zinc-800 border border-zinc-700 rounded-lg mt-1 z-50 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent">
                                        {suggestions.map((movie) => (
                                            <div key={movie.id} onClick={() => { setShowSuggestions(false); navigate(`/movie/${movie.id}`) }} className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800 cursor-pointer">
                                                {movie.poster_path ? (
                                                    <img
                                                        src={`${import.meta.env.VITE_TMDB_IMAGE_BASE}${movie.poster_path}`}
                                                        alt={movie.title}
                                                        className="w-12 h-16 object-cover rounded shrink-0"
                                                        onError={(e) => { e.target.style.display = 'none' }}
                                                    />
                                                ) : (
                                                    <div className="w-12 h-16 rounded shrink-0 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                                                        <span className="text-rose-500 text-xs">🎬</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-zinc-100 text-base font-semibold">{movie.title}</p>
                                                    <p className="text-zinc-400 text-sm">{movie.release_date?.split('-')[0]}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg cursor-pointer transition">
                                Search
                            </button>
                        </form>
                    </div>
                </section>


                {/* Movie sections */}
                {[
                    { title: 'Trending This Week', movies: trendingMovies, link: '/discover/trending' },
                    { title: 'Popular Movies', movies: popularMovies, link: '/discover/popular' },
                    { title: 'Now Playing', movies: nowPlaying, link: '/discover/now-playing' },
                ].map(({ title, movies, link }) => (
                    <section key={title} className="py-10 px-6 max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <span className="w-1 h-6 bg-rose-600 rounded-full shrink-0"></span>
                                <h2 className="font-serif text-2xl text-zinc-100">{title}</h2>
                            </div>
                            <Link to={link} className="text-sm text-rose-400 hover:text-rose-300 transition">See All →</Link>
                        </div>
                        {pageLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {[...Array(10)].map((_, i) => <MovieCardSkeleton key={i} />)}
                            </div>
                        ) : movies.length === 0 ? (
                            <p className="text-zinc-400">No movies found.</p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
                            </div>
                        )}
                    </section>
                ))}
            </div>
        </PageTransition >
    );
}