import React, { useState } from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import { AppScreen } from '../../types';
import { Avatar } from '../ui/Avatar';
import {
  BarChart3,
  Calendar,
  CheckSquare,
  ChevronDown,
  Layers,
  Lightbulb,
  Settings,
  Users,
  Building2,
  Check,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentScreen, setCurrentScreen, actionItems, currentUser } = useMeetingFlow();

  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState('Acme Labs HQ');

  const overdueCount = actionItems.filter((a) => a.status === 'Overdue').length;

  const navItems: Array<{
    id: AppScreen;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }> = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    {
      id: 'action_items',
      label: 'Action Items',
      icon: CheckSquare,
      badge: overdueCount,
      badgeColor: 'text-rose-600 bg-rose-50',
    },
    { id: 'decisions', label: 'Decisions', icon: Lightbulb },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'reports', label: 'Reports', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-14 px-5 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-2xs">
            MF
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-neutral-900 leading-none">
              MeetingFlow <span className="text-indigo-600 font-semibold">AI</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentScreen === item.id ||
            (item.id === 'meetings' && (currentScreen === 'meeting_detail' || currentScreen === 'ai_processing' || currentScreen === 'ai_review'));

          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors group ${
                isActive
                  ? 'bg-neutral-100 text-neutral-900 font-semibold shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-neutral-400 group-hover:text-neutral-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                    item.badgeColor || 'text-neutral-600 bg-neutral-100'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom of Sidebar: Workspace Selector & User Profile */}
      <div className="p-3 border-t border-neutral-200 space-y-2 bg-neutral-50/50">
        {/* Workspace Switcher */}
        <div className="relative">
          <button
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="truncate font-medium">{activeWorkspace}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
          </button>

          {workspaceMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-30">
              <div className="px-3 py-1 text-[10px] uppercase font-semibold text-neutral-400">
                Workspaces
              </div>
              {['Acme Labs HQ', 'Acme Labs EU', 'Personal Sandbox'].map((ws) => (
                <button
                  key={ws}
                  onClick={() => {
                    setActiveWorkspace(ws);
                    setWorkspaceMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 text-left"
                >
                  <span>{ws}</span>
                  {activeWorkspace === ws && <Check className="w-3 h-3 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center justify-between px-2 py-1.5 bg-white rounded-lg border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5 truncate">
            <Avatar
              name={currentUser.name}
              initials={currentUser.initials}
              colorClass={currentUser.avatarColor}
              size="sm"
            />
            <div className="truncate">
              <div className="text-xs font-semibold text-neutral-900 truncate leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-neutral-500 truncate leading-tight">
                {currentUser.role}
              </div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
        </div>
      </div>
    </aside>
  );
};
