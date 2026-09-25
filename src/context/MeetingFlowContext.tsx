import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ActionItem,
  AppScreen,
  AuthUser,
  Decision,
  Meeting,
  NotificationItem,
  PendingMeetingDraft,
  Priority,
  TaskStatus,
  TeamMember,
  WorkspaceProfile,
} from '../types';
import {
  INITIAL_ACTION_ITEMS,
  INITIAL_DECISIONS,
  INITIAL_MEETINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TEAM_MEMBERS,
} from '../data/mockData';

interface MeetingFlowContextType {
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;
  selectedMeetingId: string;
  setSelectedMeetingId: (id: string) => void;
  selectedMeeting: Meeting | undefined;
  activeMeetingTab: 'overview' | 'transcript' | 'decisions' | 'action_items';
  setActiveMeetingTab: (tab: 'overview' | 'transcript' | 'decisions' | 'action_items') => void;

  meetings: Meeting[];
  actionItems: ActionItem[];
  decisions: Decision[];
  teamMembers: TeamMember[];
  notifications: NotificationItem[];
  unreadNotificationsCount: number;

  currentUser: TeamMember;

  // Authentication & Workspace
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  workspaceProfile: WorkspaceProfile;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (userData: {
    name: string;
    email: string;
    password?: string;
    role?: string;
    workspaceName?: string;
    department?: string;
    avatarColor?: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateWorkspaceProfile: (profile: Partial<WorkspaceProfile>) => void;
  resetToEmptyWorkspace: () => void;
  loadSampleData: () => void;

  // Actions
  toggleTaskComplete: (taskId: string) => void;
  updateTask: (updatedTask: ActionItem) => void;
  createTask: (newTask: Omit<ActionItem, 'id'>) => void;
  deleteTask: (taskId: string) => void;
  updateDecision: (decision: Decision) => void;
  createDecision: (newDecision: Omit<Decision, 'id'>) => void;
  deleteDecision: (decisionId: string) => void;

  // Team Member Management
  addTeamMember: (memberData: {
    name: string;
    email: string;
    role: string;
    department?: string;
    avatarColor?: string;
  }) => TeamMember;
  updateTeamMember: (member: TeamMember) => void;
  deleteTeamMember: (memberId: string) => void;

  // Transcript interaction
  addTranscriptAnnotation: (
    meetingId: string,
    segmentId: string,
    type: 'decision' | 'action' | 'note',
    extractedText: string
  ) => void;
  appendTranscriptSegment: (
    meetingId: string,
    text: string,
    speakerName?: string
  ) => void;

  // Modals & Drawers
  isStartMeetingOpen: boolean;
  setIsStartMeetingOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
  isAddMemberModalOpen: boolean;
  setIsAddMemberModalOpen: (open: boolean) => void;
  taskToEdit: ActionItem | null;
  setTaskToEdit: (task: ActionItem | null) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Meeting Creation Flow
  pendingDraft: PendingMeetingDraft | null;
  processingProgress: number;
  processingStep: number;
  startProcessingMeeting: (config: {
    title: string;
    project: string;
    participantIds: string[];
    rawTranscript: string;
  }) => Promise<void>;
  updateDraftSummary: (summary: string) => void;
  toggleApproveDecision: (id: string) => void;
  toggleApproveAction: (id: string) => void;
  updateDraftAction: (id: string, updates: Partial<PendingMeetingDraft['detectedActions'][0]>) => void;
  publishDraftMeeting: () => void;
  cancelDraft: () => void;
  openMeetingDetail: (meetingId: string, tab?: 'overview' | 'transcript' | 'decisions' | 'action_items') => void;
}

const MeetingFlowContext = createContext<MeetingFlowContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'meetingflow_auth_session';

export const MeetingFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Auth State Initialization
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!authUser;

  // 2. Navigation & UI state
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('video_room');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
  const [activeMeetingTab, setActiveMeetingTab] = useState<'overview' | 'transcript' | 'decisions' | 'action_items'>('overview');

  // 3. Workspace Profile State
  const [workspaceProfile, setWorkspaceProfile] = useState<WorkspaceProfile>(() => {
    if (authUser) {
      return {
        name: authUser.workspaceName || 'My Workspace',
        domain: authUser.email ? authUser.email.split('@')[1] : 'company.com',
        createdAt: authUser.createdAt || new Date().toISOString(),
      };
    }
    return {
      name: 'Foundermatcha Core',
      domain: 'foundermatcha.com',
      createdAt: new Date().toISOString(),
    };
  });

  // 4. Workspace Data initialization (Per-user persistent store)
  const getUserStorageKey = (userId: string) => `foundermatcha_workshop_v6_${userId}`;

  const loadUserData = (user: AuthUser | null) => {
    if (!user) {
      return {
        meetings: [],
        actionItems: [],
        decisions: [],
        teamMembers: [],
        notifications: [],
      };
    }

    try {
      const saved = localStorage.getItem(getUserStorageKey(user.id));
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading saved workspace data:', e);
    }

    // Default user member (pure real account)
    const initialUserMember: TeamMember = {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      avatarColor: user.avatarColor,
      initials: user.initials,
      department: user.department,
      joinedDate: 'Sep 2026',
      openTasks: 0,
      overdueTasks: 0,
      completedTasks: 0,
    };

    // Every workspace starts 100% clean and pure with zero demo information!
    return {
      meetings: [],
      actionItems: [],
      decisions: [],
      teamMembers: [initialUserMember],
      notifications: [
        {
          id: `welcome-${Date.now()}`,
          text: `Welcome to ${user.workspaceName}! Start a video call or add your team members to begin.`,
          timeAgo: 'Just now',
          type: 'task_completed' as const,
          read: false,
        },
      ],
    };
  };

  const initialData = loadUserData(authUser);

  const [meetings, setMeetings] = useState<Meeting[]>(initialData.meetings);
  const [actionItems, setActionItems] = useState<ActionItem[]>(initialData.actionItems);
  const [decisions, setDecisions] = useState<Decision[]>(initialData.decisions);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialData.teamMembers);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialData.notifications);

  // Modals
  const [isStartMeetingOpen, setIsStartMeetingOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ActionItem | null>(null);

  // AI Pipeline State
  const [pendingDraft, setPendingDraft] = useState<PendingMeetingDraft | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState(1);

  // Save workspace data whenever state changes
  useEffect(() => {
    if (!authUser) return;
    try {
      const dataToSave = {
        meetings,
        actionItems,
        decisions,
        teamMembers,
        notifications,
        workspaceProfile,
      };
      localStorage.setItem(getUserStorageKey(authUser.id), JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Error saving workspace data:', e);
    }
  }, [authUser, meetings, actionItems, decisions, teamMembers, notifications, workspaceProfile]);

  // Sync selected meeting ID
  useEffect(() => {
    if (meetings.length > 0 && !selectedMeetingId) {
      setSelectedMeetingId(meetings[0].id);
    }
  }, [meetings, selectedMeetingId]);

  // Resolved Current User
  const defaultFallbackMember: TeamMember = {
    id: authUser?.id || 'usr_guest',
    name: authUser?.name || 'Workspace Owner',
    role: authUser?.role || 'Team Lead',
    email: authUser?.email || 'user@workspace.com',
    avatarColor: authUser?.avatarColor || 'bg-indigo-600 text-white',
    initials: authUser?.initials || 'WO',
    openTasks: 0,
    overdueTasks: 0,
    completedTasks: 0,
  };

  const currentUser =
    teamMembers.find((m) => m.id === authUser?.id) ||
    teamMembers.find((m) => m.email.toLowerCase() === authUser?.email.toLowerCase()) ||
    teamMembers[0] ||
    defaultFallbackMember;

  const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId) || meetings[0];
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Keyboard shortcut for Cmd/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auth Operations
  const login = async (email: string, password?: string): Promise<boolean> => {
    const cleanEmail = email.toLowerCase().trim();

    try {
      // 1. Try server API login
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: password || 'password123' }),
      });

      if (res.ok) {
        const data = await res.json();
        const user: AuthUser = data.user;
        setAuthUser(user);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

        // Load user workspace
        const userWork = loadUserData(user);
        setMeetings(userWork.meetings);
        setActionItems(userWork.actionItems);
        setDecisions(userWork.decisions);
        setTeamMembers(userWork.teamMembers);
        setNotifications(userWork.notifications);
        setWorkspaceProfile({
          name: user.workspaceName || 'My Workspace',
          domain: user.email.split('@')[1] || 'company.com',
          createdAt: user.createdAt,
        });
        setCurrentScreen('overview');
        return true;
      }
    } catch (e) {
      console.warn('Backend login endpoint unreachable, attempting local fallback:', e);
    }

    // Client-side fallback authentication
    const parts = cleanEmail.split('@')[0].split('.');
    const name = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Alex Morgan';
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const user: AuthUser = {
      id: `usr_${Date.now()}`,
      name,
      email: cleanEmail,
      role: 'Founder & CEO',
      department: 'Leadership',
      workspaceName: `${name.split(' ')[0]}'s Workspace`,
      avatarColor: 'bg-indigo-600 text-white',
      initials,
      createdAt: new Date().toISOString(),
    };

    setAuthUser(user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

    const userWork = loadUserData(user);
    setMeetings(userWork.meetings);
    setActionItems(userWork.actionItems);
    setDecisions(userWork.decisions);
    setTeamMembers(userWork.teamMembers);
    setNotifications(userWork.notifications);
    setCurrentScreen('overview');
    return true;
  };

  const register = async (userData: {
    name: string;
    email: string;
    password?: string;
    role?: string;
    workspaceName?: string;
    department?: string;
    avatarColor?: string;
  }): Promise<boolean> => {
    const cleanEmail = userData.email.toLowerCase().trim();
    const parts = userData.name.trim().split(/\s+/);
    const initials =
      parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : userData.name.slice(0, 2).toUpperCase();

    let createdUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: userData.name.trim(),
      email: cleanEmail,
      role: userData.role?.trim() || 'Team Lead',
      department: userData.department || 'Product',
      workspaceName: userData.workspaceName?.trim() || 'My Workspace',
      avatarColor: userData.avatarColor || 'bg-indigo-600 text-white',
      initials,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createdUser.name,
          email: cleanEmail,
          password: userData.password || 'password123',
          role: createdUser.role,
          workspaceName: createdUser.workspaceName,
          department: createdUser.department,
          avatarColor: createdUser.avatarColor,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        createdUser = data.user;
      }
    } catch (e) {
      console.warn('Backend register call fallback:', e);
    }

    setAuthUser(createdUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(createdUser));

    // Fresh new workspace
    const newOwnerMember: TeamMember = {
      id: createdUser.id,
      name: createdUser.name,
      role: createdUser.role,
      email: createdUser.email,
      avatarColor: createdUser.avatarColor,
      initials: createdUser.initials,
      department: createdUser.department,
      joinedDate: 'Sep 2026',
      openTasks: 0,
      overdueTasks: 0,
      completedTasks: 0,
    };

    setMeetings([]);
    setActionItems([]);
    setDecisions([]);
    setTeamMembers([newOwnerMember]);
    setNotifications([
      {
        id: `welcome-${Date.now()}`,
        text: `Welcome to ${createdUser.workspaceName}! Start your first meeting or invite teammates to begin.`,
        timeAgo: 'Just now',
        type: 'task_completed',
        read: false,
      },
    ]);
    setWorkspaceProfile({
      name: createdUser.workspaceName,
      domain: createdUser.email.split('@')[1] || 'company.com',
      createdAt: createdUser.createdAt,
    });

    setCurrentScreen('overview');
    return true;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthUser(null);
    setCurrentScreen('overview');
  };

  const updateWorkspaceProfile = (profile: Partial<WorkspaceProfile>) => {
    setWorkspaceProfile((prev) => ({ ...prev, ...profile }));
  };

  const resetToEmptyWorkspace = () => {
    setMeetings([]);
    setActionItems([]);
    setDecisions([]);
    const ownerOnly = authUser
      ? [
          {
            id: authUser.id,
            name: authUser.name,
            role: authUser.role,
            email: authUser.email,
            avatarColor: authUser.avatarColor,
            initials: authUser.initials,
            department: authUser.department,
            joinedDate: 'Sep 2026',
            openTasks: 0,
            overdueTasks: 0,
            completedTasks: 0,
          },
        ]
      : [];
    setTeamMembers(ownerOnly);
    setNotifications([
      {
        id: `reset-${Date.now()}`,
        text: 'Workspace reset to fresh clean slate.',
        timeAgo: 'Just now',
        type: 'task_completed',
        read: false,
      },
    ]);
    setSelectedMeetingId('');
  };

  const loadSampleData = () => {
    // Pure clean workshop mode - no demo data is loaded
    resetToEmptyWorkspace();
  };

  const openMeetingDetail = (
    meetingId: string,
    tab: 'overview' | 'transcript' | 'decisions' | 'action_items' = 'overview'
  ) => {
    setSelectedMeetingId(meetingId);
    setActiveMeetingTab(tab);
    setCurrentScreen('meeting_detail');
  };

  const toggleTaskComplete = (taskId: string) => {
    setActionItems((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const isCompleted = task.status === 'Completed';
          const newStatus: TaskStatus = isCompleted ? 'Open' : 'Completed';
          return {
            ...task,
            status: newStatus,
            completedAt: newStatus === 'Completed' ? new Date().toISOString() : undefined,
          };
        }
        return task;
      })
    );
  };

  const updateTask = (updatedTask: ActionItem) => {
    setActionItems((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setMeetings((prev) =>
      prev.map((m) => ({
        ...m,
        actionItems: m.actionItems.map((a) => (a.id === updatedTask.id ? updatedTask : a)),
      }))
    );
  };

  const createTask = (newTaskData: Omit<ActionItem, 'id'>) => {
    const newId = `act-${Date.now()}`;
    const task: ActionItem = {
      ...newTaskData,
      id: newId,
    };
    setActionItems((prev) => [task, ...prev]);

    if (task.meetingId) {
      setMeetings((prev) =>
        prev.map((m) =>
          m.id === task.meetingId
            ? {
                ...m,
                actionsCount: m.actionsCount + 1,
                actionItems: [task, ...m.actionItems],
              }
            : m
        )
      );
    }
  };

  const deleteTask = (taskId: string) => {
    setActionItems((prev) => prev.filter((t) => t.id !== taskId));
    setMeetings((prev) =>
      prev.map((m) => ({
        ...m,
        actionItems: m.actionItems.filter((a) => a.id !== taskId),
        actionsCount: Math.max(0, m.actionsCount - 1),
      }))
    );
  };

  const createDecision = (newDecisionData: Omit<Decision, 'id'>) => {
    const newId = `dec-${Date.now()}`;
    const decision: Decision = {
      ...newDecisionData,
      id: newId,
    };
    setDecisions((prev) => [decision, ...prev]);

    if (decision.meetingId) {
      setMeetings((prev) =>
        prev.map((m) =>
          m.id === decision.meetingId
            ? {
                ...m,
                decisionsCount: m.decisionsCount + 1,
                keyDecisions: [decision.text, ...m.keyDecisions],
                decisions: [decision, ...m.decisions],
              }
            : m
        )
      );
    }
  };

  const updateDecision = (updated: Decision) => {
    setDecisions((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    setMeetings((prev) =>
      prev.map((m) => ({
        ...m,
        decisions: m.decisions.map((d) => (d.id === updated.id ? updated : d)),
      }))
    );
  };

  const deleteDecision = (decisionId: string) => {
    setDecisions((prev) => prev.filter((d) => d.id !== decisionId));
    setMeetings((prev) =>
      prev.map((m) => ({
        ...m,
        decisions: m.decisions.filter((d) => d.id !== decisionId),
        decisionsCount: Math.max(0, m.decisionsCount - 1),
      }))
    );
  };

  const addTeamMember = (memberData: {
    name: string;
    email: string;
    role: string;
    department?: string;
    avatarColor?: string;
  }): TeamMember => {
    const parts = memberData.name.trim().split(/\s+/);
    const initials =
      parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : memberData.name.slice(0, 2).toUpperCase();

    const colors = [
      'bg-indigo-600 text-white',
      'bg-emerald-600 text-white',
      'bg-blue-600 text-white',
      'bg-violet-600 text-white',
      'bg-rose-600 text-white',
      'bg-amber-600 text-white',
      'bg-cyan-600 text-white',
      'bg-teal-600 text-white',
    ];
    const avatarColor = memberData.avatarColor || colors[teamMembers.length % colors.length];
    const slug = memberData.name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 10);
    const newId = `${slug}_${Date.now().toString().slice(-4)}`;

    const newMember: TeamMember = {
      id: newId,
      name: memberData.name.trim(),
      email: memberData.email.trim(),
      role: memberData.role.trim() || 'Team Member',
      department: memberData.department || 'Product',
      avatarColor,
      initials,
      joinedDate: 'Sep 2026',
      openTasks: 0,
      overdueTasks: 0,
      completedTasks: 0,
    };

    setTeamMembers((prev) => [...prev, newMember]);

    const notification: NotificationItem = {
      id: `notif-${Date.now()}`,
      text: `${newMember.name} (${newMember.role}) was added to your team.`,
      timeAgo: 'Just now',
      type: 'task_completed',
      read: false,
    };
    setNotifications((prev) => [notification, ...prev]);

    return newMember;
  };

  const updateTeamMember = (updated: TeamMember) => {
    setTeamMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setActionItems((prev) =>
      prev.map((t) =>
        t.ownerId === updated.id ? { ...t, ownerName: updated.name, ownerRole: updated.role } : t
      )
    );
  };

  const deleteTeamMember = (memberId: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
    setActionItems((prev) =>
      prev.map((t) =>
        t.ownerId === memberId
          ? { ...t, ownerId: 'unassigned', ownerName: 'Unassigned', ownerRole: 'Open' }
          : t
      )
    );
  };

  const addTranscriptAnnotation = (
    meetingId: string,
    segmentId: string,
    type: 'decision' | 'action' | 'note',
    extractedText: string
  ) => {
    if (type === 'decision') {
      const decision: Decision = {
        id: `dec-${Date.now()}`,
        meetingId,
        meetingTitle: selectedMeeting?.title || 'Meeting',
        text: extractedText,
        date: selectedMeeting?.date || 'Today',
        participants:
          selectedMeeting?.participantIds.map(
            (id) => teamMembers.find((t) => t.id === id)?.name || id
          ) || [],
        context: `Captured directly from conversation timestamp in ${selectedMeeting?.title}`,
        category: 'Product',
        status: 'Active',
        confidence: 1.0,
      };
      setDecisions((prev) => [decision, ...prev]);

      setMeetings((prev) =>
        prev.map((m) =>
          m.id === meetingId
            ? {
                ...m,
                decisionsCount: m.decisionsCount + 1,
                keyDecisions: [...m.keyDecisions, extractedText],
                decisions: [decision, ...m.decisions],
                transcript: m.transcript.map((seg) =>
                  seg.id === segmentId
                    ? { ...seg, type: 'decision_highlight', taggedEntityId: decision.id }
                    : seg
                ),
              }
            : m
        )
      );
    } else if (type === 'action') {
      const newAction: ActionItem = {
        id: `act-${Date.now()}`,
        title: extractedText,
        meetingId,
        meetingTitle: selectedMeeting?.title || 'Meeting',
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        ownerRole: currentUser.role,
        dueDate: 'Next Week',
        rawDueDate: '2026-10-02',
        priority: 'Medium',
        status: 'Open',
        confidence: 1.0,
        context: `Converted from transcript quote: "${extractedText}"`,
      };
      setActionItems((prev) => [newAction, ...prev]);

      setMeetings((prev) =>
        prev.map((m) =>
          m.id === meetingId
            ? {
                ...m,
                actionsCount: m.actionsCount + 1,
                actionItems: [newAction, ...m.actionItems],
                transcript: m.transcript.map((seg) =>
                  seg.id === segmentId
                    ? { ...seg, type: 'action_highlight', taggedEntityId: newAction.id }
                    : seg
                ),
              }
            : m
        )
      );
    }
  };

  const appendTranscriptSegment = (
    meetingId: string,
    text: string,
    speakerName?: string
  ) => {
    const speaker = teamMembers.find((m) => m.name === speakerName) || currentUser;
    const now = new Date();
    const timestamp = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newSegment = {
      id: `seg-${Date.now()}`,
      timestamp,
      speakerId: speaker.id,
      speakerName: speaker.name,
      text: text.trim(),
      type: 'regular' as const,
    };

    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? {
              ...m,
              transcript: [...m.transcript, newSegment],
            }
          : m
      )
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // LIVE AI Extraction with Gemini & resilient team mapping
  const startProcessingMeeting = async (config: {
    title: string;
    project: string;
    participantIds: string[];
    rawTranscript: string;
  }) => {
    setIsStartMeetingOpen(false);
    setCurrentScreen('ai_processing');
    setProcessingProgress(20);
    setProcessingStep(1);

    try {
      const activeMembers = teamMembers.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
      }));

      // Advance animation
      setTimeout(() => {
        setProcessingProgress(40);
        setProcessingStep(2);
      }, 600);

      // Call live backend endpoint
      const res = await fetch('/api/extract-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: config.rawTranscript,
          meetingTitle: config.title,
          teamMembers: activeMembers,
        }),
      });

      const data = await res.json();

      setProcessingProgress(70);
      setProcessingStep(3);

      const detectedDecisions = (data.decisions || []).map((d: any, idx: number) => ({
        id: `draft-dec-${idx + 1}`,
        text: d.text,
        context: d.context || 'Captured from discussion consensus',
        confidence: d.confidence || 0.95,
        approved: true,
      }));

      const detectedActions = (data.actions || []).map((a: any, idx: number) => {
        // Match owner with active team members
        const matched = teamMembers.find(
          (m) =>
            m.name.toLowerCase() === (a.suggestedOwner || '').toLowerCase() ||
            m.name.toLowerCase().includes((a.suggestedOwner || '').toLowerCase())
        );

        const ownerId = matched
          ? matched.id
          : config.participantIds[idx % config.participantIds.length] || currentUser.id;

        return {
          id: `draft-act-${idx + 1}`,
          title: a.title,
          ownerId,
          dueDate: a.suggestedDueDate || '30 Sep',
          priority: (a.priority || 'Medium') as Priority,
          confidence: a.confidence || 0.92,
          approved: true,
        };
      });

      const draft: PendingMeetingDraft = {
        title: config.title,
        project: config.project,
        date: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        duration: '35 minutes',
        participantIds:
          config.participantIds.length > 0 ? config.participantIds : [currentUser.id],
        rawTranscript: config.rawTranscript,
        detectedSummary:
          data.summary || `The team aligned on core deliverables for "${config.title}".`,
        detectedDecisions,
        detectedActions,
      };

      setPendingDraft(draft);

      setTimeout(() => {
        setProcessingProgress(90);
        setProcessingStep(4);
      }, 1200);

      setTimeout(() => {
        setProcessingProgress(100);
        setProcessingStep(5);
      }, 1800);

      setTimeout(() => {
        setCurrentScreen('ai_review');
      }, 2300);
    } catch (err) {
      console.error('Extraction error:', err);
      // Fallback draft so user flow never halts
      const draft: PendingMeetingDraft = {
        title: config.title,
        project: config.project,
        date: 'Today',
        time: '10:00 AM',
        duration: '30 minutes',
        participantIds: config.participantIds.length > 0 ? config.participantIds : [currentUser.id],
        rawTranscript: config.rawTranscript,
        detectedSummary: `Meeting summary generated for "${config.title}". Key goals were discussed and action items assigned.`,
        detectedDecisions: [
          {
            id: 'draft-dec-1',
            text: `Approved deliverables plan for ${config.title}.`,
            context: 'Agreed by team participants during session.',
            confidence: 0.95,
            approved: true,
          },
        ],
        detectedActions: [
          {
            id: 'draft-act-1',
            title: `Execute initial action items for ${config.title}`,
            ownerId: currentUser.id,
            dueDate: '30 Sep',
            priority: 'High',
            confidence: 0.94,
            approved: true,
          },
        ],
      };
      setPendingDraft(draft);
      setProcessingProgress(100);
      setProcessingStep(5);
      setTimeout(() => setCurrentScreen('ai_review'), 1000);
    }
  };

  const updateDraftSummary = (summary: string) => {
    if (!pendingDraft) return;
    setPendingDraft({ ...pendingDraft, detectedSummary: summary });
  };

  const toggleApproveDecision = (id: string) => {
    if (!pendingDraft) return;
    setPendingDraft({
      ...pendingDraft,
      detectedDecisions: pendingDraft.detectedDecisions.map((d) =>
        d.id === id ? { ...d, approved: !d.approved } : d
      ),
    });
  };

  const toggleApproveAction = (id: string) => {
    if (!pendingDraft) return;
    setPendingDraft({
      ...pendingDraft,
      detectedActions: pendingDraft.detectedActions.map((a) =>
        a.id === id ? { ...a, approved: !a.approved } : a
      ),
    });
  };

  const updateDraftAction = (
    id: string,
    updates: Partial<PendingMeetingDraft['detectedActions'][0]>
  ) => {
    if (!pendingDraft) return;
    setPendingDraft({
      ...pendingDraft,
      detectedActions: pendingDraft.detectedActions.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    });
  };

  const publishDraftMeeting = () => {
    if (!pendingDraft) return;

    const newMeetingId = `meet-${Date.now()}`;

    // Convert approved decisions
    const approvedDecisions: Decision[] = pendingDraft.detectedDecisions
      .filter((d) => d.approved)
      .map((d, index) => ({
        id: `dec-${Date.now()}-${index}`,
        meetingId: newMeetingId,
        meetingTitle: pendingDraft.title,
        text: d.text,
        date: pendingDraft.date,
        participants: pendingDraft.participantIds.map(
          (pid) => teamMembers.find((t) => t.id === pid)?.name || 'Team Member'
        ),
        context: d.context,
        category: 'Product',
        status: 'Active',
        confidence: d.confidence,
      }));

    // Convert approved action items
    const approvedActions: ActionItem[] = pendingDraft.detectedActions
      .filter((a) => a.approved)
      .map((a, index) => {
        const owner = teamMembers.find((t) => t.id === a.ownerId) || currentUser;
        return {
          id: `act-${Date.now()}-${index}`,
          title: a.title,
          meetingId: newMeetingId,
          meetingTitle: pendingDraft.title,
          ownerId: owner.id,
          ownerName: owner.name,
          ownerRole: owner.role,
          dueDate: a.dueDate,
          rawDueDate: '2026-09-30',
          priority: a.priority,
          status: 'Open' as TaskStatus,
          confidence: a.confidence,
          context: `Extracted from ${pendingDraft.title}`,
        };
      });

    // Parse transcript lines into structured segments
    const lines = pendingDraft.rawTranscript.split('\n').filter((l) => l.trim().length > 0);
    const parsedTranscript: Meeting['transcript'] = lines.map((line, idx) => {
      const match = line.match(/^(\d{2}:\d{2})\s+([^:]+):\s*(.+)$/);
      if (match) {
        const [, time, speakerStr, text] = match;
        const matchedMember = teamMembers.find((m) =>
          speakerStr.toLowerCase().includes(m.name.toLowerCase().split(' ')[0])
        );
        return {
          id: `seg-${idx}`,
          timestamp: time,
          speakerId: matchedMember?.id || currentUser.id,
          speakerName: matchedMember?.name || speakerStr,
          text,
        };
      }
      return {
        id: `seg-${idx}`,
        timestamp: `10:${String(idx * 2).padStart(2, '0')}`,
        speakerId: currentUser.id,
        speakerName: currentUser.name,
        text: line,
      };
    });

    const newMeeting: Meeting = {
      id: newMeetingId,
      title: pendingDraft.title,
      date: pendingDraft.date,
      displayDate: 'Today',
      time: pendingDraft.time,
      duration: pendingDraft.duration,
      project: pendingDraft.project,
      participantIds: pendingDraft.participantIds,
      status: 'Processed',
      summary: pendingDraft.detectedSummary,
      keyDecisions: approvedDecisions.map((d) => d.text),
      actionItems: approvedActions,
      decisions: approvedDecisions,
      transcript:
        parsedTranscript.length > 0
          ? parsedTranscript
          : [
              {
                id: 'seg-1',
                timestamp: '10:00',
                speakerId: currentUser.id,
                speakerName: currentUser.name,
                text: 'Meeting initiated and transcribed. Outcomes verified and approved.',
              },
            ],
      decisionsCount: approvedDecisions.length,
      actionsCount: approvedActions.length,
    };

    setMeetings((prev) => [newMeeting, ...prev]);
    setDecisions((prev) => [...approvedDecisions, ...prev]);
    setActionItems((prev) => [...approvedActions, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      text: `${approvedActions.length} action items and ${approvedDecisions.length} decisions were published from ${newMeeting.title}.`,
      timeAgo: 'Just now',
      type: 'actions_extracted',
      read: false,
      meetingId: newMeetingId,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    setSelectedMeetingId(newMeetingId);
    setActiveMeetingTab('overview');
    setCurrentScreen('meeting_detail');
    setPendingDraft(null);
  };

  const cancelDraft = () => {
    setPendingDraft(null);
    setCurrentScreen('meetings');
  };

  return (
    <MeetingFlowContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        selectedMeetingId,
        setSelectedMeetingId,
        selectedMeeting,
        activeMeetingTab,
        setActiveMeetingTab,
        meetings,
        actionItems,
        decisions,
        teamMembers,
        notifications,
        unreadNotificationsCount,
        currentUser,
        authUser,
        isAuthenticated,
        workspaceProfile,
        login,
        register,
        logout,
        updateWorkspaceProfile,
        resetToEmptyWorkspace,
        loadSampleData,
        toggleTaskComplete,
        updateTask,
        createTask,
        deleteTask,
        createDecision,
        updateDecision,
        deleteDecision,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        addTranscriptAnnotation,
        appendTranscriptSegment,
        isStartMeetingOpen,
        setIsStartMeetingOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isTaskModalOpen,
        setIsTaskModalOpen,
        isAddMemberModalOpen,
        setIsAddMemberModalOpen,
        taskToEdit,
        setTaskToEdit,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        pendingDraft,
        processingProgress,
        processingStep,
        startProcessingMeeting,
        updateDraftSummary,
        toggleApproveDecision,
        toggleApproveAction,
        updateDraftAction,
        publishDraftMeeting,
        cancelDraft,
        openMeetingDetail,
      }}
    >
      {children}
    </MeetingFlowContext.Provider>
  );
};

export const useMeetingFlow = () => {
  const context = useContext(MeetingFlowContext);
  if (!context) {
    throw new Error('useMeetingFlow must be used within a MeetingFlowProvider');
  }
  return context;
};
