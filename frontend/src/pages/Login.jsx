/**
 * Login.jsx — sign in page.
 * Refactored to use brand design system and Vanilla CSS classes.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

import { IoAirplaneSharp } from 'react-icons/io5';
import {
    MdPerson, MdLock, MdVisibility,
    MdVisibilityOff, MdLogin, MdErrorOutline
} from 'react-icons/md';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);

    const set = (key, val) => {
        setForm(f => ({ ...f, [key]: val }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username.trim() || !form.password) {
            setError('Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            const user = await login(form.username, form.password);
            toast.success(`Welcome back, ${user.username || form.username}!`);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Incorrect username or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: '60vh', paddingTop: 100, paddingBottom: 80,
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                style={{
                    width: '100%', maxWidth: 460,
                    background: 'var(--navy-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '3rem 2.5rem',
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div
                        style={{
                            width: 52, height: 52, borderRadius: 16,
                            background: 'var(--red)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.25rem',
                            boxShadow: 'var(--shadow-red)',
                        }}
                    >
                        <IoAirplaneSharp size={28} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.1rem' }}>Welcome Back</h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Sign in to your Kenya Airways account
                    </p>
                </div>

                {/* Error alert */}
                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="alert alert-error">
                        <MdErrorOutline size={17} /> {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="login-user">Email </label>
                        <div style={{ position: 'relative' }}>
                            <MdPerson
                                size={18}
                                style={{
                                    position: 'absolute', left: 12, top: '50%',
                                    transform: 'translateY(-50%)', color: 'var(--text-muted)'
                                }}
                            />
                            <input
                                id="login-user"
                                type="text"
                                placeholder="Enter username"
                                value={form.username}
                                onChange={e => set('username', e.target.value)}
                                autoComplete="username"
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-pass">Password</label>
                        <div style={{ position: 'relative' }}>
                            <MdLock
                                size={18}
                                style={{
                                    position: 'absolute', left: 12, top: '50%',
                                    transform: 'translateY(-50%)', color: 'var(--text-muted)'
                                }}
                            />
                            <input
                                id="login-pass"
                                type={showPass ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => set('password', e.target.value)}
                                autoComplete="current-password"
                                style={{ paddingLeft: '2.5rem', paddingRight: '2.8rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(v => !v)}
                                style={{
                                    position: 'absolute', right: 10, top: '50%',
                                    transform: 'translateY(-50%)', background: 'none',
                                    border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                                }}
                            >
                                {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg btn-block"
                        disabled={loading}
                        style={{ marginTop: '1.5rem' }}
                    >
                        {loading ? (
                            <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, margin: 0 }} />
                        ) : (
                            <><MdLogin size={18} /> Sign In</>
                        )}
                    </button>
                </form>

                <div className="divider" />
                <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--red)', fontWeight: 700 }}>
                        Create Account
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
