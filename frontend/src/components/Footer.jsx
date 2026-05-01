/**
 * Footer.jsx — detailed, professional multi-column footer.
 * Uses React Icons throughout. No gradients.
 */
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { IoAirplaneSharp } from 'react-icons/io5';
import {
    MdPhone, MdEmail, MdLocationOn, MdFlight,
    MdBookmark, MdGroup, MdHelp, MdBarChart,
    MdPeopleAlt, MdSend
} from 'react-icons/md';
import {
    FaFacebookF, FaTwitter,
    FaInstagram, FaLinkedinIn,
    FaYoutube
} from 'react-icons/fa';
import { RiShieldCheckLine } from 'react-icons/ri';
import { HiOutlineTicket } from 'react-icons/hi';
import api from '../api/axios';
import toast from 'react-hot-toast';

const SERVICES = [
    { to: '/flights', label: 'Browse Flights', Icon: MdFlight },
    { to: '/bookings', label: 'My Bookings', Icon: MdBookmark },
    { to: '/passengers', label: 'Manage Passengers', Icon: MdGroup },
    { to: '/reports', label: 'Reports & Analytics', Icon: MdBarChart },
    { to: '/employees', label: 'Staff Management', Icon: MdPeopleAlt },
];

const SUPPORT = [
    { to: '/help', label: 'Help Centre' },
    { to: '/help#faq', label: 'FAQs' },
    { to: '/help#guide', label: 'Booking Guide' },
    { to: '/help#contact', label: 'Contact Support' },
    { to: '/register', label: 'Create Account' },
];

const SOCIAL = [
    { Icon: FaFacebookF, href: '#', label: 'Facebook' },
    { Icon: FaTwitter, href: '#', label: 'Twitter' },
    { Icon: FaInstagram, href: '#', label: 'Instagram' },
    { Icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
    { Icon: FaYoutube, href: '#', label: 'YouTube' },
];

const CERTS = ['IATA Certified', 'ISO 9001:2015', 'KCAA Approved', 'Star Alliance'];

/* ── Newsletter form ── */
function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        try {
            await api.post('/api/users/newsletter/', { email });
            setSubscribed(true);
            setEmail('');
            toast.success('Subscribed! Check your inbox for a confirmation email.');
        } catch (err) {
            const msg = err.response?.data?.error || 'Subscription failed. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (subscribed) {
        return (
            <div style={{
                background: 'var(--navy-elevated)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '0.9rem 1rem',
                fontSize: '0.85rem', color: 'var(--text-muted)',
            }}>
                ✅ You're subscribed! Check your inbox.
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ fontSize: '0.85rem', borderRadius: 8, padding: '0.65rem 0.9rem' }}
                aria-label="Newsletter email"
                required
            />
            <button type="submit" className="btn btn-primary btn-sm"
                style={{ alignSelf: 'flex-start' }}
                disabled={loading}>
                {loading
                    ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2, margin: 0 }} /> Subscribing…</>
                    : <><MdSend size={14} /> Subscribe</>
                }
            </button>
        </form>
    );
}

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer
            style={{
                background: 'var(--navy-card)',
                borderTop: '1px solid var(--border)',
                marginTop: 'auto',
            }}
        >
            {/* ── Main footer grid ── */}
            <div className="container" style={{ padding: '4rem 1.5rem 2.5rem' }}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '3rem',
                        marginBottom: '3rem',
                    }}
                >
                    {/* Brand Column */}
                    <div style={{ gridColumn: 'span 1' }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
                            <div
                                style={{
                                    width: 42, height: 42, borderRadius: 10,
                                    background: 'var(--red)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 14px rgba(192,30,46,0.3)',
                                }}
                            >
                                <IoAirplaneSharp size={20} color="#fff" />
                            </div>
                            <div>
                                <div style={{
                                    fontWeight: 800, fontSize: '1.05rem', color: '#1d044bff',
                                    fontFamily: 'Poppins, Inter, sans-serif', lineHeight: 1.1
                                }}>
                                    Kenya Airways
                                </div>
                                <div style={{
                                    fontSize: '0.6rem', color: 'var(--red)', letterSpacing: '0.14em',
                                    textTransform: 'uppercase', fontWeight: 700
                                }}>
                                    Pride of Africa
                                </div>
                            </div>
                        </Link>

                        <p style={{ fontSize: '0.875rem', lineHeight: 1.75, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Africa's leading airline, connecting Kenya and the world through
                            excellence, safety, and warm hospitality since 1977.
                        </p>

                        {/* Social Icons */}
                        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                            {SOCIAL.map(({ Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    style={{
                                        width: 36, height: 36,
                                        borderRadius: 8,
                                        background: 'var(--navy-elevated)',
                                        border: '1px solid var(--border)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--text-muted)',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.background = 'var(--red)';
                                        e.currentTarget.style.color = '#fff';
                                        e.currentTarget.style.borderColor = 'var(--red)';
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.background = 'var(--navy-elevated)';
                                        e.currentTarget.style.color = 'var(--text-muted)';
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                    }}
                                >
                                    <Icon size={14} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Services Column */}
                    <div>
                        <h4 style={{
                            fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1.1rem'
                        }}>
                            Services
                        </h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {SERVICES.map(({ to, label, Icon }) => (
                                <li key={to}>
                                    <Link
                                        to={to}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            fontSize: '0.875rem', color: 'var(--text-muted)', transition: 'color 0.2s'
                                        }}
                                        onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                                        onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                                    >
                                        <Icon size={14} style={{ flexShrink: 0, color: 'var(--red)' }} />
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Column */}
                    <div>
                        <h4 style={{
                            fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1.1rem'
                        }}>
                            Support
                        </h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {SUPPORT.map(({ to, label }) => (
                                <li key={to}>
                                    <Link
                                        to={to}
                                        style={{ fontSize: '0.875rem', color: 'var(--text-muted)', transition: 'color 0.2s' }}
                                        onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                                        onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h4 style={{
                            fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1.1rem'
                        }}>
                            Contact
                        </h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {[
                                { Icon: MdPhone, text: '+254 020 327 4747' },
                                { Icon: MdPhone, text: '+254 020 642 2000' },
                                { Icon: MdEmail, text: 'customercare@kenya-airways.com' },
                                { Icon: MdLocationOn, text: 'JKIA, P.O. Box 19002, Nairobi 00501' },
                            ].map(({ Icon, text }) => (
                                <li key={text} style={{ display: 'flex', gap: '0.55rem', alignItems: 'flex-start' }}>
                                    <Icon size={16} style={{ color: 'var(--red)', flexShrink: 0, marginTop: 2 }} />
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div>
                        <h4 style={{
                            fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1.1rem'
                        }}>
                            Newsletter
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
                            Get the latest flight deals, routes, and travel news.
                        </p>
                        <NewsletterForm />
                    </div>
                </div>

                {/* ── Certifications bar ── */}
                <div
                    style={{
                        display: 'flex', flexWrap: 'wrap', gap: '0.65rem',
                        paddingBottom: '2rem',
                    }}
                >
                    {CERTS.map(cert => (
                        <span
                            key={cert}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                padding: '0.25rem 0.75rem',
                                background: 'var(--navy-elevated)',
                                border: '1px solid var(--border)',
                                borderRadius: 99,
                                fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)',
                                textTransform: 'uppercase', letterSpacing: '0.05em',
                            }}
                        >
                            <RiShieldCheckLine size={12} color="var(--red)" />
                            {cert}
                        </span>
                    ))}
                </div>

                {/* ── Bottom bar ── */}
                <div style={{ width: '100%', height: '1px', background: 'var(--border)', margin: '2.5rem 0 1.5rem' }} />
                
                <div
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: '0.75rem',
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                            © {year} Kenya Airways Ltd. All rights reserved.
                        </p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                            Designed and developed by <a 
                                href="https://japheth-anold-6zor.onrender.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ 
                                    color: 'var(--red)', 
                                    fontWeight: 'bold', 
                                    textDecoration: 'none',
                                    transition: 'all 0.3s'
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.color = '#ff4d4d';
                                    e.currentTarget.style.textShadow = '0 0 8px rgba(192, 30, 46, 0.6)';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.color = 'var(--red)';
                                    e.currentTarget.style.textShadow = 'none';
                                }}
                            >
                                Japheth Anold
                            </a>
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(p => (
                            <a
                                key={p} href="#"
                                style={{ fontSize: '0.8rem', color: 'var(--text-muted)', transition: 'color 0.2s' }}
                                onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                                onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                            >
                                {p}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
