/**
 * SeatAvailability.jsx — visual representation of flight capacity.
 * Displays progress bars for Executive, Business, and Economy classes.
 * Uses consistent brand colors and Vanilla CSS classes.
 */
const CLASSES = [
    { code: 'A', label: 'Executive', color: 'var(--red)', capKey: 'class_a_capacity', leftKey: 'seats_left_a', fullKey: 'is_full_a' },
    { code: 'B', label: 'Business', color: 'var(--blue)', capKey: 'class_b_capacity', leftKey: 'seats_left_b', fullKey: 'is_full_b' },
    { code: 'C', label: 'Economy', color: 'var(--text-muted)', capKey: 'class_c_capacity', leftKey: 'seats_left_c', fullKey: 'is_full_c' },
];

export default function SeatAvailability({ flight }) {
    if (!flight) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {CLASSES.map(({ code, label, color, capKey, leftKey, fullKey }) => {
                const capacity = flight[capKey] ?? 0;
                const left = flight[leftKey] ?? 0;
                const isFull = flight[fullKey];

                // Calculate percentage of seats USED
                const usedPct = capacity > 0 ? Math.round(((capacity - left) / capacity) * 100) : 100;

                return (
                    <div key={code} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'var(--text-secondary)'
                            }}>
                                {label} <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>(Class {code})</span>
                            </div>
                            <div style={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                color: isFull ? 'var(--red)' : 'var(--primary)'
                            }}>
                                {isFull ? 'FULLY BOOKED' : `${left} LEFT`}
                            </div>
                        </div>

                        <div className="seat-bar-bg">
                            <div
                                className="seat-bar-fill"
                                style={{
                                    width: `${usedPct}%`,
                                    background: isFull ? 'var(--red)' : color,
                                    opacity: isFull ? 1 : 0.8
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
