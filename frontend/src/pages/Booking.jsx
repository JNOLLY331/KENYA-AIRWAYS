/**
 * Booking.jsx — manage flight reservations.
 * Tabs: My Bookings list | Booking Inquiry by code
 * Admin sees all bookings; regular users see only their own.
 * React Icons, Framer Motion modals, custom error handling.
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import BookingForm from '../components/BookingForm';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

import { IoAirplaneSharp } from 'react-icons/io5';
import {
    MdBookmark, MdAdd, MdSearch,
    MdEdit, MdDelete, MdClose,
    MdDownload, MdWarning,
    MdCheckCircle, MdPending,
    MdCancel, MdPerson,
    MdFlight, MdEventSeat
} from 'react-icons/md';
import { HiOutlineTicket } from 'react-icons/hi';
import { FiAlertTriangle } from 'react-icons/fi';

const STATUS_BADGE = { Confirmed: 'badge-green', Pending: 'badge-yellow', Cancelled: 'badge-red' };
const CLASS_LABELS = { A: 'Executive', B: 'Business', C: 'Economy' };

const MODAL_ANIM = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' },
};

export default function Booking() {
    const { user } = useAuth();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNew, setShowNew] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [tab, setTab] = useState('list');

    /* Inquiry state */
    const [inquiryCode, setInquiryCode] = useState('');
    const [inquiryResult, setInquiryResult] = useState(null);
    const [inquiryLoading, setInquiryLoading] = useState(false);

    const fetchBookings = useCallback(() => {
        setLoading(true);
        api.get('/api/bookings/')
            .then(r => setBookings(r.data.results || r.data))
            .catch(() => toast.error('Failed to load bookings.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    const handleDelete = async () => {
        try {
            await api.delete(`/api/bookings/${deleting.id}/`);
            toast.success('Booking cancelled successfully.');
            setDeleting(null);
            fetchBookings();
        } catch {
            toast.error('Failed to cancel booking. Please try again.');
        }
    };

    const handleInquiry = async (e) => {
        e.preventDefault();
        if (!inquiryCode.trim()) return;
        setInquiryLoading(true);
        setInquiryResult(null);
        try {
            const { data } = await api.get(`/api/bookings/by-code/${inquiryCode.trim().toUpperCase()}/`);
            setInquiryResult({ data, error: null });
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.detail || 'Booking not found.';
            setInquiryResult({ data: null, error: msg });
        } finally { setInquiryLoading(false); }
    };

    /* Opens a PDF ticket in a new tab (also triggers blob download) */
    const downloadTicket = (bookingId) => {
        api.get(`/api/reports/ticket/${bookingId}/`, { responseType: 'blob' })
            .then(r => {
                const url = URL.createObjectURL(r.data);
                const a = document.createElement('a');
                a.href = url; a.download = `KQ_Ticket_${bookingId}.pdf`; a.click();
                URL.revokeObjectURL(url);
            })
            .catch(() => toast.error('Could not download ticket. Please contact an admin.'));
    };

    return (
        <div className="page-wrapper">
            <div className="container">

                {/* ── Page Header ── */}
                <div className="page-header">
                    <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <div className="page-title-tag"><MdBookmark size={12} /> Bookings</div>
                            <h1>Manage Bookings</h1>
                            <p>Reserve, edit, or cancel your flight reservations.</p>
                        </div>
                        <button id="new-booking-btn" className="btn btn-primary" onClick={() => setShowNew(true)}>
                            <MdAdd size={18} /> New Booking
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="tab-bar" style={{ marginTop: '1.25rem', marginBottom: 0 }}>
                        {[
                            { key: 'list', label: 'My Bookings', Icon: MdBookmark },
                            { key: 'inquiry', label: 'Booking Inquiry', Icon: MdSearch },
                        ].map(({ key, label, Icon }) => (
                            <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
                                <Icon size={15} /> {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── INQUIRY TAB ── */}
                {tab === 'inquiry' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                        <div className="card-static" style={{ maxWidth: 580, margin: '0 auto' }}>
                            <h3 style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MdSearch size={20} /> Booking Inquiry
                            </h3>
                            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                Enter a booking code to look up reservation details.
                            </p>

                            <form onSubmit={handleInquiry} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <input
                                    id="inquiry-code-input"
                                    placeholder="e.g. ABC123DEF456"
                                    value={inquiryCode}
                                    onChange={e => setInquiryCode(e.target.value.toUpperCase())}
                                    style={{ flex: 1, fontFamily: 'Courier New, monospace', letterSpacing: '0.06em' }}
                                />
                                <button type="submit" className="btn btn-primary" disabled={inquiryLoading}>
                                    {inquiryLoading
                                        ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, margin: 0 }} />
                                        : <><MdSearch size={15} /> Search</>
                                    }
                                </button>
                            </form>

                            {inquiryResult?.error && (
                                <div className="alert alert-error"><MdWarning size={17} /> {inquiryResult.error}</div>
                            )}
                            {inquiryResult?.data && (
                                <BookingDetailCard
                                    booking={inquiryResult.data}
                                    onEdit={() => { setEditing(inquiryResult.data); setTab('list'); }}
                                    onDelete={() => { setDeleting(inquiryResult.data); setTab('list'); }}
                                    onDownload={() => downloadTicket(inquiryResult.data.id)}
                                />
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ── BOOKINGS LIST TAB ── */}
                {tab === 'list' && (
                    loading ? (
                        <div className="loading-page" style={{ minHeight: '40vh' }}>
                            <div className="spinner" />
                            <p>Loading bookings…</p>
                        </div>
                    ) : bookings.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="alert alert-info" style={{ maxWidth: 500 }}>
                                <MdBookmark size={17} />
                                No bookings yet. Click <strong>New Booking</strong> to get started.
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                        >
                            {bookings.map((b, i) => (
                                <motion.div
                                    key={b.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <BookingRow
                                        booking={b}
                                        onEdit={() => setEditing(b)}
                                        onDelete={() => setDeleting(b)}
                                        onDownload={() => downloadTicket(b.id)}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )
                )}
            </div>

            {/* ── New Booking Modal ── */}
            <AnimatePresence>
                {showNew && (
                    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowNew(false)}>
                        <motion.div className="modal" {...MODAL_ANIM} style={{ maxWidth: 620 }}>
                            <div className="modal-header">
                                <h3><IoAirplaneSharp size={18} /> New Booking</h3>
                                <button className="modal-close" onClick={() => setShowNew(false)} aria-label="Close"><MdClose /></button>
                            </div>
                            <BookingForm onClose={() => setShowNew(false)} onSaved={fetchBookings} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Edit Booking Modal ── */}
            <AnimatePresence>
                {editing && (
                    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditing(null)}>
                        <motion.div className="modal" {...MODAL_ANIM} style={{ maxWidth: 620 }}>
                            <div className="modal-header">
                                <h3><MdEdit size={18} /> Change Booking — <code>{editing.booking_code}</code></h3>
                                <button className="modal-close" onClick={() => setEditing(null)} aria-label="Close"><MdClose /></button>
                            </div>
                            <BookingForm booking={editing} onClose={() => setEditing(null)} onSaved={fetchBookings} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Cancel Confirm Modal ── */}
            <AnimatePresence>
                {deleting && (
                    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleting(null)}>
                        <motion.div className="modal" {...MODAL_ANIM} style={{ maxWidth: 440 }}>
                            <div className="modal-header">
                                <h3 style={{ color: 'var(--red)' }}><MdCancel size={18} /> Cancel Booking</h3>
                                <button className="modal-close" onClick={() => setDeleting(null)} aria-label="Close"><MdClose /></button>
                            </div>
                            <div className="alert alert-warn">
                                <FiAlertTriangle size={17} />
                                Cancel booking <strong>{deleting.booking_code}</strong>? This action is permanent.
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                                <button className="btn btn-secondary" onClick={() => setDeleting(null)}>Keep It</button>
                                <button className="btn btn-danger" onClick={handleDelete}>
                                    <MdCancel size={15} /> Cancel Booking
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
   Booking row card for the list tab
   ────────────────────────────────────────────────────────── */
function BookingRow({ booking, onEdit, onDelete, onDownload }) {
    const dep = booking.flight_detail ? new Date(booking.flight_detail.departure_time) : null;

    return (
        <div
            className="card"
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto',
                gap: '1.5rem', alignItems: 'center',
            }}
        >
            {/* Left: code + route */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                    <code style={{
                        background: 'var(--red-dim)', color: 'var(--red)', padding: '0.2rem 0.65rem',
                        borderRadius: 6, fontSize: '0.88rem', fontWeight: 800, letterSpacing: '0.08em'
                    }}>
                        {booking.booking_code}
                    </code>
                    <span className={`badge ${STATUS_BADGE[booking.booking_status] || 'badge-blue'}`}>
                        {booking.booking_status}
                    </span>
                    <span className={`badge ${booking.payment_status ? 'badge-green' : 'badge-yellow'}`}>
                        {booking.payment_status
                            ? <><MdCheckCircle size={11} /> Paid</>
                            : <><MdPending size={11} /> Unpaid</>
                        }
                    </span>
                </div>

                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MdFlight size={15} style={{ color: 'var(--text-muted)' }} />
                    {booking.flight_detail?.origin} → {booking.flight_detail?.destination}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span>{dep?.toLocaleString('en-KE')}</span>
                    <span>·</span>
                    <span><MdEventSeat size={12} /> Seat {booking.seat_number}</span>
                    <span>·</span>
                    <span>{CLASS_LABELS[booking.travel_class] || booking.travel_class}</span>
                </div>
            </div>

            {/* Passenger */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <MdPerson size={15} style={{ color: 'var(--text-muted)' }} />
                    {booking.passenger_detail?.full_name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {booking.passenger_detail?.passport_number}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {booking.passenger_detail?.email}
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                <button className="btn btn-green btn-sm" onClick={onDownload} title="Download PDF ticket">
                    <HiOutlineTicket size={14} /> Ticket
                </button>
                <button className="btn btn-primary btn-sm" onClick={onEdit}>
                    <MdEdit size={14} /> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={onDelete}>
                    <MdCancel size={14} /> Cancel
                </button>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────
   Booking detail card for the inquiry tab
   ────────────────────────────────────────────────────────── */
function BookingDetailCard({ booking, onEdit, onDelete, onDownload }) {
    const rows = [
        ['Booking Code', <code key="code" style={{ color: 'var(--red)', fontWeight: 800 }}>{booking.booking_code}</code>],
        ['Status', <span key="status" className={`badge ${STATUS_BADGE[booking.booking_status] || 'badge-blue'}`}>{booking.booking_status}</span>],
        ['Flight', `${booking.flight_detail?.flight_number} — ${booking.flight_detail?.origin} → ${booking.flight_detail?.destination}`],
        ['Departure', booking.flight_detail?.departure_time ? new Date(booking.flight_detail.departure_time).toLocaleString('en-KE') : '—'],
        ['Passenger', booking.passenger_detail?.full_name],
        ['Passport', booking.passenger_detail?.passport_number],
        ['Class', CLASS_LABELS[booking.travel_class] || booking.travel_class],
        ['Seat', booking.seat_number],
        ['Payment', booking.payment_status ? 'Paid' : 'Pending'],
    ];

    return (
        <div style={{ background: 'var(--navy-elevated)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <tbody>
                    {rows.map(([k, v]) => (
                        <tr key={k} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.55rem 0', color: 'var(--text-muted)', width: '40%', fontWeight: 600 }}>{k}</td>
                            <td style={{ padding: '0.55rem 0', color: 'var(--text-primary)' }}>{v}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.1rem', flexWrap: 'wrap' }}>
                <button className="btn btn-green btn-sm" onClick={onDownload}><MdDownload size={14} /> Ticket</button>
                <button className="btn btn-secondary btn-sm" onClick={onEdit}><MdEdit size={14} /> Change</button>
                <button className="btn btn-danger btn-sm" onClick={onDelete}><MdCancel size={14} /> Cancel</button>
            </div>
        </div>
    );
}
