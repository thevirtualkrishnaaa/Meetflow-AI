import React, { useState } from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import { ActionItem, Priority, TaskStatus } from '../../types';
import { Avatar } from '../ui/Avatar';
import {
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  Plus,
  Search,
  Trash2,
  Users,
  Video,
  Sparkles,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const ActionItemsScreen: React.FC = () => {
  const {
    actionItems,
    toggleTaskComplete,
    deleteTask,
    teamMembers,
    currentUser,
    createTask,
    setCurrentScreen,
  } = useMeetingFlow();

  const [filterTab, setFilterTab] = useState<'all' | 'my_tasks' | 'today' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newOwnerId, setNewOwnerId] = useState(currentUser.id);
  const [newDueDate, setNewDueDate] = useState('Today');
  const [newPriority, setNewPriority] = useState<Priority>('High');

  // Filter tasks
  const filteredTasks = actionItems.filter((item) => {
    // Tab filter
    if (filterTab === 'my_tasks' && item.ownerId !== currentUser.id) return false;
    if (filterTab === 'today' && !item.dueDate.toLowerCase().includes('today')) return false;
    if (filterTab === 'completed' && item.status !== 'Completed') return false;
    if (filterTab === 'all' && item.status === 'Completed') return false;

    // Assignee filter
    if (assigneeFilter !== 'All' && item.ownerId !== assigneeFilter) return false;

    // Search query
    if (
      searchQuery &&
      !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const totalTasks = actionItems.length;
  const completedTasks = actionItems.filter((t) => t.status === 'Completed').length;
  const todayTasks = actionItems.filter(
    (t) => t.status !== 'Completed' && t.dueDate.toLowerCase().includes('today')
  ).length;
  const myTasks = actionItems.filter(
    (t) => t.status !== 'Completed' && t.ownerId === currentUser.id
  ).length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const assignedMember = teamMembers.find((m) => m.id === newOwnerId);

    createTask({
      title: newTitle.trim(),
      meetingId: 'adhoc-task',
      meetingTitle: 'Workshop Goal',
      ownerId: newOwnerId,
      ownerName: assignedMember ? assignedMember.name : currentUser.name,
      ownerRole: assignedMember ? assignedMember.role : currentUser.role || 'Team Member',
      dueDate: newDueDate,
      rawDueDate: new Date().toISOString().split('T')[0],
      priority: newPriority,
      status: 'Open',
    });

    setNewTitle('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Tasks & Goals
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Assign goals to team members, track everyday execution, and follow up on commitments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentScreen('video_room')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Video className="w-3.5 h-3.5 text-[#4b8b29]" />
            <span>Join Meeting</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-neutral-950 bg-[#78c452] hover:bg-[#67b342] rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Task / Goal</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Due Today</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{todayTasks}</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Things to be done today</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Assigned to Me</div>
          <div className="text-2xl font-black text-neutral-900 mt-1">{myTasks}</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Your active deliverables</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Completed Tasks</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{completedTasks}</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Out of {totalTasks} total goals</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium">Workshop Progress</div>
          <div className="text-2xl font-black text-[#4b8b29] mt-1">{completionPercentage}%</div>
          <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#78c452] h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterTab === 'all'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Active Tasks ({totalTasks - completedTasks})
          </button>
          <button
            onClick={() => setFilterTab('today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterTab === 'today'
                ? 'bg-amber-600 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Due Today ({todayTasks})
          </button>
          <button
            onClick={() => setFilterTab('my_tasks')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterTab === 'my_tasks'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            My Tasks ({myTasks})
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterTab === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Completed ({completedTasks})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Assignee Filter */}
          {teamMembers.length > 1 && (
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-neutral-700 focus:outline-none"
            >
              <option value="All">All Members</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}

          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#78c452]"
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#78c452]/10 border border-[#78c452]/20 flex items-center justify-center text-[#4b8b29] mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">
              {filterTab === 'completed'
                ? 'No completed tasks yet'
                : 'No active tasks found'}
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {filterTab === 'completed'
                ? 'Complete your deliverables to track progress and celebrate weekly milestones.'
                : 'Create your first goal or start a video meeting to have the AI automatically extract and assign tasks!'}
            </p>
            {filterTab !== 'completed' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-neutral-950 bg-[#78c452] hover:bg-[#67b342] rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Task</span>
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            const isDueToday = task.dueDate.toLowerCase().includes('today');

            return (
              <div
                key={task.id}
                className={`p-4 bg-white rounded-xl border transition-all shadow-2xs hover:shadow-sm flex items-start sm:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'border-neutral-200/60 bg-neutral-50/50 opacity-75'
                    : isDueToday
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  {/* Completion Checkbox */}
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="mt-0.5 sm:mt-0 text-neutral-400 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
                    title={isCompleted ? 'Mark as Incomplete' : 'Mark as Done'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                    ) : (
                      <Circle className="w-5 h-5 text-neutral-300 hover:text-emerald-500" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          isCompleted
                            ? 'line-through text-neutral-400'
                            : 'text-neutral-900'
                        }`}
                      >
                        {task.title}
                      </span>

                      {task.priority === 'Urgent' && (
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          Urgent
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 mt-1 text-[11px] text-neutral-500">
                      {/* Meeting origin */}
                      {task.meetingTitle && task.meetingTitle !== 'Workshop Goal' && (
                        <span className="flex items-center gap-1 text-neutral-400">
                          <Video className="w-3 h-3 text-[#4b8b29]" />
                          <span className="truncate max-w-[150px]">{task.meetingTitle}</span>
                        </span>
                      )}

                      {/* Due Date Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-medium ${
                          isDueToday
                            ? 'bg-amber-100/70 text-amber-800 font-semibold'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{task.dueDate}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Assignee & Action */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-neutral-50 border border-neutral-200/80">
                    <Avatar
                      name={task.ownerName}
                      size="sm"
                    />
                    <div className="text-left hidden sm:block">
                      <div className="text-xs font-semibold text-neutral-900 truncate max-w-[120px]">
                        {task.ownerName}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono truncate max-w-[120px]">
                        {task.ownerRole || 'Team Member'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: New Task / Goal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">Create Task or Goal</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Task / Goal Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Prepare architecture diagram for workshop review"
                  required
                  autoFocus
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#78c452]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Assign To Team Member
                </label>
                <select
                  value={newOwnerId}
                  onChange={(e) => setNewOwnerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#78c452]"
                >
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Due Date
                  </label>
                  <select
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none"
                  >
                    <option value="Today">Today (Immediate)</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="This Friday">This Friday</option>
                    <option value="Next Week">Next Week</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-neutral-950 bg-[#78c452] hover:bg-[#67b342] rounded-xl shadow-sm cursor-pointer"
                >
                  Assign Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
