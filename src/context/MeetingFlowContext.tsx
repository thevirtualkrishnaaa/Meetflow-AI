import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ActionItem,
  AppScreen,
  Decision,
  Meeting,
  NotificationItem,
  PendingMeetingDraft,
  Priority,
  TaskStatus,
  TeamMember,
} from '../types';
import {
  CURRENT_USER_ID,
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
  }) => void;
  updateDraftSummary: (summary: string) => void;
  toggleApproveDecision: (id: string) => void;
  toggleApproveAction: (id: string) => void;
  updateDraftAction: (id: string, updates: Partial<PendingMeetingDraft['detectedActions'][0]>) => void;
  publishDraftMeeting: () => void;
  cancelDraft: () => void;
  openMeetingDetail: (meetingId: string, tab?: 'overview' | 'transcript' | 'decisions' | 'action_items') => void;
}

const MeetingFlowContext = createContext<MeetingFlowContextType | undefined>(undefined);

export const MeetingFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('overview');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('meet-1');
  const [activeMeetingTab, setActiveMeetingTab] = useState<'overview' | 'transcript' | 'decisions' | 'action_items'>('overview');

  const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [actionItems, setActionItems] = useState<ActionItem[]>(INITIAL_ACTION_ITEMS);
  const [decisions, setDecisions] = useState<Decision[]>(INITIAL_DECISIONS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

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

  const currentUser = teamMembers.find((m) => m.id === CURRENT_USER_ID) || teamMembers[0];
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

  const openMeetingDetail = (meetingId: string, tab: 'overview' | 'transcript' | 'decisions' | 'action_items' = 'overview') => {
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
    // Also sync in meetings if present
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

    // Update parent meeting if exists
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

    // Send workspace notification
    const notification: NotificationItem = {
      id: `notif-${Date.now()}`,
      text: `${newMember.name} (${newMember.role}) was added to the workspace.`,
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
        participants: selectedMeeting?.participantIds.map((id) => teamMembers.find((t) => t.id === id)?.name || id) || [],
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
                  seg.id === segmentId ? { ...seg, type: 'decision_highlight', taggedEntityId: decision.id } : seg
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
                  seg.id === segmentId ? { ...seg, type: 'action_highlight', taggedEntityId: newAction.id } : seg
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

  // Processing wizard simulation with realistic AI extraction
  const startProcessingMeeting = (config: {
    title: string;
    project: string;
    participantIds: string[];
    rawTranscript: string;
  }) => {
    setIsStartMeetingOpen(false);
    setCurrentScreen('ai_processing');
    setProcessingProgress(15);
    setProcessingStep(1);

    // Realistic parser based on transcript content or intelligent fallback
    const hasRoadmap = config.rawTranscript.toLowerCase().includes('roadmap') || config.rawTranscript.toLowerCase().includes('analytics');
    const hasSoc2 = config.rawTranscript.toLowerCase().includes('soc2') || config.rawTranscript.toLowerCase().includes('2fa');

    let summary = `The team met to review ${config.title}, resolving key blockers and assigning operational ownership for upcoming deliverables.`;
    let detectedDecisions = [
      {
        id: `draft-dec-1`,
        text: 'Standardize cross-functional sprint commitments with bi-weekly checkpoints.',
        context: 'Unanimous alignment between engineering and leadership to prevent release delays.',
        confidence: 0.96,
        approved: true,
      },
      {
        id: `draft-dec-2`,
        text: 'Prioritize core workflow reliability over net-new speculative features.',
        context: 'Directly responds to customer survey highlighting consistency as #1 priority.',
        confidence: 0.92,
        approved: true,
      },
    ];

    let detectedActions = [
      {
        id: `draft-act-1`,
        title: `Prepare technical execution plan for ${config.title}`,
        ownerId: config.participantIds[1] || 'sarah_c',
        dueDate: '29 Sep',
        priority: 'High' as Priority,
        confidence: 0.95,
        approved: true,
      },
      {
        id: `draft-act-2`,
        title: 'Draft stakeholder alignment brief and share in #announcements',
        ownerId: config.participantIds[0] || 'alex_m',
        dueDate: '30 Sep',
        priority: 'Medium' as Priority,
        confidence: 0.91,
        approved: true,
      },
      {
        id: `draft-act-3`,
        title: 'Review operational dependencies with platform infrastructure team',
        ownerId: config.participantIds[2] || 'james_w',
        dueDate: '02 Oct',
        priority: 'Low' as Priority,
        confidence: 0.88,
        approved: true,
      },
    ];

    if (hasRoadmap) {
      summary =
        'The team aligned on Q4 deliverables, agreed to prioritize customer-requested analytics dashboard before next release, and locked in engineering deadlines.';
      detectedDecisions = [
        {
          id: 'draft-dec-1',
          text: 'Prioritize analytics dashboard for Q4 release ahead of billing upgrades.',
          context: 'Customer feedback showed strong demand for reporting functionality from 82% of enterprise trial users.',
          confidence: 0.98,
          approved: true,
        },
        {
          id: 'draft-dec-2',
          text: 'Scope initial analytics data model exclusively to action items and owner velocity.',
          context: 'Ensures delivery by October 25 deadline without overloading backend pipelines.',
          confidence: 0.94,
          approved: true,
        },
      ];
      detectedActions = [
        {
          id: 'draft-act-1',
          title: 'Prepare analytics dashboard wireframes',
          ownerId: 'sarah_c',
          dueDate: '28 Sep',
          priority: 'High' as Priority,
          confidence: 0.97,
          approved: true,
        },
        {
          id: 'draft-act-2',
          title: 'Conduct technical load testing on database schema',
          ownerId: 'elena_r',
          dueDate: '29 Sep',
          priority: 'High' as Priority,
          confidence: 0.95,
          approved: true,
        },
        {
          id: 'draft-act-3',
          title: 'Set up weekly follow-up reminder email notifications',
          ownerId: 'james_w',
          dueDate: '01 Oct',
          priority: 'Medium' as Priority,
          confidence: 0.92,
          approved: true,
        },
      ];
    } else if (hasSoc2) {
      summary =
        'Reviewed third-party penetration testing results and finalized required controls for SOC2 Type II certification, notably mandatory 2FA.';
      detectedDecisions = [
        {
          id: 'draft-dec-1',
          text: 'Mandatory 2FA will be enforced on all active workspace accounts starting November 1.',
          context: 'Crucial requirement from auditor and security questionnaire compliance.',
          confidence: 0.99,
          approved: true,
        },
      ];
      detectedActions = [
        {
          id: 'draft-act-1',
          title: 'Implement 2FA enforcement middleware and fallback recovery codes',
          ownerId: 'elena_r',
          dueDate: '15 Oct',
          priority: 'High' as Priority,
          confidence: 0.98,
          approved: true,
        },
        {
          id: 'draft-act-2',
          title: 'Coordinate vendor compliance evidence collection for auditor review',
          ownerId: 'james_w',
          dueDate: '20 Oct',
          priority: 'Medium' as Priority,
          confidence: 0.93,
          approved: true,
        },
      ];
    }

    const draft: PendingMeetingDraft = {
      title: config.title,
      project: config.project,
      date: '25 Sep 2026',
      time: '10:30 AM',
      duration: '42 minutes',
      participantIds: config.participantIds.length > 0 ? config.participantIds : ['alex_m', 'sarah_c', 'james_w'],
      rawTranscript: config.rawTranscript,
      detectedSummary: summary,
      detectedDecisions,
      detectedActions,
    };

    setPendingDraft(draft);

    // Multi-stage pipeline animation
    const timer1 = setTimeout(() => {
      setProcessingProgress(35);
      setProcessingStep(2);
    }, 700);

    const timer2 = setTimeout(() => {
      setProcessingProgress(65);
      setProcessingStep(3);
    }, 1500);

    const timer3 = setTimeout(() => {
      setProcessingProgress(85);
      setProcessingStep(4);
    }, 2200);

    const timer4 = setTimeout(() => {
      setProcessingProgress(100);
      setProcessingStep(5);
    }, 3000);

    const timer5 = setTimeout(() => {
      setCurrentScreen('ai_review');
    }, 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
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

  const updateDraftAction = (id: string, updates: Partial<PendingMeetingDraft['detectedActions'][0]>) => {
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
        const owner = teamMembers.find((t) => t.id === a.ownerId) || teamMembers[0];
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

    // Parse raw transcript lines into structured segments if available
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
          speakerId: matchedMember?.id || 'alex_m',
          speakerName: matchedMember?.name || speakerStr,
          text,
        };
      }
      return {
        id: `seg-${idx}`,
        timestamp: `10:${String(idx * 2).padStart(2, '0')}`,
        speakerId: 'alex_m',
        speakerName: 'Alex Morgan',
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
                speakerId: 'alex_m',
                speakerName: 'Alex Morgan',
                text: 'Meeting initiated and transcribed. Outcomes verified and approved.',
              },
            ],
      decisionsCount: approvedDecisions.length,
      actionsCount: approvedActions.length,
    };

    setMeetings((prev) => [newMeeting, ...prev]);
    setDecisions((prev) => [...approvedDecisions, ...prev]);
    setActionItems((prev) => [...approvedActions, ...prev]);

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      text: `${approvedActions.length} action items were extracted from ${newMeeting.title}.`,
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
