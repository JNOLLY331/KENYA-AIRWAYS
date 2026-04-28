import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(() => {
        const access = localStorage.getItem('access');
        if (access) {
            try {
                const decoded = jwtDecode(access);
                // Check not expired
                if (decoded.exp * 1000 > Date.now()) {
                    setUser({
                        id: decoded.user_id,
                        username: decoded.username,
                        is_staff: decoded.is_staff,
                    });
                } else {
                    localStorage.clear();
                    setUser(null);
                }
            } catch {
                localStorage.clear();
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = async (username, password) => {
        const { data } = await axios.post('/api/users/login/', { username, password });
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        const decoded = jwtDecode(data.access);
        const profile = await axios.get('/api/users/profile/');
        setUser({
            id: decoded.user_id,
            username: decoded.username,
            is_staff: profile.data.is_staff,
        });
        return profile.data;
    };

    const register = async (formData) => {
        const { data } = await axios.post('/api/users/register/', formData);
        localStorage.setItem('access', data.tokens.access);
        localStorage.setItem('refresh', data.tokens.refresh);
        setUser({
            id: data.user.id,
            username: data.user.username,
            is_staff: data.user.is_staff,
        });
        return data;
    };

    const logout = async () => {
        try {
            const refresh = localStorage.getItem('refresh');
            await axios.post('/api/users/logout/', { refresh });
        } catch { /* best effort */ }
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
