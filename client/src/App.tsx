import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  Clock3,
  DoorOpen,
  FileText,
  Fingerprint,
  History,
  IdCard,
  LayoutDashboard,
  LogIn,
  LogOut,
  Mail,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useVisitorData } from "@/hooks/useVisitorData";
import {
  ADMIN_CREDENTIALS,
  formatDateTime,
  formatTime,
  getRecordUser,
  isToday,
  type CheckInRecord,
  type CheckInSuccess,
  type IdentificationType,
  type User,
} from "@/types";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "checked", label: "Currently checked in", icon: DoorOpen },
  { id: "history", label: "Check-in history", icon: History },
  { id: "users", label: "Registered users", icon: Users },
] as const;
type AdminView = (typeof navItems)[number]["id"];
type PublicStage = "home" | "lookup" | "welcome" | "register" | "success" | "admin";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="brand-mark"><span className="brand-mark-inner"><Building2 size={19} strokeWidth={2.5} /></span></div>
      {!compact && <div><p className="brand-name">Visitor<span>Flow</span></p><p className="brand-caption">ACCESS MANAGEMENT</p></div>}
    </div>
  );
}

function StatusBadge({ status }: { status: "CHECKED_IN" | "CHECKED_OUT" }) {
  const checkedIn = status === "CHECKED_IN";
  return <span className={cn("status-badge", checkedIn ? "status-in" : "status-out")}><span className="status-dot" />{checkedIn ? "Checked in" : "Checked out"}</span>;
}

function TopBar({ onAdmin, onHome }: { onAdmin: () => void; onHome: () => void }) {
  return <header className="public-topbar">
    <button className="logo-button" onClick={onHome} aria-label="Return to home"><Logo /></button>
    <div className="topbar-right">
      <div className="time-chip"><Clock3 size={15} /><span>{new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date())}</span><i /></div>
      <button className="admin-link" onClick={onAdmin}><ShieldCheck size={16} />Admin login</button>
    </div>
  </header>;
}

function PublicShell({ children, onAdmin, onHome }: { children: ReactNode; onAdmin: () => void; onHome: () => void }) {
  return <div className="public-shell"><TopBar onAdmin={onAdmin} onHome={onHome} />{children}<footer className="public-footer"><span>Northstar Offices · 14th floor reception</span><span className="footer-secure"><ShieldCheck size={13} /> Your details are stored securely</span></footer></div>;
}

function HomePage({ onSelect, onAdmin }: { onSelect: (type: IdentificationType) => void; onAdmin: () => void }) {
  return <PublicShell onAdmin={onAdmin} onHome={() => undefined}>
    <main className="home-main">
      <div className="home-ambient ambient-one" /><div className="home-ambient ambient-two" />
      <div className="eyebrow"><span className="eyebrow-line" />WELCOME TO NORTHSTAR<span className="eyebrow-line" /></div>
      <div className="home-heading"><h1>Welcome.<br /><em>Let’s get you in.</em></h1><p>Choose your identification method to begin a quick and secure check-in.</p></div>
      <div className="identity-grid">
        <button className="identity-card identity-id" onClick={() => onSelect("ID")}><div className="identity-icon"><IdCard size={42} strokeWidth={1.6} /></div><div className="identity-card-copy"><span className="identity-label">01 / PRIMARY</span><strong>Check in with <span>ID</span></strong><small>Use your South African ID number</small></div><span className="card-arrow"><ArrowRight size={20} /></span></button>
        <button className="identity-card identity-passport" onClick={() => onSelect("PASSPORT")}><div className="identity-icon"><Fingerprint size={42} strokeWidth={1.6} /></div><div className="identity-card-copy"><span className="identity-label">02 / INTERNATIONAL</span><strong>Check in with <span>Passport</span></strong><small>Use your passport number</small></div><span className="card-arrow"><ArrowRight size={20} /></span></button>
      </div>
      <div className="home-note"><span className="note-icon"><Sparkles size={15} /></span><span>Already registered? We’ll recognise you instantly.</span></div>
      <button className="home-admin-mobile" onClick={onAdmin}><ShieldCheck size={16} />Admin login</button>
    </main>
  </PublicShell>;
}

function StepIndicator({ active }: { active: number }) {
  return <div className="step-indicator"><div className={cn("step", active >= 1 && "active", active > 1 && "done")}><span>{active > 1 ? <Check size={13} /> : "01"}</span><small>IDENTIFY</small></div><div className={cn("step-connector", active > 1 && "filled")} /><div className={cn("step", active >= 2 && "active", active > 2 && "done")}><span>{active > 2 ? <Check size={13} /> : "02"}</span><small>DETAILS</small></div><div className={cn("step-connector", active > 2 && "filled")} /><div className={cn("step", active >= 3 && "active")}><span>03</span><small>COMPLETE</small></div></div>;
}

function LookupPage({ type, onBack, onSubmit, error }: { type: IdentificationType; onBack: () => void; onSubmit: (number: string) => void; error: string }) {
  const [number, setNumber] = useState("");
  const isId = type === "ID";
  return <PublicShell onAdmin={() => undefined} onHome={onBack}>
    <main className="flow-main"><StepIndicator active={1} /><button className="back-button" onClick={onBack}><ArrowLeft size={16} /> Back to options</button><div className="flow-card lookup-card"><div className="flow-icon"><>{isId ? <IdCard size={28} /> : <Fingerprint size={28} />}</></div><span className="section-kicker">IDENTIFICATION REQUIRED</span><h2>Enter your {isId ? "ID number" : "passport number"}</h2><p>We’ll look up your visitor profile and get you checked in.</p><form onSubmit={(event) => { event.preventDefault(); onSubmit(number); }} className="lookup-form"><label htmlFor="identifier">{isId ? "South African ID number" : "Passport number"}<span>Required</span></label><div className={cn("input-wrap", error && "input-error")}><Search size={18} /><input id="identifier" autoFocus value={number} onChange={(event) => setNumber(event.target.value)} placeholder={isId ? "e.g. 8504125800081" : "e.g. PZ4829106"} /><button type="button" className="clear-input" onClick={() => setNumber("")} aria-label="Clear identifier"><X size={16} /></button></div>{error ? <div className="form-error"><X size={14} />{error}</div> : <div className="form-hint"><ShieldCheck size={14} /> Your information stays private and secure</div>}<button className="primary-button full-width" type="submit">Continue <ArrowRight size={17} /></button></form></div></main>
  </PublicShell>;
}

function WelcomePage({ user, onBack, onCheckIn }: { user: User; onBack: () => void; onCheckIn: () => void }) {
  return <PublicShell onAdmin={() => undefined} onHome={onBack}><main className="flow-main"><StepIndicator active={2} /><button className="back-button" onClick={onBack}><ArrowLeft size={16} /> Back to identification</button><div className="flow-card welcome-card"><div className="welcome-avatar">{user.name[0]}{user.surname[0]}</div><span className="section-kicker">PROFILE FOUND</span><h2>Welcome, <em>{user.name} {user.surname}</em></h2><p>Your profile is ready. Tap below to record your arrival.</p><div className="profile-preview"><div><span>IDENTIFICATION</span><strong>{user.identificationNumber}</strong></div><div><span>EMAIL</span><strong>{user.email}</strong></div></div><button className="primary-button full-width" onClick={onCheckIn}>Check in now <ArrowRight size={17} /></button><button className="text-button" onClick={onBack}>Not you? Use a different number</button></div></main></PublicShell>;
}

function RegistrationPage({ type, number, onBack, onSubmit }: { type: IdentificationType; number: string; onBack: () => void; onSubmit: (data: Omit<User, "id" | "createdAt">) => void }) {
  const [form, setForm] = useState({ name: "", surname: "", email: "", phone: "" });
  const [error, setError] = useState("");
  const update = (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const submit = (event: FormEvent) => { event.preventDefault(); if (Object.values(form).some((value) => !value.trim())) { setError("Please complete all fields before continuing."); return; } if (!form.email.includes("@")) { setError("Please enter a valid email address."); return; } setError(""); onSubmit({ ...form, identificationType: type, identificationNumber: number }); };
  return <PublicShell onAdmin={() => undefined} onHome={onBack}><main className="flow-main registration-main"><StepIndicator active={2} /><button className="back-button" onClick={onBack}><ArrowLeft size={16} /> Back to identification</button><div className="registration-layout"><div className="registration-intro"><span className="section-kicker">FIRST-TIME VISITOR</span><h2>Let’s get you<br /><em>registered.</em></h2><p>It only takes a moment. Once complete, you’ll be checked in automatically.</p><div className="secure-note"><ShieldCheck size={18} /><div><strong>Private & secure</strong><span>Your information is only used for site access.</span></div></div></div><form className="flow-card registration-card" onSubmit={submit}><div className="form-heading"><div><span className="section-kicker">YOUR DETAILS</span><h3>Tell us about yourself</h3></div><span className="form-step-label">02 / 03</span></div><div className="identifier-locked"><span>{type === "ID" ? "ID NUMBER" : "PASSPORT NUMBER"}</span><strong>{number}</strong><BadgeCheck size={17} /></div><div className="form-grid"><label><span>First name</span><div className="field-icon"><UserPlus size={16} /><input value={form.name} onChange={update("name")} placeholder="e.g. John" /></div></label><label><span>Surname</span><div className="field-icon"><UserPlus size={16} /><input value={form.surname} onChange={update("surname")} placeholder="e.g. Doe" /></div></label><label><span>Email address</span><div className="field-icon"><Mail size={16} /><input type="email" value={form.email} onChange={update("email")} placeholder="you@company.com" /></div></label><label><span>Phone number</span><div className="field-icon"><Phone size={16} /><input value={form.phone} onChange={update("phone")} placeholder="+27 00 000 0000" /></div></label></div>{error && <div className="form-error"><X size={14} />{error}</div>}<button className="primary-button full-width" type="submit">Register & check in <ArrowRight size={17} /></button><button type="button" className="text-button" onClick={onBack}>Cancel</button></form></div></main></PublicShell>;
}

function SuccessPage({ success, onDone }: { success: CheckInSuccess; onDone: () => void }) {
  return <PublicShell onAdmin={() => undefined} onHome={onDone}><main className="flow-main"><StepIndicator active={3} /><div className="flow-card success-card"><div className="success-icon"><Check size={31} strokeWidth={2.4} /></div><span className="section-kicker">YOU’RE ALL SET</span><h2>Welcome, <em>{success.name}.</em></h2><p>You have successfully checked in to Northstar Offices.</p><div className="success-time"><Clock3 size={17} /><span>Check-in time</span><strong>{formatTime(success.checkInTime)}</strong></div><div className="success-message"><Sparkles size={16} /><span>Please keep your visitor badge visible while you’re in the building.</span></div><button className="primary-button full-width" onClick={onDone}>Done <Check size={17} /></button></div></main></PublicShell>;
}

function AdminLogin({ onLogin, onBack }: { onLogin: (username: string, password: string) => boolean; onBack: () => void }) {
  const [username, setUsername] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState("");
  return <div className="admin-login-shell"><div className="admin-login-grid"><div className="admin-login-art"><div className="art-grid" /><button className="logo-button admin-logo" onClick={onBack}><Logo /></button><div className="art-copy"><span className="section-kicker">NORTHSTAR / OPERATIONS</span><h1>Know who’s<br /><em>in the building.</em></h1><p>A calm, clear view of your workplace access activity.</p></div><div className="art-foot"><span>VisitorFlow v1.0</span><span>Local prototype</span></div></div><div className="admin-login-panel"><button className="back-button" onClick={onBack}><ArrowLeft size={16} /> Back to kiosk</button><div className="admin-login-content"><div className="admin-login-icon"><ShieldCheck size={22} /></div><span className="section-kicker">SECURE AREA</span><h2>Admin sign in</h2><p>Use your operations credentials to continue.</p><form onSubmit={(event) => { event.preventDefault(); if (!onLogin(username, password)) setError("Those credentials don’t match. Please try again."); }}><label>Username or email<input value={username} onChange={(event) => setUsername(event.target.value)} autoFocus placeholder="Enter username" /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" /></label>{error && <div className="form-error"><X size={14} />{error}</div>}<button className="primary-button full-width" type="submit">Sign in <ArrowRight size={17} /></button></form><div className="login-footnote"><ShieldCheck size={14} /> Admin access is protected</div></div></div></div></div>;
}

function AdminShell({ view, setView, onLogout, children }: { view: AdminView; setView: (view: AdminView) => void; onLogout: () => void; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return <div className="admin-shell"><aside className={cn("admin-sidebar", mobileOpen && "mobile-open")}><div className="admin-sidebar-head"><Logo /><button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={18} /></button></div><div className="workspace-switcher"><div className="workspace-avatar">N</div><div><strong>Northstar Offices</strong><span>Reception workspace</span></div><ChevronDown size={15} /></div><nav className="admin-nav"><span className="nav-group-label">WORKSPACE</span>{navItems.map((item) => { const Icon = item.icon; return <button key={item.id} className={cn("admin-nav-item", view === item.id && "active")} onClick={() => { setView(item.id); setMobileOpen(false); }}><Icon size={17} /><span>{item.label}</span>{item.id === "checked" && <b>{children ? "" : ""}</b>}</button>; })}</nav><div className="sidebar-bottom"><div className="sidebar-help"><div className="help-icon"><ClipboardList size={16} /></div><div><strong>Need help?</strong><span>View quick guide</span></div><ArrowRight size={14} /></div><button className="logout-button" onClick={onLogout}><LogOut size={16} />Sign out</button><div className="admin-user"><div className="user-avatar">A</div><div><strong>Admin</strong><span>Operations</span></div><MoreDots /></div></div></aside><div className="admin-content"><header className="admin-topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={20} /></button><div><span className="breadcrumb">Operations / </span><strong>{navItems.find((item) => item.id === view)?.label}</strong></div><div className="admin-topbar-right"><span className="live-pill"><i /> System live</span><div className="topbar-date"><CalendarDays size={15} />{new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date())}</div><div className="user-avatar small">A</div></div></header><main className="admin-main">{children}</main></div></div>;
}

function MoreDots() { return <span className="more-dots">···</span>; }

function StatCard({ icon: Icon, label, value, meta, tone }: { icon: typeof Users; label: string; value: string | number; meta: string; tone: string }) {
  return <div className="stat-card"><div className={cn("stat-icon", tone)}><Icon size={18} /></div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{meta}</small></div><MoreDots /></div>;
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-header"><div><span className="section-kicker">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function AdminDashboard({ users, records, currentRecords, onViewChecked }: { users: User[]; records: CheckInRecord[]; currentRecords: CheckInRecord[]; onViewChecked: () => void }) {
  const checkedToday = records.filter((record) => isToday(record.checkInTime)); const checkedOutToday = records.filter((record) => isToday(record.checkOutTime));
  return <><PageHeader eyebrow="OVERVIEW / TODAY" title="Good morning, Admin." description="Here’s what’s happening across Northstar Offices today." action={<button className="outline-button" onClick={onViewChecked}><DoorOpen size={16} />View live arrivals</button>} /><div className="stat-grid"><StatCard icon={Users} label="Currently checked in" value={currentRecords.length} meta="Live right now" tone="blue" /><StatCard icon={LogIn} label="Check-ins today" value={checkedToday.length} meta="Arrivals recorded" tone="mint" /><StatCard icon={LogOut} label="Check-outs today" value={checkedOutToday.length} meta="Departures recorded" tone="orange" /><StatCard icon={UserPlus} label="Registered users" value={users.length} meta="Total profiles" tone="violet" /></div><div className="dashboard-grid"><div className="dashboard-panel arrivals-panel"><div className="panel-heading"><div><span className="section-kicker">LIVE ACTIVITY</span><h2>Currently checked in</h2></div><button className="link-button" onClick={onViewChecked}>View all <ArrowRight size={14} /></button></div>{currentRecords.length === 0 ? <EmptyState title="No one is checked in" description="New arrivals will appear here." icon={DoorOpen} /> : <div className="arrival-list">{currentRecords.slice(0, 4).map((record) => { const user = getRecordUser(record, users); if (!user) return null; return <div className="arrival-row" key={record.id}><div className="arrival-avatar">{user.name[0]}{user.surname[0]}</div><div className="arrival-info"><strong>{user.name} {user.surname}</strong><span>{user.identificationType} · {user.identificationNumber}</span></div><div className="arrival-time"><Clock3 size={14} />{formatTime(record.checkInTime)}</div><StatusBadge status={record.status} /></div>; })}</div>}</div><div className="dashboard-panel pulse-panel"><div className="pulse-orb"><BarChart3 size={22} /></div><span className="section-kicker">SITE PULSE</span><h2>Everything looks<br /><em>good today.</em></h2><p>All check-in systems are operating normally.</p><div className="pulse-metrics"><div><strong>{checkedToday.length}</strong><span>arrivals</span></div><div><strong>{currentRecords.length}</strong><span>on site</span></div></div><div className="pulse-bar"><span style={{ width: `${Math.min(100, Math.max(18, currentRecords.length * 24))}%` }} /></div><small>Live occupancy level</small></div></div></>;
}

function EmptyState({ title, description, icon: Icon }: { title: string; description: string; icon: typeof Users }) { return <div className="empty-state"><div><Icon size={22} /></div><strong>{title}</strong><span>{description}</span></div>; }

function CheckedInPage({ users, records, onCheckOut }: { users: User[]; records: CheckInRecord[]; onCheckOut: (recordId: string) => void }) {
  const current = records.filter((record) => record.status === "CHECKED_IN");
  return <><PageHeader eyebrow="LIVE / ARRIVALS" title="Currently checked in" description="People who are currently inside Northstar Offices." action={<span className="live-pill larger"><i />{current.length} active now</span>} /><div className="dashboard-panel table-panel"><div className="table-toolbar"><div className="table-summary"><strong>{current.length} people</strong><span>currently on site</span></div><div className="table-toolbar-actions"><button className="filter-button"><CalendarDays size={15} />Today<ChevronDown size={14} /></button><button className="icon-button"><MoreDots /></button></div></div><div className="responsive-table"><table><thead><tr><th>Person</th><th>Identification</th><th>Contact</th><th>Check-in time</th><th>Status</th><th className="align-right">Action</th></tr></thead><tbody>{current.map((record) => { const user = getRecordUser(record, users); if (!user) return null; return <tr key={record.id}><td><div className="person-cell"><div className="arrival-avatar small-avatar">{user.name[0]}{user.surname[0]}</div><div><strong>{user.name} {user.surname}</strong><span>Added {formatDateTime(user.createdAt).split(",")[0]}</span></div></div></td><td><strong className="mono-cell">{user.identificationNumber}</strong><span className="type-label">{user.identificationType}</span></td><td><strong className="contact-cell">{user.email}</strong><span>{user.phone}</span></td><td><strong>{formatTime(record.checkInTime)}</strong><span>{formatDateTime(record.checkInTime).split(",")[0]}</span></td><td><StatusBadge status={record.status} /></td><td className="align-right"><button className="checkout-button" onClick={() => onCheckOut(record.id)}><LogOut size={14} />Check out</button></td></tr>; })}</tbody></table>{current.length === 0 && <EmptyState title="No current arrivals" description="Everyone is out of the building." icon={DoorOpen} />}</div></div></>;
}

function HistoryPage({ users, records }: { users: User[]; records: CheckInRecord[] }) {
  const [query, setQuery] = useState(""); const [status, setStatus] = useState("ALL"); const [type, setType] = useState("ALL"); const [todayOnly, setTodayOnly] = useState(false);
  const filtered = useMemo(() => records.filter((record) => { const user = getRecordUser(record, users); if (!user) return false; const haystack = `${user.name} ${user.surname} ${user.identificationNumber}`.toLowerCase(); return (!query || haystack.includes(query.toLowerCase())) && (status === "ALL" || record.status === status) && (type === "ALL" || user.identificationType === type) && (!todayOnly || isToday(record.checkInTime)); }), [records, users, query, status, type, todayOnly]);
  return <><PageHeader eyebrow="AUDIT TRAIL / ALL ACTIVITY" title="Check-in history" description="Review every arrival and departure recorded at this site." /><div className="dashboard-panel table-panel"><div className="history-filters"><div className="search-control"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, surname or ID..." /></div><label className="select-control"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="ALL">All statuses</option><option value="CHECKED_IN">Checked in</option><option value="CHECKED_OUT">Checked out</option></select><ChevronDown size={14} /></label><label className="select-control"><span>Type</span><select value={type} onChange={(event) => setType(event.target.value)}><option value="ALL">All types</option><option value="ID">ID</option><option value="PASSPORT">Passport</option></select><ChevronDown size={14} /></label><button className={cn("today-filter", todayOnly && "selected")} onClick={() => setTodayOnly((current) => !current)}><CalendarDays size={15} />Today</button></div><div className="history-result-count">Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? "record" : "records"}</div><div className="responsive-table"><table><thead><tr><th>Person</th><th>ID / Passport</th><th>Check-in date</th><th>Check-in time</th><th>Check-out time</th><th>Status</th></tr></thead><tbody>{filtered.map((record) => { const user = getRecordUser(record, users); if (!user) return null; return <tr key={record.id}><td><div className="person-cell"><div className="arrival-avatar small-avatar">{user.name[0]}{user.surname[0]}</div><div><strong>{user.name} {user.surname}</strong><span>{user.email}</span></div></div></td><td><strong className="mono-cell">{user.identificationNumber}</strong><span className="type-label">{user.identificationType}</span></td><td>{new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(record.checkInTime))}</td><td><strong>{formatTime(record.checkInTime)}</strong></td><td>{record.checkOutTime ? formatTime(record.checkOutTime) : <span className="dash">—</span>}</td><td><StatusBadge status={record.status} /></td></tr>; })}</tbody></table>{filtered.length === 0 && <EmptyState title="No matching history" description="Try changing your filters or search term." icon={FileText} />}</div></div></>;
}

function UsersPage({ users }: { users: User[] }) { const [query, setQuery] = useState(""); const filtered = users.filter((user) => `${user.name} ${user.surname} ${user.identificationNumber} ${user.email}`.toLowerCase().includes(query.toLowerCase())); return <><PageHeader eyebrow="DIRECTORY / PROFILES" title="Registered users" description="The people who have a visitor profile at Northstar Offices." action={<span className="directory-count"><Users size={16} />{users.length} profiles</span>} /><div className="dashboard-panel table-panel"><div className="history-filters"><div className="search-control wide"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search registered users..." /></div><button className="outline-button"><UserPlus size={16} />New profile</button></div><div className="responsive-table"><table><thead><tr><th>Person</th><th>Identification</th><th>Email</th><th>Phone</th><th>Joined</th></tr></thead><tbody>{filtered.map((user) => <tr key={user.id}><td><div className="person-cell"><div className="arrival-avatar small-avatar">{user.name[0]}{user.surname[0]}</div><div><strong>{user.name} {user.surname}</strong><span>Visitor profile</span></div></div></td><td><strong className="mono-cell">{user.identificationNumber}</strong><span className="type-label">{user.identificationType}</span></td><td><span className="contact-cell">{user.email}</span></td><td>{user.phone}</td><td>{formatDateTime(user.createdAt).split(",")[0]}</td></tr>)}</tbody></table>{filtered.length === 0 && <EmptyState title="No matching profiles" description="Try a different search term." icon={Users} />}</div></div></>; }

export default function App() {
  const data = useVisitorData();
  const [stage, setStage] = useState<PublicStage>("home"); const [lookupType, setLookupType] = useState<IdentificationType>("ID"); const [lookupNumber, setLookupNumber] = useState(""); const [lookupUser, setLookupUser] = useState<User | null>(null); const [lookupError, setLookupError] = useState(""); const [success, setSuccess] = useState<CheckInSuccess | null>(null); const [adminAuth, setAdminAuth] = useState(false); const [adminView, setAdminView] = useState<AdminView>("dashboard");
  const startLookup = (type: IdentificationType) => { setLookupType(type); setLookupNumber(""); setLookupUser(null); setLookupError(""); setStage("lookup"); };
  const lookup = (number: string) => { if (!number.trim()) { setLookupError(`Please enter your ${lookupType === "ID" ? "ID" : "passport"} number.`); return; } const user = data.findUser(lookupType, number); setLookupNumber(number.trim()); if (!user) { setLookupError(""); setStage("register"); return; } if (data.activeRecordFor(user.id)) { setLookupError("You are already checked in."); return; } setLookupUser(user); setLookupError(""); setStage("welcome"); };
  const handleCheckIn = (user: User) => { const record = data.checkIn(user.id); if (!record) { setLookupError("You are already checked in."); return; } setSuccess({ name: user.name, checkInTime: record.checkInTime }); setStage("success"); };
  const resetPublic = () => { setStage("home"); setLookupUser(null); setLookupNumber(""); setLookupError(""); setSuccess(null); };
  const login = (username: string, password: string) => { if (username.trim().toLowerCase() === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) { setAdminAuth(true); setAdminView("dashboard"); return true; } return false; };
  if (adminAuth) return <AdminShell view={adminView} setView={setAdminView} onLogout={() => setAdminAuth(false)}>{adminView === "dashboard" && <AdminDashboard users={data.users} records={data.records} currentRecords={data.currentRecords} onViewChecked={() => setAdminView("checked")} />}{adminView === "checked" && <CheckedInPage users={data.users} records={data.records} onCheckOut={data.checkOut} />}{adminView === "history" && <HistoryPage users={data.users} records={data.records} />}{adminView === "users" && <UsersPage users={data.users} />}</AdminShell>;
  if (stage === "home") return <HomePage onSelect={startLookup} onAdmin={() => setStage("admin")} />;
  if (stage === "lookup") return <LookupPage type={lookupType} onBack={resetPublic} onSubmit={lookup} error={lookupError} />;
  if (stage === "welcome" && lookupUser) return <WelcomePage user={lookupUser} onBack={() => setStage("lookup")} onCheckIn={() => handleCheckIn(lookupUser)} />;
  if (stage === "register") return <RegistrationPage type={lookupType} number={lookupNumber} onBack={() => setStage("lookup")} onSubmit={(form) => { const { user, record } = data.registerAndCheckIn(form); setSuccess({ name: user.name, checkInTime: record.checkInTime }); setStage("success"); }} />;
  if (stage === "success" && success) return <SuccessPage success={success} onDone={resetPublic} />;
  return <AdminLogin onLogin={login} onBack={resetPublic} />;
}
