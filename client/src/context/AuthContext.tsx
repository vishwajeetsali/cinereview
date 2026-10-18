import { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axios";
import { User } from '../types';



interface AuthContextType {
    user: User | null;
    authLoading: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const res = await api.post("/api/auth/refresh");
                const { accessToken, user: userData } = res.data;
                window.accessToken = accessToken;
                setUser(userData);
            } catch {
                // no valid session
            } finally {
                setAuthLoading(false);
            }
        };
        restoreSession();
    }, []);

    const login = (newUser: User, token: string) => {
        window.accessToken = token;
        setUser(newUser);
    };

    const logout = () => {
        setUser(null);
        window.accessToken = null;
    };

    const updateUser = (updates: Partial<User>) => {
        setUser(prev => prev ? ({ ...prev, ...updates }) : null);
    };

    return (
        <AuthContext.Provider value={{ user, authLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}