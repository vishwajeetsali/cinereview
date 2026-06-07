import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPublicProfile, toggleFollow } from '../api/users.js';
import { useAuth } from '../context/AuthContext.jsx';
import PageTransition from '../components/PageTransition';
import MoviePoster from '../components/MoviePoster';

export default function PublicProfile() {
    const { user } = useAuth();
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewCount, setReviewCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        if (profile) document.title = `${profile.name} — CineReview`
        return () => { document.title = 'CineReview' }
    }, [profile])

    useEffect(() => {
        if (user?.id === userId) {
            navigate('/profile');
        }
    }, [user, userId]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getPublicProfile(userId);
                setProfile(res.data.user);
                setReviews(res.data.reviews);
                setReviewCount(res.data.reviewCount);
                setIsFollowing(res.data.user.followers.some(f => f._id === user?.id));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    const handleFollow = async () => {
        try {
            const res = await toggleFollow(userId);
            setIsFollowing(res.data.following);
            setProfile(prev => ({
                ...prev,
                followers: res.data.following
                    ? [...prev.followers, { _id: user.id }]
                    : prev.followers.filter(f => f._id !== user.id),
            }));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-rose-500 animate-spin" />
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
            <p className="text-zinc-400 text-lg">User not found.</p>
            <button onClick={() => navigate(-1)} className="text-sm text-rose-400 hover:text-rose-300 transition">
                ← Go Back
            </button>
        </div>
    );

    return (
        <PageTransition>
            <div className="min-h-screen bg-zinc-950 text-zinc-100">
                <div className="h-32 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 relative">
                    <div className="absolute -bottom-8 left-8 w-20 h-20 rounded-full overflow-hidden border-4 border-zinc-950 bg-zinc-700 flex items-center justify-center text-2xl font-bold">
                        {profile.avatar
                            ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                            : profile.name[0].toUpperCase()
                        }
                    </div>
                </div>

                <div className="pt-14 px-8 pb-6 border-b border-zinc-800">
                    <h1 className="font-serif text-3xl text-white">{profile.name}</h1>
                    <div className="flex gap-6 mt-2 text-zinc-400">
                        <span><strong className="text-zinc-100">{profile.followers.length}</strong> Followers</span>
                        <span><strong className="text-zinc-100">{profile.following.length}</strong> Following</span>
                        <span><strong className="text-zinc-100">{reviewCount}</strong> Reviews</span>
                    </div>
                    {user && user?.id !== userId && (
                        <button
                            onClick={handleFollow}
                            className={`mt-4 px-4 py-2 rounded text-sm font-semibold transition ${isFollowing
                                ? 'bg-zinc-800 border border-zinc-600 text-zinc-300 hover:border-rose-500 hover:text-rose-400'
                                : 'bg-rose-600 hover:bg-rose-700 text-white'
                                }`}
                        >
                            {isFollowing ? 'Unfollow' : 'Follow'}
                        </button>
                    )}
                </div>

                <div className="max-w-3xl mx-auto px-8 pt-8 pb-20">
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="font-serif text-2xl text-zinc-100 shrink-0">Recent Reviews</h2>
                        <div className="flex-1 h-px bg-zinc-800" />
                    </div>

                    {reviews.length === 0 ? (
                        <p className="text-zinc-600 text-center py-16">No reviews yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
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
                                            <span className="flex items-center gap-1 text-xs bg-zinc-800 px-2 py-0.5 rounded shrink-0">
                                                <span className="text-yellow-400">★</span>
                                                <span className="text-zinc-200">{review.rating}</span>
                                                <span className="text-zinc-600">/10</span>
                                            </span>
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
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}