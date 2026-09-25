import React, { useState } from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import { Avatar } from '../ui/Avatar';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Video,
  AlertCircle,
  Sparkles,
  Check,
  Send,
} from 'lucide-react';

export const ReportsScreen: React.FC = () => {
  const { actionItems, meetings, teamMembers, currentUser, setCurrentScreen } =
    useMeetingFlow();

  const [copiedNudgeId, setCopiedNudgeId] = useState<string | null>(null);

  const totalTasks = actionItems.length;
  const completedTasks = actionItems.filter((t) => t.status === 'Completed').length;
  const openTasks = actionItems.filter((t) => t.status !== 'Completed').length;
  const todayTasks = actionItems.filter(
    (t) => t.status !== 'Completed' && t.dueDate.toLowerCase().includes('today')
  ).length;

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  // Build team member follow-up status
  const memberFollowUps = teamMembers.map((member) => {
    const memberTasks = actionItems.filter((t) => t.ownerId === member.id);
    const memberCompleted = memberTasks.filter((t) => t.status === 'Completed').length;
    const memberOpen = memberTasks.filter((t) => t.status !== 'Completed').length;
    const memberDueToday = memberTasks.filter(
      (t) => t.status !== 'Completed' && t.dueDate.toLowerCase().includes('today')
    ).length;

    let status: 'All Clear' | 'On Track' | 'Needs Follow-up' = 'All Clear';
    if (memberDueToday > 0) {
      status = 'Needs Follow-up';
    } else if (memberOpen > 0) {
      status = 'On Track';
    }

    return {
      member,
      total: memberTasks.length,
      open: memberOpen,
      completed: memberCompleted,
      dueToday: memberDueToday,
      status,
    };
  });

  const handleSendNudge = (memberId: string, memberName: string) => {
    const text = `Hi ${memberName}, checking in from Foundermatcha regarding your workshop tasks due today. Let me know if you need any unblocking!`;
    navigator.clipboard.writeText(text);
    setCopiedNudgeId(memberId);
    setTimeout(() => setCopiedNudgeId(null), 2500);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Weekly Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Weekly task completion analytics, team member follow-up tracking, and workshop velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentScreen('video_room')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-950 bg-[#78c452] hover:bg-[#67b342] rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Launch Video Meeting</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-semibold">Weekly Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-neutral-900 mt-1">{completionRate}%</div>
          <p className="text-xs text-neutral-400 mt-1">
            {completedTasks} of {totalTasks} deliverables done
          </p>
          <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#78c452] h-full rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-semibold">Tasks Due Today</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-600 mt-1">{todayTasks}</div>
          <p className="text-xs text-neutral-400 mt-1">
            {todayTasks > 0 ? 'Requires immediate team follow-up' : 'All clear for today!'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-semibold">Open Deliverables</span>
            <TrendingUp className="w-4 h-4 text-[#4b8b29]" />
          </div>
          <div className="text-3xl font-black text-neutral-900 mt-1">{openTasks}</div>
          <p className="text-xs text-neutral-400 mt-1">Across active team members</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-semibold">Video Meetings Held</span>
            <Video className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-3xl font-black text-neutral-900 mt-1">{meetings.length}</div>
          <p className="text-xs text-neutral-400 mt-1">AI summarized workshops</p>
        </div>
      </div>

      {/* Follow-up Tracker: Team Accountability Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Team Member Follow-Up Tracker
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live status on who has open commitments, tasks due today, and follow-up reminders.
            </p>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            {teamMembers.length} team members active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-5">Team Member & Role</th>
                <th className="py-3 px-4">Open Tasks</th>
                <th className="py-3 px-4">Due Today</th>
                <th className="py-3 px-4">Completed</th>
                <th className="py-3 px-4">Follow-Up Status</th>
                <th className="py-3 px-5 text-right">Quick Follow-Up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {memberFollowUps.map((item) => (
                <tr key={item.member.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={item.member.name}
                        size="sm"
                      />
                      <div>
                        <div className="font-bold text-neutral-900">
                          {item.member.name} {item.member.id === currentUser.id && '(You)'}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          {item.member.role || 'Team Member'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-neutral-900">
                    {item.open}
                  </td>

                  <td className="py-3.5 px-4">
                    {item.dueToday > 0 ? (
                      <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        {item.dueToday} today
                      </span>
                    ) : (
                      <span className="text-neutral-400">0</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-emerald-600 font-semibold">
                    {item.completed}
                  </td>

                  <td className="py-3.5 px-4">
                    {item.status === 'Needs Follow-up' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Needs Follow-up
                      </span>
                    ) : item.status === 'On Track' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        On Track
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        All Clear
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    {item.member.id !== currentUser.id && item.dueToday > 0 ? (
                      <button
                        onClick={() => handleSendNudge(item.member.id, item.member.name)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                        title="Copy reminder message"
                      >
                        {copiedNudgeId === item.member.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>Follow Up</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-[11px] text-neutral-400 font-mono">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Meeting Reports & AI Summaries */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#4b8b29]" />
            <h3 className="text-sm font-bold text-neutral-900">
              Recent Meeting Reports & AI Summaries
            </h3>
          </div>
          <button
            onClick={() => setCurrentScreen('meetings')}
            className="text-xs text-[#4b8b29] hover:underline font-semibold cursor-pointer"
          >
            View All ({meetings.length})
          </button>
        </div>

        {meetings.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500 space-y-2">
            <Video className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="font-semibold text-neutral-700">No meeting reports recorded yet.</p>
            <p className="text-[11px] text-neutral-400">
              When you hold video calls, the AI will automatically generate complete reports and add them here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.slice(0, 3).map((meeting) => (
              <div
                key={meeting.id}
                className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between font-bold text-neutral-900">
                  <span className="flex items-center gap-2">
                    <Video className="w-3.5 h-3.5 text-[#4b8b29]" />
                    {meeting.title}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono font-normal">
                    {meeting.date} • {meeting.duration}
                  </span>
                </div>
                <p className="text-neutral-600 leading-relaxed">{meeting.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
