import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import api from '../api/axios';
import MovieCardSkeleton from "../components/MovieCardSkeleton";
import PageTransition from '../components/PageTransition';
import MovieCard from '../components/MovieCard';
import { Search } from 'lucide-react'

export default function SearchPage() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [activeTab, setActiveTab] = useState('movies');
    const [userResults, setUserResults] = useState([]);

    const { ref, inView } = useInView();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const q = searchParams.get('q');

    useEffect(() => {
        if (q) document.title = `"${q}" — CineReview`
        return () => { document.title = 'CineReview' }
    }, [q])

    useEffect(() => {
        if (!q) return;
        setResults([]);
        setPage(1);
        setHasMore(true);
        setLoading(true);

        const fetch = async () => {
            try {
                const res = await api.get(`/api/movies/search?q=${encodeURIComponent(q)}&page=1`);
                setResults(res.data.results || []);
                if (res.data.total_pages <= 1) setHasMore(false);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [q]);

    // Infinite scroll — added q/page/hasMore/loadingMore to deps
    useEffect(() => {
        if (!inView || !hasMore || loadingMore || !q) return;
        const fetchMore = async () => {
            setLoadingMore(true);
            try {
                const nextPage = page + 1;
                const res = await api.get(`/api/movies/search?q=${encodeURIComponent(q)}&page=${nextPage}`);
                setResults(prev => [...prev, ...(res.data.results || [])]);
                setPage(nextPage);
                if (nextPage >= res.data.total_pages) setHasMore(false);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingMore(false);
            }
        };
        fetchMore();
    }, [inView, hasMore, loadingMore, q, page]);

    // People search
    useEffect(() => {
        if (!q || activeTab !== 'people') return;
        const fetchUsers = async () => {
            try {
                const res = await api.get(`/api/users/search?q=${encodeURIComponent(q)}`);
                setUserResults(res.data || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchUsers();
    }, [q, activeTab]);

    return (
        <PageTransition>
            <div className="min-h-screen bg-zinc-950 text-zinc-100">
                <div className="max-w-7xl mx-auto px-6 py-10">

                    <button onClick={() => navigate(-1)} className="text-zinc-500 hover:text-zinc-300 transition text-sm mb-6">
                        ← Back
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        <span className="w-1 h-6 bg-rose-600 rounded-full shrink-0" />
                        <h1 className="font-serif text-4xl text-zinc-100">
                            Results for "{q}"
                        </h1>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                        {['movies', 'people'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition capitalize ${activeTab === tab ? 'bg-rose-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Movies Tab */}
                    {activeTab === 'movies' && (
                        <>
                            {loading && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {[...Array(10)].map((_, i) => <MovieCardSkeleton key={i} />)}
                                </div>
                            )}
                            {!loading && results.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-24 gap-4">
                                    <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                                        <Search size={28} className="text-zinc-600" />
                                    </div>
                                    <p className="text-zinc-300 font-semibold">No results for "{q}"</p>
                                    <p className="text-zinc-600 text-sm">Try a different title or check your spelling.</p>
                                </div>
                            )}
                            {!loading && results.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {results.map((movie) => (
                                        <MovieCard key={movie.id} movie={movie} />
                                    ))}
                                </div>
                            )}
                            {hasMore && (
                                <div ref={ref} className="py-8 flex justify-center">
                                    {loadingMore && <div className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-rose-500 animate-spin" />}
                                </div>
                            )}
                        </>
                    )}

                    {/* People Tab */}
                    {activeTab === 'people' && (
                        <div className="space-y-3">
                            {userResults.length === 0 ? (
                                <p className="text-zinc-500 text-center py-16">No users found.</p>
                            ) : (
                                userResults.map(u => (
                                    <div
                                        key={u._id}
                                        onClick={() => navigate(`/user/${u._id}`)}
                                        className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl cursor-pointer transition"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-rose-600 overflow-hidden flex items-center justify-center font-bold shrink-0">
                                            {u.avatar
                                                ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                                                : u.name.charAt(0).toUpperCase()
                                            }
                                        </div>
                                        <span className="text-zinc-200 font-medium">{u.name}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}