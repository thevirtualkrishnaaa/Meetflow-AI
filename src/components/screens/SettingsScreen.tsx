import React, { useState } from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
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
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { currentUser } = useMeetingFlow();

  const [emailDigest, setEmailDigest] = useState(true);
  const [slackSync, setSlackSync] = useState(true);
  const [autoDetectDecisions, setAutoDetectDecisions] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
          Configure meeting extraction rules, automated follow-up digests, and team integrations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Workspace Profile */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <Users className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-neutral-900">Workspace Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Workspace Name
              </label>
              <input
                type="text"
                defaultValue="Acme Labs HQ"
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Primary Organization Domain
              </label>
              <input
                type="text"
                defaultValue="acmelabs.com"
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900"
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
                Items below this score require explicit human verification during the AI Review step.
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
    </div>
  );
};
