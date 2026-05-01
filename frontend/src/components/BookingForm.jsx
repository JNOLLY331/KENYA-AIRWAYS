/**
 * BookingForm.jsx — handles flight reservation inputs.
 * Features: live seat availability check, new passenger enrollment,
 * next-available-flight suggestion, brand design tokens.
 */
import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import SeatAvailability from './SeatAvailability';
import { useAuth } from '../context/AuthContext';

import {
    MdEventSeat, MdPersonAdd, MdClose,
    MdFlightTakeoff, MdInfoOutline, MdWarning,
    MdOutlineLightbulb
} from 'react-icons/md';

const CLASS_OPTIONS = [
    { value: 'A', label: 'Executive Class (A)' },
    { value: 'B', label: 'Business Class (B)' },
    { value: 'C', label: 'Economy Class (C)' },
];

const passportRegex = /^[A-Z0-9]{6,10}$/;
const phoneRegex = /^\+254\d{9}$/;

export default function BookingForm({ booking, onClose, onSaved }) {
    const { user } = useAuth();
    const [flights, setFlights] = useState([]);
    const [passengers, setPassengers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [nextFlight, setNextFlight] = useState(null);

    const [form, setForm] = useState({
        flight: booking?.flight || '',
        passenger: booking?.passenger || '',
        travel_class: booking?.travel_class || 'C',
        seat_number: booking?.seat_number || '',
        payment_status: booking?.payment_status || false,
        booking_status: booking?.booking_status || 'Confirmed',
    });

    const [newPassenger, setNewPassenger] = useState(false);
    const [fullName, setFullName] = useState(booking?.passenger_detail?.full_name || '');

    useEffect(() => {
        Promise.all([
            api.get('/api/flights/').then(r => setFlights(r.data.results || r.data)),
            api.get('/api/passengers/').then(r => setPassengers(r.data.results || r.data)),
        ]).catch(() => toast.error('Failed to load flight and passenger data.'));
    }, []);

    const set = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
        setErrors(e => ({ ...e, [field]: '' }));
        setNextFlight(null);
    };

    // Passenger saving via registry is removed. We autogenerate on submit.

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!fullName.trim()) {
            toast.error('Passenger Full Name is required.');
            return;
        }

        setLoading(true);
        try {
            let passId = form.passenger;

            if (!booking) {
                // Create a passenger on the fly
                // Must be 6-10 uppercase letters/digits, no hyphens
                const randomPassport = 'KQ' + Math.floor(10000000 + Math.random() * 90000000).toString().substring(0, 8);
                const { data: passData } = await api.post('/api/passengers/', {
                    full_name: fullName,
                    passport_number: randomPassport,
                    phone: user?.phone_number || 'Kenya',
                    email: user?.email || 'passenger@kenya-airways.com'
                });
                passId = passData.id;
            } else if (booking && form.passenger) {
                // Update existing passenger if name changed
                if (fullName !== booking.passenger_detail?.full_name) {
                    await api.patch(`/api/passengers/${form.passenger}/`, { full_name: fullName });
                }
            }

            const payload = { ...form, passenger: passId };

            let res;
            if (booking) {
                res = await api.patch(`/api/bookings/${booking.id}/`, payload);
                toast.success('Booking updated!');
            } else {
                res = await api.post('/api/bookings/', payload);
                toast.success(`Booking confirmed! ID: ${res.data.booking_code}`);
                if (res.data.next_available_flight) setNextFlight(res.data.next_available_flight);
            }
            onSaved?.();
            if (!res?.data?.next_available_flight) onClose();
        } catch (err) {
            const d = err.response?.data;
            toast.error(d?.non_field_errors?.[0] || 'Booking failed. Check your details.');
        } finally {
            setLoading(false);
        }
    };

    const selectedFlight = flights.find(f => f.id === Number(form.flight));
    console.log("Flights State:", flights);
    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Select Flight</label>
                <select value={form.flight} onChange={e => set('flight', e.target.value)} required>
                    <option value="">— Choose Routes —</option>
                    {flights.map(f => (
                        <option key={f.id} value={f.id}>
                            {f.flight_number} | {f.origin} to {f.destination}
                        </option>
                    ))}
                </select>
            </div>

            {selectedFlight && (
                <div className="card-static" style={{ padding: '1.25rem', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <MdEventSeat size={18} style={{ color: 'var(--red)' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live Seat Check</span>
                    </div>
                    <SeatAvailability flight={selectedFlight} />
                </div>
            )}

            <div className="form-row">
                <div className="form-group">
                    <label>Travel Class</label>
                    <select value={form.travel_class} onChange={e => set('travel_class', e.target.value)}>
                        {CLASS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Preferred Seat</label>
                    <input style={{ fontWeight: 800, textAlign: 'center' }} placeholder="e.g. 14F" value={form.seat_number} onChange={e => set('seat_number', e.target.value.toUpperCase())} required />
                </div>
            </div>

            <div className="divider" style={{ margin: '0.5rem 0 1.25rem' }} />

            <div>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label>Passenger Full Name</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            placeholder="e.g. John Doe"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            required
                            style={{ padding: '0.75rem', fontSize: '1rem', width: '100%' }}
                        />
                    </div>
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Name as it will appear on your ticket.</small>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Payment Status</label>
                    <select value={form.payment_status} onChange={e => set('payment_status', e.target.value === 'true')}>
                        <option value="false">⏳ Pending</option>
                        <option value="true">✅ Verified Paid</option>
                    </select>
                </div>
                {booking && (
                    <div className="form-group">
                        <label>Reservation Status</label>
                        <select value={form.booking_status} onChange={e => set('booking_status', e.target.value)}>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                )}
            </div>

            {nextFlight && (
                <div className="alert alert-warn" style={{ marginTop: '0.5rem' }}>
                    <MdOutlineLightbulb size={20} />
                    <div>
                        <strong>Class Full!</strong> Recommending: {nextFlight.flight_number} departing on {new Date(nextFlight.departure_time).toLocaleDateString()}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Discard</button>
                <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                    {loading ? 'Processing...' : (booking ? 'Save Changes' : 'Confirm Flight')}
                </button>
            </div>
        </form>
    );
}
