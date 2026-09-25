export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarColor: string;
  initials: string;
  department?: string;
  joinedDate?: string;
  openTasks: number;
  overdueTasks: number;
  completedTasks: number;
}

export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Open' | 'In Progress' | 'Completed' | 'Overdue';
export type MeetingStatus = 'Processed' | 'In Review' | 'Processing' | 'Scheduled';

export interface ActionItem {
  id: string;
  title: string;
  meetingId: string;
  meetingTitle: string;
  ownerId: string;
  ownerName: string;
  ownerRole?: string;
  dueDate: string; // e.g. "Today", "26 Sep", "30 Sep"
  rawDueDate: string; // ISO date string e.g. "2026-09-25"
  priority: Priority;
  status: TaskStatus;
  confidence?: number; // e.g. 0.94 for AI detected
  context?: string; // Snippet from transcript
  completedAt?: string;
  dependsOnTaskIds?: string[]; // IDs of tasks this item is blocked by / waiting on
}

export interface Decision {
  id: string;
  meetingId: string;
  meetingTitle: string;
  text: string;
  date: string; // e.g. "24 Sep 2026"
  participants: string[];
  context: string;
  category?: 'Product' | 'Engineering' | 'Operations' | 'Marketing' | 'Finance';
  status: 'Active' | 'Superseded';
  confidence?: number;
}

export interface TranscriptSegment {
  id: string;
  timestamp: string; // e.g. "10:04"
  speakerId: string;
  speakerName: string;
  text: string;
  type?: 'regular' | 'decision_highlight' | 'action_highlight' | 'note_highlight';
  taggedEntityId?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string; // e.g. "24 Sep 2026"
  displayDate: string; // e.g. "Today", "Yesterday", "24 Sep"
  time: string; // e.g. "10:00 AM"
  duration: string; // e.g. "52 minutes"
  project: string; // e.g. "Product Core", "Operations", "Fundraising"
  participantIds: string[];
  status: MeetingStatus;
  summary: string;
  keyDecisions: string[];
  actionItems: ActionItem[];
  decisions: Decision[];
  transcript: TranscriptSegment[];
  decisionsCount: number;
  actionsCount: number;
}

export interface NotificationItem {
  id: string;
  text: string;
  timeAgo: string;
  type: 'task_due' | 'actions_extracted' | 'task_completed';
  read: boolean;
  meetingId?: string;
  actionItemId?: string;
}

export type AppScreen =
  | 'overview'
  | 'meetings'
  | 'meeting_detail'
  | 'action_items'
  | 'decisions'
  | 'team'
  | 'reports'
  | 'settings'
  | 'ai_processing'
  | 'ai_review';

export interface PendingMeetingDraft {
  title: string;
  project: string;
  date: string;
  time: string;
  duration: string;
  participantIds: string[];
  rawTranscript: string;
  detectedSummary: string;
  detectedDecisions: Array<{
    id: string;
    text: string;
    context: string;
    confidence: number;
    approved: boolean;
  }>;
  detectedActions: Array<{
    id: string;
    title: string;
    ownerId: string;
    dueDate: string;
    priority: Priority;
    confidence: number;
    approved: boolean;
  }>;
}
