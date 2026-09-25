import React, { useState } from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import { Avatar } from '../ui/Avatar';
import { PriorityBadge, StatusBadge } from '../ui/StatusBadge';
import { TranscriptView } from './TranscriptView';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit2,
  FileText,
  Lightbulb,
  MoreVertical,
  Plus,
  Share2,
  Sparkles,
  Users,
  Check,
} from 'lucide-react';

export const MeetingDetailScreen: React.FC = () => {
  const {
    selectedMeeting,
    setCurrentScreen,
    activeMeetingTab,
    setActiveMeetingTab,
    toggleTaskComplete,
    setTaskToEdit,
    setIsTaskModalOpen,
    teamMembers,
  } = useMeetingFlow();

  const [copiedShare, setCopiedShare] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  if (!selectedMeeting) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-neutral-500">Meeting not found.</p>
        <button
          onClick={() => setCurrentScreen('meetings')}
          className="mt-4 px-4 py-2 text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          Return to meetings
        </button>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleExport = (format: 'markdown' | 'brief') => {
    const brief = `# ${selectedMeeting.title}
Date: ${selectedMeeting.date} (${selectedMeeting.time}, ${selectedMeeting.duration})
Participants: ${selectedMeeting.participantIds
      .map((pid) => teamMembers.find((t) => t.id === pid)?.name || pid)
      .join(', ')}

## Executive Summary
${selectedMeeting.summary}

## Key Decisions
${selectedMeeting.keyDecisions.map((d, i) => `${i + 1}. ${d}`).join('\n')}

## Action Items
${selectedMeeting.actionItems
  .map(
    (a) =>
      `- [${a.status === 'Completed' ? 'x' : ' '}] ${a.title} (Owner: ${a.ownerName}, Due: ${a.dueDate}, Priority: ${a.priority})`
  )
  .join('\n')}
`;

    const blob = new Blob([brief], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedMeeting.title.toLowerCase().replace(/\s+/g, '-')}-summary.md`;
    link.click();
    URL.revokeObjectURL(url);

    setExportNotice('Exported Markdown executive brief.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentScreen('meetings')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Meetings</span>
        </button>

        {exportNotice && (
          <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            {exportNotice}
          </span>
        )}
      </div>

      {/* Header & Metadata */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                {selectedMeeting.project}
              </span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>{selectedMeeting.status}</span>
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              {selectedMeeting.title}
            </h1>

            {/* Unboxed Metadata with Typographic Separators */}
            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-2 flex-wrap">
              <span>{selectedMeeting.date}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedMeeting.time}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedMeeting.duration}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedMeeting.participantIds.length} participants</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Share</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleExport('brief')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Participants Row */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-neutral-500">Participants:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {selectedMeeting.participantIds.map((pid) => {
                const member = teamMembers.find((t) => t.id === pid);
                return (
                  <div
                    key={pid}
                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-neutral-50 border border-neutral-200/60 rounded-md text-xs text-neutral-700"
                  >
                    <Avatar
                      name={member?.name || 'Member'}
                      initials={member?.initials}
                      colorClass={member?.avatarColor}
                      size="xs"
                    />
                    <span>{member?.name || 'Member'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-neutral-500">
            <span>{selectedMeeting.decisionsCount} decisions</span>
            <span>·</span>
            <span>{selectedMeeting.actionsCount} actions</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex items-center gap-8 -mb-px">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'transcript', label: 'Transcript' },
            { id: 'decisions', label: `Decisions (${selectedMeeting.decisions?.length || 0})` },
            { id: 'action_items', label: `Action Items (${selectedMeeting.actionItems?.length || 0})` },
          ].map((tab) => {
            const isActive = activeMeetingTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMeetingTab(tab.id as any)}
                className={`py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700 font-semibold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeMeetingTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-semibold text-neutral-900">Executive Summary</h2>
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed">
              {selectedMeeting.summary}
            </p>
          </div>

          {/* Key Decisions */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-neutral-900">Key Decisions</h2>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {selectedMeeting.keyDecisions.length} recorded
              </span>
            </div>

            <ol className="divide-y divide-neutral-100 text-xs sm:text-sm text-neutral-800">
              {selectedMeeting.keyDecisions.map((decision, index) => {
                const linkedDecision = selectedMeeting.decisions[index];
                return (
                  <li key={index} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                    <span className="w-5 h-5 rounded bg-neutral-100 font-mono text-xs font-semibold text-neutral-600 flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900">{decision}</p>
                      {linkedDecision?.context && (
                        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                          Context: {linkedDecision.context}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Action Items Table */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">Action Items</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Extracted commitments with direct ownership and deadlines.
                </p>
              </div>
              <button
                onClick={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Task</span>
              </button>
            </div>

            {selectedMeeting.actionItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                No action items recorded for this meeting.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50/70 border-b border-neutral-100 text-neutral-500 font-medium">
                    <tr>
                      <th className="py-3 px-5 w-8"></th>
                      <th className="py-3 px-3">Task</th>
                      <th className="py-3 px-4">Owner</th>
                      <th className="py-3 px-4">Deadline</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {selectedMeeting.actionItems.map((task) => {
                      const isCompleted = task.status === 'Completed';
                      const owner = teamMembers.find((m) => m.id === task.ownerId);

                      return (
                        <tr
                          key={task.id}
                          className="hover:bg-neutral-50/80 transition-colors group"
                        >
                          <td className="py-3.5 px-5">
                            <button
                              onClick={() => toggleTaskComplete(task.id)}
                              className="text-neutral-300 hover:text-emerald-600 transition-colors"
                            >
                              <CheckCircle2
                                className={`w-4 h-4 ${
                                  isCompleted ? 'text-emerald-600 fill-emerald-50' : ''
                                }`}
                              />
                            </button>
                          </td>
                          <td className="py-3.5 px-3 font-medium text-neutral-900">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                onClick={() => {
                                  setTaskToEdit(task);
                                  setIsTaskModalOpen(true);
                                }}
                                className={`cursor-pointer hover:text-indigo-600 transition-colors ${
                                  isCompleted ? 'line-through text-neutral-400' : ''
                                }`}
                              >
                                {task.title}
                              </span>

                              {task.dependsOnTaskIds && task.dependsOnTaskIds.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/80">
                                  <span>{task.dependsOnTaskIds.length} sub-task dep{task.dependsOnTaskIds.length > 1 ? 's' : ''}</span>
                                </span>
                              )}
                            </div>
                            {task.context && (
                              <p className="text-[11px] text-neutral-400 font-normal mt-0.5 line-clamp-1">
                                {task.context}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Avatar
                                name={task.ownerName}
                                size="xs"
                                colorClass={owner?.avatarColor || 'bg-neutral-700 text-white'}
                              />
                              <span className="text-neutral-700">{task.ownerName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap font-mono text-neutral-600">
                            {task.dueDate}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <PriorityBadge priority={task.priority} />
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <StatusBadge status={task.status} />
                          </td>
                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                setTaskToEdit(task);
                                setIsTaskModalOpen(true);
                              }}
                              className="text-xs text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 px-2 py-1 rounded transition-colors"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transcript Tab */}
      {activeMeetingTab === 'transcript' && <TranscriptView meeting={selectedMeeting} />}

      {/* Decisions Tab */}
      {activeMeetingTab === 'decisions' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs divide-y divide-neutral-100">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Decisions Logged for this Meeting</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Permanent record to prevent revisiting resolved debates.
              </p>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              {selectedMeeting.decisions.length} Active
            </span>
          </div>

          {selectedMeeting.decisions.map((decision) => (
            <div key={decision.id} className="p-6 space-y-3 hover:bg-neutral-50/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 leading-snug">
                      {decision.text}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                      <span>Recorded {decision.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>Category: {decision.category || 'Product'}</span>
                      {decision.confidence && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-indigo-600 font-mono">
                            {Math.round(decision.confidence * 100)}% AI confidence
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                  {decision.status}
                </span>
              </div>

              <div className="bg-neutral-50 p-3.5 rounded-lg border border-neutral-100 text-xs text-neutral-600 leading-relaxed">
                <span className="font-semibold text-neutral-700">Context & Rationale: </span>
                {decision.context}
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-500 pt-1">
                <span className="font-medium text-neutral-600">Participants in agreement:</span>
                <span>{decision.participants.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Items Tab */}
      {activeMeetingTab === 'action_items' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">All Action Items for this Meeting</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Keep the team focused on execution commitments.
              </p>
            </div>
            <button
              onClick={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Action Item</span>
            </button>
          </div>

          <div className="divide-y divide-neutral-100">
            {selectedMeeting.actionItems.map((task) => {
              const isCompleted = task.status === 'Completed';
              const owner = teamMembers.find((m) => m.id === task.ownerId);

              return (
                <div
                  key={task.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/60 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="mt-0.5 text-neutral-300 hover:text-emerald-600 transition-colors shrink-0"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          isCompleted ? 'text-emerald-600 fill-emerald-50' : ''
                        }`}
                      />
                    </button>
                    <div>
                      <span
                        onClick={() => {
                          setTaskToEdit(task);
                          setIsTaskModalOpen(true);
                        }}
                        className={`text-xs font-semibold text-neutral-900 hover:text-indigo-600 cursor-pointer ${
                          isCompleted ? 'line-through text-neutral-400' : ''
                        }`}
                      >
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Avatar
                            name={task.ownerName}
                            size="xs"
                            colorClass={owner?.avatarColor}
                          />
                          <span>{task.ownerName}</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">Due: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                    <button
                      onClick={() => {
                        setTaskToEdit(task);
                        setIsTaskModalOpen(true);
                      }}
                      className="text-xs text-neutral-400 hover:text-neutral-700 px-2 py-1 rounded hover:bg-neutral-100"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
