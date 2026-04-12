/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Role = 'coordinator' | 'volunteer';
type Status = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'pending' | 'accepted' | 'declined';
type Urgency = 'critical' | 'moderate' | 'low';

interface Need {
  id: string;
  title: string;
  urgency: Urgency;
  status: Status;
  category: string;
  location: string;
  skills: string[];
  desc: string;
  submitted: string;
  matches: number;
}

interface VolunteerMatch {
  id: string;
  name: string;
  initials: string;
  skills: string;
  score: number;
  reasoning: string;
}

interface Task {
  id: string;
  needId: string;
  title: string;
  location: string;
  urgency: Urgency;
  status: Status;
  date: string;
  category: string;
  coords: string;
}

// --- Data ---
const INITIAL_NEEDS: Need[] = [
  {
    id: 'n1', title: 'Medical camp volunteers needed', urgency: 'critical', status: 'open',
    category: 'Health', location: 'Dharavi, Mumbai', skills: ['Medical Aid', 'First Aid'],
    desc: 'Monthly free medical camp requires 5 volunteers with basic first-aid training. 200+ residents expected.',
    submitted: '2h ago', matches: 3
  },
  {
    id: 'n2', title: 'Flood relief food distribution', urgency: 'critical', status: 'assigned',
    category: 'Food', location: 'Kurla East, Mumbai', skills: ['Driving', 'Logistics'],
    desc: 'Flash floods affected 400 families. Need 8 volunteers for food packet distribution across 3 locations.',
    submitted: '5h ago', matches: 2
  },
  {
    id: 'n3', title: 'After-school tutoring program', urgency: 'moderate', status: 'in_progress',
    category: 'Education', location: 'Govandi, Mumbai', skills: ['Teaching', 'Hindi'],
    desc: '40 children aged 8-14 need academic support in Math and Science. 3 days/week commitment.',
    submitted: '1d ago', matches: 4
  },
  {
    id: 'n4', title: 'Elderly care home assistance', urgency: 'low', status: 'resolved',
    category: 'Elderly Care', location: 'Andheri West, Mumbai', skills: ['Caregiving', 'Patience'],
    desc: 'Weekend volunteers needed to assist elderly residents with mobility, meals and companionship.',
    submitted: '2d ago', matches: 5
  },
  {
    id: 'n5', title: 'Slum cleanup drive coordination', urgency: 'moderate', status: 'open',
    category: 'Environment', location: 'Mankhurd, Mumbai', skills: ['Physical Labor', 'Organization'],
    desc: 'Monthly cleanup initiative needs team leaders and ground volunteers. Tools provided.',
    submitted: '3h ago', matches: 0
  }
];

const MATCHES: Record<string, VolunteerMatch[]> = {
  n1: [
    { id: 'v1', name: 'Dr. Priya Mehta', initials: 'PM', skills: 'MBBS, Emergency Care, Hindi', score: 9.4,
      reasoning: 'Medical degree and emergency care background is a direct match for a health camp. Hindi fluency ensures communication with local residents. Has completed 12 tasks previously.' },
    { id: 'v2', name: 'Sanjay Kumar', initials: 'SK', skills: 'Nursing, First Aid, Marathi', score: 8.1,
      reasoning: 'Professional nursing background and first-aid certification strongly qualifies this volunteer. Close proximity (2km) means fast response.' },
    { id: 'v3', name: 'Fatima Sheikh', initials: 'FS', skills: 'Paramedic, CPR certified', score: 7.6,
      reasoning: 'Paramedic certification exceeds minimum requirement. Weekend availability aligns with camp schedule.' }
  ],
  n2: [
    { id: 'v4', name: 'Ramesh Patil', initials: 'RP', skills: 'LMV License, Logistics, Marathi', score: 9.1,
      reasoning: 'Valid LMV license and prior disaster relief experience in 2019 floods makes this an ideal match for food distribution logistics.' },
    { id: 'v5', name: 'Aakash Iyer', initials: 'AI', skills: 'HMV License, Warehouse Mgmt', score: 8.5,
      reasoning: 'Heavy vehicle license and warehouse management background ensures efficient large-scale distribution.' }
  ],
  n3: [
    { id: 'v6', name: 'Neha Joshi', initials: 'NJ', skills: 'B.Ed, Math & Science, Hindi', score: 9.7,
      reasoning: 'Teaching degree with specialization in Math and Science is a perfect fit. Hindi fluency critical for communicating with children. 3 days/week availability confirmed.' },
    { id: 'v7', name: 'Arjun Singh', initials: 'AS', skills: 'MSc Physics, Tutoring exp.', score: 8.9,
      reasoning: 'Advanced science background and prior tutoring experience with underprivileged children in Govandi area — same location as the need.' },
    { id: 'v8', name: 'Pooja Desai', initials: 'PD', skills: 'BA Education, English & Hindi', score: 8.2,
      reasoning: 'Education background with bilingual skills. Regular volunteer with strong completion record.' },
    { id: 'v9', name: 'Vikram Rao', initials: 'VR', skills: 'Engineering grad, Math tutor', score: 7.8,
      reasoning: 'Strong math background and flexible schedule make this a good supplemental match.' }
  ]
};

const INITIAL_TASKS: Task[] = [
  { id: 't1', needId: 'n1', title: 'Medical camp volunteers needed', location: 'Dharavi, Mumbai', urgency: 'critical', status: 'pending', date: 'Tomorrow, 9 AM', category: 'Health', coords: '19.04,72.85' },
  { id: 't2', needId: 'n3', title: 'After-school tutoring program', location: 'Govandi, Mumbai', urgency: 'moderate', status: 'accepted', date: 'Mon–Wed, 4–6 PM', category: 'Education', coords: '19.07,72.89' },
  { id: 't3', needId: 'n5', title: 'Slum cleanup drive coordination', location: 'Mankhurd, Mumbai', urgency: 'moderate', status: 'pending', date: 'Sunday, 7 AM', category: 'Environment', coords: '19.05,72.92' }
];

// --- Components ---

const UrgencyBadge = ({ urgency }: { urgency: Urgency }) => {
  const map = { critical: 'badge-red', moderate: 'badge-amber', low: 'badge-gray' };
  const icons = { critical: '🔴', moderate: '🟡', low: '🟢' };
  return <span className={`badge ${map[urgency]}`}>{icons[urgency]} {urgency}</span>;
};

const StatusBadge = ({ status }: { status: Status }) => {
  const map: Record<string, string> = { open: 'badge-blue', assigned: 'badge-amber', in_progress: 'badge-purple', resolved: 'badge-green', pending: 'badge-amber', accepted: 'badge-green', declined: 'badge-red' };
  const labels: Record<string, string> = { open: 'Open', assigned: 'Assigned', in_progress: 'In Progress', resolved: 'Resolved', pending: 'Pending', accepted: 'Accepted', declined: 'Declined' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{labels[status] || status}</span>;
};

const StatCard = ({ icon, val, label, change, dir, small = false }: { icon: string, val: string, label: string, change?: string, dir?: 'up' | 'down', small?: boolean }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className={`stat-value ${small ? 'text-2xl' : ''}`}>{val}</div>
    <div className="stat-label">{label}</div>
    {change && (
      <div className={`stat-change ${dir === 'up' ? 'stat-up' : 'stat-down'}`}>
        {dir === 'up' ? '↑' : '↓'} {change}
      </div>
    )}
  </div>
);

const MetaItem = ({ icon, text }: { icon: string, text: string | React.ReactNode }) => (
  <span className="need-meta-item flex items-center gap-1 text-xs text-muted">
    <span>{icon}</span> <span>{text}</span>
  </span>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>('coordinator');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [needs, setNeeds] = useState<Need[]>(INITIAL_NEEDS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  const [modal, setModal] = useState<{ title: string, content: React.ReactNode } | null>(null);
  const [needsFilter, setNeedsFilter] = useState<string>('all');

  const showToast = (msg: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage(role === 'coordinator' ? 'dashboard' : 'vol-home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const assignVolunteer = (vname: string, needId: string) => {
    setNeeds(prev => prev.map(n => n.id === needId ? { ...n, status: 'assigned' } : n));
    showToast(`🔔 ${vname} assigned & notified via Firebase FCM!`, 'success');
  };

  const acceptTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'accepted' } : t));
    showToast('✅ Task accepted! Coordinator has been notified via FCM', 'success');
  };

  const simulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModal({
      title: '🤖 Gemini AI Processing',
      content: (
        <div className="text-center py-4">
          <div className="text-5xl mb-4">🧠</div>
          <div className="font-outfit text-base font-bold mb-2">Running AI pipeline...</div>
          <div className="text-[13px] text-muted mb-6">
            Translating → Extracting entities → Scoring urgency → Matching volunteers
          </div>
          <div className="text-left flex flex-col gap-2.5">
            <div className="flex gap-2.5 items-start bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-2.5 text-xs text-[#065f46] animate-in fade-in duration-300">
              <span className="text-base flex-shrink-0">🌐</span>
              <span>Cloud Translation API → Detected English, no translation needed</span>
            </div>
            <div className="flex gap-2.5 items-start bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-2.5 text-xs text-[#065f46] animate-in fade-in duration-300 delay-700">
              <span className="text-base flex-shrink-0">🏷</span>
              <span>Natural Language API → Category: Health, Entities: [volunteers, medical, camp]</span>
            </div>
            <div className="flex gap-2.5 items-start bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-2.5 text-xs text-[#065f46] animate-in fade-in duration-300 delay-1500">
              <span className="text-base flex-shrink-0">⚡</span>
              <span>Gemini 1.5 Pro → Urgency scored: CRITICAL (score: 9.1/10)</span>
            </div>
          </div>
        </div>
      )
    });

    setTimeout(() => {
      setModal({
        title: 'Success',
        content: (
          <div className="text-center py-2 pb-4">
            <div className="text-5xl mb-3">✅</div>
            <div className="font-outfit text-lg font-bold text-g mb-1.5">Need Submitted Successfully!</div>
            <div className="text-[13px] text-muted mb-5">Gemini matched 3 volunteers. Notifications sent.</div>
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 mb-5 text-left">
              <div className="font-bold text-[13px] text-[#065f46] mb-2">🤖 Top Gemini Match</div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-g to-b flex items-center justify-center font-bold text-white text-sm">PM</div>
                <div>
                  <div className="font-semibold text-[13px]">Dr. Priya Mehta</div>
                  <div className="text-[11px] text-muted">Score: 9.4/10 · Medical background · 2km away</div>
                </div>
              </div>
            </div>
            <div className="flex gap-2.5">
              <button className="btn btn-primary flex-1" onClick={() => { setModal(null); setCurrentPage('ai-matches'); }}>View All Matches</button>
              <button className="btn btn-secondary flex-1" onClick={() => { setModal(null); setCurrentPage('needs-list'); }}>View Needs List</button>
            </div>
          </div>
        )
      });
    }, 3000);
  };

  if (!isLoggedIn) {
    return (
      <div id="login-screen" className="min-h-screen bg-linear-to-br from-[#0f172a] via-[#134e4a] to-[#0f172a] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,_rgba(16,185,129,0.15)_1px,_transparent_1px)] bg-[length:32px_32px]"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/97 rounded-[20px] p-12 w-[440px] max-w-[95vw] shadow-[0_24px_80px_rgba(0,0,0,0.4)] relative"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 bg-g rounded-xl flex items-center justify-center text-xl">🤝</div>
            <span className="font-outfit text-[22px] font-bold text-dark">VolunteerBridge</span>
          </div>
          <p className="text-muted text-[13px] mb-8">AI-powered volunteer coordination for social impact</p>

          <div className="mb-4">
            <div className="form-label text-xs font-semibold text-mid mb-1.5 uppercase tracking-wider">I am a</div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div 
                className={`role-card border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 text-center ${role === 'coordinator' ? 'border-g bg-[#f0fdf4]' : 'border-border hover:border-g hover:bg-[#f0fdf4]'}`}
                onClick={() => setRole('coordinator')}
              >
                <div className="text-[28px] mb-2">🏢</div>
                <div className="font-semibold text-[13px] text-dark">NGO Coordinator</div>
                <div className="text-[11px] text-muted mt-0.5">Submit needs & manage volunteers</div>
              </div>
              <div 
                className={`role-card border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 text-center ${role === 'volunteer' ? 'border-g bg-[#f0fdf4]' : 'border-border hover:border-g hover:bg-[#f0fdf4]'}`}
                onClick={() => setRole('volunteer')}
              >
                <div className="text-[28px] mb-2">🙋</div>
                <div className="font-semibold text-[13px] text-dark">Volunteer</div>
                <div className="text-[11px] text-muted mt-0.5">Find tasks that match my skills</div>
              </div>
            </div>
          </div>

          <button className="google-btn w-full flex items-center justify-center gap-2.5 p-3.25 rounded-xl border-2 border-border bg-white cursor-pointer text-sm font-semibold transition-all duration-200 text-dark hover:border-g hover:bg-[#f0fdf4] hover:shadow-md" onClick={handleLogin}>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-[11px] text-muted mt-4">
            Demo prototype for Google Solution Challenge 2026
          </p>
        </motion.div>
      </div>
    );
  }

  const user = role === 'coordinator' ? { name: 'Ananya Sharma', email: 'ananya@ngo.org' } : { name: 'Rahul Verma', email: 'rahul.v@gmail.com' };
  const navItems = role === 'coordinator' ? [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'submit-need', icon: '➕', label: 'Submit Need' },
    { id: 'needs-list', icon: '📋', label: 'All Needs' },
    { id: 'ai-matches', icon: '🤖', label: 'AI Matches' },
    { id: 'impact', icon: '📈', label: 'Impact Dashboard' }
  ] : [
    { id: 'vol-home', icon: '🏠', label: 'My Tasks' },
    { id: 'vol-profile', icon: '👤', label: 'My Profile' },
    { id: 'vol-impact', icon: '🌟', label: 'My Impact' }
  ];

  return (
    <div id="app-shell" className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sidebar w-[var(--sidebar-w)] bg-sidebar flex flex-col fixed top-0 left-0 h-screen z-100">
        <div className="flex items-center gap-2.5 px-4 pt-5 mb-2">
          <div className="w-8 h-8 bg-g rounded-lg flex items-center justify-center text-base">🤝</div>
          <span className="font-outfit text-base font-bold text-white">VolunteerBridge</span>
        </div>
        <div className="mx-4 mb-4 px-2.5 py-1.5 rounded-md bg-white/7 text-[11px] color-white/50 font-medium">
          {role === 'coordinator' ? '🏢 NGO Coordinator' : '🙋 Volunteer'}
        </div>
        <div className="h-px bg-white/8 mx-4 my-2"></div>
        <nav className="flex-1 px-2.5 overflow-y-auto">
          {navItems.map(item => (
            <div 
              key={item.id}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 text-[13px] font-medium mb-0.5 ${currentPage === item.id ? 'bg-g/25 text-[#34d399]' : 'text-white/60 hover:bg-white/8 hover:text-white/90'}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-white/8 flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 rounded-full bg-g flex items-center justify-center text-sm font-bold text-white flex-shrink-0">{user.name[0]}</div>
          <div className="overflow-hidden">
            <div className="text-[13px] font-semibold text-white truncate">{user.name}</div>
            <div className="text-[11px] text-white/40 truncate">{user.email}</div>
          </div>
          <div className="ml-auto cursor-pointer text-white/30 text-base hover:text-r transition-colors" onClick={handleLogout} title="Sign out">⏏</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[var(--sidebar-w)] flex-1 flex flex-col">
        <div className="h-[var(--header-h)] bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-50">
          <div className="font-outfit text-lg font-bold text-dark capitalize">{currentPage.replace('-', ' ')}</div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg border border-border flex items-center justify-center cursor-pointer bg-card text-base relative hover:border-g transition-all" onClick={() => showToast('🔔 You have 3 unread notifications', 'info')}>
              🔔<div className="absolute top-1.5 right-1.5 w-2 h-2 bg-r rounded-full border-2 border-card"></div>
            </div>
            <div className={`badge ${role === 'coordinator' ? 'badge-blue' : 'badge-green'}`}>{role === 'coordinator' ? 'Coordinator' : 'Volunteer'}</div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* --- Coordinator Dashboard --- */}
              {currentPage === 'dashboard' && (
                <>
                  <div className="bg-linear-to-br from-[#0f172a] to-[#134e4a] rounded-xl p-5 px-6 mb-6 flex items-center gap-4 text-white">
                    <div className="text-[32px]">🤖</div>
                    <div className="flex-1">
                      <div className="font-outfit text-base font-bold mb-0.5">Gemini AI Matching Active</div>
                      <div className="text-xs text-white/60">All incoming needs are automatically matched with best-fit volunteers using Gemini 1.5 Pro</div>
                    </div>
                    <div className="badge badge-green text-xs px-3 py-1.5">Live</div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <StatCard icon="📋" val="14" label="Total Needs" change="▲ 3 this week" dir="up" />
                    <StatCard icon="✅" val="9" label="Resolved" change="▲ 2 today" dir="up" />
                    <StatCard icon="🙋" val="38" label="Active Volunteers" change="▲ 5 new" dir="up" />
                    <StatCard icon="⚡" val="1.8h" label="Avg. Response Time" change="▼ 0.3h" dir="up" />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-outfit text-[15px] font-bold">🚨 Critical Needs</span>
                        <button className="btn btn-sm btn-secondary" onClick={() => setCurrentPage('needs-list')}>View all</button>
                      </div>
                      <div className="flex flex-col gap-3">
                        {needs.filter(n => n.urgency === 'critical').map(n => (
                          <div key={n.id} className="need-card bg-card border border-border rounded-xl p-4 px-5 shadow-card cursor-pointer transition-all hover:border-g hover:shadow-lg hover:-translate-y-0.25" onClick={() => setModal({ title: n.title, content: (
                            <div>
                              <div className="flex gap-2 flex-wrap mb-4">
                                <UrgencyBadge urgency={n.urgency} />
                                <StatusBadge status={n.status} />
                                <span className="badge badge-blue">{n.category}</span>
                              </div>
                              <div className="bg-bg p-3 rounded-lg text-[13px] text-mid mb-4">{n.desc}</div>
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <MetaItem icon="📍" text={<strong>{n.location}</strong>} />
                                <MetaItem icon="🕐" text={`Submitted ${n.submitted}`} />
                                <MetaItem icon="🔧" text={n.skills.join(', ')} />
                                {n.matches > 0 && <span className="badge badge-purple">🤖 {n.matches} AI matches ready</span>}
                              </div>
                              {n.matches > 0 && <button className="btn btn-primary w-full" onClick={() => { setModal(null); setCurrentPage('ai-matches'); }}>View AI Match Suggestions →</button>}
                            </div>
                          )})}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-semibold text-sm text-dark mb-1">{n.title}</div>
                                <div className="text-xs text-muted line-clamp-2">{n.desc}</div>
                              </div>
                              <div className="ml-3 flex-shrink-0"><UrgencyBadge urgency={n.urgency} /></div>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap mt-2">
                              <MetaItem icon="📍" text={n.location} />
                              <StatusBadge status={n.status} />
                              {n.matches > 0 && <span className="badge badge-purple">🤖 {n.matches} matches</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="font-outfit text-[15px] font-bold mb-4">📊 Needs by Category</div>
                      <div className="card mb-4">
                        {[
                          { label: 'Health', val: 5, max: 6, color: '#ef4444' },
                          { label: 'Food', val: 4, max: 6, color: '#f59e0b' },
                          { label: 'Education', val: 3, max: 6, color: '#3b82f6' },
                          { label: 'Environment', val: 2, max: 6, color: '#10b981' },
                          { label: 'Elderly', val: 1, max: 6, color: '#8b5cf6' },
                        ].map(item => (
                          <div key={item.label} className="flex items-center gap-2.5 mb-2.5">
                            <div className="text-xs text-muted w-20 text-right flex-shrink-0">{item.label}</div>
                            <div className="flex-1 h-5 bg-bg rounded overflow-hidden">
                              <div className="h-full rounded flex items-center pl-2 text-[11px] font-semibold text-white transition-all duration-1000" style={{ width: `${(item.val / item.max) * 100}%`, backgroundColor: item.color }}>{item.val}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="font-outfit text-[15px] font-bold mb-4">⚡ Quick Actions</div>
                      <div className="flex flex-col gap-2.5">
                        <button className="btn btn-primary w-full" onClick={() => setCurrentPage('submit-need')}>➕ Submit New Community Need</button>
                        <button className="btn btn-secondary w-full" onClick={() => setCurrentPage('ai-matches')}>🤖 Review AI Match Suggestions</button>
                        <button className="btn btn-secondary w-full" onClick={() => setCurrentPage('impact')}>📈 View Impact Dashboard</button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* --- Submit Need --- */}
              {currentPage === 'submit-need' && (
                <div className="max-w-[640px]">
                  <div className="bg-linear-to-br from-[#0f172a] to-[#134e4a] rounded-xl p-5 px-6 mb-6 flex items-center gap-4 text-white">
                    <div className="text-[32px]">✨</div>
                    <div>
                      <div className="font-outfit text-base font-bold mb-0.5">Auto-powered by Gemini AI</div>
                      <div className="text-xs text-white/60">After submission, Gemini automatically scores urgency, tags categories, and finds best-fit volunteers</div>
                    </div>
                  </div>
                  <form className="card" onSubmit={simulateSubmit}>
                    <div className="mb-4">
                      <label className="form-label text-xs font-semibold text-mid mb-1.5 block uppercase tracking-wider">Need Title</label>
                      <input className="form-control" placeholder="e.g. Medical camp volunteers needed in Dharavi" required />
                    </div>
                    <div className="mb-4">
                      <label className="form-label text-xs font-semibold text-mid mb-1.5 block uppercase tracking-wider">Description</label>
                      <textarea className="form-control min-h-[100px] resize-y" placeholder="Describe the community need in detail. Gemini AI will extract key information automatically..." required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label className="form-label text-xs font-semibold text-mid mb-1.5 block uppercase tracking-wider">Location</label>
                        <input className="form-control" placeholder="Area, City" required />
                      </div>
                      <div className="mb-4">
                        <label className="form-label text-xs font-semibold text-mid mb-1.5 block uppercase tracking-wider">Language of submission</label>
                        <select className="form-control">
                          <option>English</option>
                          <option>Hindi (हिंदी)</option>
                          <option>Marathi (मराठी)</option>
                          <option>Tamil (தமிழ்)</option>
                          <option>Telugu (తెలుగు)</option>
                          <option>Kannada (ಕನ್ನಡ)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label className="form-label text-xs font-semibold text-mid mb-1.5 block uppercase tracking-wider">Skills Required</label>
                        <select className="form-control">
                          <option>Medical Aid</option>
                          <option>Teaching / Tutoring</option>
                          <option>Driving / Logistics</option>
                          <option>Caregiving</option>
                          <option>Physical Labor</option>
                          <option>Technical Skills</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label className="form-label text-xs font-semibold text-mid mb-1.5 block uppercase tracking-wider">Volunteers Needed</label>
                        <input className="form-control" type="number" placeholder="e.g. 5" min="1" required />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="form-label text-xs font-semibold text-mid mb-1.5 block uppercase tracking-wider">Date / Time</label>
                      <input className="form-control" type="datetime-local" required />
                    </div>
                    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-3 mb-4 text-xs text-[#065f46]">
                      <strong>🤖 After submission, Gemini AI will:</strong><br />
                      1. Translate to English if submitted in regional language (Cloud Translation API)<br />
                      2. Extract entities and auto-tag category (Natural Language API)<br />
                      3. Score urgency — critical / moderate / low<br />
                      4. Find and rank top 3 volunteer matches with reasoning
                    </div>
                    <div className="flex gap-3">
                      <button className="btn btn-primary flex-1" type="submit">🚀 Submit & Run AI Matching</button>
                      <button className="btn btn-secondary" type="button" onClick={() => setCurrentPage('dashboard')}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {/* --- Needs List --- */}
              {currentPage === 'needs-list' && (
                <>
                  <div className="flex items-center gap-3 mb-5 flex-wrap">
                    {['all', 'open', 'assigned', 'in_progress', 'resolved'].map(s => (
                      <button 
                        key={s}
                        className={`btn btn-sm ${needsFilter === s ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setNeedsFilter(s)}
                      >
                        {s === 'all' ? 'All' : s.replace('_', ' ')} ({s === 'all' ? needs.length : needs.filter(n => n.status === s).length})
                      </button>
                    ))}
                    <button className="btn btn-primary btn-sm ml-auto" onClick={() => setCurrentPage('submit-need')}>➕ New Need</button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {needs.filter(n => needsFilter === 'all' || n.status === needsFilter).map(n => (
                      <div key={n.id} className="need-card bg-card border border-border rounded-xl p-4 px-5 shadow-card cursor-pointer transition-all hover:border-g hover:shadow-lg hover:-translate-y-0.25" onClick={() => setModal({ title: n.title, content: (
                        <div>
                          <div className="flex gap-2 flex-wrap mb-4">
                            <UrgencyBadge urgency={n.urgency} />
                            <StatusBadge status={n.status} />
                            <span className="badge badge-blue">{n.category}</span>
                          </div>
                          <div className="bg-bg p-3 rounded-lg text-[13px] text-mid mb-4">{n.desc}</div>
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <MetaItem icon="📍" text={<strong>{n.location}</strong>} />
                            <MetaItem icon="🕐" text={`Submitted ${n.submitted}`} />
                            <MetaItem icon="🔧" text={n.skills.join(', ')} />
                            {n.matches > 0 && <span className="badge badge-purple">🤖 {n.matches} AI matches ready</span>}
                          </div>
                          {n.matches > 0 && <button className="btn btn-primary w-full" onClick={() => { setModal(null); setCurrentPage('ai-matches'); }}>View AI Match Suggestions →</button>}
                        </div>
                      )})}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-sm text-dark mb-1">{n.title}</div>
                            <div className="text-xs text-muted line-clamp-2">{n.desc}</div>
                          </div>
                          <div className="ml-4 flex-shrink-0"><UrgencyBadge urgency={n.urgency} /></div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap mt-2">
                          <MetaItem icon="📍" text={n.location} />
                          <MetaItem icon="🏷" text={n.category} />
                          <MetaItem icon="🔧" text={n.skills.join(', ')} />
                          <MetaItem icon="🕐" text={n.submitted} />
                          <StatusBadge status={n.status} />
                          {n.matches > 0 && <span className="badge badge-purple">🤖 {n.matches} AI matches</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* --- AI Matches --- */}
              {currentPage === 'ai-matches' && (
                <>
                  <div className="bg-linear-to-br from-[#0f172a] to-[#134e4a] rounded-xl p-5 px-6 mb-6 flex items-center gap-4 text-white">
                    <div className="text-[32px]">🧠</div>
                    <div>
                      <div className="font-outfit text-base font-bold mb-0.5">Powered by Gemini 1.5 Pro</div>
                      <div className="text-xs text-white/60">Each match is generated by reasoning across volunteer skills, location, availability, and past performance. Click Assign to send FCM notification.</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5">
                    {needs.filter(n => n.matches > 0).map(n => (
                      <div key={n.id} className="card">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="font-bold text-[15px]">{n.title}</div>
                            <div className="text-xs text-muted">{n.location} · {n.category}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <UrgencyBadge urgency={n.urgency} />
                            <StatusBadge status={n.status} />
                          </div>
                        </div>
                        <div className="mb-4 text-xs text-muted bg-bg p-2.5 px-3.5 rounded-lg">{n.desc}</div>
                        <div className="text-xs font-bold text-mid uppercase tracking-wider mb-3">🤖 Gemini Suggested Matches</div>
                        <div className="flex flex-col gap-3">
                          {(MATCHES[n.id] || []).map((m, idx) => (
                            <div key={m.id} className="bg-card border border-border rounded-xl p-4 px-5 shadow-card">
                              <div className="flex items-center justify-between mb-2.5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-9.5 h-9.5 rounded-full bg-linear-to-br from-g to-b flex items-center justify-center text-sm font-bold text-white flex-shrink-0">{m.initials}</div>
                                  <div>
                                    <div className="font-semibold text-sm">{idx === 0 ? '🥇 ' : idx === 1 ? '🥈 ' : '🥉 '}{m.name}</div>
                                    <div className="text-[11px] text-muted">{m.skills}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1 font-outfit text-[22px] font-bold text-g">{m.score}<span className="text-sm text-muted font-normal">/10</span></div>
                                  <div className="text-[11px] text-muted font-dm-sans">AI Match Score</div>
                                </div>
                              </div>
                              <div className="bg-linear-to-br from-[#f0fdf4] to-[#ecfdf5] border border-[#bbf7d0] rounded-lg p-2.5 px-3 text-xs text-[#065f46] mb-3 italic">
                                <span className="not-italic font-semibold">🤖 AI: </span>{m.reasoning}
                              </div>
                              <div className="flex gap-2">
                                <button className="btn btn-primary btn-sm flex-1" onClick={() => assignVolunteer(m.name, n.id)}>Assign & Notify via FCM</button>
                                <button className="btn btn-secondary btn-sm" onClick={() => showToast('Profile view coming soon', 'info')}>View Profile</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* --- Impact Dashboard --- */}
              {currentPage === 'impact' && (
                <>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <StatCard icon="🏘" val="23" label="Communities Served" change="▲ 4 this month" dir="up" />
                    <StatCard icon="✅" val="127" label="Needs Resolved" change="▲ 18 this month" dir="up" />
                    <StatCard icon="🙋" val="243" label="Volunteers Active" change="▲ 31 new" dir="up" />
                    <StatCard icon="⭐" val="94%" label="Match Accuracy" change="▲ 3% vs last month" dir="up" />
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="card">
                      <div className="font-bold text-[15px] mb-4">📊 Needs by Category</div>
                      {[
                        { label: 'Health', val: 42, max: 50, color: '#ef4444' },
                        { label: 'Food', val: 38, max: 50, color: '#f59e0b' },
                        { label: 'Education', val: 27, max: 50, color: '#3b82f6' },
                        { label: 'Elderly', val: 12, max: 50, color: '#8b5cf6' },
                        { label: 'Environment', val: 8, max: 50, color: '#10b981' },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-2.5 mb-2.5">
                          <div className="text-xs text-muted w-20 text-right flex-shrink-0">{item.label}</div>
                          <div className="flex-1 h-5 bg-bg rounded overflow-hidden">
                            <div className="h-full rounded flex items-center pl-2 text-[11px] font-semibold text-white transition-all duration-1000" style={{ width: `${(item.val / item.max) * 100}%`, backgroundColor: item.color }}>{item.val}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="card">
                      <div className="font-bold text-[15px] mb-4">📈 Weekly Resolution Rate</div>
                      {[
                        { label: 'Week 1', val: 18, max: 30, color: '#059669' },
                        { label: 'Week 2', val: 22, max: 30, color: '#059669' },
                        { label: 'Week 3', val: 19, max: 30, color: '#059669' },
                        { label: 'Week 4', val: 28, max: 30, color: '#059669' },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-2.5 mb-2.5">
                          <div className="text-xs text-muted w-20 text-right flex-shrink-0">{item.label}</div>
                          <div className="flex-1 h-5 bg-bg rounded overflow-hidden">
                            <div className="h-full rounded flex items-center pl-2 text-[11px] font-semibold text-white transition-all duration-1000" style={{ width: `${(item.val / item.max) * 100}%`, backgroundColor: item.color }}>{item.val}</div>
                          </div>
                        </div>
                      ))}
                      <div className="mt-3 text-xs text-muted">Total resolved this month: <strong className="text-g">87 needs</strong></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="card">
                      <div className="font-bold text-[15px] mb-4">⚡ Response Time Distribution</div>
                      {[
                        { label: '< 30 min', val: 45, max: 60, color: '#10b981' },
                        { label: '30–60 min', val: 38, max: 60, color: '#3b82f6' },
                        { label: '1–3 hours', val: 22, max: 60, color: '#f59e0b' },
                        { label: '3–6 hours', val: 9, max: 60, color: '#ef4444' },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-2.5 mb-2.5">
                          <div className="text-xs text-muted w-20 text-right flex-shrink-0">{item.label}</div>
                          <div className="flex-1 h-5 bg-bg rounded overflow-hidden">
                            <div className="h-full rounded flex items-center pl-2 text-[11px] font-semibold text-white transition-all duration-1000" style={{ width: `${(item.val / item.max) * 100}%`, backgroundColor: item.color }}>{item.val}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="card">
                      <div className="font-bold text-[15px] mb-4">🌍 Active Locations</div>
                      <div className="flex flex-col gap-2">
                        {[
                          { loc: 'Dharavi, Mumbai', count: 34, pct: 84 },
                          { loc: 'Govandi, Mumbai', count: 28, pct: 72 },
                          { loc: 'Kurla East', count: 22, pct: 56 },
                          { loc: 'Mankhurd', count: 18, pct: 46 },
                          { loc: 'Andheri West', count: 12, pct: 32 },
                        ].map(l => (
                          <div key={l.loc}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-mid">📍 {l.loc}</span>
                              <span className="font-semibold">{l.count} needs</span>
                            </div>
                            <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                              <div className="h-full bg-g rounded-full" style={{ width: `${l.pct}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="text-xs text-muted mb-2 font-semibold uppercase tracking-wider">SDG ALIGNMENT</div>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="badge badge-blue">SDG 1 No Poverty</span>
                          <span className="badge badge-green">SDG 3 Good Health</span>
                          <span className="badge badge-purple">SDG 4 Education</span>
                          <span className="badge badge-amber">SDG 10 Equality</span>
                          <span className="badge badge-gray">SDG 17 Partnerships</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* --- Volunteer Home --- */}
              {currentPage === 'vol-home' && (
                <>
                  <div className="bg-linear-to-br from-[#0f172a] to-[#134e4a] rounded-xl p-5 px-6 mb-6 flex items-center gap-4 text-white">
                    <div className="text-[32px]">🎯</div>
                    <div>
                      <div className="font-outfit text-base font-bold mb-0.5">Tasks matched to your skills by Gemini AI</div>
                      <div className="text-xs text-white/60">Based on: Medical Aid, Teaching, Driving · Mumbai · Weekends & Evenings</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <div className="font-outfit text-[15px] font-bold mb-4">⏳ Pending Acceptance</div>
                      <div className="flex flex-col gap-3">
                        {tasks.filter(t => t.status === 'pending').map(t => (
                          <div key={t.id} className="bg-card border border-border rounded-xl p-4 px-5 shadow-card cursor-pointer transition-all hover:border-g hover:shadow-lg hover:-translate-y-0.25 border-l-4 border-l-a" onClick={() => setModal({ title: t.title, content: (
                            <div>
                              <div className="flex gap-2 mb-4"><UrgencyBadge urgency={t.urgency} /><span className="badge badge-blue">{t.category}</span></div>
                              <div className="map-placeholder h-[200px] bg-linear-to-br from-[#e0f2fe] to-[#bae6fd] rounded-lg flex items-center justify-center border border-[#7dd3fc] text-[#0369a1] text-[13px] gap-2 mb-4 relative overflow-hidden">
                                <div className="map-grid"></div>
                                <div className="map-pin">📍</div>
                                <div className="relative font-semibold">{t.location}</div>
                              </div>
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <MetaItem icon="📍" text={<strong>{t.location}</strong>} />
                                <MetaItem icon="🕐" text={t.date} />
                              </div>
                              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-3 mb-4 text-xs text-[#065f46]">
                                <strong>🤖 Why you were matched:</strong><br />
                                Your Medical Aid skills and proximity to {t.location} made you the top Gemini AI match for this task. Your past completion rate of 100% was also a factor.
                              </div>
                              <div className="flex gap-2.5">
                                <button className="btn btn-primary flex-1" onClick={() => { acceptTask(t.id); setModal(null); }}>✅ Accept Task</button>
                                <button className="btn btn-danger flex-1" onClick={() => { showToast('Task declined. Coordinator will be notified.', 'info'); setModal(null); }}>✕ Decline</button>
                              </div>
                            </div>
                          )})}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-semibold text-sm text-dark mb-0.5">{t.title}</div>
                                <div className="text-xs text-muted flex items-center gap-3">
                                  <MetaItem icon="📍" text={t.location} />
                                  <MetaItem icon="🕐" text={t.date} />
                                </div>
                              </div>
                              <UrgencyBadge urgency={t.urgency} />
                            </div>
                            <div className="flex gap-2 mt-3">
                              <button className="btn btn-primary btn-sm flex-1" onClick={(e) => { e.stopPropagation(); acceptTask(t.id); }}>✅ Accept</button>
                              <button className="btn btn-secondary btn-sm flex-1" onClick={(e) => { e.stopPropagation(); showToast('Task declined. Coordinator will be notified.', 'info'); }}>✕ Decline</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="font-outfit text-[15px] font-bold mb-4">✅ Accepted Tasks</div>
                      <div className="flex flex-col gap-3">
                        {tasks.filter(t => t.status === 'accepted').map(t => (
                          <div key={t.id} className="bg-card border border-border rounded-xl p-4 px-5 shadow-card cursor-pointer transition-all hover:border-g hover:shadow-lg hover:-translate-y-0.25 border-l-4 border-l-g" onClick={() => setModal({ title: t.title, content: (
                            <div>
                              <div className="flex gap-2 mb-4"><UrgencyBadge urgency={t.urgency} /><span className="badge badge-blue">{t.category}</span></div>
                              <div className="map-placeholder h-[200px] bg-linear-to-br from-[#e0f2fe] to-[#bae6fd] rounded-lg flex items-center justify-center border border-[#7dd3fc] text-[#0369a1] text-[13px] gap-2 mb-4 relative overflow-hidden">
                                <div className="map-grid"></div>
                                <div className="map-pin">📍</div>
                                <div className="relative font-semibold">{t.location}</div>
                              </div>
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <MetaItem icon="📍" text={<strong>{t.location}</strong>} />
                                <MetaItem icon="🕐" text={t.date} />
                              </div>
                              <div className="badge badge-green text-[13px] px-4 py-2.5 w-full justify-center">✅ Task Accepted — In Progress</div>
                            </div>
                          )})}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-semibold text-sm text-dark mb-0.5">{t.title}</div>
                                <div className="text-xs text-muted flex items-center gap-3">
                                  <MetaItem icon="📍" text={t.location} />
                                  <MetaItem icon="🕐" text={t.date} />
                                </div>
                              </div>
                              <span className="badge badge-green">Active</span>
                            </div>
                            <div className="badge badge-green text-[11px]">✅ Accepted · In Progress</div>
                          </div>
                        ))}
                      </div>
                      <div className="font-outfit text-[15px] font-bold mt-5 mb-4">📊 Your Stats</div>
                      <div className="grid grid-cols-2 gap-3">
                        <StatCard icon="✅" val="7" label="Completed" change="All time" small />
                        <StatCard icon="⭐" val="4.9" label="Rating" change="From coordinators" small />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* --- Volunteer Profile --- */}
              {currentPage === 'vol-profile' && (
                <div className="max-w-[580px]">
                  <div className="card mb-5">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-16 h-16 rounded-full bg-linear-to-br from-g to-b flex items-center justify-center text-2xl font-bold text-white">R</div>
                      <div>
                        <div className="font-outfit text-xl font-bold">Rahul Verma</div>
                        <div className="text-[13px] text-muted">rahul.v@gmail.com · Mumbai</div>
                        <div className="mt-1.5 flex gap-1.5">
                          <span className="badge badge-green">Active Volunteer</span>
                          <span className="badge badge-purple">7 tasks completed</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-xs font-semibold text-mid mb-1.5 block uppercase tracking-wider">Skills</label>
                      <div className="flex flex-wrap gap-1.5 p-2.5 px-3.5 border-1.5 border-border rounded-lg bg-bg">
                        {['Medical Aid', 'Teaching', 'Driving', 'Hindi', 'English', 'First Aid'].map(s => (
                          <span key={s} className="badge badge-green cursor-pointer">{s} ✕</span>
                        ))}
                        <span className="badge badge-gray cursor-pointer">+ Add skill</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-xs font-semibold text-mid mb-1.5 block uppercase tracking-wider">Languages I speak</label>
                      <div className="flex flex-wrap gap-1.5 p-2.5 px-3.5 border-1.5 border-border rounded-lg bg-bg">
                        {['English', 'Hindi (हिंदी)', 'Marathi (मराठी)'].map(l => (
                          <span key={l} className="badge badge-blue">{l} ✕</span>
                        ))}
                        <span className="badge badge-gray cursor-pointer">+ Add language</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label className="form-label text-xs font-semibold text-mid mb-1.5 block uppercase tracking-wider">Availability</label>
                        <select className="form-control">
                          <option>Weekends only</option>
                          <option>Weekdays only</option>
                          <option selected>Weekends + Evenings</option>
                          <option>Any time</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label className="form-label text-xs font-semibold text-mid mb-1.5 block uppercase tracking-wider">Location</label>
                        <input className="form-control" defaultValue="Andheri East, Mumbai" />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-xs font-semibold text-mid mb-1.5 block uppercase tracking-wider">Notification Preferences</label>
                      <div className="flex flex-col gap-2 p-3 border-1.5 border-border rounded-lg bg-bg">
                        {['Push notifications (FCM)', 'Email for critical urgency needs', 'Weekly digest of open tasks'].map(p => (
                          <label key={p} className="flex items-center gap-2 text-[13px] cursor-pointer">
                            <input type="checkbox" defaultChecked className="accent-g w-3.75 h-3.75" /> {p}
                          </label>
                        ))}
                      </div>
                    </div>

                    <button className="btn btn-primary w-full" onClick={() => showToast('✅ Profile updated successfully!', 'success')}>Save Changes</button>
                  </div>
                </div>
              )}

              {/* --- Volunteer Impact --- */}
              {currentPage === 'vol-impact' && (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <StatCard icon="✅" val="7" label="Tasks Completed" change="+2 this month" dir="up" small />
                    <StatCard icon="⏱" val="42h" label="Hours Contributed" change="Across all tasks" small />
                    <StatCard icon="❤️" val="340+" label="People Impacted" change="Estimated reach" small />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="card">
                      <div className="font-bold text-[15px] mb-4">📋 Task History</div>
                      <div className="flex flex-col">
                        {[
                          { title: 'Medical camp volunteer', date: 'Mar 15', cat: 'Health', status: 'completed' },
                          { title: 'After-school tutoring', date: 'Mar 8', cat: 'Education', status: 'completed' },
                          { title: 'Food relief distribution', date: 'Feb 28', cat: 'Food', status: 'completed' },
                          { title: 'Elderly care assist', date: 'Feb 20', cat: 'Elderly Care', status: 'completed' },
                        ].map((t, idx) => (
                          <div key={idx} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                            <div className="w-9 h-9 bg-g3 rounded-lg flex items-center justify-center text-base flex-shrink-0">✅</div>
                            <div className="flex-1">
                              <div className="font-semibold text-[13px]">{t.title}</div>
                              <div className="text-[11px] text-muted">{t.date} · {t.cat}</div>
                            </div>
                            <span className="badge badge-green">{t.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="card">
                      <div className="font-bold text-[15px] mb-4">🏅 Achievements</div>
                      <div className="flex flex-col gap-3">
                        {[
                          { icon: '🌟', title: 'First Responder', desc: 'Completed first task within 30 min of assignment' },
                          { icon: '🔥', title: '5-Task Streak', desc: 'Completed 5 tasks in a row without declining' },
                          { icon: '❤️', title: 'Community Hero', desc: 'Helped 100+ people through volunteer work' },
                          { icon: '🌍', title: 'Multilingual Bridge', desc: 'Served communities in 3+ languages' },
                        ].map((a, idx) => (
                          <div key={idx} className="flex gap-3 items-center">
                            <div className="text-[28px]">{a.icon}</div>
                            <div>
                              <div className="font-semibold text-[13px]">{a.title}</div>
                              <div className="text-[11px] text-muted">{a.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Toast */}
      <div className={`toast ${toast ? 'show' : ''}`}>
        <span className="text-lg">{toast?.type === 'success' ? '✅' : toast?.type === 'info' ? 'ℹ️' : toast?.type === 'warning' ? '⚠️' : '❌'}</span>
        <span>{toast?.msg}</span>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal">
            <div className="flex items-center justify-between mb-5">
              <div className="font-outfit text-lg font-bold">{modal.title}</div>
              <div className="cursor-pointer text-muted text-xl w-7 h-7 flex items-center justify-center rounded-md hover:bg-bg hover:text-dark transition-all" onClick={() => setModal(null)}>✕</div>
            </div>
            <div>{modal.content}</div>
          </div>
        </div>
      )}
    </div>
  );
}
