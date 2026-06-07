import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useInView } from 'react-intersection-observer'
import api from '../api/axios'
import MovieCardSkeleton from "../components/MovieCardSkeleton";
import PageTransition from '../components/PageTransition';
import MovieCard from '../components/MovieCard';
const categoryMap = {
    'popular': { title: 'Popular Movies', endpoint: '/api/movies/popular' },
    'now-playing': { title: 'Now Playing', endpoint: '/api/movies/now-playing' },
    'trending': { title: 'Trending This Week', endpoint: '/api/movies/trending' },
}


export default function DiscoverPage() {
    const { category } = useParams()
    const navigate = useNavigate()
    const { ref, inView } = useInView()

    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    const { title, endpoint } = categoryMap[category] || {}

    useEffect(() => {
        if (title) document.title = `${title} — CineReview`
        return () => { document.title = 'CineReview' }
    }, [title])

    useEffect(() => {
        if (!endpoint) return;
        setMovies([]);
        setPage(1);
        setHasMore(true);
        setLoading(true);

        const fetchMovies = async () => {
            try {
                const res = await api.get(`${endpoint}?page=1`)
                setMovies(res.data.results || [])
                if (1 >= res.data.total_pages) setHasMore(false)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchMovies()
    }, [category]);

    useEffect(() => {
        if (!inView || !hasMore || loadingMore) return

        const fetchMore = async () => {
            setLoadingMore(true)
            try {
                const res = await api.get(`${endpoint}?page=${page + 1}`)
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
    }, [inView, hasMore, loadingMore, page, endpoint]);

    if (!endpoint) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <p className="text-zinc-500">Category not found.</p>
            </div>
        )
    }

    return (
        <PageTransition>
            <div className="min-h-screen bg-zinc-950 text-zinc-100">
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <button onClick={() => navigate(-1)} className="text-zinc-500 hover:text-zinc-300 text-sm mb-6">← Back</button>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="w-1 h-6 bg-rose-600 rounded-full shrink-0"></span>
                        <h1 className="font-serif text-3xl text-zinc-100">{title}</h1>
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