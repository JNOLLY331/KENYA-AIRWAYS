/**
 * Register.jsx — account creation page.
 * Features: field-level validation, custom API error display,
 * React Icons, Framer Motion entrance, password visibility toggle.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

import { IoAirplaneSharp } from 'react-icons/io5';
import {
    MdPerson, MdEmail, MdPhone,
    MdLock, MdVisibility, MdVisibilityOff,
    MdPersonAdd, MdLogin,
    MdCheckCircle, MdErrorOutline
} from 'react-icons/md';

/* Helper — renders an icon input with optional error */
const Field = ({ id, label, Icon, type = 'text', placeholder, field, value, onChange, error, autoComplete, right, min }) => (
    <div className="form-group">
        <label htmlFor={id}>{label}</label>
        <div style={{ position: 'relative' }}>
            <Icon
                size={16}
                style={{
                    position: 'absolute', left: 12, top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-muted)',
                    pointerEvents: 'none',
                }}
            />
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                minLength={min}
                style={{ paddingLeft: '2.4rem', paddingRight: right ? '2.8rem' : undefined }}
                className={error ? 'input-error' : ''}
            />
            {right}
        </div>
        {error && (
            <span className="error-msg">
                <MdErrorOutline size={13} /> {error}
            </span>
        )}
    </div>
);

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: '', email: '', phone_number: '',
        password: '', confirm: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPass, setShowPass] = useState(false);
    const [showConf, setShowConf] = useState(false);

    const set = (key, val) => {
        setForm(f => ({ ...f, [key]: val }));
        setErrors(e => ({ ...e, [key]: '', _global: '' }));
    };

    /* ── Field-level validation ── */
    const validate = () => {
        const e = {};
        if (!form.username.trim()) e.username = 'Username is required.';
        else if (form.username.length < 3) e.username = 'Minimum 3 characters.';
        if (!form.email.includes('@')) e.email = 'Please enter a valid email address.';
        if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
        if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }

        setLoading(true);
        try {
            await register({
                username: form.username,
                email: form.email,
                password: form.password,
                phone_number: form.phone_number,
            });
            toast.success('Account created successfully! Please login.');

            setTimeout(() => {
                navigate('/login', { state: { email: form.email } });
            }, 1000);
        } catch (err) {
            const data = err.response?.data || {};
            const next = {};

            // Map Django validation errors to specific fields
            if (data.username) next.username = Array.isArray(data.username) ? data.username[0] : data.username;
            if (data.email) next.email = Array.isArray(data.email) ? data.email[0] : data.email;
            if (data.password) next.password = Array.isArray(data.password) ? data.password[0] : data.password;
            if (data.phone_number) next.phone_number = Array.isArray(data.phone_number) ? data.phone_number[0] : data.phone_number;
            if (data.detail) next._global = data.detail;

            if (!Object.keys(next).length) next._global = 'Registration failed. Please try again.';
            setErrors(next);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: '50vh', paddingTop: 100, paddingBottom: 50, position: 'relative',
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                style={{
                    width: '100%', maxWidth: 520,
                    background: 'var(--navy-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.0rem 2rem',
                    position: 'relative', zIndex: 1,
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div
                        style={{
                            width: 52, height: 52, borderRadius: 16,
                            background: 'var(--red)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 0.5rem',
                            boxShadow: 'var(--shadow-red)',
                        }}
                    >
                        <IoAirplaneSharp size={28} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.1rem' }}>Create Account</h1>
                    <p style={{ fontSize: '0.9rem' }}>Join Kenya Airways — The Pride of Africa</p>
                </div>

                {/* Global error */}
                {errors._global && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="alert alert-error">
                        <MdErrorOutline size={17} /> {errors._global}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <Field id="reg-username" label="Username *" Icon={MdPerson} value={form.username} onChange={e => set('username', e.target.value)} error={errors.username} placeholder="johndoe" autoComplete="username" />
                        <Field id="reg-phone" label="Phone Number" Icon={MdPhone} value={form.phone_number} onChange={e => set('phone_number', e.target.value)} error={errors.phone_number} placeholder="+254712345678" autoComplete="tel" />
                    </div>

                    <Field id="reg-email" label="Email Address *" Icon={MdEmail} type="email" value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} placeholder="you@example.com" autoComplete="email" />

                    <div className="form-row">
                        {/* Password with toggle */}
                        <div className="form-group">
                            <label htmlFor="reg-pass">Password *</label>
                            <div style={{ position: 'relative' }}>
                                <MdLock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                <input id="reg-pass" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters"
                                    value={form.password} onChange={e => set('password', e.target.value)}
                                    autoComplete="new-password" className={errors.password ? 'input-error' : ''}
                                    style={{ paddingLeft: '2.4rem', paddingRight: '2.8rem' }} />
                                <button type="button" onClick={() => setShowPass(v => !v)} aria-label="Toggle password"
                                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                                </button>
                            </div>
                            {errors.password && <span className="error-msg"><MdErrorOutline size={13} /> {errors.password}</span>}
                        </div>

                        {/* Confirm with toggle */}
                        <div className="form-group">
                            <label htmlFor="reg-confirm">Confirm Password *</label>
                            <div style={{ position: 'relative' }}>
                                <MdLock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                <input id="reg-confirm" type={showConf ? 'text' : 'password'} placeholder="Repeat password"
                                    value={form.confirm} onChange={e => set('confirm', e.target.value)}
                                    autoComplete="new-password" className={errors.confirm ? 'input-error' : ''}
                                    style={{ paddingLeft: '2.4rem', paddingRight: '2.8rem' }} />
                                <button type="button" onClick={() => setShowConf(v => !v)} aria-label="Toggle confirm password"
                                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    {showConf ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                                </button>
                            </div>
                            {errors.confirm && <span className="error-msg"><MdErrorOutline size={13} /> {errors.confirm}</span>}
                        </div>
                    </div>

                    {/* Password strength hint */}
                    {form.password.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
                            {form.password.length >= 8
                                ? <><MdCheckCircle size={14} style={{ color: 'var(--success)' }} /> <span style={{ color: 'var(--success)' }}>Password meets minimum requirements</span></>
                                : <><MdErrorOutline size={14} style={{ color: 'var(--warning)' }} /> <span style={{ color: 'var(--warning)' }}>Need {8 - form.password.length} more character{8 - form.password.length !== 1 ? 's' : ''}</span></>
                            }
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                        {loading ? (
                            <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, margin: 0 }} /> Creating account…</>
                        ) : (
                            <><MdPersonAdd size={18} /> Create Account</>
                        )}
                    </button>
                </form>

                <div className="divider" />
                <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--red)', fontWeight: 700, marginTop: 0 }}>
                        <MdLogin size={14} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
