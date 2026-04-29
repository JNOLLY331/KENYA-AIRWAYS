/**
 * Reports.jsx — operational analytics & report generation.
 * Admin only. Features: statistical overview, PDF report export
 * (Daily Ops, Staff Matches, Tickets), React Icons, Framer Motion.
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import api from '../api/axios';
import toast from 'react-hot-toast';

import {
    MdInsights, MdAssessment, MdCloudDownload,
    MdFileDownload, MdConfirmationNumber, MdPsychology,
    MdEventNote, MdVerified, MdInfoOutline,
    MdPeopleAlt, MdFlight, MdVerifiedUser
} from 'react-icons/md';

function AnimatedStat({ value, color }) {
    const [count, setCount] = useState(0);
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.4 });
    const timerRef = useRef(null);

    useEffect(() => {
        if (!inView || value == null) return;
        let cur = 0;
        const target = Number(value);
        const step = Math.max(1, Math.ceil(target / 40));
        timerRef.current = setInterval(() => {
            cur += step;
            if (cur >= target) { cur = target; clearInterval(timerRef.current); }
            setCount(cur);
        }, 35);
        return () => clearInterval(timerRef.current);
    }, [inView, value]);

    return (
        <div ref={ref} className="stat-value" style={{ color: color || 'var(--text-primary)' }}>
            {value == null ? '—' : count.toLocaleString()}
        </div>
    );
}

export default function Reports() {
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [downloading, setDownloading] = useState('');

    useEffect(() => {
        api.get('/api/reports/stats/')
            .then(r => setStats(r.data))
            .catch(() => toast.error('Failed to load system statistics.'))
            .finally(() => setLoading(false));
    }, []);

    const downloadPdf = async (url, filename, key) => {
        setDownloading(key);
        try {
            const r = await api.get(url, { responseType: 'blob' });
            const blob = new Blob([r.data], { type: 'application/pdf' });
            const href = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = href; a.download = filename; a.click();
            URL.revokeObjectURL(href);
            toast.success(`${filename} exported!`);
        } catch (err) {
            toast.error('Export failed. Ensure you have admin privileges.');
        } finally { setDownloading(''); }
    };

    const STAT_ITEMS = [
        { Icon: MdAssessment, label: 'All Bookings', key: 'total_bookings', color: 'var(--red)' },
        { Icon: MdVerified, label: 'Confirmed', key: 'confirmed_bookings', color: 'var(--success)' },
        { Icon: MdEventNote, label: 'Today', key: 'bookings_today', color: 'var(--blue)' },
        { Icon: MdPeopleAlt, label: 'Passengers', key: 'total_passengers', color: 'var(--text-primary)' },
        { Icon: MdFlight, label: 'Active Routes', key: 'total_flights', color: 'var(--red)' },
        { Icon: MdVerifiedUser, label: 'On-Duty Crew', key: 'assigned_employees', color: 'var(--blue)' },
    ];

    return (
        <div className="page-wrapper">
            <div className="container">

                <div className="page-header">
                    <div className="page-title-tag"><MdInsights size={12} /> Intelligence</div>
                    <h1>Reports & Analytics</h1>
                    <p>Monitor operational efficiency and generate high-fidelity audit reports.</p>
                </div>

                {/* ── Stats Grid ── */}
                <div className="grid-3" style={{ marginBottom: '3rem' }}>
                    {loadingStats ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="stat-card" style={{ height: 110, background: 'var(--navy-card)', opacity: 0.5 }}></div>
                        ))
                    ) : STAT_ITEMS.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="stat-card"
                        >
                            <div className="stat-icon" style={{ background: 'var(--border)', color: item.color }}>
                                <item.Icon size={24} />
                            </div>
                            <div>
                                <AnimatedStat value={stats?.[item.key]} color={item.color} />
                                <div className="stat-label">{item.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ── Export Actions ── */}
                <div className="grid-2" style={{ marginBottom: '3rem' }}>
                    <div className="card-static">
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: 48, height: 48, background: 'var(--red-dim)', color: 'var(--red)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MdEventNote size={24} />
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '0.2rem' }}>Daily Operations</h3>
                                <p style={{ fontSize: '0.85rem' }}>Export all flight and booking activities for a specific day.</p>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Target Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        <button
                            onClick={() => downloadPdf(`/api/reports/daily/?date=${date}`, `KQ_Daily_${date}.pdf`, 'daily')}
                            disabled={!!downloading}
                            className="btn btn-primary btn-block"
                        >
                            <MdCloudDownload size={18} />
                            {downloading === 'daily' ? 'Processing...' : 'Generate Daily Report'}
                        </button>
                    </div>

                    <div className="card-static">
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: 48, height: 48, background: 'var(--blue-dim)', color: 'var(--blue)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MdVerified size={24} />
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '0.2rem' }}>Staff Placements</h3>
                                <p style={{ fontSize: '0.85rem' }}>Master roster of all active crew members and their current duties.</p>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                            Includes Pilot certifications, Cabin Crew IDs, and Flight Route matching data for regulatory compliance.
                        </p>
                        <button
                            onClick={() => downloadPdf('/api/reports/employees/', 'KQ_Staff_Matches.pdf', 'employees')}
                            disabled={!!downloading}
                            className="btn btn-blue btn-block"
                        >
                            <MdFileDownload size={18} />
                            {downloading === 'employees' ? 'Processing...' : 'Export Placement Roster'}
                        </button>
                    </div>
                </div>

                {/* ── Secondary Actions ── */}
                <div className="grid-2">
                    <div className="card" style={{ background: 'var(--navy-mid)', borderColor: 'var(--red-border)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <MdConfirmationNumber size={22} style={{ color: 'var(--red)' }} />
                            Ticket Extraction
                        </h3>
                        <p style={{ fontSize: '0.88rem', marginBottom: '1.5rem' }}>Retrieve high-fidelity PDF tickets using a system booking ID.</p>
                        <TicketDownloader />
                    </div>

                    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                            <MdPsychology size={22} style={{ color: 'var(--blue)' }} />
                            Usability Audit
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Assessment of system efficiency and interface effectiveness.</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1, background: 'var(--border)', padding: '1rem', borderRadius: 12, textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Score</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--red)' }}>94%</div>
                            </div>
                            <div style={{ flex: 1, background: 'var(--border)', padding: '1rem', borderRadius: 12, textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue)' }}>High</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TicketDownloader() {
    const [bookingId, setBookingId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDownload = async (e) => {
        e.preventDefault();
        if (!bookingId.trim()) return;
        setLoading(true);
        try {
            const r = await api.get(`/api/reports/ticket/${bookingId}/`, { responseType: 'blob' });
            const href = URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }));
            const a = document.createElement('a');
            a.href = href; a.download = `KQ_Ticket_${bookingId}.pdf`; a.click();
            toast.success('Ticket pulled successfully.');
        } catch (err) {
            toast.error('Booking ID not recognized in our database.');
        } finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleDownload} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
                type="number" min={1} placeholder="Booking ID"
                style={{ flex: 1, textAlign: 'center', fontWeight: 700 }}
                value={bookingId} onChange={e => setBookingId(e.target.value)}
            />
            <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? '...' : 'Download'}
            </button>
        </form>
    );
}
