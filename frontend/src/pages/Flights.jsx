/**
 * Flights.jsx — browse routes, check seat availability.
 * Admin can add, edit, or delete flights.
 * Uses React Icons, Framer Motion modals, AOS card animations.
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import SeatAvailability from '../components/SeatAvailability';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

import { IoAirplaneSharp } from 'react-icons/io5';
import {
    MdFlight, MdSearch, MdAdd,
    MdEdit, MdDelete, MdClose,
    MdFlightTakeoff, MdFlightLand,
    MdSchedule, MdAirlineSeatReclineNormal,
    MdWarning
} from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';

const MODAL_ANIM = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' },
};

export default function Flights() {
    const { user } = useAuth();
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const fetchFlights = useCallback(() => {
        setLoading(true);
        api.get('/api/flights/')
            .then(r => setFlights(r.data.results || r.data))
            .catch(() => toast.error('Failed to load flights. Please refresh.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchFlights(); }, [fetchFlights]);

    const filtered = flights.filter(f =>
        [f.flight_number, f.origin, f.destination]
            .some(v => v?.toLowerCase().includes(search.toLowerCase()))
    );

    const handleDelete = async () => {
        try {
            await api.delete(`/api/flights/${deleting.id}/`);
            toast.success('Flight deleted successfully.');
            setDeleting(null);
            fetchFlights();
        } catch {
            toast.error('Cannot delete — this flight may have active bookings.');
        }
    };

    return (
        <div className="page-wrapper">
            <div className="container">

                {/* ── Page Header ── */}
                <div className="page-header">
                    <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <div className="page-title-tag"><MdFlight size={12} /> Flights</div>
                            <h1>Available Flights</h1>
                            <p>Browse routes and check real-time seat availability.</p>
                        </div>

                        {user?.is_staff && (
                            <button
                                id="add-flight-btn"
                                className="btn btn-primary"
                                onClick={() => { setEditing(null); setShowForm(true); }}
                            >
                                <MdAdd size={18} /> Add Flight
                            </button>
                        )}
                    </div>

                    {/* Search bar */}
                    <div style={{ marginTop: '1.25rem', position: 'relative', maxWidth: 420 }}>
                        <MdSearch size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                            id="flights-search"
                            type="search"
                            placeholder="Search by flight number, origin, or destination…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                </div>

                {/* ── Content ── */}
                {loading ? (
                    <div className="loading-page">
                        <div className="spinner" />
                        <p>Loading flights…</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="alert alert-info">
                        <MdFlight size={17} />
                        {search ? `No flights found for "${search}".` : 'No flights available yet.'}
                    </div>
                ) : (
                    <div className="grid-2">
                        {filtered.map((flight, i) => (
                            <motion.div
                                key={flight.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06, duration: 0.4 }}
                            >
                                <FlightDetailCard
                                    flight={flight}
                                    isAdmin={user?.is_staff}
                                    onEdit={() => { setEditing(flight); setShowForm(true); }}
                                    onDelete={() => setDeleting(flight)}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Add / Edit Modal ── */}
            <AnimatePresence>
                {showForm && (
                    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
                        <motion.div className="modal" {...MODAL_ANIM} style={{ maxWidth: 560 }}>
                            <div className="modal-header">
                                <h3>{editing ? <><MdEdit size={18} /> Edit Flight</> : <><MdAdd size={18} /> Add New Flight</>}</h3>
                                <button className="modal-close" onClick={() => setShowForm(false)} aria-label="Close"><MdClose /></button>
                            </div>
                            <FlightForm flight={editing} onClose={() => setShowForm(false)} onSaved={fetchFlights} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Delete Confirm Modal ── */}
            <AnimatePresence>
                {deleting && (
                    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleting(null)}>
                        <motion.div className="modal" {...MODAL_ANIM} style={{ maxWidth: 420 }}>
                            <div className="modal-header">
                                <h3 style={{ color: 'var(--red)' }}><MdDelete size={18} /> Delete Flight</h3>
                                <button className="modal-close" onClick={() => setDeleting(null)} aria-label="Close"><MdClose /></button>
                            </div>
                            <div className="alert alert-warn" style={{ marginBottom: '1.5rem' }}>
                                <FiAlertTriangle size={17} />
                                Are you sure you want to delete flight <strong>{deleting.flight_number}</strong>?
                                This cannot be undone.
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button className="btn btn-secondary" onClick={() => setDeleting(null)}>Cancel</button>
                                <button className="btn btn-danger" onClick={handleDelete}>
                                    <MdDelete size={15} /> Delete
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
   Flight detail card
   ────────────────────────────────────────────────────────── */
function FlightDetailCard({ flight, isAdmin, onEdit, onDelete }) {
    const dep = new Date(flight.departure_time);
    const arr = new Date(flight.arrival_time);
    const fmtDT = d => d.toLocaleString('en-KE', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    return (
        <div className="card">
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span
                    style={{
                        background: 'var(--red-dim)', color: 'var(--red)',
                        padding: '0.25rem 0.75rem', borderRadius: 99,
                        fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.06em',
                        border: '1px solid var(--red-border)',
                    }}
                >
                    {flight.flight_number}
                </span>

                {isAdmin && (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={onEdit} aria-label="Edit flight">
                            <MdEdit size={15} /> Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={onDelete} aria-label="Delete flight">
                            <MdDelete size={15} />
                        </button>
                    </div>
                )}
            </div>

            {/* Route display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                    <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)', lineHeight: 1 }}>{flight.origin}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        <MdFlightTakeoff size={13} /> {fmtDT(dep)}
                    </div>
                </div>

                <div style={{ flex: 1, height: 1, background: 'var(--border)', position: 'relative' }}>
                    <IoAirplaneSharp
                        size={18}
                        style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', color: 'var(--red)' }}
                    />
                </div>

                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)', lineHeight: 1 }}>{flight.destination}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, justifyContent: 'flex-end' }}>
                        <MdFlightLand size={13} /> {fmtDT(arr)}
                    </div>
                </div>
            </div>

            <div className="divider" style={{ margin: '0.75rem 0' }} />

            {/* Seat availability bars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                <MdAirlineSeatReclineNormal size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Seat Availability
                </span>
            </div>
            <SeatAvailability flight={flight} />
        </div>
    );
}

/* ──────────────────────────────────────────────────────────
   Flight form — create / update
   ────────────────────────────────────────────────────────── */
function FlightForm({ flight, onClose, onSaved }) {
    const [form, setForm] = useState({
        flight_number: flight?.flight_number || '',
        origin: flight?.origin || '',
        destination: flight?.destination || '',
        departure_time: flight?.departure_time ? flight.departure_time.slice(0, 16) : '',
        arrival_time: flight?.arrival_time ? flight.arrival_time.slice(0, 16) : '',
        class_a_capacity: flight?.class_a_capacity || 20,
        class_b_capacity: flight?.class_b_capacity || 50,
        class_c_capacity: flight?.class_c_capacity || 100,
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

    const validate = () => {
        const e = {};
        if (!form.flight_number.trim()) e.flight_number = 'Required';
        if (!form.origin.trim()) e.origin = 'Required';
        if (!form.destination.trim()) e.destination = 'Required';
        if (!form.departure_time) e.departure_time = 'Required';
        if (!form.arrival_time) e.arrival_time = 'Required';
        if (form.departure_time && form.arrival_time && form.arrival_time <= form.departure_time)
            e.arrival_time = 'Arrival must be after departure';
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setSaving(true);
        try {
            if (flight) {
                await api.patch(`/api/flights/${flight.id}/`, form);
                toast.success('Flight updated!');
            } else {
                await api.post('/api/flights/', form);
                toast.success('Flight added!');
            }
            onSaved(); onClose();
        } catch (err) {
            const d = err.response?.data;
            if (d?.flight_number) toast.error('Flight number already exists.');
            else toast.error('Failed to save flight.');
        } finally { setSaving(false); }
    };

    const FieldGroup = ({ k, label, placeholder, type = 'text', min, extra }) => (
        <div className="form-group">
            <label>{label}</label>
            <input
                type={type} placeholder={placeholder} min={min}
                value={form[k]}
                onChange={e => set(k, type === 'number' ? (parseInt(e.target.value) || 1) : e.target.value)}
                className={errors[k] ? 'input-error' : ''}
                {...extra}
            />
            {errors[k] && <span className="error-msg"><MdWarning size={13} /> {errors[k]}</span>}
        </div>
    );

    return (
        <form onSubmit={handleSubmit}>
            <FieldGroup k="flight_number" label="Flight Number *" placeholder="KQ101"
                extra={{ onChange: e => set('flight_number', e.target.value.toUpperCase()) }} />

            <div className="form-row">
                <FieldGroup k="origin" label="Origin *" placeholder="Nairobi" />
                <FieldGroup k="destination" label="Destination *" placeholder="London" />
            </div>

            <div className="form-row">
                <FieldGroup k="departure_time" label="Departure *" type="datetime-local" />
                <FieldGroup k="arrival_time" label="Arrival *" type="datetime-local" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <FieldGroup k="class_a_capacity" label="Executive Seats" type="number" min={1} />
                <FieldGroup k="class_b_capacity" label="Business Seats" type="number" min={1} />
                <FieldGroup k="class_c_capacity" label="Economy Seats" type="number" min={1} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving
                        ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, margin: 0 }} /> Saving…</>
                        : flight ? 'Update Flight' : 'Add Flight'
                    }
                </button>
            </div>
        </form>
    );
}
