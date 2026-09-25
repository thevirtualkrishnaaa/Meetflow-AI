import React, { useState } from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import { ActionItem, Priority, TaskStatus } from '../../types';
import { Avatar } from '../ui/Avatar';
import { PriorityBadge, StatusBadge } from '../ui/StatusBadge';
import { DependencyGraphView } from './DependencyGraphView';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  CornerDownRight,
  Filter,
  GitBranch,
  Link2,
  List,
  Plus,
  Search,
  Users,
} from 'lucide-react';

export const ActionItemsScreen: React.FC = () => {
  const {
    actionItems,
    toggleTaskComplete,
    setTaskToEdit,
    setIsTaskModalOpen,
    openMeetingDetail,
    currentUser,
    teamMembers,
    updateTask,
  } = useMeetingFlow();

  const [activeTab, setActiveTab] = useState<
    'all' | 'my_tasks' | 'overdue' | 'due_today' | 'dependencies' | 'completed'
  >('all');
  const [viewMode, setViewMode] = useState<'table' | 'dependency_flows'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [expandedDependencyTaskId, setExpandedDependencyTaskId] = useState<string | null>(null);

  const filteredTasks = actionItems.filter((item) => {
    // Tab filter
    if (activeTab === 'my_tasks' && item.ownerId !== currentUser.id) return false;
    if (activeTab === 'overdue' && item.status !== 'Overdue') return false;
    if (activeTab === 'due_today' && !item.dueDate.toLowerCase().includes('today')) return false;
    if (activeTab === 'completed' && item.status !== 'Completed') return false;
    if (activeTab === 'dependencies' && (!item.dependsOnTaskIds || item.dependsOnTaskIds.length === 0)) return false;
    if (activeTab === 'all' && item.status === 'Completed') return false; // Show active by default on "all"

    // Search query
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meetingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Owner filter
    if (ownerFilter !== 'All' && item.ownerId !== ownerFilter) return false;

    // Priority filter
    if (priorityFilter !== 'All' && item.priority !== priorityFilter) return false;

    return true;
  });

  const overdueCount = actionItems.filter((a) => a.status === 'Overdue').length;
  const myTasksCount = actionItems.filter((a) => a.ownerId === currentUser.id && a.status !== 'Completed').length;
  const dueTodayCount = actionItems.filter((a) => a.dueDate.toLowerCase().includes('today') && a.status !== 'Completed').length;
  const completedCount = actionItems.filter((a) => a.status === 'Completed').length;
  const dependenciesCount = actionItems.filter((a) => a.dependsOnTaskIds && a.dependsOnTaskIds.length > 0).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Action Items</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Track everything your team committed to during meetings and monitor dependent prerequisites.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View mode toggle */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
            <button
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode('dependency_flows')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'dependency_flows'
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Dependency Flows</span>
            </button>
          </div>

          <button
            onClick={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Action Item</span>
          </button>
        </div>
      </div>

      {/* Top Filter Tabs (Segmented Button Controls) */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg w-fit overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            All Active ({actionItems.filter((a) => a.status !== 'Completed').length})
          </button>
          <button
            onClick={() => setActiveTab('my_tasks')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'my_tasks'
                ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            My Tasks ({myTasksCount})
          </button>
          <button
            onClick={() => setActiveTab('dependencies')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'dependencies'
                ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Link2 className="w-3 h-3 text-indigo-600" />
            <span>Has Dependencies ({dependenciesCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'overdue'
                ? 'bg-white text-rose-700 shadow-2xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Overdue ({overdueCount})
          </button>
          <button
            onClick={() => setActiveTab('due_today')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'due_today'
                ? 'bg-white text-amber-700 shadow-2xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Due Today ({dueTodayCount})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'completed'
                ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action items by task title, meeting source, or owner..."
            className="w-full pl-9 pr-4 py-1.5 text-xs text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-neutral-400"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none focus:border-indigo-600"
          >
            <option value="All">All Owners</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none focus:border-indigo-600"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {viewMode === 'dependency_flows' ? (
        <DependencyGraphView />
      ) : (
        /* Task Table */
        <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900">
                {activeTab === 'overdue'
                  ? 'No overdue actions'
                  : activeTab === 'dependencies'
                  ? 'No action items with dependencies'
                  : 'No action items found'}
              </h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                {activeTab === 'overdue'
                  ? 'Great — your team is completely on track.'
                  : activeTab === 'dependencies'
                  ? 'No tasks currently have prerequisite dependencies. Edit a task to link prerequisite sub-tasks.'
                  : 'No tasks matched your current search filters.'}
              </p>
              {activeTab === 'overdue' || activeTab === 'dependencies' ? (
                <button
                  onClick={() => setActiveTab('all')}
                  className="mt-4 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  View all active tasks
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setOwnerFilter('All');
                    setPriorityFilter('All');
                    setActiveTab('all');
                  }}
                  className="mt-4 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50/70 border-b border-neutral-100 text-neutral-500 font-medium">
                  <tr>
                    <th className="py-3 px-5 w-8"></th>
                    <th className="py-3 px-3">Task & Dependencies</th>
                    <th className="py-3 px-4">Meeting Source</th>
                    <th className="py-3 px-4">Owner</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredTasks.map((task) => {
                    const isCompleted = task.status === 'Completed';
                    const owner = teamMembers.find((m) => m.id === task.ownerId);

                    const hasDeps = Boolean(task.dependsOnTaskIds && task.dependsOnTaskIds.length > 0);
                    const depTasks = hasDeps
                      ? (task.dependsOnTaskIds || [])
                          .map((id) => actionItems.find((a) => a.id === id))
                          .filter(Boolean) as ActionItem[]
                      : [];
                    const pendingDeps = depTasks.filter((d) => d.status !== 'Completed');
                    const isBlocked = pendingDeps.length > 0 && !isCompleted;
                    const isDrawerExpanded = expandedDependencyTaskId === task.id;

                    return (
                      <React.Fragment key={task.id}>
                        <tr
                          className={`hover:bg-neutral-50/80 transition-colors group ${
                            isBlocked ? 'bg-amber-50/15' : ''
                          }`}
                        >
                          <td className="py-3.5 px-5">
                            <button
                              onClick={() => toggleTaskComplete(task.id)}
                              className="text-neutral-300 hover:text-emerald-600 transition-colors"
                              title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                            >
                              <CheckCircle2
                                className={`w-4 h-4 ${
                                  isCompleted ? 'text-emerald-600 fill-emerald-50' : ''
                                }`}
                              />
                            </button>
                          </td>
                          <td className="py-3.5 px-3 font-medium text-neutral-900 max-w-sm">
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

                              {/* Interactive Dependency Pill */}
                              {hasDeps && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedDependencyTaskId(
                                      isDrawerExpanded ? null : task.id
                                    )
                                  }
                                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                                    isBlocked
                                      ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  }`}
                                  title="Click to view sub-task prerequisites"
                                >
                                  {isBlocked ? (
                                    <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                  ) : (
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                  )}
                                  <span>
                                    {isBlocked
                                      ? `Waiting on ${pendingDeps.length} sub-task${pendingDeps.length > 1 ? 's' : ''}`
                                      : 'Prerequisites met'}
                                  </span>
                                </button>
                              )}
                            </div>

                            {task.context && (
                              <p className="text-[11px] text-neutral-400 font-normal mt-0.5 line-clamp-1">
                                {task.context}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              onClick={() => openMeetingDetail(task.meetingId)}
                              className="text-neutral-600 hover:text-indigo-600 cursor-pointer truncate max-w-[160px] inline-block"
                            >
                              {task.meetingTitle}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Avatar
                                name={task.ownerName}
                                size="xs"
                                colorClass={owner?.avatarColor || 'bg-neutral-700 text-white'}
                              />
                              <span className="text-neutral-800">{task.ownerName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                            <span
                              className={`${
                                task.status === 'Overdue'
                                  ? 'text-rose-600 font-semibold'
                                  : task.dueDate.toLowerCase() === 'today'
                                  ? 'text-amber-700 font-semibold'
                                  : 'text-neutral-600'
                              }`}
                            >
                              {task.dueDate}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <PriorityBadge priority={task.priority} />
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {/* Quick status selector */}
                            <select
                              value={task.status}
                              onChange={(e) =>
                                updateTask({ ...task, status: e.target.value as TaskStatus })
                              }
                              className="bg-transparent text-xs text-neutral-700 hover:text-neutral-900 focus:outline-none cursor-pointer"
                            >
                              <option value="Open">Open</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Overdue">Overdue</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {hasDeps && (
                                <button
                                  onClick={() =>
                                    setExpandedDependencyTaskId(
                                      isDrawerExpanded ? null : task.id
                                    )
                                  }
                                  className={`p-1 rounded text-xs transition-colors ${
                                    isDrawerExpanded
                                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                                      : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'
                                  }`}
                                  title="Expand prerequisites tree"
                                >
                                  <Link2 className="w-3.5 h-3.5" />
                                </button>
                              )}
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
                          </td>
                        </tr>

                        {/* Inline Expandable Sub-task Dependency Drawer */}
                        {isDrawerExpanded && hasDeps && (
                          <tr className="bg-neutral-50/90 border-y border-neutral-200/80 animate-fadeIn">
                            <td colSpan={8} className="p-4 pl-14">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
                                    <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Prerequisite Sub-tasks for "{task.title}"</span>
                                  </span>
                                  <span className="text-[11px] text-neutral-400 font-mono">
                                    {depTasks.length - pendingDeps.length} of {depTasks.length} Completed
                                  </span>
                                </div>

                                <div className="space-y-1.5">
                                  {depTasks.map((dep) => {
                                    const isDepDone = dep.status === 'Completed';
                                    const depOwner = teamMembers.find((m) => m.id === dep.ownerId);

                                    return (
                                      <div
                                        key={dep.id}
                                        className={`flex items-center justify-between p-2.5 rounded-lg border text-xs bg-white transition-colors ${
                                          isDepDone
                                            ? 'border-neutral-200 text-neutral-500'
                                            : 'border-amber-200 text-neutral-900 shadow-2xs'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5 truncate pr-2">
                                          <CornerDownRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                          <button
                                            onClick={() => toggleTaskComplete(dep.id)}
                                            className="text-neutral-300 hover:text-emerald-600 transition-colors shrink-0"
                                            title={isDepDone ? 'Mark uncompleted' : 'Mark completed'}
                                          >
                                            <CheckCircle2
                                              className={`w-3.5 h-3.5 ${
                                                isDepDone ? 'text-emerald-600 fill-emerald-50' : ''
                                              }`}
                                            />
                                          </button>
                                          <span
                                            onClick={() => {
                                              setTaskToEdit(dep);
                                              setIsTaskModalOpen(true);
                                            }}
                                            className={`truncate cursor-pointer hover:text-indigo-600 font-medium ${
                                              isDepDone ? 'line-through text-neutral-400' : ''
                                            }`}
                                          >
                                            {dep.title}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0 text-xs">
                                          <div className="flex items-center gap-1.5 text-neutral-600">
                                            <Avatar
                                              name={dep.ownerName}
                                              size="xs"
                                              colorClass={depOwner?.avatarColor}
                                            />
                                            <span>{dep.ownerName}</span>
                                          </div>
                                          <span className="font-mono text-[11px] text-neutral-500">
                                            Due: {dep.dueDate}
                                          </span>
                                          {isDepDone ? (
                                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                              Resolved
                                            </span>
                                          ) : (
                                            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                                              Prerequisite Open
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
