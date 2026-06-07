import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import api from "../api/axios";
import EditReviewModal from "../components/EditReviewModal";
import toast from 'react-hot-toast';
import { Trash2, Pencil } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import EditProfileModal from "../components/EditProfileModal";
import MoviePoster from '../components/MoviePoster';
import ReviewCardSkeleton from '../components/ReviewCardSkeleton'

export default function Profile() {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [modalUsers, setModalUsers] = useState([]);
    const [editingReview, setEditingReview] = useState(null);
    const [editingProfile, setEditingProfile] = useState(false);
    const [watchlistCount, setWatchlistCount] = useState(0);
    const reviewsRef = useRef(null);

    const avgRating = reviews.length
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : "—";

    useEffect(() => {
        if (user) document.title = `${user.name} — CineReview`
        return () => { document.title = 'CineReview' }
    }, [user])

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const [reviewsRes, profileRes, watchlistRes] = await Promise.all([
                    api.get("/api/reviews/user/me"),
                    api.get(`/api/users/${user.id}`),
                    api.get("/api/users/watchlist"),
                ]);
                setReviews(reviewsRes.data);
                setProfileData(profileRes.data.user);
                setWatchlistCount(watchlistRes.data.length);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Delete this review?")) return;
        try {
            await api.delete(`/api/reviews/${reviewId}`);
            setReviews(prev => prev.filter(r => r._id !== reviewId));
            toast.success("Review deleted");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete review");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <div className="h-32 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900" />
            <div className="max-w-3xl mx-auto px-8 pt-20 pb-20 space-y-4">
                {[...Array(5)].map((_, i) => <ReviewCardSkeleton key={i} />)}
            </div>
        </div>
    );

    return (
        <PageTransition>
            <div className="min-h-screen bg-zinc-950 text-zinc-100">

                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 relative">
                    <div className="absolute -bottom-8 left-8 w-16 h-16 rounded-full overflow-hidden bg-rose-600 border-4 border-zinc-950 flex items-center justify-center text-2xl font-black text-white">
                        {user?.avatar
                            ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                            : user?.name?.charAt(0).toUpperCase()
                        }
                    </div>
                </div>

                {/* Info */}
                <div className="pt-12 px-8 pb-6 border-b border-zinc-800">
                    <h1 className="font-serif text-3xl text-white">{user?.name}</h1>
                    <p className="text-zinc-500 text-sm mt-1 mb-3">★ {avgRating} avg rating</p>
                    <button
                        onClick={() => setEditingProfile(true)}
                        className="text-xs text-rose-400 hover:text-rose-300 border border-zinc-700 hover:border-rose-500 px-3 py-1 rounded-lg transition mb-4"
                    >
                        Edit Profile
                    </button>

                    {/* Stats row */}
                    <div className="flex gap-4">
                        {/* Reviews → scroll to section */}
                        <div
                            onClick={() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-center cursor-pointer hover:border-zinc-600 transition"
                        >
                            <p className="font-serif text-2xl text-white">{reviews.length}</p>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Reviews</p>
                        </div>

                        {/* Followers */}
                        <div
                            onClick={() => {
                                setModalType('followers');
                                setModalUsers(profileData?.followers || []);
                            }}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-center cursor-pointer hover:border-zinc-600 transition"
                        >
                            <p className="font-serif text-2xl text-white">{profileData?.followers?.length || 0}</p>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Followers</p>
                        </div>

                        {/* Following */}
                        <div
                            onClick={() => {
                                setModalType('following');
                                setModalUsers(profileData?.following || []);
                            }}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-center cursor-pointer hover:border-zinc-600 transition"
                        >
                            <p className="font-serif text-2xl text-white">{profileData?.following?.length || 0}</p>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Following</p>
                        </div>

                        {/* Watchlist → link to /watchlist */}
                        <Link
                            to="/watchlist"
                            className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-center hover:border-zinc-600 transition"
                        >
                            <p className="font-serif text-2xl text-white">{watchlistCount}</p>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Watchlist</p>
                        </Link>
                    </div>
                </div>

                {/* Reviews */}
                <div ref={reviewsRef} className="max-w-3xl mx-auto px-8 pt-8 pb-20">
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="font-serif text-2xl text-zinc-100 shrink-0">My Reviews</h2>
                        <div className="flex-1 h-px bg-zinc-800" />
                    </div>

                    {reviews.length === 0 ? (
                        <p className="text-zinc-600 text-center py-16">No reviews yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => {


                                return (
                                    <Link
                                        to={`/movie/${review.tmdbId}`}
                                        key={review._id}
                                        className="flex gap-4 p-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition rounded-xl"
                                    >
                                        <MoviePoster
                                            path={review.moviePoster}
                                            title={review.movieTitle}
                                            className="w-14 h-20 shrink-0"
                                        />

                                        <div className="flex-1 space-y-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="text-zinc-200 font-semibold text-sm">{review.movieTitle}</h4>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="flex items-center gap-1 text-xs bg-zinc-800 px-2 py-0.5 rounded">
                                                        <span className="text-yellow-400">★</span>
                                                        <span className="text-zinc-200">{review.rating}</span>
                                                        <span className="text-zinc-600">/10</span>
                                                    </span>
                                                    <div className="relative group">
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingReview(review); }}
                                                            className="text-xs px-2 py-1 rounded border border-zinc-700 text-zinc-500 hover:border-rose-500 hover:text-rose-400 transition"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                                                            Edit
                                                        </span>
                                                    </div>
                                                    <div className="relative group">
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteReview(review._id); }}
                                                            className="text-xs px-2 py-1 rounded border border-zinc-700 text-zinc-500 hover:border-rose-500 hover:text-rose-400 transition"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                                                            Delete
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">{review.text}</p>

                                            <div className="flex items-center justify-between pt-1">
                                                {review.sentiment && (
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${review.sentiment === "positive" ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50" :
                                                        review.sentiment === "negative" ? "bg-rose-900/60 text-rose-300 border border-rose-700/50" :
                                                            "bg-yellow-900/60 text-yellow-300 border border-yellow-700/50"
                                                        }`}>
                                                        {review.sentiment}
                                                    </span>
                                                )}
                                                <span className="text-xs text-zinc-600">
                                                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Followers / Following Modal */}
                {modalType && (
                    <div
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
                        onClick={() => setModalType(null)}
                    >
                        <div
                            className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-sm mx-4 p-5"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-zinc-100 capitalize">{modalType}</h3>
                                <button onClick={() => setModalType(null)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                            </div>

                            {modalUsers.length === 0 ? (
                                <p className="text-zinc-500 text-sm text-center py-4">Nobody here yet.</p>
                            ) : (
                                modalUsers.map((u) => (
                                    <Link
                                        key={u._id}
                                        to={`/user/${u._id}`}
                                        onClick={() => setModalType(null)}
                                        className="flex items-center gap-3 py-2 hover:bg-zinc-800 px-2 rounded-lg transition"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-rose-600 overflow-hidden flex items-center justify-center text-sm font-bold shrink-0">
                                            {u.avatar
                                                ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                                                : u.name.charAt(0).toUpperCase()
                                            }
                                        </div>
                                        <span className="text-zinc-200 text-sm">{u.name}</span>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Edit Review Modal */}
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

                {/* Edit Profile Modal */}
                {editingProfile && (
                    <EditProfileModal
                        onClose={() => setEditingProfile(false)}
                        onSave={(updated) => setProfileData(prev => ({ ...prev, ...updated }))}
                    />
                )}
            </div>
        </PageTransition>
    );
}