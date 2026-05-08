import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { MdPerson, MdEmail, MdPhone, MdVerifiedUser } from 'react-icons/md';

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/users/profile/')
            .then(res => setProfile(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;
    if (!profile) return <div className="page-wrapper"><div className="container">Error loading profile.</div></div>;

    return (
        <div className="page-wrapper">
            <div className="container" style={{ maxWidth: 640 }}>
                <div className="page-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: 'var(--shadow-red)' }}>
                        <MdPerson size={36} color="#fff" />
                    </div>
                    <h1>My Profile</h1>
                    <p>View your personal details and account status.</p>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-static" style={{ padding: '2rem' }}>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                            <MdPerson size={24} color="var(--text-muted)" />
                            <div>
                                <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Username</small>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{profile.username}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                            <MdEmail size={24} color="var(--text-muted)" />
                            <div>
                                <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Email Address</small>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{profile.email}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                            <MdPhone size={24} color="var(--text-muted)" />
                            <div>
                                <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Phone Number</small>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{profile.phone_number || 'Not provided'}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.5rem' }}>
                            <MdVerifiedUser size={24} color="var(--text-muted)" />
                            <div>
                                <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Account Role</small>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: profile.is_staff ? 'var(--red)' : 'var(--text-primary)' }}>
                                    {profile.is_staff ? 'System Administrator' : 'me'}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
