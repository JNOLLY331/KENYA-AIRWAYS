/**
 * Home.jsx — landing page + logged-in dashboard.
 *
 * Public view:
 *   - Hero section with typewriter effect
 *   - Swiper destinations carousel
 *   - Stats section with react-intersection-observer counter animation
 *   - Features section (AOS scroll animations)
 *   - User testimonials (Swiper)
 *   - Call-to-action section
 *
 * Authenticated view:
 *   - Welcome banner
 *   - Admin stats (if is_staff)
 *   - Quick action cards (AOS)
 *   - Live flights preview (Swiper)
 */
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import SeatAvailability from '../components/SeatAvailability';
import useTypewriter from '../hooks/useTypewriter';
import heroImg from '../assets/hero.webp';

import { IoAirplaneSharp } from 'react-icons/io5';
import {
    MdFlight, MdBookmark, MdGroup,
    MdBarChart, MdPeopleAlt, MdHelp,
    MdArrowForward, MdVerified,
    MdSecurity, MdSupportAgent
} from 'react-icons/md';
import {
    RiShieldUserLine, RiFlightTakeoffLine,
    RiCustomerService2Line
} from 'react-icons/ri';
import { HiOutlineTicket } from 'react-icons/hi';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';
import { BsGraphUpArrow } from 'react-icons/bs';

/* ──────────────────────────────────────────────────────────
   Typewriter phrases for the hero
   ────────────────────────────────────────────────────────── */
const HERO_PHRASES = [
    'Book Your Next Flight',
    'Explore Africa\'s Skies & Beyond',
    'Manage Your Journey',
    'Experience the Difference',
];

/* Destinations loaded from backend dynamically */
/* Testimonials */
const TESTIMONIALS = [
    { name: 'Amara Osei', role: 'Business Traveller', stars: 5, text: 'The booking system is incredibly smooth and professional. Found my seat, chose my class, and had the ticket in my inbox in under 2 minutes.' },
    { name: 'David Kimani', role: 'Frequent Flyer', stars: 5, text: 'Best airline booking experience I\'ve had on the continent. Real-time seat availability is a game changer.' },
    { name: 'Sofia Mwangi', role: 'Holiday Traveller', stars: 4, text: 'Loved how easy it was to add a passenger profile and book for my family. The PDF ticket feature is brilliant.' },
    { name: 'James Otieno', role: 'Corporate Client', stars: 5, text: 'Managing employee assignments through the admin panel is seamless. Reports are detailed and easy to export.' },
];

const features = [
    {
        Icon: HiOutlineTicket,
        color: 'var(--red)',
        bg: 'var(--red-dim)',
        title: 'Book & Manage',
        desc: 'Reserve seats, change or cancel bookings instantly.',
    },
    {
        Icon: MdFlight,
        color: 'var(--blue-light)',
        bg: 'var(--blue-dim)',
        title: 'Live Seat Capacity',
        desc: 'View real-time availability across all classes.',
    },
    {
        Icon: BsGraphUpArrow,
        color: '#FBBF24',
        bg: 'rgba(251,191,36,0.12)',
        title: 'Reports & PDFs',
        desc: 'Download tickets and generate reports easily.',
    },
    {
        Icon: MdSecurity,
        color: '#86EFAC',
        bg: 'var(--success-dim)',
        title: 'Secure & Reliable',
        desc: 'JWT authentication and role-based access.',
    },
    {
        Icon: MdSupportAgent,
        color: '#C084FC',
        bg: 'rgba(192,132,252,0.12)',
        title: '24/7 Support',
        desc: 'Always available to assist you.',
    },
    {
        Icon: MdVerified,
        color: 'var(--blue-light)',
        bg: 'var(--blue-dim)',
        title: 'IATA Certified',
        desc: 'Globally recognized aviation standards.',
    },
];
/* ──────────────────────────────────────────────────────────
   Animated counter — counts up when in view
   ────────────────────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '', speed = 40 }) {
    const [count, setCount] = useState(0);
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.4 });
    const timerRef = useRef(null);

    useEffect(() => {
        if (!inView) return;
        let current = 0;
        const step = Math.ceil(target / (1500 / speed));
        timerRef.current = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timerRef.current); }
            setCount(current);
        }, speed);
        return () => clearInterval(timerRef.current);
    }, [inView, target, speed]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ──────────────────────────────────────────────────────────
   HOME — main export
   ────────────────────────────────────────────────────────── */
export default function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const typeText = useTypewriter(HERO_PHRASES, 85, 45, 1800);

    const [flights, setFlights] = useState([]);
    const [stats, setStats] = useState(null);
    const [loadingFlights, setLoadingFlights] = useState(true);
    const [destinations, setDestinations] = useState([]);

    useEffect(() => {
        // Fetch public destinations for hero slider
        api.get('/api/flights/destinations/')
            .then(r => setDestinations(r.data.results || r.data))
            .catch(() => { });

        if (user) {
            api.get('/api/flights/')
                .then(r => setFlights((r.data.results || r.data).slice(0, 6)))
                .catch(() => { })
                .finally(() => setLoadingFlights(false));

            if (user.is_staff) {
                api.get('/api/reports/stats/')
                    .then(r => setStats(r.data))
                    .catch(() => { });
            }
        }
    }, [user]);

    /* ── PUBLIC VIEW ──────────────────────────────────────── */
    if (!user) {
        return (
            <div style={{ flex: 1 }}>

                {/* ── Hero ─────────────────────────────────────── */}
                <section
                    style={{
                        position: 'relative',
                        minHeight: '100vh',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                    }}
                >
                    {/* Background image */}
                    <img
                        src={heroImg}
                        alt="Kenya Airways aircraft in flight"
                        fetchpriority="high"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {/* Dark solid overlay — NO gradient per design rules */}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,9,15,0.72)' }} />

                    <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', paddingTop: '80px' }}>
                        {/* Airline badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}
                        >
                            <div
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.45rem 1.1rem',
                                    background: 'var(--red)',
                                    borderRadius: 99,
                                    fontSize: '0.78rem', fontWeight: 700, color: '#fff',
                                    textTransform: 'uppercase', letterSpacing: '0.1em',
                                }}
                            >
                                <IoAirplaneSharp size={15} /> The Pride of Africa
                            </div>
                        </motion.div>

                        {/* Headline with typewriter */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.7 }}
                            style={{
                                fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
                                fontWeight: 900,
                                lineHeight: 1.05,
                                color: '#fff',
                                marginBottom: '1.5rem',
                            }}
                        >
                            Kenya Airways
                            <br />
                            <span style={{ color: 'var(--red)' }}>{typeText}</span>
                            <span className="typewriter-cursor" />
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            style={{
                                fontSize: 'clamp(1.2rem, 2.5vw, 1.2rem)',
                                color: 'rgba(255,255,255,0.72)',
                                maxWidth: 580,
                                margin: '0 auto 2.5rem',
                                lineHeight: 1.75,
                            }}
                        >
                            Book tickets, manage your journey, and experience the best of
                            African aviation — all from one powerful platform.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
                        >
                            <Link to="/register" className="btn btn-primary btn-xl">
                                Get Started <MdArrowForward size={18} />
                            </Link>
                            <Link to="/login" className="btn btn-secondary btn-xl">
                                Sign In
                            </Link>
                        </motion.div>
                    </div>

                    {/* Scroll arrow */}
                    <div
                        className="float"
                        style={{
                            position: 'absolute', bottom: '2.5rem', left: '50%',
                            transform: 'translateX(-50%)',
                        }}
                    >
                        <div
                            style={{
                                width: 38, height: 38,
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'rgba(255,255,255,0.4)',
                                fontSize: '1.1rem',
                            }}
                        >
                            ↓
                        </div>
                    </div>
                </section>

                {/* ── Stats Strip ────────────────────────────────── */}
                <section style={{ background: 'var(--red)', padding: '2.5rem 0' }}>
                    <div className="container">
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '2rem',
                                textAlign: 'center',
                            }}
                        >
                            {[
                                { label: 'Destinations', target: 56, suffix: '+' },
                                { label: 'Daily Flights', target: 43, suffix: '' },
                                { label: 'Happy Clients', target: 12600, suffix: '+' },
                                { label: 'Years Flying', target: 47, suffix: '' },
                            ].map(({ label, target, suffix }) => (
                                <div key={label}>
                                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#fff' }}>
                                        <AnimatedCounter target={target} suffix={suffix} />
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.78)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        {label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Destinations Carousel ───────────────────────── */}
                <section className="section" style={{ background: 'var(--navy-card)' }}>
                    <div className="container">
                        <div style={{ textAlign: 'center', marginBottom: '3rem' }} data-aos="fade-up">
                            <span className="section-label">Where We Fly</span>
                            <h2 className="section-title">Popular Destinations</h2>
                            <p className="section-subtitle" style={{ margin: '0 auto' }}>
                                Connecting Nairobi to the world's most exciting cities
                            </p>
                        </div>

                        <Swiper
                            modules={[Autoplay, Pagination]}
                            autoplay={{ delay: 1000, disableOnInteraction: false }}
                            pagination={{ clickable: true }}
                            loop
                            spaceBetween={25}
                            breakpoints={{
                                0: { slidesPerView: 1 },
                                640: { slidesPerView: 2 },
                                900: { slidesPerView: 3 },
                            }}
                            style={{ paddingBottom: '3rem' }}
                        >
                            {destinations.map(({ city, code, detail, color, image_url }) => (
                                <SwiperSlide key={code}>
                                    <div
                                        style={{
                                            position: 'relative',
                                            height: '420px',
                                            borderRadius: '18px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                                        }}
                                    >
                                        {/* Background Image */}
                                        <img
                                            src={image_url}
                                            alt={city}
                                            loading="lazy"
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />

                                        {/* Dark Overlay */}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background:
                                                    'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.25), transparent)',
                                            }}
                                        />

                                        {/* Content */}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                bottom: '1.5rem',
                                                left: '1.5rem',
                                                right: '1.5rem',
                                                color: '#fff',
                                            }}
                                        >
                                            {/* Country (small text) */}
                                            <div
                                                style={{
                                                    fontSize: '0.7rem',
                                                    letterSpacing: '0.15em',
                                                    textTransform: 'uppercase',
                                                    opacity: 0.8,
                                                }}
                                            >
                                                {detail}
                                            </div>

                                            {/* City */}
                                            <h2
                                                style={{
                                                    fontSize: '2rem',
                                                    fontWeight: 800,
                                                    margin: '0.3rem 0',
                                                    color: "white"
                                                }}
                                            >
                                                {city}{' '}
                                                <span style={{ color: 'var(--red)', fontSize: '1rem' }}>
                                                    {code}
                                                </span>
                                            </h2>

                                            {/* Button */}
                                            <Link
                                                to="/register"
                                                style={{
                                                    display: 'block',
                                                    fontWeight: 'bold',
                                                    marginTop: '1rem',
                                                    textAlign: 'center',
                                                    padding: '0.6rem',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(255,255,255,0.4)',
                                                    color: '#fff',
                                                    textDecoration: 'none',
                                                    fontSize: '0.85rem',
                                                    backdropFilter: 'blur(6px)',
                                                }}
                                                className='btn-secondary'
                                            >
                                                Book Now
                                            </Link>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </section>

                <section className="features-section">
                    <div className="container">
                        <div className="header">
                            <span className="section-label">Why Choose Us</span>
                            <h2 className="section-title">Everything in One Platform</h2>
                        </div>

                        <div className="marquee">
                            <div className="marquee-track">
                                {[...features, ...features].map((item, index) => {
                                    const { Icon, color, bg, title, desc } = item;

                                    return (
                                        <div className="feature-card" key={index}>
                                            <div
                                                className="icon-box"
                                                style={{
                                                    background: bg,
                                                    border: `1px solid ${color}`,
                                                }}
                                            >
                                                <Icon size={22} style={{ color }} />
                                            </div>

                                            <h3>{title}</h3>
                                            <p>{desc}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Testimonials ────────────────────────────────── */}
                <section className="section" style={{ background: 'var(--navy-card)' }}>
                    <div className="container">
                        <div style={{ textAlign: 'center', marginBottom: '3rem' }} data-aos="fade-up">
                            <span className="section-label">User Feedback</span>
                            <h2 className="section-title">What Passengers Say</h2>
                        </div>

                        <Swiper
                            modules={[Autoplay, Pagination]}
                            autoplay={{ delay: 4000, disableOnInteraction: false }}
                            pagination={{ clickable: true }}
                            loop
                            spaceBetween={24}
                            breakpoints={{
                                0: { slidesPerView: 1 },
                                768: { slidesPerView: 2 },
                            }}
                            style={{ paddingBottom: '3rem' }}
                        >
                            {TESTIMONIALS.map(({ name, role, stars, text }) => (
                                <SwiperSlide key={name}>
                                    <div className="card-static" style={{ height: '100%', padding: '2rem', borderLeft: 'var(--red) 5px solid' }}>
                                        <FaQuoteLeft size={20} style={{ color: 'var(--red)', marginBottom: '1rem', opacity: 0.7 }} />
                                        <p style={{ fontSize: '1.2rem', lineHeight: 1.9, marginBottom: '1.9rem', color: 'var(--text-secondary)' }}>
                                            {text}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div
                                                style={{
                                                    width: 44, height: 44, borderRadius: '50%',
                                                    background: 'var(--red)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff',
                                                }}
                                            >
                                                {name[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{name}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{role}</div>
                                            </div>
                                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '2px' }}>
                                                {Array.from({ length: stars }).map((_, i) => (
                                                    <FaStar key={i} size={13} style={{ color: '#FBBF24' }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </section>

                {/* ── CTA ─────────────────────────────────────────── */}
                <section className="section">
                    <div className="container">
                        <div
                            style={{
                                background: 'var(--red)',
                                borderRadius: 'var(--radius-xl)',
                                padding: 'clamp(2rem, 5vw, 4rem)',
                                textAlign: 'center',
                            }}
                            data-aos="zoom-in"
                        >
                            <IoAirplaneSharp size={48} color="rgba(255,255,255,0.8)" style={{ marginBottom: '1.25rem' }} />
                            <h2 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', marginBottom: '1rem' }}>
                                Ready to Take Off?
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
                                Create your free account today and book your first flight in under 3 minutes.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Link
                                    to="/register"
                                    className="btn btn-lg"
                                    style={{ background: '#fff', color: 'var(--red)', border: 'none', fontWeight: 700 }}
                                >
                                    Create Account <MdArrowForward size={18} />
                                </Link>
                                <Link to="/help" className="btn btn-lg"
                                    style={{ border: '1px solid rgba(255,255,255,0.5)', color: '#fff', background: 'transparent' }}>
                                    Learn More
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    /* ── AUTHENTICATED DASHBOARD ──────────────────────────── */
    const QUICK_ACTIONS = [
        { to: '/flights', Icon: MdFlight, title: 'Browse Flights', desc: 'View routes and seat availability', color: '#FBBF24' },
        { to: '/bookings', Icon: MdBookmark, title: 'My Bookings', desc: 'View, edit or cancel reservations', color: 'var(--red)' },
        ...(user.is_staff ? [
            { to: '/passengers', Icon: MdGroup, title: 'Passengers', desc: 'Add and manage passenger registry', color: 'var(--blue-light)' },
            { to: '/employees', Icon: MdPeopleAlt, title: 'Employees', desc: 'Assign staff to flight openings', color: '#86EFAC' },
            { to: '/reports', Icon: MdBarChart, title: 'Reports', desc: 'Generate PDFs and analytics', color: '#C084FC' },
        ] : []),
        { to: '/help', Icon: MdHelp, title: 'Help Centre', desc: 'Guides, FAQs, and support', color: '#FB923C' },
    ];

    return (
        <div className="page-wrapper">
            <div className="container">

                {/* ── Welcome Banner ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        background: 'var(--navy-card)',
                        border: '1px solid var(--red-border)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '2rem',
                        marginBottom: '2rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: '1.5rem',
                    }}
                >
                    <div>
                        <div style={{
                            fontSize: '0.78rem', color: 'var(--red)', fontWeight: 700, marginBottom: '0.35rem',
                            textTransform: 'uppercase', letterSpacing: '0.08em'
                        }}>
                            Welcome back
                        </div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>
                            {user.username}
                            {user.is_staff && (
                                <span
                                    className="role-admin"
                                    style={{ marginLeft: '0.75rem', fontSize: '0.75rem', verticalAlign: 'middle' }}
                                >
                                    <RiShieldUserLine size={13} /> Admin
                                </span>
                            )}
                        </h1>
                        <p>Ready to take off? Book a flight or review your reservations.</p>
                    </div>
                    <Link to="/bookings" className="btn btn-primary btn-lg">
                        <IoAirplaneSharp size={18} /> New Booking
                    </Link>
                </motion.div>

                {/* ── Admin Stats ── */}
                {user.is_staff && stats && (
                    <div className="grid-4" style={{ marginBottom: '2rem' }}>
                        {[
                            { Icon: HiOutlineTicket, label: 'Total Bookings', value: stats.total_bookings, bg: 'var(--red-dim)', color: 'var(--red)' },
                            { Icon: MdBookmark, label: "Today's Bookings", value: stats.bookings_today, bg: 'var(--success-dim)', color: '#86EFAC' },
                            { Icon: MdGroup, label: 'Passengers', value: stats.total_passengers, bg: 'var(--blue-dim)', color: 'var(--blue-light)' },
                            { Icon: MdFlight, label: 'Flights', value: stats.total_flights, bg: 'rgba(251,191,36,0.12)', color: '#FBBF24' },
                        ].map(({ Icon, label, value, bg, color }, i) => (
                            <motion.div
                                key={label}
                                className="stat-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08, duration: 0.45 }}
                            >
                                <div className="stat-icon" style={{ background: bg }}>
                                    <Icon size={24} style={{ color }} />
                                </div>
                                <div>
                                    <div className="stat-value" style={{ color }}>{value ?? '—'}</div>
                                    <div className="stat-label">{label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* ── Quick Actions ── */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Quick Actions</h2>
                    <div className="grid-3">
                        {QUICK_ACTIONS.map(({ to, Icon, title, desc, color }, i) => (
                            <motion.div
                                key={to}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07, duration: 0.4 }}
                            >
                                <Link to={to} style={{ textDecoration: 'none' }}>
                                    <div className="card" style={{ height: '100%' }}>
                                        <div
                                            style={{
                                                width: 46, height: 46, borderRadius: 10,
                                                background: `${color}1A`,
                                                border: `1px solid ${color}44`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                marginBottom: '1rem',
                                            }}
                                        >
                                            <Icon size={22} style={{ color }} />
                                        </div>
                                        <h3 style={{ color, marginBottom: '0.4rem', fontSize: '1.05rem' }}>{title}</h3>
                                        <p style={{ fontSize: '0.85rem' }}>{desc}</p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* ── Available Flights (Swiper) ── */}
                <div>
                    <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                        <h2 style={{ fontSize: '1.25rem' }}>Available Flights</h2>
                        <Link to="/flights" className="btn btn-secondary btn-sm">
                            View All <MdArrowForward size={14} />
                        </Link>
                    </div>

                    {loadingFlights ? (
                        <div className="loading-page" style={{ minHeight: 'auto', padding: '3rem 0' }}>
                            <div className="spinner" />
                        </div>
                    ) : flights.length === 0 ? (
                        <div className="alert alert-info">
                            No flights available. An admin must add flights first.
                        </div>
                    ) : (
                        <Swiper
                            modules={[Autoplay, Pagination]}
                            autoplay={{ delay: 3500, disableOnInteraction: false }}
                            pagination={{ clickable: true }}
                            loop={flights.length > 2}
                            spaceBetween={20}
                            breakpoints={{
                                0: { slidesPerView: 1 },
                                640: { slidesPerView: 2 },
                                960: { slidesPerView: 3 },
                            }}
                            style={{ paddingBottom: '3rem' }}
                        >
                            {flights.map(flight => (
                                <SwiperSlide key={flight.id}>
                                    <FlightCard flight={flight} onBook={() => navigate('/bookings')} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────
   Flight card used in the dashboard preview slider
   ────────────────────────────────────────────────────────── */
function FlightCard({ flight, onBook }) {
    const dep = new Date(flight.departure_time);
    const arr = new Date(flight.arrival_time);
    const fmt = d => d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
    const fmtT = d => d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Flight number badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                    style={{
                        background: 'var(--red-dim)', color: 'var(--red)',
                        padding: '0.25rem 0.65rem', borderRadius: 99,
                        fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em',
                        border: '1px solid var(--red-border)',
                    }}
                >
                    {flight.flight_number}
                </span>
                <MdFlight size={18} style={{ color: 'var(--text-muted)' }} />
            </div>

            {/* Route */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-primary)' }}>{flight.origin}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{fmtT(dep)}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{fmt(dep)}</div>
                </div>

                <div style={{ flex: 1, height: 1, background: 'var(--border)', position: 'relative' }}>
                    <IoAirplaneSharp
                        size={16}
                        style={{
                            position: 'absolute', top: -8, left: '50%',
                            transform: 'translateX(-50%)',
                            color: 'var(--red)',
                        }}
                    />
                </div>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-primary)' }}>{flight.destination}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{fmtT(arr)}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{fmt(arr)}</div>
                </div>
            </div>

            {/* Seat bars */}
            <SeatAvailability flight={flight} />

            <button className="btn btn-primary btn-sm" onClick={onBook} style={{ width: '100%' }}>
                Book Now <MdArrowForward size={14} />
            </button>
        </div>
    );
}
