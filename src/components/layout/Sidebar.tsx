import React, { useState } from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import { AppScreen } from '../../types';
import { Avatar } from '../ui/Avatar';
import { FounderMachaLogo } from '../ui/FounderMachaLogo';
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
  LogOut,
  Video,
  Radio,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentScreen, setCurrentScreen, actionItems, currentUser, workspaceProfile, logout } =
    useMeetingFlow();

  const overdueCount = actionItems.filter((a) => a.status === 'Overdue').length;

  const navItems: Array<{
    id: AppScreen;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
    pulseBadge?: boolean;
  }> = [
    { id: 'overview', label: 'Executive Hub', icon: BarChart3 },
    {
      id: 'video_room',
      label: 'Live Video Huddle',
      icon: Video,
      badge: 'LIVE',
      badgeColor: 'bg-[#78c452]/20 text-[#4b8b29] border border-[#78c452]/30',
      pulseBadge: true,
    },
    { id: 'meetings', label: 'Huddles & Syncs', icon: Calendar },
    {
      id: 'action_items',
      label: 'Sprint Deliverables',
      icon: CheckSquare,
      badge: overdueCount > 0 ? overdueCount : undefined,
      badgeColor: 'text-rose-600 bg-rose-50',
    },
    { id: 'decisions', label: 'Executive Decisions', icon: Lightbulb },
    { id: 'team', label: 'Founders & Engineers', icon: Users },
    { id: 'reports', label: 'Chemistry & Velocity', icon: Layers },
    { id: 'settings', label: 'Sanctuary Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
        <FounderMachaLogo size="sm" showText={true} subtext="Executive Huddle Suite" />
      </div>

      {/* Quick Launch Everyday Huddle Button */}
      <div className="p-3 pb-1">
        <button
          onClick={() => setCurrentScreen('video_room')}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-sm transition-all group border border-neutral-800"
        >
          <div className="w-2 h-2 rounded-full bg-[#78c452] animate-ping" />
          <Video className="w-3.5 h-3.5 text-[#78c452]" />
          <span>Start Daily Huddle</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider font-mono">
          Workspace Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentScreen === item.id ||
            (item.id === 'meetings' &&
              (currentScreen === 'meeting_detail' ||
                currentScreen === 'ai_processing' ||
                currentScreen === 'ai_review'));

          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors group ${
                isActive
                  ? 'bg-neutral-100 text-neutral-950 font-semibold shadow-2xs border-l-2 border-[#78c452]'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#4b8b29]' : 'text-neutral-400 group-hover:text-neutral-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium flex items-center gap-1 ${
                    item.badgeColor || 'text-neutral-600 bg-neutral-100'
                  }`}
                >
                  {item.pulseBadge && <span className="w-1.5 h-1.5 rounded-full bg-[#78c452] animate-pulse" />}
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom of Sidebar: Workspace Profile & User Account */}
      <div className="p-3 border-t border-neutral-200 space-y-2 bg-neutral-50/50">
        {/* Workspace Display */}
        <div className="px-2.5 py-1.5 text-xs text-neutral-700 bg-white rounded-md border border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <Building2 className="w-3.5 h-3.5 text-[#4b8b29] shrink-0" />
            <span className="truncate font-semibold text-neutral-900">
              {workspaceProfile.name.includes('FounderMacha') ? workspaceProfile.name : `FounderMacha • ${workspaceProfile.name}`}
            </span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#78c452]/15 text-[#4b8b29] font-bold">
            Sanctuary
          </span>
        </div>

        {/* User Profile & Sign Out */}
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
          <button
            onClick={logout}
            className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 rounded transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
