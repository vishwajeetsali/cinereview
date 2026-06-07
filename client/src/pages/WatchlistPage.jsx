import { useEffect, useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import PageTransition from '../components/PageTransition'
import { X, Bookmark } from 'lucide-react'
import MovieCard from '../components/MovieCard';

export default function WatchlistPage() {
    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        document.title = 'My Watchlist — CineReview'
        return () => { document.title = 'CineReview' }
    }, [])

    useEffect(() => {
        const fetchWatchlist = async () => {
            try {
                const res = await api.get('/api/users/watchlist')
                setMovies(res.data || [])
            } catch (err) {
                console.error('Failed to fetch watchlist:', err)
                toast.error('Could not load your watchlist.')
            } finally {
                setLoading(false)
            }
        }
        fetchWatchlist()
    }, [])

    const handleRemove = async (e, tmdbId) => {
        e.stopPropagation() // Prevents triggering the movie navigation underneath

        // 1. Optimistic UI Update: Remove instantly
        const previousMovies = [...movies]
        setMovies(prev => prev.filter(m => m.tmdbId !== tmdbId))

        // 2. Perform Backend Task
        try {
            await api.post('/api/users/watchlist/toggle', { tmdbId })
            toast.success('Removed from watchlist')
        } catch (err) {
            // 3. Rollback if the backend fails
            console.error('Failed to remove movie:', err)
            setMovies(previousMovies)
            toast.error('Failed to remove movie. Please try again.')
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-rose-500 animate-spin" />
        </div>
    )

    return (
        <PageTransition>
            <div className="min-h-screen bg-zinc-950 text-zinc-100">
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="w-1 h-6 bg-rose-600 rounded-full shrink-0"></span>
                        <h1 className="font-serif text-4xl text-zinc-100">My Watchlist</h1>
                    </div>

                    {movies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                                <Bookmark size={28} className="text-zinc-600" />
                            </div>
                            <p className="text-zinc-300 font-semibold">Your watchlist is empty</p>
                            <p className="text-zinc-600 text-sm">Save movies you want to watch later.</p>
                            <a href="/" className="mt-2 text-sm text-rose-400 hover:text-rose-300 transition">Browse movies →</a>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {movies.map(movie => (
                                <div key={movie.tmdbId} className="relative group">

                                    {/* Action Button */}
                                    <button
                                        onClick={(e) => handleRemove(e, movie.tmdbId)}
                                        className="absolute top-2 right-2 z-20 bg-black/70 text-zinc-300 hover:text-rose-400 rounded-full p-1 opacity-0 group-hover:opacity-100 transition duration-200"
                                        aria-label="Remove from watchlist"
                                    >
                                        <X size={16} />
                                    </button>

                                    {/* Tooltip */}
                                    <span className="absolute top-2 right-10 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-20 shadow-lg">
                                        Remove
                                    </span>

                                    {/* Poster & Fallback */}
                                    <div className="hover:scale-105 transition-transform duration-300 ease-out">
                                        <MovieCard movie={{ id: movie.tmdbId, poster_path: movie.moviePoster, title: movie.movieTitle }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    )
}