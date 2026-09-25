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
  { label: 'Green', class: 'bg-[#78c452] text-neutral-950 font-bold', ring: 'ring-[#78c452]' },
  { label: 'Emerald', class: 'bg-emerald-600 text-white font-bold', ring: 'ring-emerald-600' },
  { label: 'Blue', class: 'bg-blue-600 text-white font-bold', ring: 'ring-blue-600' },
  { label: 'Indigo', class: 'bg-indigo-600 text-white font-bold', ring: 'ring-indigo-600' },
  { label: 'Violet', class: 'bg-violet-600 text-white font-bold', ring: 'ring-violet-600' },
  { label: 'Rose', class: 'bg-rose-600 text-white font-bold', ring: 'ring-rose-600' },
  { label: 'Amber', class: 'bg-amber-600 text-white font-bold', ring: 'ring-amber-600' },
  { label: 'Cyan', class: 'bg-cyan-600 text-white font-bold', ring: 'ring-cyan-600' },
];

const COMMON_ROLES = [
  'Tech Co-Founder & CTO',
  'Lead Software Engineer',
  'Full Stack Software Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Head of Product & Psychology',
  'Product Manager',
  'Head of UI/UX Design',
  'Growth & Operations Lead',
  'Engineering Advisor',
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
  const { addTeamMember, workspaceProfile } = useMeetingFlow();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Tech Co-Founder & CTO');
  const [customRole, setCustomRole] = useState('');
  const [department, setDepartment] = useState('Engineering');
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

    const finalRole = role === 'Other' ? customRole.trim() || 'Team Member' : role;

    const created = addTeamMember({
      name: name.trim(),
      email: email.trim(),
      role: finalRole,
      department,
      avatarColor: selectedColor,
    });

    if (onMemberAdded) {
      onMemberAdded(created.id);
    }

    setName('');
    setEmail('');
    setCustomRole('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden font-sans">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#78c452]/20 border border-[#78c452]/30 flex items-center justify-center text-[#4b8b29]">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Add Team Member</h2>
              <p className="text-[11px] text-neutral-500">
                Assign a role and onboard someone into {workspaceProfile.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Member Preview Card */}
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-xs ${selectedColor}`}
            >
              {previewInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-neutral-900 text-sm truncate">
                {name.trim() || 'Teammate Full Name'}
              </div>
              <div className="text-xs text-[#4b8b29] font-medium truncate">
                {role === 'Other' ? customRole || 'Custom Role' : role}
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMessage('');
              }}
              placeholder="e.g. Alex Miller"
              required
              autoFocus
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#78c452]"
            />
          </div>

          {/* Work Email */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Work Email *
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="name@foundermatcha.com"
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#78c452]"
              />
            </div>
          </div>

          {/* Role Assignment */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Assigned Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#78c452]"
            >
              {COMMON_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              <option value="Other">Other / Custom Title</option>
            </select>

            {role === 'Other' && (
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Enter custom title / role..."
                className="w-full mt-2 px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#78c452]"
              />
            )}
          </div>

          {/* Department & Avatar Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#78c452]"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Tag Color
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color.label}
                    type="button"
                    onClick={() => setSelectedColor(color.class)}
                    className={`w-5 h-5 rounded-full ${color.class} transition-all cursor-pointer ${
                      selectedColor === color.class
                        ? 'ring-2 ring-offset-2 ring-neutral-900 scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-neutral-950 bg-[#78c452] hover:bg-[#67b342] rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member to Workshop</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
