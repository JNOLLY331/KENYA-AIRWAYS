/**
 * NotFound.jsx — 404 page for missing routes.
 * Features: floating animations, brand consistency,
 * return-to-home and help center deep links.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdFlight, MdHome, MdHelpOutline } from 'react-icons/md';

export default function NotFound() {
    return (
        <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="container" style={{ textAlign: 'center' }}>

                {/* Floating Icon */}
                <motion.div
                    animate={{ y: [-15, 0, -15] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ marginBottom: '2.5rem', display: 'inline-flex' }}
                >
                    <div style={{
                        width: 120, height: 120, borderRadius: '50%',
                        background: 'var(--red-dim)', border: '2px solid var(--red-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--shadow-red)'
                    }}>
                        <MdFlight size={56} color="var(--red)" />
                    </div>
                </motion.div>

                {/* Error Text */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 style={{
                        fontSize: 'clamp(6rem, 20vw, 12rem)',
                        fontWeight: 900,
                        color: 'var(--red)',
                        lineHeight: 1,
                        marginBottom: '1rem',
                        letterSpacing: '-0.05em'
                    }}>404</h1>

                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontStyle: 'italic' }}>
                        Flight Diverted: Route Not Found
                    </h2>

                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: 500, margin: '0 auto 3rem', lineHeight: 1.8 }}>
                        The destination you requested is currently unavailable in our flight path.
                        Let’s navigate you back to the Pride of Africa terminal.
                    </p>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/" className="btn btn-primary btn-xl" style={{ boxShadow: 'var(--shadow-red)' }}>
                            <MdHome size={20} /> Back to Terminal
                        </Link>

                        <Link to="/help" className="btn btn-secondary btn-xl">
                            <MdHelpOutline size={20} /> Portal Support
                        </Link>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}