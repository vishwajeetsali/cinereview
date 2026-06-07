import { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
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

    const login = (newUser, token) => {
        window.accessToken = token;
        setUser(newUser);
    };

    const logout = () => {
        setUser(null);
        window.accessToken = null;
    };

    const updateUser = (updates) => {
        setUser(prev => ({ ...prev, ...updates }));
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