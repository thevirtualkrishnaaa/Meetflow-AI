import React, { useState } from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import { Avatar } from '../ui/Avatar';
import {
  Bell,
  Check,
  Globe,
  Lock,
  Mail,
  Save,
  Shield,
  Sliders,
  Sparkles,
  Users,
  Trash2,
  RefreshCw,
  LogOut,
  UserPlus,
  Building2,
  Compass,
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const {
    currentUser,
    workspaceProfile,
    updateWorkspaceProfile,
    resetToEmptyWorkspace,
    loadSampleData,
    logout,
    setIsAddMemberModalOpen,
  } = useMeetingFlow();

  const [workspaceName, setWorkspaceName] = useState(workspaceProfile.name);
  const [workspaceDomain, setWorkspaceDomain] = useState(workspaceProfile.domain);
  const [emailDigest, setEmailDigest] = useState(true);
  const [slackSync, setSlackSync] = useState(true);
  const [autoDetectDecisions, setAutoDetectDecisions] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorkspaceProfile({
      name: workspaceName.trim() || 'My Workspace',
      domain: workspaceDomain.trim() || 'company.com',
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleResetData = () => {
    resetToEmptyWorkspace();
    setConfirmResetOpen(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Workspace Settings
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Configure meeting extraction rules, manage team members, and adjust workspace preferences.
        </p>
      </div>

      {/* Current User Profile Card */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            name={currentUser.name}
            initials={currentUser.initials}
            colorClass={currentUser.avatarColor}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900">{currentUser.name}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Workspace Owner
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              {currentUser.role} · {currentUser.department}
            </p>
            <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddMemberModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Teammate</span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Workspace Profile */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-neutral-900">Workspace Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Workspace Name
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Primary Organization Domain
              </label>
              <input
                type="text"
                value={workspaceDomain}
                onChange={(e) => setWorkspaceDomain(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* AI Extraction & Accountability Rules */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-neutral-900">AI Intelligence Rules</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-neutral-900">
                  Automatic Decision Extraction
                </div>
                <div className="text-neutral-500">
                  Surface consensus milestones and tag participants who agreed.
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoDetectDecisions}
                onChange={(e) => setAutoDetectDecisions(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-neutral-300"
              />
            </div>

            <div className="pt-2 border-t border-neutral-100">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-neutral-900">
                  Confidence Threshold for Auto-Suggestion
                </span>
                <span className="font-mono text-neutral-700 font-semibold">
                  {confidenceThreshold}%
                </span>
              </div>
              <p className="text-neutral-500 mb-2">
                Items below this score require human verification during the AI Review step.
              </p>
              <input
                type="range"
                min="70"
                max="95"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Notifications & Follow-Up Automated Reminders */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-neutral-900">Automated Follow-ups</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-neutral-900">
                  Friday Morning Async Progress Digest
                </div>
                <div className="text-neutral-500">
                  Deliver personal summary of open and overdue commitments to each team member.
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailDigest}
                onChange={(e) => setEmailDigest(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-neutral-300"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
              <div>
                <div className="font-semibold text-neutral-900">
                  Overdue Task Alerts
                </div>
                <div className="text-neutral-500">
                  Notify owners 24 hours prior to deadline and when a task slips past due.
                </div>
              </div>
              <input
                type="checkbox"
                checked={slackSync}
                onChange={(e) => setSlackSync(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-neutral-300"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedNotice ? (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              <span>Workspace preferences saved successfully</span>
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Workspace Data Management */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
          <Trash2 className="w-4 h-4 text-rose-600" />
          <h2 className="text-sm font-semibold text-neutral-900">Workspace Data Management</h2>
        </div>

        <p className="text-xs text-neutral-500">
          Control your workspace content. You can start completely fresh with an empty state or load
          reference demo scenarios.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {confirmResetOpen ? (
            <div className="flex items-center gap-2 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              <span className="text-xs text-rose-700 font-medium">Are you sure? This will remove all meetings and tasks.</span>
              <button
                type="button"
                onClick={handleResetData}
                className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded hover:bg-rose-700 transition-colors"
              >
                Yes, Reset Everything
              </button>
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="px-2 py-1 text-xs text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmResetOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Clean Slate (Remove All Demo Data)</span>
            </button>
          )}

          <button
            type="button"
            onClick={loadSampleData}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>Load Demo Reference Scenarios</span>
          </button>
        </div>
      </div>
    </div>
  );
};
