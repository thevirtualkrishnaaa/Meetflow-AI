import React, { useState } from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import { Avatar } from '../ui/Avatar';
import { PriorityBadge, StatusBadge } from '../ui/StatusBadge';
import { ActionItem, Decision, Meeting, TeamMember } from '../../types';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Lightbulb,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';

const DEPARTMENTS = [
  'All',
  'Leadership',
  'Product',
  'Engineering',
  'Operations',
  'Marketing',
  'Design',
];

interface MemberActivityItem {
  id: string;
  type:
    | 'task_completed'
    | 'task_in_progress'
    | 'task_overdue'
    | 'meeting_attended'
    | 'decision_agreed'
    | 'workspace_joined';
  title: string;
  subtitle: string;
  badgeText: string;
  badgeColor: string;
  timestamp: string;
  meetingId?: string;
  actionItemId?: string;
}

export const TeamScreen: React.FC = () => {
  const {
    teamMembers,
    actionItems,
    meetings,
    decisions,
    setTaskToEdit,
    setIsTaskModalOpen,
    toggleTaskComplete,
    deleteTeamMember,
    setIsAddMemberModalOpen,
    openMeetingDetail,
    currentUser,
    workspaceProfile,
  } = useMeetingFlow();

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'tasks' | 'activity'>('activity');
  const [activityFilter, setActivityFilter] = useState<
    'all' | 'tasks' | 'meetings' | 'decisions'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  const selectedMember = teamMembers.find((m) => m.id === selectedMemberId);

  // Generate recent activity items for a member
  const getMemberActivities = (member: TeamMember): MemberActivityItem[] => {
    const list: MemberActivityItem[] = [];

    // 1. Completed tasks
    const completedTasks = actionItems.filter(
      (a) => a.ownerId === member.id && a.status === 'Completed'
    );
    completedTasks.forEach((t) => {
      list.push({
        id: `act-comp-${t.id}`,
        type: 'task_completed',
        title: `Completed action item: "${t.title}"`,
        subtitle: `Meeting source: ${t.meetingTitle}`,
        badgeText: 'Completed',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        timestamp: t.completedAt || 'Earlier this week',
        meetingId: t.meetingId,
        actionItemId: t.id,
      });
    });

    // 2. Active or Overdue tasks
    const activeTasks = actionItems.filter(
      (a) => a.ownerId === member.id && a.status !== 'Completed'
    );
    activeTasks.forEach((t) => {
      const isOverdue = t.status === 'Overdue';
      list.push({
        id: `act-active-${t.id}`,
        type: isOverdue ? 'task_overdue' : 'task_in_progress',
        title: isOverdue
          ? `Overdue commitment: "${t.title}"`
          : `Actively working on: "${t.title}"`,
        subtitle: `Source: ${t.meetingTitle} · Priority: ${t.priority}`,
        badgeText: isOverdue ? 'Overdue' : 'In Progress',
        badgeColor: isOverdue
          ? 'bg-rose-50 text-rose-700 border-rose-200'
          : 'bg-blue-50 text-blue-700 border-blue-200',
        timestamp: `Due ${t.dueDate}`,
        meetingId: t.meetingId,
        actionItemId: t.id,
      });
    });

    // 3. Meetings attended
    const attendedMeetings = meetings.filter((m) => m.participantIds.includes(member.id));
    attendedMeetings.forEach((m) => {
      list.push({
        id: `act-meet-${m.id}`,
        type: 'meeting_attended',
        title: `Participated in ${m.title}`,
        subtitle: `${m.duration} · ${m.decisionsCount} decisions reached · ${m.actionsCount} actions`,
        badgeText: 'Meeting Attendance',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        timestamp: `${m.displayDate} at ${m.time}`,
        meetingId: m.id,
      });
    });

    // 4. Decisions agreed
    const firstName = member.name.split(' ')[0].toLowerCase();
    const agreedDecisions = decisions.filter((d) =>
      d.participants.some(
        (p) =>
          p.toLowerCase().includes(firstName) ||
          p.toLowerCase().includes(member.name.toLowerCase())
      )
    );
    agreedDecisions.forEach((d) => {
      list.push({
        id: `act-dec-${d.id}`,
        type: 'decision_agreed',
        title: `Aligned on key decision: "${d.text}"`,
        subtitle: `Meeting: ${d.meetingTitle} · Context: ${d.context.slice(0, 75)}...`,
        badgeText: 'Key Decision',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        timestamp: d.date,
        meetingId: d.meetingId,
      });
    });

    // 5. Workspace milestone
    list.push({
      id: `act-join-${member.id}`,
      type: 'workspace_joined',
      title: `Joined ${workspaceProfile.name} as ${member.role}`,
      subtitle: `${member.department || 'General'} Department · Work email: ${member.email}`,
      badgeText: 'Team Member',
      badgeColor: 'bg-neutral-100 text-neutral-700 border-neutral-200',
      timestamp: member.joinedDate || 'Sep 2026',
    });

    return list;
  };

  // Recalculate member task metrics and latest activity
  const membersWithMetrics = teamMembers.map((member) => {
    const memberTasks = actionItems.filter((a) => a.ownerId === member.id);
    const openTasks = memberTasks.filter(
      (a) => a.status === 'Open' || a.status === 'In Progress'
    ).length;
    const overdueTasks = memberTasks.filter((a) => a.status === 'Overdue').length;
    const completedTasks = memberTasks.filter((a) => a.status === 'Completed').length;
    const total = openTasks + overdueTasks + completedTasks;
    const completionRate = total > 0 ? Math.round((completedTasks / total) * 100) : 100;

    const activities = getMemberActivities(member);
    const latestActivity = activities[0] || null;

    return {
      ...member,
      openTasks,
      overdueTasks,
      completedTasks,
      completionRate,
      tasks: memberTasks,
      activities,
      latestActivity,
    };
  });

  // Filtered members
  const filteredMembers = membersWithMetrics.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      selectedDept === 'All' ||
      (m.department && m.department.toLowerCase() === selectedDept.toLowerCase());

    return matchesSearch && matchesDept;
  });

  // KPI calculations
  const totalOpenTasks = membersWithMetrics.reduce((acc, m) => acc + m.openTasks, 0);
  const totalOverdueTasks = membersWithMetrics.reduce((acc, m) => acc + m.overdueTasks, 0);
  const totalCompletedTasks = membersWithMetrics.reduce((acc, m) => acc + m.completedTasks, 0);
  const totalTasks = totalOpenTasks + totalOverdueTasks + totalCompletedTasks;
  const avgCompletionRate =
    totalTasks > 0 ? Math.round((totalCompletedTasks / totalTasks) * 100) : 100;

  const handleDeleteConfirm = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTeamMember(id);
    setMemberToDelete(null);
    if (selectedMemberId === id) {
      setSelectedMemberId(null);
    }
  };

  // Activities for selected member
  const selectedMemberData = membersWithMetrics.find((m) => m.id === selectedMemberId);
  const filteredActivities = (selectedMemberData?.activities || []).filter((act) => {
    if (activityFilter === 'tasks') {
      return (
        act.type === 'task_completed' ||
        act.type === 'task_in_progress' ||
        act.type === 'task_overdue'
      );
    }
    if (activityFilter === 'meetings') {
      return act.type === 'meeting_attended';
    }
    if (activityFilter === 'decisions') {
      return act.type === 'decision_agreed';
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header with Prominent "Invite Team Member" Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Team & Accountability
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Monitor workload distribution, inspect individual contributions, and invite colleagues to turn meetings into actions.
          </p>
        </div>

        {/* Prominent Invite Team Member Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddMemberModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all ring-2 ring-indigo-500/20 active:scale-98 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-indigo-100" />
            <span>Invite Team Member</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Active Roster</span>
            <Users className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2 font-mono">
            {teamMembers.length}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Colleagues across all tracks</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Open Commitments</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-2 font-mono">
            {totalOpenTasks}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">In progress or pending</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Overdue Deliverables</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2 font-mono">
            {totalOverdueTasks}
          </div>
          <p className="text-[11px] text-rose-500/80 mt-1">Requires founder attention</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Avg Follow-Through</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2 font-mono">
            {avgCompletionRate}%
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Completion efficiency</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, role, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-neutral-400"
          />
        </div>

        {/* Department Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors whitespace-nowrap font-medium ${
                selectedDept === dept
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => {
          const isSelected = selectedMemberId === member.id;
          const isConfirmingDelete = memberToDelete === member.id;

          return (
            <div
              key={member.id}
              onClick={() => {
                setSelectedMemberId(isSelected ? null : member.id);
                setActiveDetailTab('activity');
              }}
              className={`bg-white p-5 rounded-xl border transition-all cursor-pointer shadow-2xs hover:border-neutral-300 relative group flex flex-col justify-between ${
                isSelected ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-neutral-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={member.name}
                      initials={member.initials}
                      colorClass={member.avatarColor}
                      size="lg"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-sm font-semibold text-neutral-900 leading-tight">
                          {member.name}
                        </h2>
                        {member.department && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-medium">
                            {member.department}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">{member.role}</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{member.email}</p>
                    </div>
                  </div>

                  {/* Member card actions */}
                  <div className="flex items-center gap-1">
                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                        <span className="text-[10px] text-rose-700 font-medium px-1">Delete?</span>
                        <button
                          onClick={(e) => handleDeleteConfirm(member.id, e)}
                          className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-600 text-white rounded hover:bg-rose-700"
                        >
                          Yes
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMemberToDelete(null);
                          }}
                          className="px-1.5 py-0.5 text-[10px] text-neutral-600 hover:text-neutral-900"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      member.id !== currentUser.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMemberToDelete(member.id);
                          }}
                          title="Remove member"
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Task Counters Grid */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-neutral-100 text-center">
                  <div className="bg-neutral-50 p-2 rounded-lg">
                    <div className="text-[10px] uppercase font-semibold text-neutral-400">
                      Open
                    </div>
                    <div className="text-base font-bold font-mono text-neutral-900 mt-0.5">
                      {member.openTasks}
                    </div>
                  </div>

                  <div
                    className={`p-2 rounded-lg ${
                      member.overdueTasks > 0
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-neutral-50 text-neutral-900'
                    }`}
                  >
                    <div
                      className={`text-[10px] uppercase font-semibold ${
                        member.overdueTasks > 0 ? 'text-rose-600' : 'text-neutral-400'
                      }`}
                    >
                      Overdue
                    </div>
                    <div className="text-base font-bold font-mono mt-0.5">
                      {member.overdueTasks}
                    </div>
                  </div>

                  <div className="bg-neutral-50 p-2 rounded-lg">
                    <div className="text-[10px] uppercase font-semibold text-neutral-400">
                      Done
                    </div>
                    <div className="text-base font-bold font-mono text-neutral-900 mt-0.5">
                      {member.completedTasks}
                    </div>
                  </div>
                </div>

                {/* Follow through rate progress */}
                <div className="mt-3.5 flex items-center justify-between text-xs text-neutral-500">
                  <span>Follow-through Rate</span>
                  <span className="font-mono font-semibold text-neutral-800">
                    {member.completionRate}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-neutral-100 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all"
                    style={{ width: `${member.completionRate}%` }}
                  />
                </div>
              </div>

              {/* Recent Activity Snippet per Team Member */}
              <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-indigo-500" />
                    <span>Recent Activity</span>
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {member.latestActivity?.timestamp || 'Recently active'}
                  </span>
                </div>

                {member.latestActivity ? (
                  <p className="text-xs text-neutral-600 bg-neutral-50/80 p-2 rounded-lg border border-neutral-100 line-clamp-1">
                    {member.latestActivity.title}
                  </p>
                ) : (
                  <p className="text-xs text-neutral-400 italic">No recent activity recorded.</p>
                )}

                {/* Card Quick Action Links */}
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-indigo-600 font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    <span>{isSelected ? 'Viewing details below' : 'View Activity & Tasks'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                  <span className="text-neutral-400 font-mono">
                    {member.activities.length} contributions
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty state card or quick invite card */}
        <div
          onClick={() => setIsAddMemberModalOpen(true)}
          className="border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[260px]"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <UserPlus className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900">Invite Team Member</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs">
            Add engineers, product managers, or founders to assign meeting action items and view their recent activities.
          </p>
          <button
            type="button"
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold shadow-2xs hover:bg-indigo-700"
          >
            + Invite to Workspace
          </button>
        </div>
      </div>

      {/* Selected Member Detail Section with Recent Activity Feed & Assigned Tasks */}
      {selectedMemberId && selectedMemberData && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden mt-8 animate-fadeIn">
          {/* Detail Header */}
          <div className="p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-50/50">
            <div className="flex items-center gap-3">
              <Avatar
                name={selectedMemberData.name}
                initials={selectedMemberData.initials}
                colorClass={selectedMemberData.avatarColor}
                size="lg"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-neutral-900">
                    {selectedMemberData.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-700">
                    {selectedMemberData.department || 'Member'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {selectedMemberData.role} · {selectedMemberData.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Tab Selector: Recent Activity vs Assigned Tasks */}
              <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-xs">
                <button
                  onClick={() => setActiveDetailTab('activity')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                    activeDetailTab === 'activity'
                      ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Recent Activity ({selectedMemberData.activities.length})</span>
                </button>
                <button
                  onClick={() => setActiveDetailTab('tasks')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                    activeDetailTab === 'tasks'
                      ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Assigned Tasks ({selectedMemberData.tasks.length})</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedMemberId(null)}
                className="text-xs text-neutral-500 hover:text-neutral-800 px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          {/* TAB 1: RECENT ACTIVITY FEED */}
          {activeDetailTab === 'activity' && (
            <div className="p-6 space-y-5">
              {/* Activity Feed Sub-Filter */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Contribution & Meeting Timeline</span>
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <span className="text-neutral-400 mr-1">Filter:</span>
                  {(['all', 'tasks', 'meetings', 'decisions'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setActivityFilter(f)}
                      className={`px-2.5 py-1 rounded text-xs capitalize transition-colors ${
                        activityFilter === f
                          ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chronological Activity Feed List */}
              {filteredActivities.length === 0 ? (
                <div className="p-12 text-center text-xs text-neutral-400">
                  No activity found matching the selected filter.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                  {filteredActivities.map((act) => {
                    const isTask =
                      act.type === 'task_completed' ||
                      act.type === 'task_in_progress' ||
                      act.type === 'task_overdue';
                    const isMeeting = act.type === 'meeting_attended';
                    const isDecision = act.type === 'decision_agreed';

                    return (
                      <div key={act.id} className="relative group">
                        {/* Timeline Node Dot */}
                        <div
                          className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-2xs ${
                            act.type === 'task_completed'
                              ? 'bg-emerald-500 text-white'
                              : act.type === 'task_overdue'
                              ? 'bg-rose-500 text-white'
                              : isMeeting
                              ? 'bg-indigo-500 text-white'
                              : isDecision
                              ? 'bg-amber-500 text-white'
                              : 'bg-neutral-500 text-white'
                          }`}
                        >
                          {act.type === 'task_completed' && (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          {act.type === 'task_overdue' && (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {act.type === 'task_in_progress' && <Clock className="w-3 h-3" />}
                          {isMeeting && <Calendar className="w-3 h-3" />}
                          {isDecision && <Lightbulb className="w-3 h-3" />}
                          {act.type === 'workspace_joined' && <Users className="w-3 h-3" />}
                        </div>

                        {/* Activity Card */}
                        <div className="bg-neutral-50/70 hover:bg-neutral-50 p-4 rounded-xl border border-neutral-200 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${act.badgeColor}`}
                              >
                                {act.badgeText}
                              </span>
                              <span className="text-xs font-semibold text-neutral-900">
                                {act.title}
                              </span>
                            </div>
                            <span className="text-[11px] text-neutral-400 font-mono">
                              {act.timestamp}
                            </span>
                          </div>

                          <p className="text-xs text-neutral-600 mt-1.5">{act.subtitle}</p>

                          {/* Interactive links to source meeting or action item */}
                          <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                            {act.meetingId ? (
                              <button
                                onClick={() => openMeetingDetail(act.meetingId!)}
                                className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Open Source Meeting</span>
                              </button>
                            ) : (
                              <span className="text-neutral-400">Workspace Milestone</span>
                            )}

                            {act.actionItemId && (
                              <button
                                onClick={() => {
                                  const targetTask = actionItems.find(
                                    (t) => t.id === act.actionItemId
                                  );
                                  if (targetTask) {
                                    setTaskToEdit(targetTask);
                                    setIsTaskModalOpen(true);
                                  }
                                }}
                                className="text-neutral-500 hover:text-neutral-800 underline"
                              >
                                Edit Action Item
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ASSIGNED TASKS TABLE */}
          {activeDetailTab === 'tasks' && (
            <div className="divide-y divide-neutral-100">
              {selectedMemberData.tasks.length === 0 ? (
                <div className="p-12 text-center text-xs text-neutral-400">
                  No active action items assigned to {selectedMemberData.name}. You can assign tasks in the Action Items screen.
                </div>
              ) : (
                selectedMemberData.tasks.map((task) => {
                  const isCompleted = task.status === 'Completed';

                  return (
                    <div
                      key={task.id}
                      className="p-4 flex items-center justify-between hover:bg-neutral-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
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
                          <div className="text-[11px] text-neutral-400 mt-0.5">
                            Meeting: {task.meetingTitle} · Due: {task.dueDate}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
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
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
