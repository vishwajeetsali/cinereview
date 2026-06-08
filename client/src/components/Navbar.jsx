import api from "../api/axios";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';
import { Rss, Bookmark, Menu, X, Bell } from 'lucide-react'
import { io } from 'socket.io-client'

export default function Navbar() {
    const [navQuery, setNavQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [heroScrolled, setHeroScrolled] = useState(false)
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isHome = location.pathname === '/' || location.pathname === '/home';
    const isAuthRoute = ['/login', '/register'].includes(location.pathname);

    useEffect(() => {
        if (!user) return
        api.get('/api/notifications/unread').then(res => setUnreadCount(res.data.count))
    }, [user])

    useEffect(() => {
        if (!user) return
        const socket = io(import.meta.env.VITE_API_URL)
        socket.emit('joinUser', user.id)
        socket.on('newNotification', () => {
            setUnreadCount(prev => prev + 1)
        })
        return () => socket.disconnect()
    }, [user])

    useEffect(() => {
        const handleScroll = () => setHeroScrolled(window.scrollY > 300)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const handleClick = (e) => {
            if (!e.target.closest('.notif-wrapper')) setNotifOpen(false)
        }
        document.addEventListener('click', handleClick)
        return () => document.removeEventListener('click', handleClick)
    }, [])

    const handleNavSearch = (e) => {
        e.preventDefault()
        if (!navQuery.trim()) return
        navigate(`/search?q=${encodeURIComponent(navQuery)}`)
        setNavQuery('')
        setMenuOpen(false)
    }

    const handleLogout = async () => {
        try {
            await api.post("/api/auth/logout");
            logout();
            window.accessToken = null;
            toast.success('Logged out successfully');
            navigate("/login");
            setMenuOpen(false)
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    const handleBellClick = async (e) => {
        e.stopPropagation();
        setNotifOpen(p => !p)
        if (!notifOpen) {
            try {
                const res = await api.get('/api/notifications')
                setNotifications(res.data)
                await api.put('/api/notifications/read')
                setUnreadCount(0)
            } catch (err) {
                console.error(err)
            }
        }
    }

    const isLanding = location.pathname === '/';
    if (isLanding) return null;

    return (
        <>
            <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md text-zinc-100">
                <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-6">

                    {/* Left - Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-rose-600 rounded-sm rotate-12"></div>
                        <span className="text-zinc-100 text-xl font-black tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            CINE<span className="text-rose-600">REVIEW</span>
                        </span>
                    </Link>

                    {/* Center - Search */}
                    {(!isHome || heroScrolled) && !isAuthRoute && (
                        <form onSubmit={handleNavSearch} className="hidden md:flex flex-1 max-w-sm">
                            <input
                                value={navQuery}
                                onChange={e => setNavQuery(e.target.value)}
                                placeholder="Search movies..."
                                className="w-full bg-zinc-900 border border-zinc-700 hover:border-zinc-600 focus:border-rose-500 text-zinc-100 text-sm px-4 py-2 rounded-lg focus:outline-none placeholder-zinc-600 transition-colors"
                            />
                        </form>
                    )}

                    {/* Right - Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <>
                                <Link to="/feed" className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 transition-colors text-sm tracking-wide">
                                    <Rss size={14} />
                                    Feed
                                </Link>
                                <Link to="/watchlist" className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 transition-colors text-sm tracking-wide">
                                    <Bookmark size={14} />
                                    Watchlist
                                </Link>

                                {/* Bell */}
                                <div className="relative notif-wrapper">
                                    <button onClick={handleBellClick} className="relative text-zinc-400 hover:text-zinc-100 transition-colors p-1">
                                        <Bell size={17} />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-600 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    {notifOpen && (
                                        <div className="absolute right-0 top-9 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                                            <div className="px-4 py-3 border-b border-zinc-800 text-xs font-medium tracking-widest uppercase text-zinc-500">
                                                Notifications
                                            </div>
                                            {notifications.length === 0 ? (
                                                <p className="text-zinc-600 text-sm text-center py-8">No notifications yet.</p>
                                            ) : (
                                                notifications.map(n => (
                                                    <div key={n._id} className={`px-4 py-3 text-sm border-b border-zinc-800 transition-colors ${!n.read ? 'bg-zinc-800/40' : 'hover:bg-zinc-800/20'}`}>
                                                        <span className="text-rose-400 font-medium">{n.fromUserId?.name}</span>
                                                        <span className="text-zinc-500"> {n.type === 'like' ? 'liked' : 'commented on'} your review</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="w-px h-5 bg-zinc-800" />

                                {/* Avatar + name */}
                                <Link to="/profile" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors">
                                    <div className="w-7 h-7 rounded-full bg-rose-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden ring-1 ring-zinc-700 hover:ring-rose-500 transition-all">
                                        {user.avatar
                                            ? <img key={user.avatar} src={user.avatar} alt="" className="w-full h-full object-cover" />
                                            : user.name.charAt(0).toUpperCase()
                                        }
                                    </div>
                                    <span className="text-sm text-zinc-300">{user.name}</span>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="px-3.5 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors text-zinc-300"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm tracking-wide">Login</Link>
                                <Link to="/register" className="px-4 py-2 text-sm bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors font-medium">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button className="md:hidden text-zinc-400 hover:text-zinc-100 transition-colors" onClick={() => setMenuOpen(p => !p)}>
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </nav>

            {/* Mobile overlay - OUTSIDE nav */}
            {menuOpen && (
                <div className="md:hidden fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
            )}

            {/* Mobile drawer - OUTSIDE nav */}
            {menuOpen && (
                <div className="md:hidden fixed top-0 right-0 h-full w-64 bg-zinc-950 border-l border-zinc-800 px-5 py-6 flex flex-col gap-1 z-[70] shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-zinc-600 text-[10px] uppercase tracking-widest">Menu</span>
                        <button onClick={() => setMenuOpen(false)} className="text-zinc-500 hover:text-zinc-100 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {user ? (
                        <>
                            {!isHome && !isAuthRoute && (
                                <form onSubmit={handleNavSearch} className="flex items-center gap-2 mb-4">
                                    <input
                                        value={navQuery}
                                        onChange={e => setNavQuery(e.target.value)}
                                        placeholder="Search movies..."
                                        className="bg-zinc-900 border border-zinc-700 focus:border-rose-500 text-zinc-100 text-sm px-3 py-2 rounded-lg w-full focus:outline-none placeholder-zinc-600 transition-colors"
                                    />
                                </form>
                            )}
                            <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-zinc-400 hover:text-zinc-100 transition-colors py-3 border-b border-zinc-800">
                                <div className="w-6 h-6 rounded-full bg-rose-600 flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
                                    {user.avatar
                                        ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                        : user.name.charAt(0).toUpperCase()
                                    }
                                </div>
                                <span className="text-sm text-zinc-300">{user.name}</span>
                            </Link>
                            <Link to="/feed" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-zinc-400 hover:text-zinc-100 transition-colors py-3 border-b border-zinc-800">
                                <Rss size={15} className="text-zinc-600" />
                                <span className="text-sm">Feed</span>
                            </Link>
                            <Link to="/watchlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-zinc-400 hover:text-zinc-100 transition-colors py-3 border-b border-zinc-800">
                                <Bookmark size={15} className="text-zinc-600" />
                                <span className="text-sm">Watchlist</span>
                            </Link>
                            <button onClick={handleLogout} className="flex items-center gap-3 text-rose-500 hover:text-rose-400 transition-colors py-3 text-sm text-left mt-auto">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setMenuOpen(false)} className="text-zinc-400 hover:text-zinc-100 transition-colors py-3 text-sm border-b border-zinc-800">Login</Link>
                            <Link to="/register" onClick={() => setMenuOpen(false)} className="text-zinc-300 hover:text-rose-400 transition-colors py-3 text-sm">Register</Link>
                        </>
                    )}
                </div>
            )}
        </>
    );
}