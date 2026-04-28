/**
 * Employees.jsx — crew management dashboard.
 * Tabs: Crew Roster | Flight Assignments
 * Admin only. Features: crew enrollment, role assignment,
 * duty tracking, React Icons, Framer Motion.
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';

import {
    MdPeopleAlt, MdAdd, MdAssignmentTurnedIn,
    MdSearch, MdEdit, MdDelete, MdClose,
    MdVerifiedUser, MdFlightTakeoff, MdAssignmentReturn,
    MdPerson, MdCategory
} from 'react-icons/md';

const ROLE_OPTIONS = ['Pilot', 'Co-Pilot', 'Cabin Crew', 'Ground Staff', 'Engineer', 'Customer Service'];

const MODAL_ANIM = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' },
};

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('employees');
    const [search, setSearch] = useState('');
    const [showEmpForm, setShowEmpForm] = useState(false);
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [editingEmp, setEditingEmp] = useState(null);
    const [deletingEmp, setDeletingEmp] = useState(null);
    const [deletingAssign, setDeletingAssign] = useState(null);

    const fetchAll = useCallback(() => {
        setLoading(true);
        Promise.all([
            api.get('/api/employees/').then(r => setEmployees(r.data.results || r.data)),
            api.get('/api/assignments/').then(r => setAssignments(r.data.results || r.data)),
            api.get('/api/flights/').then(r => setFlights(r.data.results || r.data)),
        ])
            .catch(() => toast.error('Failed to load data. Please refresh.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const filteredEmp = employees.filter(e =>
        [e.name, e.role, e.employee_id]
            .some(v => v?.toLowerCase().includes(search.toLowerCase()))
    );

    const handleDeleteEmp = async () => {
        try {
            await api.delete(`/api/employees/${deletingEmp.id}/`);
            toast.success('Employee deleted successfully.');
            setDeletingEmp(null); fetchAll();
        } catch { toast.error('Failed to delete staff member.'); }
    };

    const handleDeleteAssign = async () => {
        try {
            await api.delete(`/api/assignments/${deletingAssign.id}/`);
            toast.success('Assignment removed.');
            setDeletingAssign(null); fetchAll();
        } catch { toast.error('Failed to remove assignment.'); }
    };

    return (
        <div className="page-wrapper">
            <div className="container">

                {/* ── Page Header ── */}
                <div className="page-header">
                    <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <div className="page-title-tag"><MdVerifiedUser size={12} /> Admin Operations</div>
                            <h1>Crew & Duty</h1>
                            <p>Manage airline personnel and flight assignments.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn btn-secondary" onClick={() => setShowAssignForm(true)}>
                                <MdAssignmentTurnedIn size={18} /> Assign Crew
                            </button>
                            <button className="btn btn-primary" onClick={() => { setEditingEmp(null); setShowEmpForm(true); }}>
                                <MdAdd size={18} /> Add Staff
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="tab-bar" style={{ marginTop: '1.25rem', marginBottom: 0 }}>
                        <button className={`tab-btn ${tab === 'employees' ? 'active' : ''}`} onClick={() => setTab('employees')}>
                            <MdPeopleAlt size={15} /> Crew Roster
                        </button>
                        <button className={`tab-btn ${tab === 'assignments' ? 'active' : ''}`} onClick={() => setTab('assignments')}>
                            <MdAssignmentTurnedIn size={15} /> Flight Assignments
                        </button>
                    </div>
                </div>

                {/* ── Search & Table ── */}
                <div className="card-static" style={{ padding: 0, overflow: 'hidden' }}>
                    {tab === 'employees' && (
                        <div style={{ padding: '1.25rem', background: 'var(--navy-elevated)', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ position: 'relative', maxWidth: 380 }}>
                                <MdSearch size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    placeholder="Search crew by name or ID..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    {tab === 'employees' ? (
                                        <>
                                            <th>Staff Member</th>
                                            <th>Payroll ID</th>
                                            <th>Role</th>
                                            <th>Duty Load</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </>
                                    ) : (
                                        <>
                                            <th>Assignee</th>
                                            <th>Flight No.</th>
                                            <th>Route Detail</th>
                                            <th>Duty Date</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-20"><div className="spinner" /></td></tr>
                                ) : (tab === 'employees' ? filteredEmp : assignments).length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-20 text-muted italic">No records found.</td></tr>
                                ) : (tab === 'employees' ? filteredEmp : assignments).map((item, i) => (
                                    <tr key={item.id}>
                                        {tab === 'employees' ? (
                                            <>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--red)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                                                            {item.name[0]}
                                                        </div>
                                                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</div>
                                                    </div>
                                                </td>
                                                <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{item.employee_id}</td>
                                                <td><span className="badge badge-blue">{item.role}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                                                        <MdFlightTakeoff size={14} style={{ color: 'var(--red)' }} />
                                                        {assignments.filter(a => (a.employee === item.id || a.employee_detail?.id === item.id)).length} duties
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                                        <button className="btn btn-secondary btn-xs" onClick={() => { setEditingEmp(item); setShowEmpForm(true); }}><MdEdit size={14} /></button>
                                                        <button className="btn btn-danger btn-xs" onClick={() => setDeletingEmp(item)}><MdDelete size={14} /></button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>
                                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.employee_name || item.employee_detail?.name}</div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.employee_role || item.employee_detail?.role}</div>
                                                </td>
                                                <td><span className="badge badge-red">{item.flight_number || flights.find(f => f.id === (item.flight?.id || item.flight))?.flight_number}</span></td>
                                                <td style={{ fontStyle: 'italic', fontSize: '0.82rem' }}>
                                                    {item.flight_origin || flights.find(f => f.id === (item.flight?.id || item.flight))?.origin} → {item.flight_destination || flights.find(f => f.id === (item.flight?.id || item.flight))?.destination}
                                                </td>
                                                <td style={{ fontSize: '0.82rem' }}>{new Date(item.assigned_at).toLocaleDateString('en-KE')}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button className="btn btn-danger btn-sm" onClick={() => setDeletingAssign(item)} title="Remove assignment">
                                                        <MdAssignmentReturn size={16} />
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Modals ── */}
            <AnimatePresence>
                {showEmpForm && (
                    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowEmpForm(false)}>
                        <motion.div className="modal" {...MODAL_ANIM}>
                            <div className="modal-header">
                                <h3>{editingEmp ? <><MdEdit size={18} /> Modify Staff Profile</> : <><MdPerson size={18} /> Enroll New Staff</>}</h3>
                                <button className="modal-close" onClick={() => setShowEmpForm(false)}><MdClose /></button>
                            </div>
                            <EmployeeForm employee={editingEmp} onClose={() => setShowEmpForm(false)} onSaved={fetchAll} />
                        </motion.div>
                    </div>
                )}

                {showAssignForm && (
                    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAssignForm(false)}>
                        <motion.div className="modal" {...MODAL_ANIM}>
                            <div className="modal-header">
                                <h3><MdAssignmentTurnedIn size={18} /> Assign Crew to Flight</h3>
                                <button className="modal-close" onClick={() => setShowAssignForm(false)}><MdClose /></button>
                            </div>
                            <AssignmentForm employees={employees} flights={flights} onClose={() => setShowAssignForm(false)} onSaved={fetchAll} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────
   Forms (Employee / Assignment)
   ────────────────────────────────────────────────────────── */
function EmployeeForm({ employee, onClose, onSaved }) {
    const [form, setForm] = useState({ name: employee?.name || '', role: employee?.role || 'Cabin Crew', employee_id: employee?.employee_id || '' });
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setSaving(true);
        try {
            if (employee) await api.patch(`/api/employees/${employee.id}/`, form);
            else await api.post('/api/employees/', form);
            toast.success('Crew roster updated!');
            onSaved(); onClose();
        } catch (err) { toast.error('Error: Ensure employee ID is unique.'); }
        finally { setSaving(false); }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Full Legal Name</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Jane Doe" />
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>Payroll ID</label>
                    <input style={{ fontFamily: 'monospace' }} value={form.employee_id} onChange={e => set('employee_id', e.target.value.toUpperCase())} required placeholder="EMP-001" />
                </div>
                <div className="form-group">
                    <label>Operation Role</label>
                    <select value={form.role} onChange={e => set('role', e.target.value)}>
                        {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Dismiss</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : (employee ? 'Update Profile' : 'Enroll Staff')}
                </button>
            </div>
        </form>
    );
}

function AssignmentForm({ employees, flights, onClose, onSaved }) {
    const [form, setForm] = useState({ employee: '', flight: '' });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (!form.employee || !form.flight) return;
        setSaving(true);
        try {
            await api.post('/api/assignments/', form);
            toast.success('Assignment confirmed!');
            onSaved(); onClose();
        } catch { toast.error('Error: Potential duplicate assignment.'); }
        finally { setSaving(false); }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Staff Member</label>
                <select value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })} required>
                    <option value="">— Select Crew Member —</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>)}
                </select>
            </div>
            <div className="form-group">
                <label>Target Flight</label>
                <select value={form.flight} onChange={e => setForm({ ...form, flight: e.target.value })} required>
                    <option value="">— Select Route —</option>
                    {flights.map(f => <option key={f.id} value={f.id}>{f.flight_number} | {f.origin} to {f.destination}</option>)}
                </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Working...' : 'Confirm Assignment'}
                </button>
            </div>
        </form>
    );
}
