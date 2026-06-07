import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import api from '../api/axios'
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';

export default function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        document.title = 'Login — CineReview'
        return () => { document.title = 'CineReview' }
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.email || !formData.password) {
            setError("Please fill in all fields.");
            return;
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError("Please enter a valid email.");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/api/auth/login", formData);
            const { user, accessToken } = res.data;
            window.accessToken = accessToken;
            await login(user, accessToken);
            toast.success('Welcome back!');
            const from = location.state?.from || "/home";
            navigate(from);
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please check your details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="bg-zinc-900 p-8 rounded-xl shadow-2xl shadow-black/50 w-full max-w-md">
                    <form onSubmit={handleSubmit}>
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-rose-600 rounded-sm rotate-12"></div>
                            <span className="text-zinc-100 text-2xl font-black tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                CINE<span className="text-rose-600">REVIEW</span>
                            </span>
                        </div>

                        <h2 className="font-serif text-2xl text-zinc-100 text-center mb-6">Login</h2>

                        <div className="mb-4">
                            <label className="text-sm text-zinc-400 mb-1 block">Email</label>
                            <input
                                type="text"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-zinc-900 text-zinc-100 border border-zinc-700 hover:border-zinc-600 focus:border-rose-500 px-4 py-2 rounded-lg focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="text-sm text-zinc-400 mb-1 block">Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-zinc-900 text-zinc-100 border border-zinc-700 hover:border-zinc-600 focus:border-rose-500 px-4 py-2 rounded-lg focus:outline-none transition-colors"
                            />
                        </div>

                        {error && <p className="text-rose-400 text-sm">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg transition mt-4 disabled:opacity-50"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-700" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-zinc-900 px-2 text-zinc-500">or</span>
                            </div>
                        </div>

                        <a
                            href={`${import.meta.env.VITE_API_URL}/api/auth/google`}
                            className="w-full flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 py-2 rounded-lg transition"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                            Continue with Google
                        </a>

                        <p className="text-gray-400 text-sm text-center mt-4">
                            Don't have an account?
                            <Link to="/register" className="text-rose-500 ml-1">Register</Link>
                        </p>
                    </form>
                </div>
            </div>
        </PageTransition>
    );
}

