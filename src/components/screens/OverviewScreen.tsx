import React from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import { Avatar } from '../ui/Avatar';
import { PriorityBadge, StatusBadge } from '../ui/StatusBadge';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  Lightbulb,
  Plus,
  Users,
  Sparkles,
  UserPlus,
  Compass,
} from 'lucide-react';

export const OverviewScreen: React.FC = () => {
  const {
    currentUser,
    actionItems,
    meetings,
    decisions,
    setIsStartMeetingOpen,
    openMeetingDetail,
    toggleTaskComplete,
    setTaskToEdit,
    setIsTaskModalOpen,
    setCurrentScreen,
    teamMembers,
    setIsAddMemberModalOpen,
    loadSampleData,
    workspaceProfile,
  } = useMeetingFlow();

  const openTasksCount = actionItems.filter((a) => a.status !== 'Completed').length;
  const overdueCount = actionItems.filter((a) => a.status === 'Overdue').length;
  const meetingsCount = meetings.length;
  const decisionsCount = decisions.length;

  const urgentTasks = actionItems
    .filter(
      (a) =>
        a.status === 'Overdue' ||
        a.dueDate.toLowerCase().includes('today') ||
        a.priority === 'High' ||
        a.priority === 'Urgent'
    )
    .slice(0, 5);

  const isFreshWorkspace = meetings.length === 0 && actionItems.length === 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#78c452]/20 text-[#4b8b29] font-bold border border-[#78c452]/30 uppercase tracking-wider">
              Foundermatcha Executive OS
            </span>
            <span className="text-xs text-neutral-400 font-mono">Sanctuary Mode Active</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900">
            Founder & Engineering Executive Hub
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Everyday online video meetings, psychology-backed alignment, and accountable action delivery.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setCurrentScreen('video_room')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-all shadow-md group active:scale-95"
          >
            <div className="w-2 h-2 rounded-full bg-[#78c452] animate-ping" />
            <span className="text-[#78c452]">Launch Video Room</span>
          </button>
          <button
            onClick={() => setIsAddMemberModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl transition-colors shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-neutral-500" />
            <span>Add Role</span>
          </button>
          <button
            onClick={() => setIsStartMeetingOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-neutral-950 bg-[#78c452] hover:bg-[#67b342] rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Sync</span>
          </button>
        </div>
      </div>

      {/* Flagship: Foundermatcha Everyday Video Huddle Card */}
      <div className="rounded-2xl p-6 sm:p-7 bg-gradient-to-r from-neutral-950 via-neutral-900 to-[#121c10] text-white shadow-xl border border-neutral-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#78c452]/20 text-[#78c452] border border-[#78c452]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#78c452] animate-pulse" />
                EVERYDAY HUDDLE SUITE
              </span>
              <span className="text-xs text-neutral-400 font-mono">3-Min Standup Protocol</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Start Today's Founder & Tech Co-Founder Video Sync
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Connect camera and mic, share architectural screens, review yesterday's deliverables, and let our
              live note-taker extract decisions and action items in real time.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 pt-1 font-mono">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="text-[#78c452]">●</span> 6 Company Roles Active
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="text-[#78c452]">●</span> Live AI Diarization
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="text-[#78c452]">●</span> End-to-End Encrypted
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => setCurrentScreen('video_room')}
              className="px-6 py-3 rounded-xl bg-[#78c452] hover:bg-[#67b342] text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#78c452]/20 transition-all active:scale-95 cursor-pointer"
            >
              <span>Enter Video Room Now</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={() => setIsStartMeetingOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-semibold text-xs border border-neutral-700/80 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Upload / Paste Transcript</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fresh Workspace Welcome & Onboarding Banner */}
      {isFreshWorkspace && (
        <div className="bg-linear-to-r from-indigo-900 via-indigo-950 to-neutral-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Workspace Initialized & Ready</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Welcome to your new live workspace!
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              You are all set with a clean slate. You can now invite your real team members, record or
              paste live meetings, and let Gemini extract decisions and action items automatically.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-100 rounded-xl transition-all shadow-sm"
              >
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>Invite Teammates</span>
              </button>
              <button
                onClick={() => setIsStartMeetingOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Capture First Meeting</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Meetings Logged */}
        <div
          onClick={() => setCurrentScreen('meetings')}
          className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Recorded Meetings</span>
            <Calendar className="w-4 h-4 text-neutral-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900">
            {meetingsCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
            <span>{meetingsCount === 0 ? 'No meetings yet' : `${meetingsCount} indexed`}</span>
          </div>
        </div>

        {/* Open Action Items */}
        <div
          onClick={() => setCurrentScreen('action_items')}
          className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Open Action Items</span>
            <CheckSquare className="w-4 h-4 text-neutral-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900">
            {openTasksCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
            <span>Across team members</span>
          </div>
        </div>

        {/* Overdue */}
        <div
          onClick={() => setCurrentScreen('action_items')}
          className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-2xs hover:border-rose-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium text-rose-700">Overdue</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-rose-600">
            {overdueCount}
          </div>
          <div className="text-[11px] text-rose-600/80 mt-1 font-medium">
            {overdueCount === 0 ? 'All tasks on schedule' : 'Requires follow-up resolution'}
          </div>
        </div>

        {/* Decisions Logged */}
        <div
          onClick={() => setCurrentScreen('decisions')}
          className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Decisions Logged</span>
            <Lightbulb className="w-4 h-4 text-neutral-400 group-hover:text-amber-500 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900">
            {decisionsCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            {decisionsCount === 0 ? 'Extracted automatically' : 'Aligned in consensus'}
          </div>
        </div>
      </div>

      {/* Needs Your Attention Section */}
      <section className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Needs Your Attention</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Urgent tasks with impending deadlines or overdue status.
            </p>
          </div>
          <button
            onClick={() => setCurrentScreen('action_items')}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
          >
            <span>View all action items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {urgentTasks.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-semibold text-neutral-900">No urgent tasks right now</h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {openTasksCount === 0
                ? 'Your task board is clear. Start a meeting to extract new commitments.'
                : 'All open tasks are within their target deadlines.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {urgentTasks.map((task) => {
              const isCompleted = task.status === 'Completed';
              const owner = teamMembers.find((m) => m.id === task.ownerId);

              return (
                <div
                  key={task.id}
                  className="p-4 hover:bg-neutral-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="mt-0.5 text-neutral-400 hover:text-emerald-600 transition-colors shrink-0"
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          isCompleted ? 'text-emerald-600 fill-emerald-50' : 'text-neutral-300'
                        }`}
                      />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => {
                            setTaskToEdit(task);
                            setIsTaskModalOpen(true);
                          }}
                          className={`text-xs font-semibold text-neutral-900 hover:text-indigo-600 cursor-pointer truncate ${
                            isCompleted ? 'line-through text-neutral-400' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-[11px] text-neutral-500">
                        <span className="truncate">Meeting: {task.meetingTitle}</span>
                        <span>·</span>
                        <span className="font-mono text-neutral-600">Due {task.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />

                    <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-100">
                      <Avatar
                        name={task.ownerName}
                        initials={owner?.initials}
                        colorClass={owner?.avatarColor}
                        size="xs"
                      />
                      <span className="text-xs text-neutral-700 font-medium">
                        {task.ownerName}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setTaskToEdit(task);
                        setIsTaskModalOpen(true);
                      }}
                      className="text-xs text-neutral-400 hover:text-neutral-700 px-2 py-1 rounded hover:bg-neutral-100 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Meetings Section */}
      <section className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Recent Meetings</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Conversations processed with decisions and actions extracted.
            </p>
          </div>
          <button
            onClick={() => setCurrentScreen('meetings')}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
          >
            <span>View all meetings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {meetings.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-2.5">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-semibold text-neutral-900">No meetings recorded yet</h3>
            <p className="text-[11px] text-neutral-500 mt-0.5 max-w-sm mx-auto">
              Start your first meeting to transcribe audio or paste discussion notes.
            </p>
            <button
              onClick={() => setIsStartMeetingOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record or Import Meeting</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/70 border-b border-neutral-100 text-neutral-500 font-medium">
                <tr>
                  <th className="py-3 px-5">Meeting</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Participants</th>
                  <th className="py-3 px-4 text-right">Decisions</th>
                  <th className="py-3 px-4 text-right">Action Items</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {meetings.slice(0, 4).map((meeting) => (
                  <tr
                    key={meeting.id}
                    onClick={() => openMeetingDetail(meeting.id)}
                    className="hover:bg-neutral-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-5 font-semibold text-neutral-900 group-hover:text-indigo-600 transition-colors">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400 group-hover:text-indigo-600 shrink-0" />
                        <span>{meeting.title}</span>
                        <span className="text-[11px] font-normal text-neutral-400">
                          ({meeting.duration})
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">
                      {meeting.displayDate} · {meeting.time}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600">
                      <div className="flex items-center -space-x-1.5">
                        {meeting.participantIds.slice(0, 4).map((pid) => {
                          const m = teamMembers.find((t) => t.id === pid);
                          return (
                            <Avatar
                              key={pid}
                              name={m?.name || 'User'}
                              initials={m?.initials}
                              colorClass={m?.avatarColor}
                              size="xs"
                              className="ring-2 ring-white"
                            />
                          );
                        })}
                        {meeting.participantIds.length > 4 && (
                          <span className="w-5 h-5 rounded-md bg-neutral-100 text-[10px] font-mono text-neutral-600 flex items-center justify-center ring-2 ring-white">
                            +{meeting.participantIds.length - 4}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-neutral-700">
                      {meeting.decisionsCount} decisions
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-neutral-700">
                      {meeting.actionsCount} actions
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>{meeting.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
