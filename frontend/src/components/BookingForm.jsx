import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import SeatAvailability from './SeatAvailability';
import { useAuth } from '../context/AuthContext';

const CLASS_OPTIONS = [
    { value: 'A', label: 'Executive Class (A)' },
    { value: 'B', label: 'Business Class (B)' },
    { value: 'C', label: 'Economy Class (C)' },
];

const seatRegex = /^\d{1,2}[A-F]$/;
const passportRegex = /^[A-Z0-9]{6,10}$/;

export default function BookingForm({ booking, onClose, onSaved }) {
    const { user } = useAuth();

    const [flights, setFlights] = useState([]);
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

    const [fullName, setFullName] = useState(
        booking?.passenger_detail?.full_name || ''
    );

    // Load flights
    useEffect(() => {
        const fetchFlights = async () => {
            try {
                const res = await api.get('/api/flights/');
                setFlights(res.data.results || res.data);
            } catch {
                toast.error('Failed to load flights.');
            }
        };
        fetchFlights();
    }, []);

    const set = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
        setNextFlight(null);
    };

    // Validation
    const validate = () => {
        const newErrors = {};

        if (!form.flight) newErrors.flight = 'Flight is required';
        if (!fullName.trim()) newErrors.fullName = 'Full name is required';

        if (!seatRegex.test(form.seat_number)) {
            newErrors.seat_number = 'Seat must be like 12A';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Passport generator
    const generatePassport = () => {
        const val = 'KQ' + Math.random().toString(36).substring(2, 10).toUpperCase();
        return passportRegex.test(val) ? val : generatePassport();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            toast.error('Please check the errors.');
            return;
        }

        setLoading(true);

        try {
            let passengerId = form.passenger;

            // Create passenger if new booking
            if (!booking) {
                const { data } = await api.post('/api/passengers/', {
                    full_name: fullName.trim(),
                    passport_number: generatePassport(),
                    phone: user?.phone_number || '+254700000000',
                    email: user?.email || 'guest@booking.com',
                });
                passengerId = data.id;
            }

            // Update passenger if editing
            if (booking && form.passenger) {
                if (fullName !== booking.passenger_detail?.full_name) {
                    await api.patch(`/api/passengers/${form.passenger}/`, {
                        full_name: fullName.trim(),
                    });
                }
            }

            const payload = {
                ...form,
                passenger: passengerId,
                seat_number: form.seat_number.toUpperCase(),
            };

            let res;

            if (booking) {
                res = await api.patch(`/api/bookings/${booking.id}/`, payload);
                toast.success('Booking updated!');
            } else {
                res = await api.post('/api/bookings/', payload);
                toast.success(`Booking confirmed! ID: ${res.data.booking_code}`);

                if (res.data.next_available_flight) {
                    setNextFlight(res.data.next_available_flight);
                }
            }

            onSaved?.();

            if (!res?.data?.next_available_flight) {
                onClose();
            }

        } catch (err) {
            const data = err.response?.data || {};

            const fieldErrors = {};
            Object.keys(data).forEach(key => {
                if (Array.isArray(data[key])) {
                    fieldErrors[key] = data[key][0];
                }
            });

            setErrors(fieldErrors);

            toast.error(
                data.non_field_errors?.[0] ||
                data.detail ||
                'Booking failed. Check your inputs.'
            );

        } finally {
            setLoading(false);
        }
    };

    const selectedFlight = flights.find(f => f.id === Number(form.flight));

    return (
        <form onSubmit={handleSubmit}>

            {/* Flight */}
            <div className="form-group">
                <label>Select Flight</label>
                <select
                    value={form.flight}
                    onChange={e => set('flight', e.target.value)}
                >
                    <option value="">— Choose Flight —</option>
                    {flights.map(f => (
                        <option key={f.id} value={f.id}>
                            {f.flight_number} | {f.origin} → {f.destination}
                        </option>
                    ))}
                </select>
                {errors.flight && <small className="error">{errors.flight}</small>}
            </div>

            {/* Seat Availability */}
            {selectedFlight && (
                <div className="card-static">
                    <SeatAvailability flight={selectedFlight} />
                </div>
            )}

            {/* Class + Seat */}
            <div className="form-row">
                <div className="form-group">
                    <label>Travel Class</label>
                    <select
                        value={form.travel_class}
                        onChange={e => set('travel_class', e.target.value)}
                    >
                        {CLASS_OPTIONS.map(c => (
                            <option key={c.value} value={c.value}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Seat</label>
                    <input
                        value={form.seat_number}
                        onChange={e => set('seat_number', e.target.value.toUpperCase())}
                        placeholder="12A"
                    />
                    {errors.seat_number && (
                        <small className="error">{errors.seat_number}</small>
                    )}
                </div>
            </div>

            {/* Passenger */}
            <div className="form-group">
                <label>Passenger Full Name</label>
                <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="John Doe"
                />
                {errors.fullName && (
                    <small className="error">{errors.fullName}</small>
                )}
            </div>

            {/* Payment */}
            <div className="form-group">
                <label>Payment Status</label>
                <select
                    value={form.payment_status}
                    onChange={e => set('payment_status', e.target.value === 'true')}
                >
                    <option value="false">Pending</option>
                    <option value="true">Paid</option>
                </select>
            </div>

            {/* Booking status (edit only) */}
            {booking && (
                <div className="form-group">
                    <label>Booking Status</label>
                    <select
                        value={form.booking_status}
                        onChange={e => set('booking_status', e.target.value)}
                    >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            )}

            {/* Next flight suggestion */}
            {nextFlight && (
                <div className="alert alert-warn">
                    <strong>Class Full!</strong> Try flight {nextFlight.flight_number} on{' '}
                    {new Date(nextFlight.departure_time).toLocaleDateString()}
                </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary flex-1"
                >
                    Discard
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary flex-1"
                >
                    {loading
                        ? 'Processing...'
                        : booking
                            ? 'Save Changes'
                            : 'Confirm Flight'}
                </button>
            </div>

        </form>
    );
}