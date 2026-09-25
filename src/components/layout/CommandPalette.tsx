import React, { useEffect, useState } from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import { AppScreen } from '../../types';
import {
  Calendar,
  CheckSquare,
  FileText,
  Lightbulb,
  Plus,
  Search,
  Users,
  BarChart3,
  X,
  ArrowRight,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setCurrentScreen,
    openMeetingDetail,
    meetings,
    actionItems,
    decisions,
    setIsStartMeetingOpen,
    setIsTaskModalOpen,
    setTaskToEdit,
  } = useMeetingFlow();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredMeetings = meetings.filter((m) =>
    m.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = actionItems.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.ownerName.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDecisions = decisions.filter((d) =>
    d.text.toLowerCase().includes(query.toLowerCase())
  );

  const navigateTo = (screen: AppScreen) => {
    setCurrentScreen(screen);
    setIsCommandPaletteOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-neutral-900/40 backdrop-blur-[2px]">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-100">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search meetings, tasks, decisions..."
            className="w-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-neutral-400 bg-neutral-100 rounded border border-neutral-200">
            ESC
          </kbd>
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4 text-xs">
          {/* Quick Actions */}
          {!query && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Quick Actions
              </div>
              <div className="space-y-0.5 mt-1">
                <button
                  onClick={() => {
                    setIsCommandPaletteOpen(false);
                    setIsStartMeetingOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-lg text-left transition-colors"
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <Plus className="w-4 h-4 text-indigo-600" />
                    Start New Meeting
                  </span>
                  <span className="text-neutral-400 text-[11px]">Action</span>
                </button>
                <button
                  onClick={() => {
                    setIsCommandPaletteOpen(false);
                    setTaskToEdit(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-lg text-left transition-colors"
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    Create New Action Item
                  </span>
                  <span className="text-neutral-400 text-[11px]">Task</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          {!query && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Jump to Screen
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                <button
                  onClick={() => navigateTo('overview')}
                  className="flex items-center gap-2 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors text-left"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Overview Dashboard</span>
                </button>
                <button
                  onClick={() => navigateTo('meetings')}
                  className="flex items-center gap-2 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors text-left"
                >
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Meetings List</span>
                </button>
                <button
                  onClick={() => navigateTo('action_items')}
                  className="flex items-center gap-2 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors text-left"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Action Items</span>
                </button>
                <button
                  onClick={() => navigateTo('decisions')}
                  className="flex items-center gap-2 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors text-left"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Decision Log</span>
                </button>
                <button
                  onClick={() => navigateTo('team')}
                  className="flex items-center gap-2 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors text-left"
                >
                  <Users className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Team Workload</span>
                </button>
                <button
                  onClick={() => navigateTo('reports')}
                  className="flex items-center gap-2 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Execution Reports</span>
                </button>
              </div>
            </div>
          )}

          {/* Search results: Meetings */}
          {filteredMeetings.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Meetings
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredMeetings.slice(0, 4).map((meeting) => (
                  <button
                    key={meeting.id}
                    onClick={() => {
                      openMeetingDetail(meeting.id);
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="font-medium text-neutral-900">{meeting.title}</span>
                      <span className="text-neutral-400">· {meeting.date}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search results: Action Items */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Action Items
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredActions.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTaskToEdit(item);
                      setIsTaskModalOpen(true);
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CheckSquare className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <span className="truncate text-neutral-900">{item.title}</span>
                      <span className="text-neutral-400 shrink-0">· {item.ownerName}</span>
                    </div>
                    <span className="text-[11px] text-neutral-400 shrink-0 ml-2">{item.dueDate}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search results: Decisions */}
          {filteredDecisions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Decisions
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredDecisions.slice(0, 3).map((decision) => (
                  <button
                    key={decision.id}
                    onClick={() => {
                      setCurrentScreen('decisions');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-neutral-800 hover:bg-neutral-100 rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate text-neutral-900">{decision.text}</span>
                    </div>
                    <span className="text-[11px] text-neutral-400 shrink-0 ml-2">{decision.date}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
