import React, { useState } from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import { Priority } from '../../types';
import { Avatar } from '../ui/Avatar';
import { PriorityBadge } from '../ui/StatusBadge';
import {
  Check,
  CheckCircle2,
  Clock,
  Edit2,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';

export const AiReviewScreen: React.FC = () => {
  const {
    pendingDraft,
    updateDraftSummary,
    toggleApproveDecision,
    toggleApproveAction,
    updateDraftAction,
    publishDraftMeeting,
    cancelDraft,
    teamMembers,
  } = useMeetingFlow();

  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState(pendingDraft?.detectedSummary || '');
  const [editingActionId, setEditingActionId] = useState<string | null>(null);

  if (!pendingDraft) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-neutral-500">No pending meeting review found.</p>
        <button
          onClick={cancelDraft}
          className="mt-4 px-4 py-2 text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          Back to Meetings
        </button>
      </div>
    );
  }

  const approvedDecisionsCount = pendingDraft.detectedDecisions.filter((d) => d.approved).length;
  const approvedActionsCount = pendingDraft.detectedActions.filter((a) => a.approved).length;

  const handleSaveSummary = () => {
    updateDraftSummary(summaryText);
    setEditingSummary(false);
  };

  const handleApproveAll = () => {
    // Approve all items and publish
    pendingDraft.detectedDecisions.forEach((d) => {
      if (!d.approved) toggleApproveDecision(d.id);
    });
    pendingDraft.detectedActions.forEach((a) => {
      if (!a.approved) toggleApproveAction(a.id);
    });
    publishDraftMeeting();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 animate-fadeIn">
      {/* Top Banner Notice */}
      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-indigo-900">
              AI Verification Gate
            </h4>
            <p className="text-[11px] text-indigo-700">
              Review and calibrate extracted decisions and actions before publishing to team dashboards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={cancelDraft}
            className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            Discard Draft
          </button>
          <button
            onClick={handleApproveAll}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Approve All & Publish</span>
          </button>
        </div>
      </div>

      {/* Screen Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Review Meeting Results
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          {pendingDraft.title} · {pendingDraft.date} · {pendingDraft.project}
        </p>
      </div>

      {/* Section 1: Executive Summary */}
      <section className="bg-white rounded-xl border border-neutral-200 p-6 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-neutral-900">Executive Summary</h2>
          </div>
          {!editingSummary ? (
            <button
              onClick={() => setEditingSummary(true)}
              className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-indigo-600 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit Summary</span>
            </button>
          ) : (
            <button
              onClick={handleSaveSummary}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          )}
        </div>

        {editingSummary ? (
          <textarea
            rows={3}
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
            className="w-full p-3 text-xs text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        ) : (
          <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
            {pendingDraft.detectedSummary}
          </p>
        )}
      </section>

      {/* Section 2: Detected Decisions */}
      <section className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Detected Decisions</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Agreed outcomes discovered in conversation.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            {approvedDecisionsCount} of {pendingDraft.detectedDecisions.length} Approved
          </span>
        </div>

        <div className="divide-y divide-neutral-100">
          {pendingDraft.detectedDecisions.map((dec) => (
            <div
              key={dec.id}
              className={`p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors ${
                dec.approved ? 'bg-white' : 'bg-neutral-50/60 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-semibold text-neutral-900 leading-snug">
                    {dec.text}
                  </p>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    <span className="font-medium text-neutral-600">Context: </span>
                    {dec.context}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {Math.round(dec.confidence * 100)}% AI confidence
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                <button
                  onClick={() => toggleApproveDecision(dec.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    dec.approved
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{dec.approved ? 'Approved' : 'Approve'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Suggested Action Items */}
      <section className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Suggested Action Items</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Commitments assigned with suggested owner and deadlines.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            {approvedActionsCount} of {pendingDraft.detectedActions.length} Approved
          </span>
        </div>

        <div className="divide-y divide-neutral-100">
          {pendingDraft.detectedActions.map((action) => {
            const owner = teamMembers.find((m) => m.id === action.ownerId);
            const isEditing = editingActionId === action.id;

            return (
              <div
                key={action.id}
                className={`p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors ${
                  action.approved ? 'bg-white' : 'bg-neutral-50/60 opacity-60'
                }`}
              >
                <div className="space-y-2 flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div>
                        <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                          Task Title
                        </label>
                        <input
                          type="text"
                          value={action.title}
                          onChange={(e) =>
                            updateDraftAction(action.id, { title: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-md"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                            Owner
                          </label>
                          <select
                            value={action.ownerId}
                            onChange={(e) =>
                              updateDraftAction(action.id, { ownerId: e.target.value })
                            }
                            className="w-full px-2 py-1 text-xs bg-white border border-neutral-200 rounded-md"
                          >
                            {teamMembers.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                            Deadline
                          </label>
                          <input
                            type="text"
                            value={action.dueDate}
                            onChange={(e) =>
                              updateDraftAction(action.id, { dueDate: e.target.value })
                            }
                            className="w-full px-2.5 py-1 text-xs bg-white border border-neutral-200 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                            Priority
                          </label>
                          <select
                            value={action.priority}
                            onChange={(e) =>
                              updateDraftAction(action.id, {
                                priority: e.target.value as Priority,
                              })
                            }
                            className="w-full px-2 py-1 text-xs bg-white border border-neutral-200 rounded-md"
                          >
                            <option value="Urgent">Urgent</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingActionId(null)}
                        className="text-xs text-indigo-600 font-semibold"
                      >
                        Done Editing
                      </button>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 leading-snug">
                        {action.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 flex-wrap">
                        <span className="flex items-center gap-1.5 font-medium text-neutral-800">
                          <Avatar
                            name={owner?.name || 'Owner'}
                            size="xs"
                            colorClass={owner?.avatarColor}
                          />
                          <span>{owner?.name}</span>
                        </span>
                        <span aria-hidden="true" className="text-neutral-300">·</span>
                        <span className="font-mono">Due: {action.dueDate}</span>
                        <span aria-hidden="true" className="text-neutral-300">·</span>
                        <PriorityBadge priority={action.priority} />
                        <span aria-hidden="true" className="text-neutral-300">·</span>
                        <span className="text-[11px] font-mono text-indigo-700">
                          {Math.round(action.confidence * 100)}% AI confidence
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                  {!isEditing && (
                    <button
                      onClick={() => setEditingActionId(action.id)}
                      className="px-2.5 py-1 text-xs text-neutral-500 hover:text-neutral-800 rounded hover:bg-neutral-100 transition-colors"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => toggleApproveAction(action.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      action.approved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{action.approved ? 'Approved' : 'Approve'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Publish Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <button
          onClick={cancelDraft}
          className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          Cancel & Return
        </button>

        <button
          onClick={publishDraftMeeting}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>Publish Official Meeting Workspace ({approvedActionsCount} tasks, {approvedDecisionsCount} decisions)</span>
        </button>
      </div>
    </div>
  );
};
