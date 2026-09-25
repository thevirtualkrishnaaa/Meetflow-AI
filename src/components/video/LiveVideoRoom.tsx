import React, { useState, useEffect, useRef } from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import { FounderMachaLogo } from '../ui/FounderMachaLogo';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  PhoneOff,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  ChevronRight,
  MessageSquare,
  Plus,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Radio,
  FileText,
  UserPlus,
  Trash2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { Priority, TaskStatus } from '../../types';

interface DetectedAction {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  dueDate: string;
  priority: Priority;
}

export const LiveVideoRoom: React.FC = () => {
  const {
    currentUser,
    teamMembers,
    setCurrentScreen,
    createTask,
    setIsAddMemberModalOpen,
    workspaceProfile,
  } = useMeetingFlow();

  // Media states
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<'notes' | 'participants'>('notes');
  const [meetingTitle, setMeetingTitle] = useState('Foundermatcha Workshop Meeting');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Live notes and spoken transcript
  const [transcriptEntries, setTranscriptEntries] = useState<
    Array<{ id: string; speaker: string; text: string; time: string }>
  >([]);
  const [currentNoteInput, setCurrentNoteInput] = useState('');
  const [isAiListening, setIsAiListening] = useState(true);

  // End meeting AI modal state
  const [showEndMeetingReport, setShowEndMeetingReport] = useState(false);
  const [isGeneratingAiReport, setIsGeneratingAiReport] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [generatedDecisions, setGeneratedDecisions] = useState<string[]>([]);
  const [generatedActions, setGeneratedActions] = useState<DetectedAction[]>([]);
  const [newActionTitle, setNewActionTitle] = useState('');

  // Video element refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localMediaStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // 1. Call timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 2. Initialize camera & microphone
  useEffect(() => {
    let mounted = true;

    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          if (!mounted) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          localMediaStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn('Camera/mic access unavailable or denied:', err);
      }
    }

    initCamera();

    return () => {
      mounted = false;
      if (localMediaStreamRef.current) {
        localMediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // 3. Microphone toggle
  const toggleMic = () => {
    if (localMediaStreamRef.current) {
      localMediaStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !isMicOn;
      });
    }
    setIsMicOn((prev) => !prev);
  };

  // 4. Camera toggle
  const toggleVideo = () => {
    if (localMediaStreamRef.current) {
      localMediaStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !isVideoOn;
      });
    }
    setIsVideoOn((prev) => !prev);
  };

  // 5. Screen Share toggle
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      if (localVideoRef.current && localMediaStreamRef.current) {
        localVideoRef.current.srcObject = localMediaStreamRef.current;
      }
      setIsScreenSharing(false);
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
          });
          screenStreamRef.current = screenStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
          }
          screenStream.getVideoTracks()[0].onended = () => {
            if (localVideoRef.current && localMediaStreamRef.current) {
              localVideoRef.current.srcObject = localMediaStreamRef.current;
            }
            setIsScreenSharing(false);
          };
          setIsScreenSharing(true);
        }
      } catch (err) {
        console.warn('Screen share canceled or denied:', err);
      }
    }
  };

  // 6. Speech Recognition for real-time AI transcription
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition && isAiListening && isMicOn) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const lastResultIndex = event.results.length - 1;
          const transcriptText = event.results[lastResultIndex][0].transcript.trim();
          if (transcriptText) {
            setTranscriptEntries((prev) => [
              ...prev,
              {
                id: `entry-${Date.now()}`,
                speaker: currentUser.name,
                text: transcriptText,
                time: formatTime(callDurationSeconds),
              },
            ]);
          }
        };

        recognition.onerror = () => {
          // Silent fallback
        };

        recognition.start();
        speechRecognitionRef.current = recognition;

        return () => {
          try {
            recognition.stop();
          } catch {}
        };
      } catch {}
    }
  }, [isAiListening, isMicOn, currentUser.name, callDurationSeconds]);

  // 7. Add Manual Note to live transcript
  const handleAddManualNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNoteInput.trim()) return;

    setTranscriptEntries((prev) => [
      ...prev,
      {
        id: `note-${Date.now()}`,
        speaker: `${currentUser.name} (Live Note)`,
        text: currentNoteInput.trim(),
        time: formatTime(callDurationSeconds),
      },
    ]);
    setCurrentNoteInput('');
  };

  // 8. Copy meeting link
  const handleCopyLink = () => {
    const link = `https://foundermatcha.com/meet/${workspaceProfile.name.toLowerCase().replace(/\s+/g, '-')}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // 9. Trigger End Meeting & AI Report Generation
  const handleEndCallClick = async () => {
    setIsGeneratingAiReport(true);
    setShowEndMeetingReport(true);

    // Build raw discussion context from transcript & notes
    const combinedNotes =
      transcriptEntries.length > 0
        ? transcriptEntries.map((e) => `${e.speaker}: ${e.text}`).join('\n')
        : `${currentUser.name}: Held workshop meeting for ${meetingTitle}. Reviewed team goals, sprint deliverables, and agreed on key next steps today.`;

    try {
      const response = await fetch('/api/extract-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: combinedNotes,
          meetingTitle,
          teamMembers,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedSummary(
          data.summary ||
            `The team met for "${meetingTitle}" to align on workshop deliverables, review progress, and specify today's immediate priorities.`
        );

        const decisions = Array.isArray(data.decisions)
          ? data.decisions.map((d: any) => (typeof d === 'string' ? d : d.text))
          : [`Agreed on execution roadmap and today's priority commitments for ${meetingTitle}.`];
        setGeneratedDecisions(decisions);

        const actions: DetectedAction[] = (data.actions || []).map((a: any, idx: number) => {
          const matchedMember = teamMembers.find(
            (m) =>
              m.name.toLowerCase() === (a.suggestedOwner || '').toLowerCase() ||
              m.name.split(' ')[0].toLowerCase() === (a.suggestedOwner || '').toLowerCase()
          );

          return {
            id: `act-gen-${Date.now()}-${idx}`,
            title: a.title || 'Follow up on discussion items',
            ownerId: matchedMember ? matchedMember.id : currentUser.id,
            ownerName: matchedMember ? matchedMember.name : currentUser.name,
            dueDate: a.suggestedDueDate || 'Today',
            priority: (a.priority as Priority) || 'High',
          };
        });

        // Ensure at least one action exists
        if (actions.length === 0) {
          actions.push({
            id: `act-gen-${Date.now()}-default`,
            title: `Execute deliverables agreed during ${meetingTitle}`,
            ownerId: currentUser.id,
            ownerName: currentUser.name,
            dueDate: 'Today',
            priority: 'High',
          });
        }

        setGeneratedActions(actions);
      } else {
        throw new Error('Fallback report');
      }
    } catch {
      // Clean fallback if offline or API error
      setGeneratedSummary(
        `The team conducted "${meetingTitle}" to align on workshop goals, discuss ongoing deliverables, and establish clear action items to be completed today.`
      );
      setGeneratedDecisions([
        `Approved workshop plan and priorities for ${meetingTitle}.`,
      ]);
      setGeneratedActions([
        {
          id: `act-fallback-${Date.now()}`,
          title: `Complete core deliverables discussed in ${meetingTitle}`,
          ownerId: currentUser.id,
          ownerName: currentUser.name,
          dueDate: 'Today',
          priority: 'High',
        },
      ]);
    } finally {
      setIsGeneratingAiReport(false);
    }
  };

  // 10. Save AI Report & Publish Tasks directly to Workspace
  const handleSaveReportAndTasks = () => {
    // Save each detected action item into the workspace Tasks & Goals
    generatedActions.forEach((action) => {
      const ownerMember = teamMembers.find((m) => m.id === action.ownerId);
      createTask({
        title: action.title,
        meetingId: `meet-${Date.now()}`,
        meetingTitle,
        ownerId: action.ownerId,
        ownerName: ownerMember?.name || currentUser.name,
        ownerRole: ownerMember?.role || currentUser.role || 'Team Member',
        dueDate: action.dueDate,
        rawDueDate: new Date().toISOString().split('T')[0],
        priority: action.priority,
        status: 'Open',
        confidence: 0.95,
        context: `Generated by AI assistant during video call "${meetingTitle}".`,
      });
    });

    // Close modal & navigate to Tasks & Goals
    setShowEndMeetingReport(false);
    setCurrentScreen('action_items');
  };

  // Add custom action manually during review
  const handleAddCustomAction = () => {
    if (!newActionTitle.trim()) return;
    setGeneratedActions((prev) => [
      ...prev,
      {
        id: `act-custom-${Date.now()}`,
        title: newActionTitle.trim(),
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        dueDate: 'Today',
        priority: 'High',
      },
    ]);
    setNewActionTitle('');
  };

  const otherTeamMembers = teamMembers.filter((m) => m.id !== currentUser.id);

  return (
    <div className="relative h-[calc(100vh-6rem)] w-full rounded-2xl overflow-hidden bg-neutral-950 flex flex-col font-sans select-none border border-neutral-800 shadow-2xl">
      {/* Top Header Bar (Google Meet Style) */}
      <div className="h-14 px-5 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800/80 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <FounderMachaLogo size="sm" showText={false} />
          {isEditingTitle ? (
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              autoFocus
              className="text-sm font-bold text-white bg-neutral-800 px-2 py-1 rounded border border-[#78c452]/50 focus:outline-none"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-sm font-bold text-white hover:text-[#78c452] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Click to edit meeting name"
            >
              <span>{meetingTitle}</span>
              <span className="text-[10px] text-neutral-400 font-normal">✎</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-mono">
            <Clock className="w-3 h-3 text-[#78c452]" />
            <span>{formatTime(callDurationSeconds)}</span>
          </div>
        </div>

        {/* Center: Live AI Recording Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#78c452]/10 border border-[#78c452]/20 text-[#78c452] text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#78c452] animate-pulse" />
          <span>AI Recording & Summarizing Active</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700 cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#78c452]" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copiedLink ? 'Copied!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={() => setIsAddMemberModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#78c452]" />
            <span className="hidden md:inline">Add Member</span>
          </button>
        </div>
      </div>

      {/* Main Video Grid Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 p-4 flex flex-col justify-center items-center overflow-y-auto">
          {/* Grid Layout depending on member count */}
          <div
            className={`w-full h-full max-w-6xl grid gap-4 items-center justify-center ${
              otherTeamMembers.length === 0
                ? 'grid-cols-1'
                : otherTeamMembers.length === 1
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {/* Tile 1: Current User (Local Camera stream) */}
            <div className="relative w-full h-full min-h-[260px] bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center shadow-lg group">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isVideoOn ? 'opacity-100' : 'opacity-0 hidden'
                }`}
              />

              {/* Avatar Fallback if camera is off */}
              {!isVideoOn && (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-md ${currentUser.avatarColor}`}
                  >
                    {currentUser.initials}
                  </div>
                  <span className="text-sm font-semibold text-white">{currentUser.name}</span>
                </div>
              )}

              {/* Bottom label */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-neutral-950/80 backdrop-blur-xs text-xs text-white border border-neutral-800/80">
                <span className="font-semibold">{currentUser.name} (You)</span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {currentUser.role || 'Founder & CEO'}
                </span>
                {!isMicOn ? (
                  <MicOff className="w-3 h-3 text-rose-500" />
                ) : (
                  <Mic className="w-3 h-3 text-[#78c452]" />
                )}
              </div>
            </div>

            {/* If user is alone: Clean Google Meet invite tile */}
            {otherTeamMembers.length === 0 && (
              <div className="w-full h-full min-h-[220px] bg-neutral-900/40 border border-dashed border-neutral-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-[#78c452] mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">You're in the workshop meeting</h3>
                <p className="text-xs text-neutral-400 max-w-sm mt-1 mb-4">
                  Add team members to assign their roles, or copy the link to invite them to this session.
                </p>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsAddMemberModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-950 bg-[#78c452] hover:bg-[#67b342] rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Team Member</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all border border-neutral-700 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Other real team members added to workshop */}
            {otherTeamMembers.map((member) => (
              <div
                key={member.id}
                className="relative w-full h-full min-h-[260px] bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 flex flex-col items-center justify-center shadow-lg group p-4"
              >
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-md ${member.avatarColor}`}
                >
                  {member.initials}
                </div>
                <span className="text-sm font-semibold text-white mt-3">{member.name}</span>
                <span className="text-xs text-neutral-400 font-mono mt-0.5">{member.role}</span>

                <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-neutral-950/80 backdrop-blur-xs text-xs text-white border border-neutral-800/80">
                  <span className="font-semibold">{member.name}</span>
                  <Mic className="w-3 h-3 text-[#78c452]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side Drawer: Live AI Notes & Participants */}
        {isSideDrawerOpen && (
          <div className="w-80 sm:w-96 bg-neutral-900 border-l border-neutral-800 flex flex-col z-20 animate-fadeIn">
            {/* Drawer Tabs */}
            <div className="flex border-b border-neutral-800 p-2 gap-1 bg-neutral-950/40">
              <button
                onClick={() => setActiveSideTab('notes')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeSideTab === 'notes'
                    ? 'bg-[#78c452] text-neutral-950'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>AI Transcript & Notes</span>
              </button>
              <button
                onClick={() => setActiveSideTab('participants')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeSideTab === 'participants'
                    ? 'bg-[#78c452] text-neutral-950'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Team ({teamMembers.length})</span>
              </button>
            </div>

            {/* Tab 1: Live AI Transcript & Notes */}
            {activeSideTab === 'notes' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-3 bg-neutral-950/30 border-b border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#78c452] animate-ping" />
                    Live Audio & Note Stream
                  </span>
                  <span>{transcriptEntries.length} items</span>
                </div>

                <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
                  {transcriptEntries.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500 text-xs">
                      <Sparkles className="w-6 h-6 mx-auto mb-2 text-[#78c452]/50" />
                      Speak naturally or type a quick note below. The AI captures all topics and converts them into tasks when you end the call.
                    </div>
                  ) : (
                    transcriptEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#78c452] mb-1">
                          <span>{entry.speaker}</span>
                          <span className="text-neutral-500 font-mono">{entry.time}</span>
                        </div>
                        <p className="text-neutral-300 leading-relaxed">{entry.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Input for manual discussion notes */}
                <form
                  onSubmit={handleAddManualNote}
                  className="p-3 border-t border-neutral-800 bg-neutral-950 flex gap-2"
                >
                  <input
                    type="text"
                    value={currentNoteInput}
                    onChange={(e) => setCurrentNoteInput(e.target.value)}
                    placeholder="Type a quick meeting point..."
                    className="flex-1 px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#78c452]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#78c452] hover:bg-[#67b342] text-neutral-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </form>
              </div>
            )}

            {/* Tab 2: Participants */}
            {activeSideTab === 'participants' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Workshop Attendees
                  </span>
                  <button
                    onClick={() => setIsAddMemberModalOpen(true)}
                    className="text-xs text-[#78c452] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Member</span>
                  </button>
                </div>

                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${member.avatarColor}`}
                      >
                        {member.initials}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">
                          {member.name} {member.id === currentUser.id && '(You)'}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">{member.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Bottom Control Bar (Google Meet Style) */}
      <div className="h-20 bg-neutral-950 border-t border-neutral-800/80 px-6 flex items-center justify-between z-20 shrink-0">
        <div className="hidden sm:block text-xs text-neutral-400 font-mono">
          <span>Foundermatcha Meet</span>
        </div>

        {/* Center Control Pill */}
        <div className="flex items-center gap-3 mx-auto">
          {/* Microphone */}
          <button
            onClick={toggleMic}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 ${
              isMicOn
                ? 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Camera */}
          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 ${
              isVideoOn
                ? 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
            title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 ${
              isScreenSharing
                ? 'bg-[#78c452] text-neutral-950 font-bold'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
            }`}
            title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Entire Screen'}
          >
            <ScreenShare className="w-5 h-5" />
          </button>

          {/* AI Notes & Chat Drawer Toggle */}
          <button
            onClick={() => setIsSideDrawerOpen((prev) => !prev)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 ${
              isSideDrawerOpen
                ? 'bg-[#78c452] text-neutral-950 font-bold'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
            }`}
            title="Toggle AI Notes & Transcript"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Red End Call Button */}
          <button
            onClick={handleEndCallClick}
            className="h-12 px-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
            title="End Meeting & Generate AI Report"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Call</span>
          </button>
        </div>

        <div className="hidden sm:block text-xs text-neutral-500 font-mono">
          <span>AI Engine Connected</span>
        </div>
      </div>

      {/* AI Post-Meeting Report & Task Assignment Modal */}
      {showEndMeetingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#78c452]/20 border border-[#78c452]/30 flex items-center justify-center text-[#78c452]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">AI Meeting Summary & Action Report</h3>
                  <p className="text-xs text-neutral-400">
                    {meetingTitle} • Duration: {formatTime(callDurationSeconds)}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {isGeneratingAiReport ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-10 h-10 border-2 border-[#78c452] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-white">
                    AI is synthesizing call transcript into summary report and tasks...
                  </p>
                  <p className="text-xs text-neutral-400">
                    Extracting what was talked about and what needs to be done today.
                  </p>
                </div>
              ) : (
                <>
                  {/* 1. What was talked about in this meeting */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#78c452] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>What We Talked About on This Meeting</span>
                    </label>
                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 leading-relaxed">
                      {generatedSummary}
                    </div>
                  </div>

                  {/* 2. Key Decisions & Goals Agreed */}
                  {generatedDecisions.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#78c452]" />
                        <span>Key Goals & Decisions Established</span>
                      </label>
                      <ul className="space-y-1.5">
                        {generatedDecisions.map((dec, idx) => (
                          <li
                            key={idx}
                            className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs flex items-start gap-2"
                          >
                            <span className="text-[#78c452] font-bold">•</span>
                            <span>{dec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 3. Things to be done today (Action Items & Assigning Goals) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Things To Be Done Today (Assign to Team Members)</span>
                      </label>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {generatedActions.length} tasks ready
                      </span>
                    </div>

                    <div className="space-y-2">
                      {generatedActions.map((action, idx) => (
                        <div
                          key={action.id}
                          className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={action.title}
                              onChange={(e) => {
                                const newTitle = e.target.value;
                                setGeneratedActions((prev) =>
                                  prev.map((a, i) => (i === idx ? { ...a, title: newTitle } : a))
                                );
                              }}
                              className="flex-1 bg-transparent text-white font-medium text-xs focus:outline-none focus:ring-1 focus:ring-[#78c452] rounded px-1.5 py-0.5"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setGeneratedActions((prev) => prev.filter((_, i) => i !== idx));
                              }}
                              className="text-neutral-500 hover:text-rose-400 p-1 cursor-pointer"
                              title="Remove Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                            {/* Assignee Selector */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-neutral-400">Assign To:</span>
                              <select
                                value={action.ownerId}
                                onChange={(e) => {
                                  const selectedId = e.target.value;
                                  const member = teamMembers.find((m) => m.id === selectedId);
                                  setGeneratedActions((prev) =>
                                    prev.map((a, i) =>
                                      i === idx
                                        ? {
                                            ...a,
                                            ownerId: selectedId,
                                            ownerName: member?.name || currentUser.name,
                                          }
                                        : a
                                    )
                                  );
                                }}
                                className="bg-neutral-900 border border-neutral-700 text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#78c452]"
                              >
                                {teamMembers.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.name} ({m.role || 'Member'})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Due Date Selector */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-neutral-400">Due:</span>
                              <select
                                value={action.dueDate}
                                onChange={(e) => {
                                  const newDate = e.target.value;
                                  setGeneratedActions((prev) =>
                                    prev.map((a, i) => (i === idx ? { ...a, dueDate: newDate } : a))
                                  );
                                }}
                                className="bg-neutral-900 border border-neutral-700 text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#78c452]"
                              >
                                <option value="Today">Today (Immediate)</option>
                                <option value="Tomorrow">Tomorrow</option>
                                <option value="This Friday">This Friday</option>
                                <option value="Next Week">Next Week</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add extra task input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newActionTitle}
                        onChange={(e) => setNewActionTitle(e.target.value)}
                        placeholder="Add another action item..."
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCustomAction()}
                        className="flex-1 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#78c452]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomAction}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        + Add Task
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowEndMeetingReport(false);
                  setCurrentScreen('action_items');
                }}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Skip / Discard
              </button>

              <button
                type="button"
                disabled={isGeneratingAiReport}
                onClick={handleSaveReportAndTasks}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-neutral-950 bg-[#78c452] hover:bg-[#67b342] rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Save Report & Assign {generatedActions.length} Tasks</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
