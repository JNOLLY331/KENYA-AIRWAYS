/**
 * Navbar.jsx — Main responsive navigation.
 * Handles role-based links, sign-out flow, and mobile hamburger menu.
 * Uses Framer Motion for smooth mobile transitions.
 */
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

import {
  MdMenu, MdClose, MdLogout,
  MdPerson, MdDashboard, MdFlight,
  MdBookmark, MdBadge, MdInsights,
  MdHelpOutline
} from 'react-icons/md';
import { IoAirplaneSharp } from 'react-icons/io5';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout(); // instant — clears state synchronously
    toast.success('Signed out successfully.');
    navigate('/login');
    setMobileOpen(false);
    setIsLoggingOut(false);
  };

  const NAV_LINKS = [
    { label: 'Home', path: '/', icon: MdDashboard },
    { label: 'Help', path: '/help', icon: MdHelpOutline },
  ];

  const AUTH_LINKS = user ? [
    { label: 'Flights', path: '/flights', icon: MdFlight },
    { label: 'Bookings', path: '/bookings', icon: MdBookmark },
  ] : [];

  const ADMIN_LINKS = user?.is_staff ? [
    { label: 'Admin', path: '/admin', icon: MdDashboard },
    { label: 'Passengers', path: '/passengers', icon: MdPerson },
    { label: 'Staff', path: '/employees', icon: MdBadge },
    { label: 'Reports', path: '/reports', icon: MdInsights },
  ] : [];

  const ALL_LINKS = [...NAV_LINKS, ...AUTH_LINKS, ...ADMIN_LINKS];

  return (
    <>
      <header
        className="main-header"
        style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: 999,
          backdropFilter: 'blur(16px)',
          background: scrolled ? 'rgba(0, 31, 63, 0.95)' : 'rgba(255, 255, 255, 0.8)',
          borderBottom: '1px solid var(--border)',
          transition: 'var(--ease)',
          color: scrolled ? '#fff' : 'var(--text-primary)'
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 80 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => setMobileOpen(false)}>
            <IoAirplaneSharp size={28} color="var(--red)" />
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              fontStyle: 'italic',
              color: scrolled ? '#fff' : 'var(--primary)',
              margin: 0
            }}>
              Kenya Airways
            </h1>
          </Link>

          {/* Desktop Links */}
          <nav className="hide-mobile" style={{ display: 'flex', gap: user?.is_staff ? '1.2rem' : '2rem' }}>
            {ALL_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                style={({ isActive }) => ({
                  fontWeight: 700,
                  fontSize: user?.is_staff ? '0.82rem' : '0.88rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: isActive ? 'var(--red)' : (scrolled ? '#CBD5E1' : 'var(--text-muted)'),
                  transition: 'var(--ease)'
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/profile" title="View Profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, lineHeight: 1 }}>{user.username}</div>
                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--red)', fontWeight: 800 }}>
                      {user.is_staff ? 'Superuser' : 'Frequent Flyer'}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(168, 2, 2, 0.1)', padding: '0.4rem', borderRadius: '50%', color: 'var(--red)' }}>
                    <MdPerson size={20} />
                  </div>
                </Link>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  title="Sign Out"
                >
                  <MdLogout size={16} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
            )}
          </div>

          {/* Mobile Toggle & Actions */}
          <div className="show-mobile-flex" style={{ display: 'none', alignItems: 'center', gap: '1rem' }}>
            {user && (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="Sign Out"
                style={{
                  background: 'none', border: 'none',
                  color: scrolled ? '#fff' : 'var(--primary)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center'
                }}
              >
                <MdLogout size={24} />
              </button>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background: 'none', border: 'none', color: scrolled ? '#fff' : 'var(--primary)', cursor: 'pointer' }}
            >
              {mobileOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(245, 242, 242, 1)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div className="flex-between" style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IoAirplaneSharp size={28} color="var(--red)" />
                <span style={{ color: 'rgba(4, 6, 70, 1)', fontWeight: 800, fontSize: '1.2rem', fontStyle: 'italic' }}>Kenya Airways</span>
              </div>
              <button onClick={() => setMobileOpen(false)} style={{ background: 'rgba(168, 2, 2, 0.91)', border: 'none', color: '#fff', padding: 8, borderRadius: 12 }}>
                <MdClose size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              {ALL_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  style={({ isActive }) => ({
                    background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                    padding: '1.25rem',
                    borderRadius: 16,
                    color: '#7a7a7aff',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontSize: '1.1rem'
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <link.icon size={24} color={isActive ? 'var(--red)' : '#64748B'} />
                      {link.label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Mobile bottom actions — flexShrink:0 ensures they're never clipped */}
            <div style={{ borderTop: '1px solid rgba(100,116,139,0.2)', paddingTop: '2rem', flexShrink: 0 }}>
              {user ? (
                <>
                  <Link to="/profile" className="btn btn-secondary btn-xl btn-block" onClick={() => setMobileOpen(false)} style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                    <MdPerson size={20} /> My Profile
                  </Link>
                  <button
                    className="btn btn-primary btn-xl btn-block"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    style={{ justifyContent: 'center' }}
                  >
                    <MdLogout size={20} /> Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn btn-primary btn-xl btn-block" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}