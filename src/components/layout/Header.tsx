import React, { useRef, useState, useEffect } from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import { Avatar } from '../ui/Avatar';
import {
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Menu,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const {
    setIsStartMeetingOpen,
    setIsCommandPaletteOpen,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    openMeetingDetail,
    currentUser,
    setTaskToEdit,
    setIsTaskModalOpen,
    actionItems,
  } = useMeetingFlow();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (n: (typeof notifications)[0]) => {
    markNotificationAsRead(n.id);
    setNotificationsOpen(false);
    if (n.meetingId) {
      openMeetingDetail(n.meetingId);
    } else if (n.actionItemId) {
      const task = actionItems.find((t) => t.id === n.actionItemId);
      if (task) {
        setTaskToEdit(task);
        setIsTaskModalOpen(true);
      }
    }
  };

  return (
    <header className="h-14 bg-white border-b border-neutral-200 px-6 flex items-center justify-between z-20 shrink-0">
      {/* Left Zone: Mobile toggle & Global Search */}
      <div className="flex items-center gap-3 w-72 md:w-96">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-1.5 text-neutral-500 hover:text-neutral-800 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-neutral-400 bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200 rounded-lg transition-colors group text-left"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 transition-colors shrink-0" />
            <span className="truncate">Search meetings, decisions, tasks...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-neutral-500 bg-white rounded border border-neutral-200/80 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Zone: Notifications, Start Meeting, User Avatar */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-40 animate-fadeIn">
              <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-900">Notifications</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                      {unreadNotificationsCount} new
                    </span>
                  )}
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-neutral-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-neutral-50">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full text-left p-3.5 hover:bg-neutral-50 transition-colors flex items-start gap-3 ${
                      !notif.read ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {notif.type === 'task_due' && (
                        <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center text-amber-600">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {notif.type === 'actions_extracted' && (
                        <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {notif.type === 'task_completed' && (
                        <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${notif.read ? 'text-neutral-700' : 'text-neutral-900 font-medium'}`}>
                        {notif.text}
                      </p>
                      <span className="text-[11px] text-neutral-400 mt-1 block font-mono">
                        {notif.timeAgo}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-300 shrink-0 self-center" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Start Meeting CTA */}
        <button
          onClick={() => setIsStartMeetingOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs whitespace-nowrap active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Start Meeting</span>
        </button>

        {/* User Avatar */}
        <div className="pl-1 border-l border-neutral-200">
          <Avatar
            name={currentUser.name}
            initials={currentUser.initials}
            colorClass={currentUser.avatarColor}
            size="sm"
          />
        </div>
      </div>
    </header>
  );
};
