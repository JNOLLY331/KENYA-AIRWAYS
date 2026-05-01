/**
 * ResetPassword.jsx — two-step password-reset flow:
 *
 * Step 1 (no token in URL):  user enters email → "reset link sent" message.
 * Step 2 (?token=<uuid>):    user enters new password → password updated.
 *
 * The backend sends an email with a link like:
 *   /reset-password?token=<uuid>
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { IoAirplaneSharp } from 'react-icons/io5';
import {
    MdEmail, MdLock, MdLogin,
    MdMarkEmailRead, MdVisibility, MdVisibilityOff,
    MdCheckCircle, MdErrorOutline,
} from 'react-icons/md';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');   // Present on Step 2

    /* ── Step 1 state — request reset link ────────────── */
    const [email, setEmail] = useState('');
    const [requestLoading, setRequestLoading] = useState(false);
    const [linkSent, setLinkSent] = useState(false);

    /* ── Step 2 state — set new password ──────────────── */
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState('');

    /* ── Handlers ────────────────────────────────────── */
    const handleRequestReset = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setRequestLoading(true);
        try {
            await api.post('/api/users/request-password-reset/', { email });
            setLinkSent(true);
        } catch {
            // Always show success-like message to protect against user enumeration
            setLinkSent(true);
        } finally {
            setRequestLoading(false);
        }
    };

    const handleConfirmReset = async (e) => {
        e.preventDefault();
        setResetError('');
        if (newPassword.length < 8) {
            setResetError('Password must be at least 8 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setResetError('Passwords do not match.');
            return;
        }
        setResetLoading(true);
        try {
            await api.post('/api/users/confirm-password-reset/', {
                token,
                new_password: newPassword,
            });
            toast.success('Password reset successfully! You can now log in.');
            setTimeout(() => navigate('/login'), 1200);
        } catch (err) {
            const msg = err.response?.data?.error || 'Reset failed. This link may have expired.';
            setResetError(msg);
        } finally {
            setResetLoading(false);
        }
    };

    /* ── Common card wrapper ─────────────────────────── */
    const Card = ({ children }) => (
        <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            justifyContent: 'center', minHeight: '60vh',
            paddingTop: 100, paddingBottom: 80,
        }}>
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
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 16,
                        background: 'var(--red)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem',
                        boxShadow: 'var(--shadow-red)',
                    }}>
                        <IoAirplaneSharp size={28} color="#fff" />
                    </div>
                    {children}
                </div>

                <div className="divider" />
                <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                    <Link to="/login" style={{ color: 'var(--red)', fontWeight: 700 }}>
                        <MdLogin size={14} style={{ verticalAlign: 'middle' }} /> Back to Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );

    /* ── Step 2: token present — set new password ──────── */
    if (token) {
        return (
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', minHeight: '60vh',
                paddingTop: 100, paddingBottom: 80,
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        width: '100%', maxWidth: 460,
                        background: 'var(--navy-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '3rem 2.5rem',
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 16,
                            background: 'var(--red)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1rem',
                        }}>
                            <IoAirplaneSharp size={28} color="#fff" />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Set New Password</h1>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Enter a strong new password for your account.
                        </p>
                    </div>

                    {resetError && (
                        <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                            <MdErrorOutline size={17} /> {resetError}
                        </div>
                    )}

                    <form onSubmit={handleConfirmReset}>
                        {/* New password */}
                        <div className="form-group">
                            <label>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <MdLock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="Min. 8 characters"
                                    style={{ paddingLeft: '2.4rem', paddingRight: '2.8rem' }}
                                    required minLength={8}
                                />
                                <button type="button" onClick={() => setShowNew(v => !v)}
                                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    {showNew ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                                </button>
                            </div>
                            {newPassword.length > 0 && (
                                <span style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.3rem' }}>
                                    {newPassword.length >= 8
                                        ? <><MdCheckCircle size={13} style={{ color: 'var(--success)' }} /><span style={{ color: 'var(--success)' }}>Looks good</span></>
                                        : <><MdErrorOutline size={13} style={{ color: 'var(--warning)' }} /><span style={{ color: 'var(--warning)' }}>{8 - newPassword.length} more char{8 - newPassword.length !== 1 ? 's' : ''} needed</span></>
                                    }
                                </span>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <MdLock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat password"
                                    style={{ paddingLeft: '2.4rem', paddingRight: '2.8rem' }}
                                    required
                                />
                                <button type="button" onClick={() => setShowConfirm(v => !v)}
                                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    {showConfirm ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg btn-block"
                            disabled={resetLoading} style={{ marginTop: '0.5rem' }}>
                            {resetLoading
                                ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, margin: 0 }} /> Updating…</>
                                : 'Set New Password'
                            }
                        </button>
                    </form>

                    <div className="divider" />
                    <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                        <Link to="/login" style={{ color: 'var(--red)', fontWeight: 700 }}>
                            <MdLogin size={14} style={{ verticalAlign: 'middle' }} /> Back to Login
                        </Link>
                    </p>
                </motion.div>
            </div>
        );
    }

    /* ── Step 1: "link sent" confirmation ────────────── */
    if (linkSent) {
        return (
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', minHeight: '60vh',
                paddingTop: 100, paddingBottom: 80,
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        width: '100%', maxWidth: 460,
                        background: 'var(--navy-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '3rem 2.5rem',
                        textAlign: 'center',
                    }}
                >
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'var(--red-dim)', border: '2px solid var(--red)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                    }}>
                        <MdMarkEmailRead size={36} style={{ color: 'var(--red)' }} />
                    </div>
                    <h1 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>Check Your Email</h1>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
                        If an account with <strong style={{ color: 'var(--text-primary)' }}>{email}</strong> exists,
                        we've sent a password-reset link. The link is valid for <strong>1 hour</strong>.
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        Didn't receive it? Check your spam folder or{' '}
                        <button
                            onClick={() => setLinkSent(false)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontWeight: 700, padding: 0 }}
                        >
                            try again
                        </button>.
                    </p>
                    <Link to="/login" className="btn btn-primary btn-lg btn-block" style={{ justifyContent: 'center' }}>
                        <MdLogin size={18} /> Back to Login
                    </Link>
                </motion.div>
            </div>
        );
    }

    /* ── Step 1: request reset form ────────────────────── */
    return (
        <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            justifyContent: 'center', minHeight: '60vh',
            paddingTop: 100, paddingBottom: 80,
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    width: '100%', maxWidth: 460,
                    background: 'var(--navy-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '3rem 2.5rem',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 16,
                        background: 'var(--red)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem',
                    }}>
                        <IoAirplaneSharp size={28} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Forgot Password?</h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Enter your email and we'll send you a reset link.
                    </p>
                </div>

                <form onSubmit={handleRequestReset}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <MdEmail size={18} style={{
                                position: 'absolute', left: 12, top: '50%',
                                transform: 'translateY(-50%)', color: 'var(--text-muted)',
                            }} />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                style={{ paddingLeft: '2.5rem' }}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg btn-block"
                        disabled={requestLoading} style={{ marginTop: '1.5rem' }}>
                        {requestLoading
                            ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, margin: 0 }} /> Sending…</>
                            : 'Send Reset Link'
                        }
                    </button>
                </form>

                <div className="divider" />
                <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                    <Link to="/login" style={{ color: 'var(--red)', fontWeight: 700 }}>
                        <MdLogin size={14} style={{ verticalAlign: 'middle' }} /> Back to Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
