import React, { useEffect, useState } from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import { ActionItem, Priority, TaskStatus } from '../../types';
import { Check, Link2, Plus, Trash2, X } from 'lucide-react';

export const TaskEditModal: React.FC = () => {
  const {
    isTaskModalOpen,
    setIsTaskModalOpen,
    taskToEdit,
    setTaskToEdit,
    updateTask,
    createTask,
    deleteTask,
    teamMembers,
    meetings,
    actionItems,
    setIsAddMemberModalOpen,
  } = useMeetingFlow();

  const isEditing = Boolean(taskToEdit);

  const [title, setTitle] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('High');
  const [status, setStatus] = useState<TaskStatus>('Open');
  const [dependsOnTaskIds, setDependsOnTaskIds] = useState<string[]>([]);
  const [isAddingDep, setIsAddingDep] = useState(false);
  const [selectedDepId, setSelectedDepId] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setOwnerId(taskToEdit.ownerId);
      setMeetingId(taskToEdit.meetingId || meetings[0]?.id || '');
      setDueDate(taskToEdit.dueDate);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setDependsOnTaskIds(taskToEdit.dependsOnTaskIds || []);
    } else {
      setTitle('');
      setOwnerId(teamMembers[0]?.id || 'alex_m');
      setMeetingId(meetings[0]?.id || '');
      setDueDate('Tomorrow');
      setPriority('High');
      setStatus('Open');
      setDependsOnTaskIds([]);
    }
    setIsAddingDep(false);
    setSelectedDepId('');
  }, [taskToEdit, isTaskModalOpen, teamMembers, meetings]);

  if (!isTaskModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const owner = teamMembers.find((m) => m.id === ownerId) || teamMembers[0] || {
      id: 'usr_owner',
      name: 'Workspace Member',
      role: 'Team Lead',
    };
    const meeting = meetings.find((m) => m.id === meetingId) || meetings[0];
    const meetingIdVal = meeting ? meeting.id : '';
    const meetingTitleVal = meeting ? meeting.title : 'Direct Workspace Commitment';

    if (isEditing && taskToEdit) {
      updateTask({
        ...taskToEdit,
        title: title.trim(),
        ownerId: owner.id,
        ownerName: owner.name,
        ownerRole: owner.role,
        meetingId: meetingIdVal,
        meetingTitle: meetingTitleVal,
        dueDate: dueDate.trim() || 'Next week',
        priority,
        status,
        dependsOnTaskIds,
      });
    } else {
      createTask({
        title: title.trim(),
        ownerId: owner.id,
        ownerName: owner.name,
        ownerRole: owner.role,
        meetingId: meetingIdVal,
        meetingTitle: meetingTitleVal,
        dueDate: dueDate.trim() || 'Next week',
        rawDueDate: new Date().toISOString().split('T')[0],
        priority,
        status,
        confidence: 1.0,
        dependsOnTaskIds,
      });
    }

    setIsTaskModalOpen(false);
    setTaskToEdit(null);
  };

  const handleDelete = () => {
    if (taskToEdit) {
      deleteTask(taskToEdit.id);
      setIsTaskModalOpen(false);
      setTaskToEdit(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-[2px] animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              {isEditing ? 'Edit Action Item' : 'New Action Item'}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Assign clear accountability, timeline, and source meeting.
            </p>
          </div>
          <button
            onClick={() => {
              setIsTaskModalOpen(false);
              setTaskToEdit(null);
            }}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Task Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Send revised investor deck before 5pm call"
              className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-neutral-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-neutral-700">
                  Owner
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(true)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  + Add teammate
                </button>
              </div>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Due Date
              </label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="e.g. Today, 28 Sep, Monday"
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Source Meeting
            </label>
            <select
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            >
              {meetings.length === 0 && (
                <option value="">Direct Workspace Commitment (No meeting)</option>
              )}
              {meetings.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.date})
                </option>
              ))}
            </select>
          </div>

          {/* Task Dependencies (Waiting on / Blocked by) */}
          <div className="pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700">
                <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Waiting on Dependent Tasks ({dependsOnTaskIds.length})</span>
              </label>
              {!isAddingDep && (
                <button
                  type="button"
                  onClick={() => setIsAddingDep(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Link Sub-task</span>
                </button>
              )}
            </div>

            {dependsOnTaskIds.length > 0 ? (
              <div className="space-y-1.5 mb-2">
                {dependsOnTaskIds.map((depId) => {
                  const depTask = actionItems.find((a) => a.id === depId);
                  const isDone = depTask?.status === 'Completed';
                  return (
                    <div
                      key={depId}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs ${
                        isDone
                          ? 'bg-neutral-50 border-neutral-200/80 text-neutral-500'
                          : 'bg-amber-50/50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isDone ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <span className={`truncate font-medium ${isDone ? 'line-through' : ''}`}>
                          {depTask?.title || depId}
                        </span>
                        {depTask && (
                          <span className="text-[10px] text-neutral-400 shrink-0 font-mono">
                            ({depTask.ownerName.split(' ')[0]} · {depTask.status})
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDependsOnTaskIds((prev) => prev.filter((id) => id !== depId))
                        }
                        className="text-neutral-400 hover:text-rose-600 p-0.5 rounded transition-colors shrink-0"
                        title="Remove dependency link"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-neutral-400 mb-2">
                No dependencies linked. This task can proceed independently.
              </p>
            )}

            {isAddingDep && (
              <div className="flex items-center gap-2 p-2 bg-neutral-50 border border-neutral-200 rounded-lg animate-fadeIn">
                <select
                  value={selectedDepId}
                  onChange={(e) => setSelectedDepId(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs bg-white border border-neutral-200 rounded-md text-neutral-800 focus:outline-none focus:border-indigo-600"
                >
                  <option value="">Select task this item is waiting on...</option>
                  {actionItems
                    .filter(
                      (item) =>
                        item.id !== taskToEdit?.id && !dependsOnTaskIds.includes(item.id)
                    )
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title} ({item.ownerName.split(' ')[0]} - {item.status})
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  disabled={!selectedDepId}
                  onClick={() => {
                    if (selectedDepId) {
                      setDependsOnTaskIds((prev) => [...prev, selectedDepId]);
                      setSelectedDepId('');
                      setIsAddingDep(false);
                    }
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-md transition-colors"
                >
                  Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingDep(false);
                    setSelectedDepId('');
                  }}
                  className="p-1 text-neutral-400 hover:text-neutral-600 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsTaskModalOpen(false);
                  setTaskToEdit(null);
                }}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Save Changes' : 'Create Task'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
