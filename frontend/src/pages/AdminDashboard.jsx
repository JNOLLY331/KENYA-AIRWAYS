import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

import {
    MdDashboard, MdPersonAdd, MdFlight,
    MdPeople, MdLocationOn, MdArrowForward
} from 'react-icons/md';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [superUserForm, setSuperUserForm] = useState({ username: '', email: '', password: '', phone_number: '' });
    const [loading, setLoading] = useState(false);

    const handleCreateSuperUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/users/admin-create/', superUserForm);
            toast.success('Super user created successfully!');
            setSuperUserForm({ username: '', email: '', password: '', phone_number: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create super user.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="container">
                <div className="page-header" style={{ marginBottom: '2rem' }}>
                    <div className="page-title-tag"><MdDashboard size={12} /> Dashboard</div>
                    <h1>Admin Dashboard</h1>
                    <p>Manage system operations and personnel.</p>
                </div>

                <div className="grid-2">
                    {/* Add Super User Form */}
                    <div className="card-static" style={{ padding: '2rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <MdPersonAdd size={20} color="var(--red)"/> Add another Admin
                        </h3>
                        <form onSubmit={handleCreateSuperUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Username</label>
                                <input value={superUserForm.username} onChange={e => setSuperUserForm({...superUserForm, username: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" value={superUserForm.email} onChange={e => setSuperUserForm({...superUserForm, email: e.target.value})} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Password</label>
                                    <input type="password" value={superUserForm.password} onChange={e => setSuperUserForm({...superUserForm, password: e.target.value})} required minLength="8" />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input value={superUserForm.phone_number} onChange={e => setSuperUserForm({...superUserForm, phone_number: e.target.value})} placeholder="+254..." />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Creating...' : 'Grant Admin Access'}
                            </button>
                        </form>
                    </div>

                    {/* Quick Links Block */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <motion.button whileHover={{ scale: 1.02 }} className="card" onClick={() => navigate('/flights')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: 'var(--navy-elevated)', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: 'var(--navy-accent)', padding: '1rem', borderRadius: 12 }}><MdFlight size={24} color="#fff" /></div>
                                <div style={{ textAlign: 'left' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Flights & Destinations</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Add flights, delete flights, and new destinations</p>
                                </div>
                            </div>
                            <MdArrowForward size={20} color="var(--text-muted)" />
                        </motion.button>

                        <motion.button whileHover={{ scale: 1.02 }} className="card" onClick={() => navigate('/passengers')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: 'var(--navy-elevated)', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: 'var(--navy-accent)', padding: '1rem', borderRadius: 12 }}><MdPeople size={24} color="#fff" /></div>
                                <div style={{ textAlign: 'left' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Manage Passengers</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>View, edit and override passenger profiles</p>
                                </div>
                            </div>
                            <MdArrowForward size={20} color="var(--text-muted)" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
}
