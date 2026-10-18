import { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer'
import api from '../api/axios';
import MovieCardSkeleton from "../components/MovieCardSkeleton";
import PageTransition from '../components/PageTransition'
import MovieCard from '../components/MovieCard';
import { Movie } from '../types';


const SORT_OPTIONS = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'release_date.desc', label: 'Latest' },
    { value: 'revenue.desc', label: 'Box Office' },
];

export default function GenrePage() {
    const { genreId } = useParams<{ genreId: string }>();
    const location = useLocation();
    const genreName = (location.state as { genreName?: string } | null)?.genreName || 'Genre';
    const { ref, inView } = useInView()
    const navigate = useNavigate();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [sortBy, setSortBy] = useState<string>('popularity.desc');
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

    useEffect(() => {
        document.title = `${genreName} Movies — CineReview`
        return () => { document.title = 'CineReview' }
    }, [genreName])

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true)
            try {
                const res = await api.get(`/api/movies/genre/${genreId}?page=1&sort=${sortBy}`)
                setMovies(res.data.results || [])
                if (1 >= res.data.total_pages) setHasMore(false)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchMovies()
    }, [genreId, sortBy]);

    useEffect(() => {
        if (!inView || !hasMore || loadingMore) return

        const fetchMore = async () => {
            setLoadingMore(true)
            try {
                const res = await api.get(`/api/movies/genre/${genreId}?page=${page + 1}&sort=${sortBy}`)
                setMovies(prev => [...prev, ...(res.data.results || [])])
                setPage(prev => prev + 1)
                if (page + 1 >= res.data.total_pages) setHasMore(false)
            } catch (err) {
                console.error(err)
            } finally {
                setLoadingMore(false)
            }
        }
        fetchMore()
    }, [inView, hasMore, loadingMore, page, genreId, sortBy]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (!(e.target as HTMLElement)?.closest('.sort-dropdown')) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClick)
        return () => document.removeEventListener('click', handleClick)
    }, [])

    return (
        <PageTransition>
            <div className="min-h-screen bg-zinc-950 text-zinc-100">
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <button onClick={() => navigate(-1)} className="text-zinc-500 hover:text-zinc-300 transition text-sm mb-6">
                        ← Back
                    </button>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="w-1 h-6 bg-rose-600 rounded-full shrink-0"></span>
                        <h1 className="font-serif text-4xl text-zinc-100">{genreName} Movies</h1>
                    </div>
                    <div className="relative mb-6 w-48 sort-dropdown">
                        <button
                            onClick={() => setDropdownOpen(p => !p)}
                            className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                            {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                            <span className="text-zinc-500 ml-2">{dropdownOpen ? '▲' : '▼'}</span>
                        </button>
                        {dropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg z-50 overflow-hidden">
                                {SORT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            setSortBy(opt.value);
                                            setMovies([]);
                                            setPage(1);
                                            setHasMore(true);
                                            setDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2.5 text-sm transition-colors
                        ${sortBy === opt.value
                                                ? 'text-rose-400 bg-zinc-800'
                                                : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {[...Array(10)].map((_, i) => <MovieCardSkeleton key={i} />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {movies.map(movie => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>
                    )}
                </div>
                {hasMore && (
                    <div ref={ref} className="py-8 flex justify-center">
                        {loadingMore && <div className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-rose-500 animate-spin" />}
                    </div>
                )}
            </div>
        </PageTransition>
    )
}