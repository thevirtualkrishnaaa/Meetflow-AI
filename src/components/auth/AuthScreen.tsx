import React, { useState } from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import { FounderMachaLogo } from '../ui/FounderMachaLogo';
import {
  Lock,
  Mail,
  User,
  Building2,
  Briefcase,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Users,
  Calendar,
  AlertCircle,
  Loader2,
  Video,
  Brain,
  Shield,
  HeartHandshake,
} from 'lucide-react';

const AVATAR_COLORS = [
  { label: 'Matcha Green', class: 'bg-[#78c452] text-neutral-950 font-bold' },
  { label: 'Emerald', class: 'bg-emerald-600 text-white' },
  { label: 'Dark Slate', class: 'bg-neutral-800 text-white' },
  { label: 'Blue', class: 'bg-blue-600 text-white' },
  { label: 'Violet', class: 'bg-violet-600 text-white' },
  { label: 'Rose', class: 'bg-rose-600 text-white' },
];

export const AuthScreen: React.FC = () => {
  const { login, register } = useMeetingFlow();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Founder & CEO');
  const [workspaceName, setWorkspaceName] = useState('Foundermatcha Core');
  const [department, setDepartment] = useState('Leadership');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0].class);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid credentials. You can also click "Instant Foundermatcha Access" below.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid work email.');
      return;
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: role.trim() || 'Founder & CEO',
        workspaceName: workspaceName.trim() || 'Foundermatcha Core',
        department,
        avatarColor,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      await login('krishna@foundermatcha.com', 'password123');
    } catch (e: any) {
      // Fallback
      await login('admin@meetingflow.ai', 'password123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row bg-neutral-950 text-neutral-100 overflow-x-hidden font-sans">
      {/* Left Column: Foundermatcha Brand Hero & Philosophy */}
      <div className="w-full md:w-5/12 bg-gradient-to-br from-neutral-950 via-neutral-900 to-[#121c10] p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-800">
        <div>
          {/* Logo */}
          <div className="mb-10">
            <FounderMachaLogo size="lg" showText={true} subtext="Executive Huddle & Video Engine" />
          </div>

          {/* Value prop pitch */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#78c452]/10 border border-[#78c452]/20 text-[#78c452] text-xs font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#78c452] animate-ping" />
              <span>Sanctuary Mode Active</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Where Founders and Engineers Align, Huddle, and Ship.
            </h1>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Tailored specifically for Foundermatcha’s internal operations. Connect daily via high-fidelity
              online video calls, track psychological chemistry alignment, and turn discussions into accountable
              commitments.
            </p>
          </div>

          {/* Key Foundermatcha Pillars */}
          <div className="mt-8 space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#78c452]/10 border border-[#78c452]/20 flex items-center justify-center text-[#78c452] shrink-0 mt-0.5">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Everyday Online Video Huddles
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Interactive multi-party video calls with speaker timers, screen sharing, and active speaker glow.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#78c452]/10 border border-[#78c452]/20 flex items-center justify-center text-[#78c452] shrink-0 mt-0.5">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Mapping Human Chemistry
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Built around psychological synergy, working styles, equity vs cash expectations, and roadmap clarity.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#78c452]/10 border border-[#78c452]/20 flex items-center justify-center text-[#78c452] shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live In-Call AI Note-Taker
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Detects consensus decisions and auto-assigns action items directly during online huddles.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#78c452]/10 border border-[#78c452]/20 flex items-center justify-center text-[#78c452] shrink-0 mt-0.5">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  A Sanctuary to Protect Ideas
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Encrypted internal logs, IP protection, and privacy-first founder-engineer handshakes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-8 mt-8 border-t border-neutral-800 text-[11px] text-neutral-500 flex items-center justify-between font-mono">
          <span>Foundermatcha Internal Engine</span>
          <span>v2.8 Matcha Edition</span>
        </div>
      </div>

      {/* Right Column: Live Login / Register Forms */}
      <div className="w-full md:w-7/12 bg-neutral-950 p-6 sm:p-12 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-[#78c452] text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign In to Foundermatcha
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-[#78c452] text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Join Company Workspace
            </button>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {mode === 'signin' ? 'Welcome back to Foundermatcha' : 'Onboard your team into Foundermatcha'}
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              {mode === 'signin'
                ? 'Access your daily huddles, video rooms, and decision records.'
                : 'Configure your company role, setup workspace, and connect with engineers.'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#78c452] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-neutral-300">
                    Password
                  </label>
                  <span className="text-[11px] text-[#78c452] hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#78c452] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-3.5 h-3.5 rounded bg-neutral-900 border-neutral-700 text-[#78c452] focus:ring-0"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-bold text-neutral-950 bg-[#78c452] hover:bg-[#67b342] disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Foundermatcha</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-semibold text-neutral-500">
                  <span className="bg-neutral-950 px-3 font-mono">or instant login</span>
                </div>
              </div>

              {/* 1-Click Instant Access */}
              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-medium text-neutral-200 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-[#78c452]/40 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#78c452]" />
                <span>Instant Foundermatcha Access (Founder & CEO)</span>
              </button>
            </form>
          ) : (
            /* Sign Up / Create Workspace Form */
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Krishna (Founder)"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#78c452] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Company Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="krishna@foundermatcha.com"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#78c452] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#78c452] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Workspace / Organization
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      placeholder="Foundermatcha Core"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#78c452] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Company Role / Department
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#78c452] transition-all"
                    >
                      <option value="Founder & CEO">Founder & CEO</option>
                      <option value="Tech Co-Founder & CTO">Tech Co-Founder & CTO</option>
                      <option value="Lead Software Engineer">Lead Software Engineer</option>
                      <option value="Head of Product & Psychology">Head of Product & Psychology</option>
                      <option value="Head of UI/UX Design">Head of UI/UX Design</option>
                      <option value="Growth & Operations Lead">Growth & Operations Lead</option>
                      <option value="Engineering Advisor">Engineering Advisor</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Avatar Color Picker */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Brand Theme Tag
                </label>
                <div className="flex items-center gap-2">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => setAvatarColor(c.class)}
                      className={`w-6 h-6 rounded-full ${c.class} transition-all ${
                        avatarColor === c.class
                          ? 'ring-2 ring-offset-2 ring-offset-neutral-950 ring-[#78c452] scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-bold text-neutral-950 bg-[#78c452] hover:bg-[#67b342] disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Join Foundermatcha Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center">
            <span className="text-xs text-neutral-500">
              {mode === 'signin' ? "Don't have a workspace yet? " : 'Already have an account? '}
            </span>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
              }}
              className="text-xs font-semibold text-[#78c452] hover:underline"
            >
              {mode === 'signin' ? 'Onboard your team' : 'Sign in here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
