/**
 * Help.jsx — Fully Responsive Help Center
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
    MdQuiz,
    MdMenuBook,
    MdPermPhoneMsg,
    MdAdd,
    MdCheckCircle,
    MdSearch,
    MdSupportAgent,
    MdHelpOutline,
    MdPhoneIphone,
    MdEmail,
    MdCloudDownload
} from 'react-icons/md';

const FAQ_ITEMS = [
    {
        q: 'How do I book a flight?',
        a: 'Log in or create an account, go to Flights to browse available routes and check seat availability, then click Bookings → New Booking. Select your flight, passenger profile, travel class, and seat number to confirm.',
    },
    {
        q: 'What travel classes are available?',
        a: 'We offer three classes: Class A (Executive), Class B (Business), and Class C (Economy). Each has its own seat capacity as configured per flight.',
    },
    {
        q: 'What happens when a class is full?',
        a: 'If your selected class is fully booked, the system will automatically suggest the next available flight on the same route with open seats.',
    },
    {
        q: 'How do I download my ticket?',
        a: 'In the Bookings page, find your reservation and click the Ticket button. A PDF with your booking details and QR code will be downloaded immediately.',
    },
    {
        q: 'Can I change or cancel my booking?',
        a: 'Yes. Go to Bookings, find your reservation, and click Edit to change the class or seat, or Cancel Booking to remove it.',
    },
    {
        q: 'How do I add a passenger profile?',
        a: 'Navigate to Passengers and click Add Passenger. Provide the full name, passport number, phone number, and email address.',
    },
];

const GUIDE_STEPS = [
    {
        Icon: MdSupportAgent,
        color: 'var(--red)',
        title: '1. Registration',
        desc: 'Create your secure account to start managing your travels.',
    },
    {
        Icon: MdSearch,
        color: 'var(--blue)',
        title: '2. Search',
        desc: 'Explore global routes and check real-time seat availability.',
    },
    {
        Icon: MdAdd,
        color: 'var(--success)',
        title: '3. Profiles',
        desc: 'Add travelers to your registry for faster future bookings.',
    },
    {
        Icon: MdCheckCircle,
        color: 'var(--red)',
        title: '4. Booking',
        desc: 'Select your flight, class, and seat to confirm your reservation.',
    },
    {
        Icon: MdCloudDownload,
        color: 'var(--blue)',
        title: '5. Tickets',
        desc: 'Download PDF tickets anytime from your dashboard.',
    },
];

function FAQItem({ item, i }) {
    const [open, setOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`help-faq-item ${open ? 'active-faq' : ''}`}
        >
            <button
                className="help-faq-trigger"
                onClick={() => setOpen(!open)}
            >
                <span>{item.q}</span>

                <MdAdd
                    size={22}
                    style={{
                        transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
                        transition: '0.3s ease',
                        flexShrink: 0,
                    }}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        <div className="help-faq-content">
                            {item.a}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function Help() {
    const [activeTab, setActiveTab] = useState('faq');
    const [faqSearch, setFaqSearch] = useState('');

    const filteredFaqs = FAQ_ITEMS.filter(item =>
        item.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
        item.a.toLowerCase().includes(faqSearch.toLowerCase())
    );

    return (
        <div className="page-wrapper">
            <div className="container help-container">

                {/* HEADER */}
                <div className="page-header">
                    <div className="page-title-tag">
                        <MdSupportAgent size={12} />
                        Support
                    </div>

                    <h1>Help Center</h1>

                    <p>
                        Guides, FAQs, and direct support lines for
                        world-class assistance.
                    </p>
                </div>

                {/* TABS */}
                <div className="tab-bar help-tabs">
                    {[
                        { k: 'faq', l: 'Frequently Asked', Icon: MdQuiz },
                        { k: 'guide', l: 'Getting Started', Icon: MdMenuBook },
                        { k: 'contact', l: 'Contact Us', Icon: MdPermPhoneMsg },
                    ].map(tab => (
                        <button
                            key={tab.k}
                            onClick={() => setActiveTab(tab.k)}
                            className={`tab-btn ${activeTab === tab.k ? 'active' : ''}`}
                        >
                            <tab.Icon size={18} />
                            <span>{tab.l}</span>
                        </button>
                    ))}
                </div>

                {/* CONTENT */}
                <AnimatePresence mode="wait">

                    {/* FAQ */}
                    {activeTab === 'faq' && (
                        <motion.div
                            key="faq"
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -15 }}
                            className="help-content"
                        >
                            <div className="help-search">
                                <MdSearch size={20} className="help-search-icon" />

                                <input
                                    placeholder="Search help topics..."
                                    value={faqSearch}
                                    onChange={e => setFaqSearch(e.target.value)}
                                />
                            </div>

                            <div className="help-faq-list">
                                {filteredFaqs.map((faq, i) => (
                                    <FAQItem key={i} item={faq} i={i} />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* GUIDE */}
                    {activeTab === 'guide' && (
                        <motion.div
                            key="guide"
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -15 }}
                        >
                            <div className="help-guide-grid">
                                {GUIDE_STEPS.map((step, i) => (
                                    <div
                                        key={i}
                                        className="card help-guide-card"
                                    >
                                        <div
                                            className="help-guide-icon"
                                            style={{
                                                color: step.color,
                                            }}
                                        >
                                            <step.Icon size={28} />
                                        </div>

                                        <h4>{step.title}</h4>

                                        <p>{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* CONTACT */}
                    {activeTab === 'contact' && (
                        <motion.div
                            key="contact"
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -15 }}
                        >
                            <div className="help-contact-grid">

                                {[
                                    {
                                        i: MdPhoneIphone,
                                        t: 'Emergency Support',
                                        v: '+254 020 327 4747',
                                        d: 'Available 24/7 Global Response',
                                    },
                                    {
                                        i: MdEmail,
                                        t: 'Customer Experience',
                                        v: 'care@kenyaairways.com',
                                        d: 'Support within 2 business hours',
                                    },
                                    {
                                        i: MdHelpOutline,
                                        t: 'Digital Concierge',
                                        v: '@KQ_Support',
                                        d: 'Instant messaging & social',
                                    },
                                ].map((c, i) => (
                                    <div
                                        key={i}
                                        className="card help-contact-card"
                                    >
                                        <div className="help-contact-icon">
                                            <c.i size={30} />
                                        </div>

                                        <h3>{c.t}</h3>

                                        <div className="help-contact-value">
                                            {c.v}
                                        </div>

                                        <p>{c.d}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}