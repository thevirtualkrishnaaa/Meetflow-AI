import React, { useState } from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import { ActionItem } from '../../types';
import { Avatar } from '../ui/Avatar';
import { PriorityBadge, StatusBadge } from '../ui/StatusBadge';
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  CornerDownRight,
  GitBranch,
  Link2,
  ShieldAlert,
} from 'lucide-react';

export const DependencyGraphView: React.FC = () => {
  const {
    actionItems,
    toggleTaskComplete,
    setTaskToEdit,
    setIsTaskModalOpen,
    teamMembers,
  } = useMeetingFlow();

  const [selectedChainRootId, setSelectedChainRootId] = useState<string | null>(null);

  // Group tasks that have dependencies or are dependencies of others
  const tasksWithDeps = actionItems.filter(
    (t) => t.dependsOnTaskIds && t.dependsOnTaskIds.length > 0
  );

  const dependentTaskIds = new Set<string>();
  tasksWithDeps.forEach((t) => {
    t.dependsOnTaskIds?.forEach((depId) => dependentTaskIds.add(depId));
  });

  // Root deliverables: tasks that have dependencies but are not depended upon by others, or have the most downstream impact
  const blockedTasks = tasksWithDeps.filter((t) => {
    const uncompletedDeps = (t.dependsOnTaskIds || []).filter((id) => {
      const parent = actionItems.find((a) => a.id === id);
      return parent && parent.status !== 'Completed';
    });
    return uncompletedDeps.length > 0;
  });

  return (
    <div className="space-y-6">
      {/* Dependency Health Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-500 font-medium">Linked Chains</span>
            <div className="text-xl font-bold font-mono text-neutral-900 mt-0.5">
              {tasksWithDeps.length}
            </div>
            <span className="text-[11px] text-neutral-400">Tasks with prerequisites</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <GitBranch className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-700 font-medium">Currently Blocked</span>
            <div className="text-xl font-bold font-mono text-rose-600 mt-0.5">
              {blockedTasks.length}
            </div>
            <span className="text-[11px] text-rose-600/80 font-medium">
              Waiting on open prerequisites
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-700 font-medium">Unblocked / Clear</span>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
              {tasksWithDeps.length - blockedTasks.length}
            </div>
            <span className="text-[11px] text-emerald-600">All prerequisites completed</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Visual Dependency Tree Cards */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden divide-y divide-neutral-100">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Execution Dependency Flows
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Visualize downstream commitments and what prerequisites must finish first.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            {tasksWithDeps.length} dependency sets
          </span>
        </div>

        {tasksWithDeps.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">
            No task dependencies recorded. Link tasks by clicking "Edit" on any action item.
          </div>
        ) : (
          tasksWithDeps.map((task) => {
            const deps = (task.dependsOnTaskIds || [])
              .map((id) => actionItems.find((a) => a.id === id))
              .filter(Boolean) as ActionItem[];

            const pendingDeps = deps.filter((d) => d.status !== 'Completed');
            const isBlocked = pendingDeps.length > 0 && task.status !== 'Completed';
            const owner = teamMembers.find((m) => m.id === task.ownerId);

            return (
              <div key={task.id} className="p-6 space-y-4 hover:bg-neutral-50/40 transition-colors">
                {/* Main Deliverable / Target Task */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200/80">
                  <div className="flex items-start sm:items-center gap-3">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="text-neutral-300 hover:text-emerald-600 transition-colors shrink-0 mt-0.5 sm:mt-0"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          task.status === 'Completed' ? 'text-emerald-600 fill-emerald-50' : ''
                        }`}
                      />
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          onClick={() => {
                            setTaskToEdit(task);
                            setIsTaskModalOpen(true);
                          }}
                          className={`text-xs sm:text-sm font-semibold text-neutral-900 hover:text-indigo-600 cursor-pointer ${
                            task.status === 'Completed' ? 'line-through text-neutral-400' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Waiting on {pendingDeps.length} sub-task{pendingDeps.length > 1 ? 's' : ''}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Unblocked & Ready</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-neutral-700">
                          <Avatar
                            name={task.ownerName}
                            size="xs"
                            colorClass={owner?.avatarColor}
                          />
                          <span>{task.ownerName}</span>
                        </span>
                        <span aria-hidden="true" className="text-neutral-300">·</span>
                        <span className="font-mono">Due: {task.dueDate}</span>
                        <span aria-hidden="true" className="text-neutral-300">·</span>
                        <span>{task.meetingTitle}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                    <button
                      onClick={() => {
                        setTaskToEdit(task);
                        setIsTaskModalOpen(true);
                      }}
                      className="text-xs text-neutral-400 hover:text-neutral-800 px-2 py-1 rounded hover:bg-neutral-200/60 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Sub-tasks / Prerequisites Branch */}
                <div className="pl-6 space-y-2 relative">
                  {/* Left connector line */}
                  <div className="absolute left-3 top-0 bottom-4 w-px bg-neutral-200" />

                  <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider pl-4 pt-1">
                    Prerequisites ({deps.length})
                  </div>

                  <div className="space-y-2">
                    {deps.map((dep) => {
                      const depOwner = teamMembers.find((m) => m.id === dep.ownerId);
                      const isDepDone = dep.status === 'Completed';

                      return (
                        <div
                          key={dep.id}
                          className={`relative flex items-center justify-between p-3 rounded-lg border text-xs transition-colors pl-4 ${
                            isDepDone
                              ? 'bg-neutral-50/60 border-neutral-200/60 text-neutral-500'
                              : 'bg-white border-amber-200 shadow-2xs text-neutral-800'
                          }`}
                        >
                          {/* Branch indicator */}
                          <div className="flex items-center gap-3">
                            <CornerDownRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <button
                              onClick={() => toggleTaskComplete(dep.id)}
                              className="text-neutral-300 hover:text-emerald-600 transition-colors shrink-0"
                            >
                              <CheckCircle2
                                className={`w-3.5 h-3.5 ${
                                  isDepDone ? 'text-emerald-600 fill-emerald-50' : ''
                                }`}
                              />
                            </button>
                            <div>
                              <span
                                onClick={() => {
                                  setTaskToEdit(dep);
                                  setIsTaskModalOpen(true);
                                }}
                                className={`font-medium hover:text-indigo-600 cursor-pointer ${
                                  isDepDone ? 'line-through text-neutral-400' : 'text-neutral-900'
                                }`}
                              >
                                {dep.title}
                              </span>
                              <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-2">
                                <span>{dep.ownerName}</span>
                                <span>·</span>
                                <span className="font-mono">Due: {dep.dueDate}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isDepDone ? (
                              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                Completed
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Blocking
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
