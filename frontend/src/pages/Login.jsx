/**
 * Login.jsx — sign in page.
 * Handles email verification banners from ?verified= URL param.
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

import { IoAirplaneSharp } from 'react-icons/io5';
import {
    MdPerson, MdLock, MdVisibility,
    MdVisibilityOff, MdLogin, MdErrorOutline,
    MdCheckCircle, MdMarkEmailRead, MdRefresh,
} from 'react-icons/md';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { state } = useLocation();
    const [searchParams] = useSearchParams();
    const verifiedParam = searchParams.get('verified');   // 'true' | null

    const [form, setForm] = useState({ email: state?.email || '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [notVerifiedEmail, setNotVerifiedEmail] = useState(null); // email that needs verification
    const [resending, setResending] = useState(false);

    const set = (key, val) => {
        setForm(f => ({ ...f, [key]: val }));
        setError('');
        setNotVerifiedEmail(null);
    };

    const handleResend = async () => {
        const emailToUse = notVerifiedEmail || form.email;
        if (!emailToUse) return;
        setResending(true);
        try {
            await api.post('/api/users/resend-verification/', { email: emailToUse });
            toast.success('Verification email sent! Check your inbox.');
        } catch {
            toast.error('Could not resend. Please try again.');
        } finally {
            setResending(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email.trim() || !form.password) {
            setError('Please fill in all fields.');
            return;
        }

        setLoading(true);
        setNotVerifiedEmail(null);
        try {
            const user = await login(form.email, form.password);
            toast.success(`Welcome back, ${user.username || user.email}!`);
            navigate('/');
        } catch (err) {
            const data = err.response?.data || {};
            // Backend now returns a flat object: { detail: "...", code: "..." }
            // or for field errors: { email: [...], non_field_errors: [...] }
            const detail = data.detail;
            const nonFieldErrors = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : null;
            const msg = (typeof detail === 'string' ? detail : null)
                || (typeof nonFieldErrors === 'string' ? nonFieldErrors : null)
                || 'Incorrect email or password.';

            // Check for the email-not-verified marker
            if (data.code === 'email_not_verified' ||
                (typeof msg === 'string' && msg.toLowerCase().includes('verify'))) {
                setNotVerifiedEmail(form.email);
                setError(msg);
            } else {
                setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
            }
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

                {/* Email verified success banner (from ?verified=true redirect) */}
                {verifiedParam === 'true' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="alert"
                        style={{ background: 'var(--success-dim)', border: '1px solid #86EFAC', color: '#166534', marginBottom: '1.25rem' }}>
                        <MdCheckCircle size={17} style={{ color: '#166534' }} />
                        Email verified successfully! You can now sign in.
                    </motion.div>
                )}

                {/* Error alert */}
                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="alert alert-error">
                        <MdErrorOutline size={17} /> {error}
                    </motion.div>
                )}

                {/* Email not verified — show resend option */}
                {notVerifiedEmail && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{
                            background: 'rgba(251,191,36,0.1)', border: '1px solid #FBBF24',
                            borderRadius: 8, padding: '0.85rem 1rem', marginBottom: '1rem',
                            display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                        }}>
                        <MdMarkEmailRead size={18} style={{ color: '#FBBF24', flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                                Email not verified
                            </p>
                            <p style={{ margin: '0.2rem 0 0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Check your inbox for the verification link, or resend it.
                            </p>
                            <button className="btn btn-secondary btn-sm" onClick={handleResend} disabled={resending}>
                                {resending
                                    ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2, margin: 0 }} /> Sending…</>
                                    : <><MdRefresh size={14} /> Resend Email</>
                                }
                            </button>
                        </div>
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
                                id="login-email"
                                type="email"
                                placeholder="japhethanold@gmail.com"
                                value={form.email}
                                onChange={e => set('email', e.target.value)}
                                autoComplete="email"
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
                    Forgot your password?{' '}
                    <Link to="/reset-password" style={{ color: 'var(--red)', fontWeight: 700 }}>
                        Reset Password
                    </Link>
                </p>
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
