import React, { useState } from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import { Avatar } from '../ui/Avatar';
import {
  X,
  UserPlus,
  Mail,
  Briefcase,
  Layers,
  Sparkles,
  Check,
  ShieldCheck,
} from 'lucide-react';

const AVATAR_COLORS = [
  { label: 'Indigo', class: 'bg-indigo-600 text-white', ring: 'ring-indigo-600' },
  { label: 'Emerald', class: 'bg-emerald-600 text-white', ring: 'ring-emerald-600' },
  { label: 'Blue', class: 'bg-blue-600 text-white', ring: 'ring-blue-600' },
  { label: 'Violet', class: 'bg-violet-600 text-white', ring: 'ring-violet-600' },
  { label: 'Rose', class: 'bg-rose-600 text-white', ring: 'ring-rose-600' },
  { label: 'Amber', class: 'bg-amber-600 text-white', ring: 'ring-amber-600' },
  { label: 'Cyan', class: 'bg-cyan-600 text-white', ring: 'ring-cyan-600' },
  { label: 'Teal', class: 'bg-teal-600 text-white', ring: 'ring-teal-600' },
];

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Operations',
  'Design',
  'Marketing',
  'Sales',
  'Leadership',
  'Finance',
];

const PRESETS = [
  { name: 'Daniel Miller', role: 'Staff Backend Engineer', department: 'Engineering', email: 'daniel@meetingflow.ai' },
  { name: 'Maya Lin', role: 'Senior UX Researcher', department: 'Design', email: 'maya@meetingflow.ai' },
  { name: 'Kavita Rao', role: 'Customer Success Manager', department: 'Operations', email: 'kavita@meetingflow.ai' },
  { name: 'Liam O’Connor', role: 'Demand Gen Lead', department: 'Marketing', email: 'liam@meetingflow.ai' },
];

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemberAdded?: (memberId: string) => void;
}

export const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
  isOpen,
  onClose,
  onMemberAdded,
}) => {
  const { addTeamMember } = useMeetingFlow();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Product');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0].class);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const parts = name.trim().split(/\s+/);
  const previewInitials =
    name.trim().length > 0
      ? parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : name.trim().slice(0, 2).toUpperCase()
      : 'TM';

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setName(preset.name);
    setRole(preset.role);
    setDepartment(preset.department);
    setEmail(preset.email);
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }
    if (!role.trim()) {
      setErrorMessage('Please specify their role or title.');
      return;
    }

    const created = addTeamMember({
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      department,
      avatarColor: selectedColor,
    });

    // Reset form
    setName('');
    setEmail('');
    setRole('');
    setErrorMessage('');
    onClose();

    if (onMemberAdded) {
      onMemberAdded(created.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-[2px] animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 leading-tight">
                Add New Team Member
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Add teammates to assign meeting action items and track follow-through.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Quick presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                Quick Fill Suggestions
              </span>
              <span className="text-[11px] text-neutral-400">Click to autofill sample</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 text-xs bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 rounded-md transition-colors"
                >
                  + {p.name} ({p.role.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="e.g. Maya Lin"
                required
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-neutral-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Work Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="maya@company.com"
                  required
                  className="w-full pl-8 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-neutral-400"
                />
                <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Role & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Role / Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="e.g. Senior Frontend Architect"
                  required
                  className="w-full pl-8 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-neutral-400"
                />
                <Briefcase className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Department
              </label>
              <div className="relative">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <Layers className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Avatar Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">
              Profile Avatar Color
            </label>
            <div className="flex items-center gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  title={c.label}
                  onClick={() => setSelectedColor(c.class)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${c.class} ${
                    selectedColor === c.class ? `ring-2 ring-offset-2 ring-neutral-900 scale-110` : 'hover:opacity-90'
                  }`}
                >
                  {selectedColor === c.class && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block mb-2">
              Live Member Card Preview
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-2xs ${selectedColor}`}
                >
                  {previewInitials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-neutral-900">
                    {name.trim() || 'New Teammate'}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {role.trim() || 'Team Member'} · <span className="text-neutral-400">{department}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    {email.trim() || 'teammate@meetingflow.ai'}
                  </div>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Ready for assignments
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Teammate to Workspace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
