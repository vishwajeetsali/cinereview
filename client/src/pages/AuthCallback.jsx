import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';
import api from '../api/axios';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const token = searchParams.get('token');
                if (!token) return navigate('/login');

                window.accessToken = token;
                const payload = JSON.parse(atob(token.split('.')[1]));

                const res = await api.get(`/api/users/${payload.userId}`);
                await login({
                    id: payload.userId,
                    name: payload.name,
                    avatar: res.data.user.avatar || null,
                    role: payload.role || 'user',
                    email: res.data.user.email
                }, token);
                navigate('/home');
            } catch {
                navigate('/login');
            }
        }
        handleCallback();
    }, []);

    return (
        <PageTransition>
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-zinc-700 border-t-rose-500 animate-spin" />
                    <p className="text-zinc-500 text-sm tracking-widest uppercase">
                        Loading
                    </p>
                </div>
            </div>
        </PageTransition>
    );
}