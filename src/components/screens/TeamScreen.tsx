import React, { useState } from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import { Avatar } from '../ui/Avatar';
import {
  UserPlus,
  Users,
  CheckCircle2,
  Clock,
  Trash2,
  Plus,
  Briefcase,
  Mail,
  Building2,
  Video,
} from 'lucide-react';
import { Priority } from '../../types';

export const TeamScreen: React.FC = () => {
  const {
    teamMembers,
    deleteTeamMember,
    currentUser,
    actionItems,
    createTask,
    setIsAddMemberModalOpen,
    setCurrentScreen,
  } = useMeetingFlow();

  const [assigningMemberId, setAssigningMemberId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('Today');
  const [taskPriority, setTaskPriority] = useState<Priority>('High');

  const handleAssignTask = (memberId: string, memberName: string, memberRole: string) => {
    if (!taskTitle.trim()) return;

    createTask({
      title: taskTitle.trim(),
      meetingId: 'adhoc-workshop',
      meetingTitle: 'Workshop Goal',
      ownerId: memberId,
      ownerName: memberName,
      ownerRole: memberRole || 'Team Member',
      dueDate: taskDueDate,
      rawDueDate: new Date().toISOString().split('T')[0],
      priority: taskPriority,
      status: 'Open',
    });

    setTaskTitle('');
    setAssigningMemberId(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Team Members & Roles
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Manage your workshop team, assign company roles, and monitor individual follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddMemberModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-neutral-950 bg-[#78c452] hover:bg-[#67b342] rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Team Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map((member) => {
          const isCurrentUser = member.id === currentUser.id;
          const memberTasks = actionItems.filter((t) => t.ownerId === member.id);
          const openTasks = memberTasks.filter((t) => t.status !== 'Completed').length;
          const dueTodayTasks = memberTasks.filter(
            (t) => t.status !== 'Completed' && t.dueDate.toLowerCase().includes('today')
          ).length;
          const completedTasks = memberTasks.filter((t) => t.status === 'Completed').length;

          return (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-sm transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Member Top Bar */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={member.name}
                      size="md"
                      colorClass={member.avatarColor}
                    />
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                        <span>{member.name}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                            You
                          </span>
                        )}
                      </h3>
                      <div className="text-xs font-semibold text-[#4b8b29] flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3 h-3" />
                        <span>{member.role || 'Team Member'}</span>
                      </div>
                    </div>
                  </div>

                  {!isCurrentUser && (
                    <button
                      onClick={() => deleteTeamMember(member.id)}
                      className="text-neutral-400 hover:text-rose-600 p-1 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
                      title="Remove Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Email & Department */}
                <div className="mt-4 pt-3 border-t border-neutral-100 space-y-1.5 text-xs text-neutral-500">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.department && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{member.department}</span>
                    </div>
                  )}
                </div>

                {/* Task Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-neutral-100 text-center">
                  <div className="bg-neutral-50 p-2 rounded-xl">
                    <div className="text-[10px] text-neutral-400 font-semibold uppercase">Open</div>
                    <div className="text-sm font-bold text-neutral-900 mt-0.5">{openTasks}</div>
                  </div>
                  <div className="bg-amber-50/60 p-2 rounded-xl">
                    <div className="text-[10px] text-amber-700 font-semibold uppercase">Today</div>
                    <div className="text-sm font-bold text-amber-700 mt-0.5">{dueTodayTasks}</div>
                  </div>
                  <div className="bg-emerald-50/60 p-2 rounded-xl">
                    <div className="text-[10px] text-emerald-700 font-semibold uppercase">Done</div>
                    <div className="text-sm font-bold text-emerald-700 mt-0.5">{completedTasks}</div>
                  </div>
                </div>
              </div>

              {/* Quick Assign Task Form / Trigger */}
              <div>
                {assigningMemberId === member.id ? (
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2 text-xs animate-fadeIn">
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="Task or goal title..."
                      autoFocus
                      className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#78c452]"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                        className="bg-white border border-neutral-200 rounded-lg px-2 py-1 text-[11px] text-neutral-700"
                      >
                        <option value="Today">Due Today</option>
                        <option value="Tomorrow">Tomorrow</option>
                        <option value="This Friday">This Friday</option>
                        <option value="Next Week">Next Week</option>
                      </select>
                      <select
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value as Priority)}
                        className="bg-white border border-neutral-200 rounded-lg px-2 py-1 text-[11px] text-neutral-700"
                      >
                        <option value="High">High Priority</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Medium">Medium</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setAssigningMemberId(null)}
                        className="px-2.5 py-1 text-[11px] text-neutral-500 hover:text-neutral-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAssignTask(member.id, member.name, member.role)}
                        className="px-3 py-1 text-[11px] font-bold text-neutral-950 bg-[#78c452] hover:bg-[#67b342] rounded-lg shadow-xs"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAssigningMemberId(member.id);
                      setTaskTitle('');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-neutral-700 hover:text-neutral-950 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign Goal / Task</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* If only 1 member (the founder) is currently in the workshop */}
      {teamMembers.length === 1 && (
        <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#78c452]/10 border border-[#78c452]/20 flex items-center justify-center text-[#4b8b29] mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">
            Set up your Foundermatcha Workshop Team
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            You are currently the only member registered. Add your co-founders, software engineers, and workshop participants to assign roles and track commitments.
          </p>
          <button
            onClick={() => setIsAddMemberModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-neutral-950 bg-[#78c452] hover:bg-[#67b342] rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Team Member Now</span>
          </button>
        </div>
      )}
    </div>
  );
};
