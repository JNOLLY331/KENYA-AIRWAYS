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
                if (decoded.exp * 1000 > Date.now()) {
                    setUser({
                        id: decoded.user_id,
                        email: decoded.email,
                        is_staff: decoded.is_staff || false,
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

    // Fixed Login Function
    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/api/users/login/', {
                email,
                password
            });

            // Save tokens
            localStorage.setItem('access', data.tokens.access);
            localStorage.setItem('refresh', data.tokens.refresh);

            // Set user state
            setUser({
                id: data.user.id,
                email: data.user.email,
                username: data.user.username,
                is_staff: data.user.is_staff || false,
            });

            return data.user;

        } catch (err) {
            console.error("Login error:", err.response?.data);
            throw err;
        }
    };

    const register = async (formData) => {
        const { data } = await axios.post('/api/users/register/', formData);
        return data; // Return data but do NOT set local tokens automatically
    };

    const logout = async () => {
        try {
            const refresh = localStorage.getItem('refresh');
            if (refresh) {
                await axios.post('/api/users/logout/', { refresh });
            }
        } catch (err) {
            console.error("Logout error:", err.response?.data);
        } finally {
            localStorage.clear();
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);