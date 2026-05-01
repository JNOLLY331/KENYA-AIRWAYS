/**
 * VerifyEmail.jsx — handles the email-verification link flow.
 *
 * Two entry points:
 *   A) Backend link → /api/users/verify-email/<token>/ → Django redirects →
 *      /login?verified=true  (Login.jsx shows the success banner).
 *      The user never lands here in this flow — it's handled by the redirect.
 *
 *   B) Legacy / fallback: if someone opens /verify-email?token=<uuid> directly
 *      (e.g. copied link), this page calls the backend API on mount and shows
 *      a success or error state, then navigates to /login?verified=true.
 *
 *   C) /verify-email?verified=invalid — backend token-not-found redirect
 *      shows an error + resend form.
 */
import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoAirplaneSharp } from 'react-icons/io5';
import { MdCheckCircle, MdErrorOutline, MdLogin, MdRefresh } from 'react-icons/md';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const verifiedParam = searchParams.get('verified');   // 'true' | 'invalid' | null
    const tokenParam = searchParams.get('token');       // raw UUID from legacy link

    const [status, setStatus] = useState(
        verifiedParam === 'true' ? 'success' :
            verifiedParam === 'invalid' ? 'invalid' :
                tokenParam ? 'verifying' : 'idle'
    );
    const [resendEmail, setResendEmail] = useState('');
    const [resending, setResending] = useState(false);

    /* ── If a raw token is in the URL: call the backend API, then redirect ── */
    useEffect(() => {
        if (!tokenParam) return;

        (async () => {
            try {
                // Backend now returns JSON: { verified: true, message: "..." }
                // or HTTP 400: { error: "Invalid or already-used verification link." }
                await api.get(`/api/users/verify-email/${tokenParam}/`);
                setStatus('success');
                toast.success('Email verified! You can now log in.');
                setTimeout(() => navigate('/login?verified=true', { replace: true }), 2200);
            } catch (err) {
                // 400 = invalid / already-used token
                setStatus('invalid');
                const msg = err.response?.data?.error;
                if (msg) toast.error(msg);
            }
        })();
    }, [tokenParam]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleResend = async (e) => {
        e.preventDefault();
        if (!resendEmail.trim()) return;
        setResending(true);
        try {
            await api.post('/api/users/resend-verification/', { email: resendEmail });
            toast.success('Email sent! Check your inbox.');
        } catch {
            toast.error('Could not resend. Please try again.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '70vh', paddingTop: 100, paddingBottom: 60,
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    width: '100%', maxWidth: 480,
                    background: 'var(--navy-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '3rem 2.5rem',
                    textAlign: 'center',
                }}
            >
                {/* Logo */}
                <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: 'var(--red)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    boxShadow: 'var(--shadow-red)',
                }}>
                    <IoAirplaneSharp size={28} color="#fff" />
                </div>

                {/* ── Verifying in progress ── */}
                {status === 'verifying' && (
                    <>
                        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>Verifying your email…</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Please wait just a moment.</p>
                        <div className="spinner" style={{ margin: '2rem auto' }} />
                    </>
                )}

                {/* ── Success ── */}
                {status === 'success' && (
                    <>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'var(--success-dim)',
                            border: '2px solid #86EFAC',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                        }}>
                            <MdCheckCircle size={32} style={{ color: '#86EFAC' }} />
                        </div>
                        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>
                            Email Verified!
                        </h1>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
                            Your email has been successfully verified.
                            You can now log in to your Kenya Airways account.
                        </p>
                        <Link to="/login" className="btn btn-primary btn-lg btn-block" style={{ justifyContent: 'center' }}>
                            <MdLogin size={18} /> Sign In Now
                        </Link>
                    </>
                )}

                {/* ── Invalid / expired ── */}
                {status === 'invalid' && (
                    <>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'rgba(192,30,46,0.12)',
                            border: '2px solid var(--red)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                        }}>
                            <MdErrorOutline size={32} style={{ color: 'var(--red)' }} />
                        </div>
                        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>
                            Invalid Link
                        </h1>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
                            This verification link is invalid or has already been used.
                            Enter your email below to receive a new one.
                        </p>
                        <form onSubmit={handleResend} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                value={resendEmail}
                                onChange={e => setResendEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn btn-primary btn-block" disabled={resending}>
                                {resending
                                    ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, margin: 0 }} /> Sending…</>
                                    : <><MdRefresh size={16} /> Resend Verification Email</>
                                }
                            </button>
                        </form>
                    </>
                )}

                {/* ── Idle (no params at all) ── */}
                {status === 'idle' && (
                    <>
                        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>Email Verification</h1>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
                            Check your inbox for the verification link we sent after registration.
                        </p>
                        <Link to="/login" className="btn btn-primary btn-lg btn-block" style={{ justifyContent: 'center' }}>
                            <MdLogin size={18} /> Back to Login
                        </Link>
                    </>
                )}

                <div className="divider" />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Link to="/login" style={{ color: 'var(--red)', fontWeight: 700 }}>
                        <MdLogin size={13} style={{ verticalAlign: 'middle' }} /> Back to Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
