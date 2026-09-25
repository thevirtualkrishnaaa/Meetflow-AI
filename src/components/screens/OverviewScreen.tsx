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
  } = useMeetingFlow();

  const urgentTasks = actionItems
    .filter((a) => a.status === 'Overdue' || a.dueDate.toLowerCase().includes('today') || a.priority === 'High')
    .slice(0, 5);

  const overdueCount = actionItems.filter((a) => a.status === 'Overdue').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Good morning, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Here's what needs your attention today.
          </p>
        </div>
        <button
          onClick={() => setIsStartMeetingOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Start Meeting</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Meetings This Week */}
        <div
          onClick={() => setCurrentScreen('meetings')}
          className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Meetings This Week</span>
            <Calendar className="w-4 h-4 text-neutral-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900">
            12
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
            <span>4 scheduled today</span>
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
            27
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
            <span>Across 6 active projects</span>
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
            {overdueCount > 0 ? overdueCount : 4}
          </div>
          <div className="text-[11px] text-rose-600/80 mt-1 font-medium">
            Requires follow-up resolution
          </div>
        </div>

        {/* Decisions This Week */}
        <div
          onClick={() => setCurrentScreen('decisions')}
          className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Decisions This Week</span>
            <Lightbulb className="w-4 h-4 text-neutral-400 group-hover:text-amber-500 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900">
            18
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Logged & aligned in consensus
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
                      className={`w-4 h-4 ${isCompleted ? 'text-emerald-600 fill-emerald-50' : 'text-neutral-300'}`}
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

                      {task.dependsOnTaskIds && task.dependsOnTaskIds.length > 0 && (() => {
                        const pendingCount = task.dependsOnTaskIds.filter((id) => {
                          const dep = actionItems.find((a) => a.id === id);
                          return dep && dep.status !== 'Completed';
                        }).length;

                        return pendingCount > 0 && !isCompleted ? (
                          <span
                            onClick={() => setCurrentScreen('action_items')}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 cursor-pointer hover:bg-amber-100"
                            title="Click to view dependency in Action Items"
                          >
                            <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                            <span>Waiting on {pendingCount} sub-task{pendingCount > 1 ? 's' : ''}</span>
                          </span>
                        ) : null;
                      })()}
                    </div>

                    {/* Metadata line with typographic separator */}
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1 flex-wrap">
                      <span className="font-medium text-neutral-700 flex items-center gap-1.5">
                        <Avatar
                          name={task.ownerName}
                          size="xs"
                          colorClass={owner?.avatarColor || 'bg-neutral-700 text-white'}
                        />
                        <span>{task.ownerName}</span>
                      </span>
                      <span aria-hidden="true" className="text-neutral-300">·</span>
                      <span
                        onClick={() => openMeetingDetail(task.meetingId)}
                        className="hover:text-indigo-600 cursor-pointer truncate"
                      >
                        {task.meetingTitle}
                      </span>
                      <span aria-hidden="true" className="text-neutral-300">·</span>
                      <span
                        className={`font-mono text-[11px] ${
                          task.status === 'Overdue'
                            ? 'text-rose-600 font-semibold'
                            : task.dueDate.toLowerCase() === 'today'
                            ? 'text-amber-700 font-semibold'
                            : 'text-neutral-500'
                        }`}
                      >
                        Due: {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
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
                      <span className="text-[11px] font-normal text-neutral-400">({meeting.duration})</span>
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
      </section>
    </div>
  );
};
