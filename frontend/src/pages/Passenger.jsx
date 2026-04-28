/**
 * Passenger.jsx — traveler profiles management.
 * Admin only. Features: passenger enrollment, document info,
 * contact details, search/filter, React Icons.
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';

import {
    MdPerson, MdPersonAdd, MdSearch,
    MdEdit, MdDelete, MdClose,
    MdEmail, MdPhoneIphone, MdBadge,
    MdGroupOff
} from 'react-icons/md';

const MODAL_ANIM = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' },
};

export default function Passenger() {
    const [passengers, setPassengers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const fetchPassengers = useCallback(() => {
        setLoading(true);
        api.get('/api/passengers/')
            .then(r => setPassengers(r.data.results || r.data))
            .catch(() => toast.error('Failed to load passenger registry.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchPassengers(); }, [fetchPassengers]);

    const filtered = passengers.filter(p =>
        [p.full_name, p.passport_number, p.email, p.phone]
            .some(v => v?.toLowerCase().includes(search.toLowerCase()))
    );

    const handleDelete = async () => {
        try {
            await api.delete(`/api/passengers/${deleting.id}/`);
            toast.success('Passenger profile removed.');
            setDeleting(null);
            fetchPassengers();
        } catch {
            toast.error('Cannot remove profile: active bookings exist for this traveler.');
        }
    };

    return (
        <div className="page-wrapper">
            <div className="container">

                {/* ── Page Header ── */}
                <div className="page-header">
                    <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <div className="page-title-tag"><MdBadge size={12} /> Registry</div>
                            <h1>Passenger Directory</h1>
                            <p>Manage verified traveler profiles and travel credentials.</p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => { setEditing(null); setShowForm(true); }}
                        >
                            <MdPersonAdd size={18} /> Add Traveler
                        </button>
                    </div>

                    {/* Search bar */}
                    <div style={{ marginTop: '1.25rem', position: 'relative', maxWidth: 420 }}>
                        <MdSearch size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="search"
                            placeholder="Search by name, passport, or email…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                </div>

                {/* ── Content ── */}
                <div className="card-static" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Full Legal Name</th>
                                    <th>Passport Number</th>
                                    <th>Contact Information</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" className="text-center py-20"><div className="spinner" /></td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-20">
                                            <MdGroupOff size={48} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
                                            <div className="text-muted italic">No passenger profiles found.</div>
                                        </td>
                                    </tr>
                                ) : filtered.map((p, i) => (
                                    <tr key={p.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--navy-mid)', color: 'var(--red)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                                                    {p.full_name[0]?.toUpperCase()}
                                                </div>
                                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.full_name}</div>
                                            </div>
                                        </td>
                                        <td><code style={{ fontSize: '0.85rem' }}>{p.passport_number}</code></td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                                                    <MdEmail size={13} style={{ color: 'var(--text-muted)' }} /> {p.email}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                                                    <MdPhoneIphone size={13} style={{ color: 'var(--text-muted)' }} /> {p.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                                <button className="btn btn-secondary btn-xs" onClick={() => { setEditing(p); setShowForm(true); }}><MdEdit size={14} /></button>
                                                <button className="btn btn-danger btn-xs" onClick={() => setDeleting(p)}><MdDelete size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Add / Edit Modal ── */}
            <AnimatePresence>
                {showForm && (
                    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
                        <motion.div className="modal" {...MODAL_ANIM} style={{ maxWidth: 520 }}>
                            <div className="modal-header">
                                <h3>{editing ? <><MdEdit size={18} /> Edit Profile</> : <><MdPersonAdd size={18} /> New Profile</>}</h3>
                                <button className="modal-close" onClick={() => setShowForm(false)} aria-label="Close"><MdClose /></button>
                            </div>
                            <PassengerForm passenger={editing} onClose={() => setShowForm(false)} onSaved={fetchPassengers} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Cancel Confirm Modal ── */}
            <AnimatePresence>
                {deleting && (
                    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleting(null)}>
                        <motion.div className="modal" {...MODAL_ANIM} style={{ maxWidth: 420 }}>
                            <div className="modal-header">
                                <h3 style={{ color: 'var(--red)' }}><MdDelete size={18} /> Remove Traveler</h3>
                                <button className="modal-close" onClick={() => setDeleting(null)} aria-label="Close"><MdClose /></button>
                            </div>
                            <div className="alert alert-warn" style={{ marginBottom: '1.5rem' }}>
                                <FiAlertTriangle size={17} />
                                Delete traveler <strong>{deleting.full_name}</strong>? This action is permanent.
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button className="btn btn-secondary" onClick={() => setDeleting(null)}>Keep Profile</button>
                                <button className="btn btn-danger" onClick={handleDelete}>
                                    <MdDelete size={15} /> Yes, Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────
   Passenger form component
   ────────────────────────────────────────────────────────── */
function PassengerForm({ passenger, onClose, onSaved }) {
    const [form, setForm] = useState({
        full_name: passenger?.full_name || '',
        passport_number: passenger?.passport_number || '',
        phone: passenger?.phone || '',
        email: passenger?.email || '',
    });
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setSaving(true);
        try {
            if (passenger) {
                await api.patch(`/api/passengers/${passenger.id}/`, form);
                toast.success('Traveler updated!');
            } else {
                await api.post('/api/passengers/', form);
                toast.success('Profile created!');
            }
            onSaved(); onClose();
        } catch (err) {
            toast.error('Failed to save profile. Ensure data is valid.');
        } finally { setSaving(false); }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Full Legal Name</label>
                <input value={form.full_name} onChange={e => set('full_name', e.target.value)} required placeholder="e.g. John Smith" />
            </div>
            <div className="form-group">
                <label>Passport Number</label>
                <input value={form.passport_number} onChange={e => set('passport_number', e.target.value.toUpperCase())} required placeholder="A1234567" style={{ fontFamily: 'monospace' }} />
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} required placeholder="+254..." />
                </div>
                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="john@example.com" />
                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Discard</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Processing...' : (passenger ? 'Save Changes' : 'Register Profile')}
                </button>
            </div>
        </form>
    );
}
