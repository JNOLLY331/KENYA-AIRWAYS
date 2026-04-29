import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

import { IoAirplaneSharp } from 'react-icons/io5';
import { MdEmail, MdLock, MdLogin } from 'react-icons/md';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', new_password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/users/reset-password/', form);
            toast.success('Password reset successfully!');
            setTimeout(() => navigate('/login'), 1000);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', paddingTop: 100, paddingBottom: 80 }}>
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                style={{ width: '100%', maxWidth: 460, background: 'var(--navy-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '3rem 2.5rem' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                        <IoAirplaneSharp size={28} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.1rem' }}>Reset Password</h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Enter your email and a new password</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <MdEmail size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" style={{ paddingLeft: '2.5rem' }} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <div style={{ position: 'relative' }}>
                            <MdLock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="password" value={form.new_password} onChange={e => setForm({...form, new_password: e.target.value})} placeholder="••••••••" style={{ paddingLeft: '2.5rem' }} required minLength="8" />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '1.5rem' }}>
                        {loading ? 'Processing...' : 'Reset My Password'}
                    </button>
                </form>

                <div className="divider" />
                <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                    <Link to="/login" style={{ color: 'var(--red)', fontWeight: 700 }}><MdLogin size={14} style={{ verticalAlign: 'middle' }} /> Back to Login</Link>
                </p>
            </motion.div>
        </div>
    );
}
