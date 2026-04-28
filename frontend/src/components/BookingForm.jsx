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
    const [passengerForm, setPassengerForm] = useState({ full_name: '', passport_number: '', phone: '', email: '' });

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

    const handleSavePassenger = async () => {
        const e = {};
        if (!passengerForm.full_name.trim()) e.full_name = 'Name required';
        if (!passportRegex.test(passengerForm.passport_number)) e.passport_number = 'Invalid Passport';
        if (!phoneRegex.test(passengerForm.phone)) e.phone = 'Format: +254...';
        if (!passengerForm.email.includes('@')) e.email = 'Invalid Email';

        if (Object.keys(e).length) { setErrors(e); return; }
        try {
            const { data } = await api.post('/api/passengers/', passengerForm);
            setPassengers(prev => [data, ...prev]);
            setForm(f => ({ ...f, passenger: data.id }));
            setNewPassenger(false);
            toast.success('Passenger profile created!');
        } catch (err) {
            toast.error('Failed to create traveler profile.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let res;
            if (booking) {
                res = await api.patch(`/api/bookings/${booking.id}/`, form);
                toast.success('Booking updated!');
            } else {
                res = await api.post('/api/bookings/', form);
                toast.success(`Booking confirmed! ID: ${res.data.booking_code}`);
                if (res.data.next_available_flight) setNextFlight(res.data.next_available_flight);
            }
            onSaved?.();
            if (!res.data.next_available_flight) onClose();
        } catch (err) {
            const d = err.response?.data;
            toast.error(d?.non_field_errors?.[0] || 'Booking failed. Check seat availability.');
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
                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <label>Passenger Identification</label>
                    {user?.is_staff && (
                        <button type="button" onClick={() => setNewPassenger(!newPassenger)} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MdPersonAdd size={16} /> {newPassenger ? 'Use Registry' : 'Add New'}
                        </button>
                    )}
                </div>
                {!newPassenger ? (
                    <div className="form-group">
                        <select value={form.passenger} onChange={e => set('passenger', e.target.value)} required>
                            <option value="">— Select from Registry —</option>
                            {passengers.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.passport_number})</option>)}
                        </select>
                    </div>
                ) : (
                    user?.is_staff && (
                        <div className="card-static" style={{ padding: '1.25rem', marginBottom: '1.25rem', background: 'var(--navy-mid)' }}>
                            <div className="grid-2">
                                <div className="form-group"><input placeholder="Full Name" value={passengerForm.full_name} onChange={e => setPassengerForm({ ...passengerForm, full_name: e.target.value })} /></div>
                                <div className="form-group"><input style={{ fontFamily: 'monospace' }} placeholder="Passport No." value={passengerForm.passport_number} onChange={e => setPassengerForm({ ...passengerForm, passport_number: e.target.value.toUpperCase() })} /></div>
                            </div>
                            <div className="grid-2">
                                <div className="form-group"><input placeholder="Phone (+254...)" value={passengerForm.phone} onChange={e => setPassengerForm({ ...passengerForm, phone: e.target.value })} /></div>
                                <div className="form-group"><input type="email" placeholder="Email Address" value={passengerForm.email} onChange={e => setPassengerForm({ ...passengerForm, email: e.target.value })} /></div>
                            </div>
                            <button type="button" onClick={handleSavePassenger} className="btn btn-secondary btn-block btn-sm">Enroll Traveler</button>
                        </div>
                    )
                )}
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
