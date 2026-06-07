import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInView } from 'react-intersection-observer'
import { getFeed } from '../api/users.js'
import PageTransition from '../components/PageTransition';
import MoviePoster from '../components/MoviePoster';
import ReviewCardSkeleton from '../components/ReviewCardSkeleton'
import { Rss } from 'lucide-react'

export default function FeedPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const { ref, inView } = useInView();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Feed — CineReview'
        return () => { document.title = 'CineReview' }
    }, [])

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const res = await getFeed(1)
                setReviews(res.data.reviews || [])
                if (1 >= res.data.totalPages) setHasMore(false)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchFeed()
    }, []);

    useEffect(() => {
        if (!inView || !hasMore || loadingMore) return
        const fetchMore = async () => {
            setLoadingMore(true)
            try {
                const res = await getFeed(page + 1)
                setReviews(prev => [...prev, ...(res.data.reviews || [])])
                setPage(prev => prev + 1)
                if (page + 1 >= res.data.totalPages) setHasMore(false)
            } catch (err) {
                console.error(err)
            } finally {
                setLoadingMore(false)
            }
        }
        fetchMore()
    }, [inView, hasMore, loadingMore, page]);

    return (
        <PageTransition>
            <div className="min-h-screen bg-zinc-950 text-zinc-100">
                <div className="max-w-3xl mx-auto px-6 py-10">
                    <div className="flex items-center gap-4 mb-8">
                        <h1 className="font-serif text-3xl text-zinc-100 shrink-0">Your Feed</h1>
                        <div className="flex-1 h-px bg-zinc-800" />
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => <ReviewCardSkeleton key={i} />)}
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                                <Rss size={28} className="text-zinc-600" />
                            </div>
                            <p className="text-zinc-300 font-semibold">Your feed is empty</p>
                            <p className="text-zinc-600 text-sm">Follow people to see their reviews here.</p>
                            <a href="/search?q=" className="mt-2 text-sm text-rose-400 hover:text-rose-300 transition">Find people to follow →</a>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review._id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition rounded-xl p-4 flex gap-4">
                                    <MoviePoster
                                        path={review.moviePoster}
                                        title={review.movieTitle}
                                        className="w-14 h-20 shrink-0 cursor-pointer"
                                    />
                                    <div className="flex-1 space-y-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 onClick={() => navigate(`/movie/${review.tmdbId}`)} className="text-zinc-200 font-semibold text-sm cursor-pointer hover:text-rose-400 transition">{review.movieTitle}</h4>
                                            <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded shrink-0">
                                                <span className="text-yellow-400">★</span> {review.rating}/10
                                            </span>
                                        </div>
                                        <p onClick={() => navigate(`/user/${review.userId?._id}`)} className="text-xs text-zinc-500 cursor-pointer hover:text-rose-400 transition">
                                            {review.userId?.name}
                                        </p>
                                        <p className="text-zinc-400 text-sm line-clamp-2">{review.text}</p>
                                        <div className="flex justify-between items-center pt-1">
                                            {review.sentiment && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${review.sentiment === 'positive' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' :
                                                    review.sentiment === 'negative' ? 'bg-rose-900/60 text-rose-300 border border-rose-700/50' :
                                                        'bg-yellow-900/60 text-yellow-300 border border-yellow-700/50'
                                                    }`}>{review.sentiment}</span>
                                            )}
                                            <span className="text-xs text-zinc-600">{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {hasMore && (
                        <div ref={ref} className="py-8 flex justify-center">
                            {loadingMore && <div className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-rose-500 animate-spin" />}
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}