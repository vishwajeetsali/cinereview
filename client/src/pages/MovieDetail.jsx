import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import EditReviewModal from '../components/EditReviewModal';
import { useAuth } from "../context/AuthContext";
import useSocket from "../hooks/useSocket";
import SentimentChart from "../components/SentimentChart";
import CommentSection from '../components/CommentSection';
import { Trash2, Pencil, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import MovieCard from '../components/MovieCard';

export default function MovieDetail() {
    const { tmdbId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [credits, setCredits] = useState([]);
    const [crew, setCrew] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [verdict, setVerdict] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [error, setError] = useState("");
    const [reviewError, setReviewError] = useState("");
    const [inWatchlist, setInWatchlist] = useState(false);
    const [similar, setSimilar] = useState([]);
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [editingReview, setEditingReview] = useState(null);

    const appRating = reviews.length
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    const handleNewReview = (review) => setReviews(prev => [review, ...prev]);
    const handleVerdictUpdated = (verdict) => setVerdict(verdict);

    useSocket(tmdbId, handleNewReview, handleVerdictUpdated);

    const isLoggedIn = !!user;

    useEffect(() => {
        if (movie) document.title = `${movie.title} — CineReview`
        return () => { document.title = 'CineReview' }
    }, [movie])

    useEffect(() => {
        const fetchMovieData = async () => {
            try {
                setLoading(true);
                setReviewsLoading(true);
                setError("");

                const [movieRes, reviewsRes, creditsRes] = await Promise.all([
                    api.get(`/api/movies/${tmdbId}`),
                    api.get(`/api/reviews/${tmdbId}`),
                    api.get(`/api/movies/${tmdbId}/credits`),
                ]);

                setMovie(movieRes.data);
                setReviews(reviewsRes.data.reviews || reviewsRes.data || []);
                setCredits(creditsRes.data.cast?.slice(0, 10) || []);
                setCrew(creditsRes.data.crew?.filter(p =>
                    ['Director', 'Screenplay', 'Producer'].includes(p.job)
                ) || []);

                try {
                    const verdictRes = await api.get(`/api/verdict/${tmdbId}`);
                    setVerdict(verdictRes.data);
                } catch { }

                try {
                    const similarRes = await api.get(`/api/movies/similar/${tmdbId}`)
                    setSimilar(similarRes.data.results?.filter(m => m.poster_path).slice(0, 10) || [])
                } catch { }

                if (user) {
                    const watchlistRes = await api.get('/api/users/watchlist');
                    const found = watchlistRes.data.some(item => item.tmdbId === Number(tmdbId));
                    setInWatchlist(found);
                }
            } catch (err) {
                console.error("Error fetching movie details:", err);
                setError("Failed to load movie details.");
            } finally {
                setLoading(false);
                setReviewsLoading(false);
            }
        };

        if (tmdbId) fetchMovieData();
    }, [tmdbId]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewText.trim()) return;
        try {
            setSubmitting(true);
            setReviewError("");
            await api.post("/api/reviews", {
                tmdbId: Number(tmdbId),
                movieTitle: movie.title,
                moviePoster: movie.poster_path,
                rating,
                text: reviewText,
            });
            setReviewText("");
            setRating(5);
            toast.success('Review posted!');
        } catch (err) {
            setReviewError(err.response?.data?.message || "Could not submit review.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await api.delete(`/api/reviews/${reviewId}`);
            setReviews(prev => prev.filter(r => r._id !== reviewId));
            toast.success('Review deleted');
        } catch (err) {
            console.error(err)
        }
    };

    const handleLike = async (reviewId) => {
        if (!user) return toast.error('Login to like')
        try {
            const res = await api.post(`/api/reviews/${reviewId}/like`)
            setReviews(prev => prev.map(r => r._id === reviewId ? {
                ...r,
                likes: res.data.liked
                    ? [...(r.likes || []), user.id]
                    : (r.likes || []).filter(id => id !== user.id)
            } : r))
        } catch (err) {
            console.error(err)
        }
    }

    const handleWatchlist = async () => {
        try {
            const res = await api.post('/api/users/watchlist/toggle', {
                tmdbId: Number(tmdbId),
                movieTitle: movie.title,
                moviePoster: movie.poster_path
            })
            setInWatchlist(res.data.inWatchlist)
            toast.success(res.data.inWatchlist ? 'Added to watchlist' : 'Removed from watchlist')
        } catch (err) {
            console.error(err)
        }
    }

    const posterUrl = movie?.poster_path
        ? `${import.meta.env.VITE_TMDB_IMAGE_BASE}${movie.poster_path}`
        : '/placeholder.png';

    const sentimentBadgeBg = (sentiment) => {
        if (!sentiment) return "bg-zinc-700 text-zinc-300";
        const s = sentiment.toLowerCase();
        if (s === "positive") return "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50";
        if (s === "negative") return "bg-rose-900/60 text-rose-300 border border-rose-700/50";
        return "bg-yellow-900/60 text-yellow-300 border border-yellow-700/50";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-zinc-700 border-t-rose-500 animate-spin" />
                    <p className="text-zinc-500 text-sm tracking-widest uppercase">Loading</p>
                </div>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <p className="text-rose-400 text-lg">{error || "Movie not found."}</p>
                    <Link to="/" className="text-zinc-500 hover:text-zinc-300 text-sm underline underline-offset-4 transition-colors">
                        ← Back to home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="min-h-screen bg-zinc-950 text-zinc-100">
                {movie.backdrop_path && (
                    <div className="relative h-64 md:h-80 overflow-hidden">
                        <img
                            src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
                            alt=""
                            className="w-full h-full object-cover object-top opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/60 to-zinc-950" />
                        <button
                            onClick={() => navigate(-1)}
                            className="absolute top-4 left-4 flex items-center gap-2 text-zinc-100 hover:text-white transition text-sm font-medium bg-black/50 border border-zinc-700 px-4 py-2 rounded-lg backdrop-blur-sm hover:bg-black/70"
                        >
                            ← Back
                        </button>
                    </div>
                )}

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                    <div className={`flex flex-col sm:flex-row gap-8 ${movie.backdrop_path ? "-mt-32 relative z-10" : "pt-12"}`}>
                        <div className="shrink-0 mx-auto sm:mx-0">
                            <div className="w-44 sm:w-52 rounded-xl overflow-hidden shadow-2xl shadow-black/70 ring-1 ring-white/5">
                                <img src={posterUrl} alt={movie.title} className="w-full h-auto object-cover" />
                            </div>
                        </div>
                        <div className="flex flex-col justify-end gap-3 text-center sm:text-left items-center sm:items-start">
                            <h1 className="font-serif text-5xl sm:text-5xl text-white leading-tight">
                                {movie.title}
                            </h1>

                            {isLoggedIn && (
                                <div className="relative group w-fit">
                                    <button onClick={handleWatchlist} className={`w-fit flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition ${inWatchlist ? 'border-rose-500 text-rose-400 bg-rose-500/10' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>
                                        {inWatchlist ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                                        {inWatchlist ? 'Saved' : 'Watchlist'}
                                    </button>
                                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                                        {inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                                    </span>
                                </div>
                            )}

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-zinc-400">
                                {movie.release_date && (
                                    <span className="bg-zinc-800 px-2.5 py-1 rounded-md">{movie.release_date.split("-")[0]}</span>
                                )}
                                {movie.vote_average != null && (
                                    <span className="flex items-center gap-1.5 bg-zinc-800 px-2.5 py-1 rounded-md">
                                        <span className="text-yellow-400">★</span>
                                        <span className="text-zinc-200 font-medium">{Number(movie.vote_average).toFixed(1)}</span>
                                        <span className="text-zinc-500">/10</span>
                                    </span>
                                )}
                                {appRating && (
                                    <span className="flex items-center gap-1.5 bg-zinc-800 px-2.5 py-1 rounded-md">
                                        <span className="text-rose-400">★</span>
                                        <span className="text-zinc-200 font-medium">{appRating}</span>
                                        <span className="text-zinc-500">/10</span>
                                        <span className="text-zinc-600 text-xs">CR</span>
                                    </span>
                                )}
                                {movie.runtime > 0 && (
                                    <span className="bg-zinc-800 px-2.5 py-1 rounded-md">
                                        {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                                    </span>
                                )}
                            </div>

                            {(movie.genres || []).length > 0 && (
                                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                    {movie.genres.map((genre) => (
                                        <span
                                            key={genre.id || genre.name}
                                            onClick={() => navigate(`/genre/${genre.id}`, { state: { genreName: genre.name } })}
                                            className="text-xs px-3 py-1 rounded-full border border-zinc-700 text-zinc-400 hover:border-rose-600 hover:text-rose-400 transition-colors cursor-pointer"
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
                                {movie.overview || "No overview available."}
                            </p>
                        </div>
                    </div>

                    {credits.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Cast</h3>
                            <div className="flex gap-2 flex-wrap">
                                {credits.map(person => (
                                    <span key={person.id} onClick={() => navigate(`/person/${person.id}`)} className="text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-full text-zinc-300 cursor-pointer hover:border-rose-500 hover:text-rose-400 transition">
                                        {person.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {crew.length > 0 && (
                        <div className="mt-3">
                            <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Crew</h3>
                            <div className="flex gap-2 flex-wrap">
                                {crew.map(person => (
                                    <span key={`${person.id}-${person.job}`} onClick={() => navigate(`/person/${person.id}`)} className="text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-full text-zinc-300 cursor-pointer hover:border-rose-500 hover:text-rose-400 transition">
                                        {person.name} <span className="text-zinc-500">· {person.job}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {verdict && (
                        <div className="mt-10 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800/50 border border-zinc-700/50 p-5 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold tracking-widest uppercase text-rose-500">AI Verdict</span>
                                <span className="text-zinc-600 text-xs">· based on {verdict.totalReviews} reviews</span>
                            </div>
                            <p className="text-zinc-200 text-sm leading-relaxed">{verdict.verdictText}</p>
                            {verdict.sentimentBreakdown && <SentimentChart sentimentBreakdown={verdict.sentimentBreakdown} />}
                        </div>
                    )}

                    {similar.length > 0 && (
                        <div className="mt-10">
                            <h2 className="font-serif text-lg text-zinc-100 mb-4">You Might Also Like</h2>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {similar.map(m => (
                                    <MovieCard key={m.id} movie={m} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-12 mb-8 flex items-center gap-4">
                        <h2 className="font-serif text-lg text-zinc-100 shrink-0">Reviews</h2>
                        <div className="flex-1 h-px bg-zinc-800" />
                        {!reviewsLoading && (
                            <span className="text-xs text-zinc-600 shrink-0">
                                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                            </span>
                        )}
                    </div>

                    {isLoggedIn && (
                        <div className="mb-10 rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
                            <h3 className="text-sm font-semibold text-zinc-300 tracking-wide uppercase">Write a Review</h3>
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <label className="text-xs text-zinc-500 uppercase tracking-widest shrink-0">Rating</label>
                                    <div className="flex gap-1 flex-wrap">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setRating(n)}
                                                className={`w-7 h-7 rounded text-xs font-semibold transition-all ${n <= rating ? "bg-rose-600 text-white" : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"}`}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-xs text-zinc-500">{rating}/10</span>
                                </div>
                                <textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    rows={4}
                                    placeholder="Share your thoughts on this film..."
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600/30 transition resize-none"
                                />
                                {reviewError && <p className="text-rose-400 text-xs">{reviewError}</p>}
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={submitting || !reviewText.trim()}
                                        className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
                                    >
                                        {submitting ? "Posting..." : "Post Review"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {!isLoggedIn && (
                        <div className="mb-8 rounded-xl border border-dashed border-zinc-700 px-6 py-5 text-center">
                            <p className="text-zinc-500 text-sm">
                                <Link to="/login" state={{ from: `/movie/${tmdbId}` }} className="text-rose-400 hover:text-rose-300 underline underline-offset-4 transition-colors">
                                    Log in
                                </Link>{" "}
                                to write a review.
                            </p>
                        </div>
                    )}

                    {reviewsLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-rose-500 animate-spin" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-zinc-600">No reviews yet. Be the first.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review, index) => (
                                <div
                                    key={review._id || review.id || index}
                                    className="rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors p-5 space-y-3"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0 overflow-hidden">
                                                {review.userId?.avatar
                                                    ? <img src={review.userId.avatar} alt="" className="w-full h-full object-cover" />
                                                    : (review.userId?.name || review.username || "A").charAt(0).toUpperCase()
                                                }
                                            </div>
                                            <Link to={`/user/${review.userId?._id}`} className="text-sm font-medium text-zinc-200 hover:text-rose-400 transition-colors">
                                                {review.userId?.name || review.username || "Anonymous"}
                                            </Link>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {review.sentiment && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sentimentBadgeBg(review.sentiment)}`}>
                                                    {review.sentiment}
                                                </span>
                                            )}
                                            {review.rating != null && (
                                                <span className="flex items-center gap-1 text-xs bg-zinc-800 px-2.5 py-1 rounded-md">
                                                    <span className="text-yellow-400">★</span>
                                                    <span className="text-zinc-200 font-medium">{review.rating}</span>
                                                    <span className="text-zinc-600">/10</span>
                                                </span>
                                            )}
                                            {user?.id === review.userId?._id && (
                                                <div className="relative group">
                                                    <button onClick={() => setEditingReview(review)} className="text-xs px-2 py-1 rounded border border-zinc-700 text-zinc-500 hover:border-rose-500 hover:text-rose-400 transition">
                                                        <Pencil size={14} />
                                                    </button>
                                                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">Edit</span>
                                                </div>
                                            )}
                                            {(user?.id === review.userId?._id || user?.role === 'mod' || user?.role === 'admin') && (
                                                <div className="relative group">
                                                    <button onClick={() => handleDeleteReview(review._id)} className="text-xs px-2 py-1 rounded border border-zinc-700 text-zinc-500 hover:border-rose-500 hover:text-rose-400 transition">
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">Delete</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-zinc-400 text-sm leading-relaxed">
                                        {review.text || review.review || review.comment || ""}
                                    </p>
                                    <span className="text-xs text-zinc-500">
                                        {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    <div className="relative group">
                                        <button onClick={() => handleLike(review._id)}
                                            className={`flex items-center gap-1.5 text-xs transition ${review.likes?.includes(user?.id) ? 'text-rose-400' : 'text-zinc-500 hover:text-rose-400'}`}>
                                            <Heart size={13} fill={review.likes?.includes(user?.id) ? 'currentColor' : 'none'} />
                                            {review.likes?.length || 0}
                                        </button>
                                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">Like</span>
                                    </div>
                                    <CommentSection reviewId={review._id} user={user} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {editingReview && (
                    <EditReviewModal
                        review={editingReview}
                        onClose={() => setEditingReview(null)}
                        onSave={(updated) => {
                            setReviews(prev => prev.map(r => r._id === updated._id ? updated : r));
                            setEditingReview(null);
                        }}
                    />
                )}
            </div>
        </PageTransition>
    );
}