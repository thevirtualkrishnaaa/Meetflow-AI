import { ActionItem, Decision, Meeting, NotificationItem, TeamMember, TranscriptSegment } from '../types';

export const CURRENT_USER_ID = 'alex_m';

// Pure clean initial workspace - zero demo data
export const INITIAL_TEAM_MEMBERS: TeamMember[] = [];
export const INITIAL_DECISIONS: Decision[] = [];
export const INITIAL_ACTION_ITEMS: ActionItem[] = [];
export const INITIAL_MEETINGS: Meeting[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const PRODUCT_STRATEGY_TRANSCRIPT: TranscriptSegment[] = [];

export const SAMPLE_TRANSCRIPT_PRESETS: Array<{ id: string; title: string; project: string; transcript: string }> = [];
