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
  Shield,
  MessageSquare,
  Plus,
  Maximize2,
  Minimize2,
  Volume2,
  Hand,
  Copy,
  Check,
  Radio,
  FileText,
  UserCheck,
} from 'lucide-react';

interface ParticipantState {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarColor: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  handRaised: boolean;
  quote?: string;
  streamMockId: number;
}

export const LiveVideoRoom: React.FC = () => {
  const { currentUser, teamMembers, setCurrentScreen, createDecision, createTask, meetings } =
    useMeetingFlow();

  // Local media states
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState(142); // 2m 22s initial
  const [activeTab, setActiveTab] = useState<'ai_notes' | 'standup' | 'chat'>('ai_notes');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isStandupActive, setIsStandupActive] = useState(true);
  const [activeSpeakerIdx, setActiveSpeakerIdx] = useState(1);
  const [standupSpeakerTime, setStandupSpeakerTime] = useState(74); // 74s remaining for current speaker

  // Video element refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localMediaStreamRef = useRef<MediaStream | null>(null);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);

  // Live in-call AI detections
  const [liveTranscript, setLiveTranscript] = useState<
    Array<{ id: string; speaker: string; text: string; time: string; isAiExtracted?: boolean }>
  >([
    {
      id: 't-1',
      speaker: 'Elena Rostova (CTO)',
      text: 'Good morning team. We ran the test suite for the psychological matching engine overnight. The chemistry scoring benchmark improved by 14%.',
      time: '00:45',
    },
    {
      id: 't-2',
      speaker: currentUser.name,
      text: 'Great progress Elena. For today’s internal daily huddle, what are the primary blockers on the Sanctuary privacy features?',
      time: '01:10',
    },
    {
      id: 't-3',
      speaker: 'David Thorne (Lead Engineer)',
      text: 'The stealth mode anonymity filters are passing CI. We can deploy the private founder-engineer handshake to staging by 3 PM.',
      time: '01:40',
      isAiExtracted: true,
    },
    {
      id: 't-4',
      speaker: 'Sarah Chen (Head of Product)',
      text: 'Agreed. Let’s freeze schema migrations for the equity-vs-cash preference slider until Wednesday.',
      time: '02:05',
      isAiExtracted: true,
    },
  ]);

  const [liveDecisions, setLiveDecisions] = useState<
    Array<{ id: string; text: string; confidence: number; timestamp: string }>
  >([
    {
      id: 'ld-1',
      text: 'Freeze schema migrations on the equity vs cash slider until Wednesday sprint review.',
      confidence: 0.96,
      timestamp: '02:06',
    },
  ]);

  const [liveActions, setLiveActions] = useState<
    Array<{ id: string; title: string; owner: string; dueDate: string; confidence: number }>
  >([
    {
      id: 'la-1',
      title: 'Deploy Sanctuary private founder-engineer handshake to staging',
      owner: 'David Thorne',
      dueDate: 'Today, 3 PM',
      confidence: 0.94,
    },
    {
      id: 'la-2',
      title: 'Finalise benchmark telemetry for the psychology chemistry algorithm',
      owner: 'Elena Rostova',
      dueDate: 'Tomorrow',
      confidence: 0.92,
    },
  ]);

  const [newManualNote, setNewManualNote] = useState('');

  // FounderMacha Team Participants
  const [participants, setParticipants] = useState<ParticipantState[]>([
    {
      id: 'local_user',
      name: `${currentUser.name} (You)`,
      role: currentUser.role || 'Founder & CEO',
      department: currentUser.department || 'Executive',
      avatarColor: 'bg-[#78c452] text-neutral-950 font-bold',
      isSpeaking: false,
      isMuted: !isMicOn,
      isVideoOff: !isVideoOn,
      handRaised: isHandRaised,
      streamMockId: 0,
    },
    {
      id: 'elena_r',
      name: 'Elena Rostova',
      role: 'Tech Co-Founder & CTO',
      department: 'Engineering',
      avatarColor: 'bg-emerald-700 text-white font-bold',
      isSpeaking: true,
      isMuted: false,
      isVideoOff: false,
      handRaised: false,
      quote: 'Sanctuary privacy tests are 100% green.',
      streamMockId: 1,
    },
    {
      id: 'david_t',
      name: 'David Thorne',
      role: 'Lead Software Engineer',
      department: 'Core Systems',
      avatarColor: 'bg-blue-600 text-white font-bold',
      isSpeaking: false,
      isMuted: false,
      isVideoOff: false,
      handRaised: false,
      quote: 'Reviewing graph matching PR.',
      streamMockId: 2,
    },
    {
      id: 'sarah_c',
      name: 'Sarah Chen',
      role: 'Head of Product & Psychology',
      department: 'Product',
      avatarColor: 'bg-violet-600 text-white font-bold',
      isSpeaking: false,
      isMuted: false,
      isVideoOff: false,
      handRaised: false,
      quote: 'Updating founder chemistry questionnaire.',
      streamMockId: 3,
    },
    {
      id: 'priya_p',
      name: 'Priya Patel',
      role: 'Head of UI/UX Design',
      department: 'Design',
      avatarColor: 'bg-rose-600 text-white font-bold',
      isSpeaking: false,
      isMuted: true,
      isVideoOff: false,
      handRaised: false,
      quote: 'Finalising dark huddle UI layout.',
      streamMockId: 4,
    },
    {
      id: 'marcus_v',
      name: 'Marcus Vance',
      role: 'Growth & Operations Lead',
      department: 'Growth',
      avatarColor: 'bg-amber-600 text-white font-bold',
      isSpeaking: false,
      isMuted: false,
      isVideoOff: true,
      handRaised: false,
      quote: 'Republic campaign + 400 new vetted devs.',
      streamMockId: 5,
    },
  ]);

  // Request actual camera & mic if available
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((s) => {
          stream = s;
          localMediaStreamRef.current = s;
          setCameraPermissionGranted(true);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          // Camera not available or denied - gracefully use high-fidelity simulation
          setCameraPermissionGranted(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Update local video track when toggled
  useEffect(() => {
    if (localMediaStreamRef.current) {
      localMediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOn;
      });
      localMediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMicOn;
      });
    }
  }, [isVideoOn, isMicOn]);

  // Meeting timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDurationSeconds((prev) => prev + 1);
      setStandupSpeakerTime((prev) => (prev > 0 ? prev - 1 : 120));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate speaking simulator among team members
  useEffect(() => {
    const speakerInterval = setInterval(() => {
      setActiveSpeakerIdx((prev) => {
        const next = (prev + 1) % participants.length;
        setParticipants((current) =>
          current.map((p, idx) => ({
            ...p,
            isSpeaking: idx === next,
          }))
        );
        return next;
      });
    }, 9000);
    return () => clearInterval(speakerInterval);
  }, [participants.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://foundermacha.com/room/executive-huddle');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddManualNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManualNote.trim()) return;

    setLiveTranscript((prev) => [
      ...prev,
      {
        id: `t-${Date.now()}`,
        speaker: `${currentUser.name} (Direct Note)`,
        text: newManualNote.trim(),
        time: formatTime(callDurationSeconds),
        isAiExtracted: false,
      },
    ]);
    setNewManualNote('');
  };

  // Convert live session into a real persistent Meeting record in MeetingFlowContext
  const handleEndAndSyncCall = () => {
    // 1. Create a persistent Decision in the system
    liveDecisions.forEach((d) => {
      createDecision({
        meetingId: 'meet-huddle-today',
        meetingTitle: 'FounderMacha Daily Executive Standup',
        text: d.text,
        date: 'Today',
        participants: participants.map((p) => p.name.replace(' (You)', '')),
        context: 'Captured live during FounderMacha Daily Standup video session.',
        category: 'Engineering',
        status: 'Active',
        confidence: d.confidence,
      });
    });

    // 2. Create persistent Action Items with owners in the system
    liveActions.forEach((a) => {
      const matchedMember = teamMembers.find((m) => m.name.includes(a.owner.split(' ')[0]));
      createTask({
        title: a.title,
        meetingId: 'meet-huddle-today',
        meetingTitle: 'FounderMacha Daily Executive Standup',
        ownerId: matchedMember?.id || currentUser.id,
        ownerName: a.owner,
        ownerRole: matchedMember?.role || 'Executive',
        dueDate: 'Tomorrow',
        rawDueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        priority: 'High',
        status: 'Open',
        confidence: a.confidence,
        context: 'Action extracted live by FounderMacha Huddle AI engine.',
      });
    });

    // Navigate to meetings screen to see outcomes
    setCurrentScreen('overview');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8 bg-neutral-950 text-neutral-100 select-none overflow-hidden">
      {/* Top Header Bar */}
      <div className="h-14 bg-neutral-900/90 border-b border-neutral-800 px-4 flex items-center justify-between shrink-0 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <FounderMachaLogo size="sm" showText={true} />
          <div className="h-4 w-px bg-neutral-800" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-neutral-200">
              Daily Executive Huddle
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#78c452]/20 text-[#78c452] border border-[#78c452]/30 animate-pulse">
              <Radio className="w-2.5 h-2.5" />
              LIVE {formatTime(callDurationSeconds)}
            </span>
          </div>
        </div>

        {/* Center Pill: Sanctuary Security & Psychology Protocol */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800/70 border border-neutral-700/60 text-xs text-neutral-300">
          <Shield className="w-3.5 h-3.5 text-[#78c452]" />
          <span>Sanctuary Mode: End-to-End Encrypted Internal Room</span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 transition-colors"
            title="Copy Secure Meeting Room Link"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#78c452]" />
                <span className="text-[#78c452]">Link Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Invite Link</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Video & Intelligence Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Video Grid Section */}
        <div className="flex-1 flex flex-col p-3 overflow-y-auto">
          {/* Daily Standup Active Speaker Banner */}
          {isStandupActive && (
            <div className="mb-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900 border border-[#78c452]/30 flex items-center justify-between shrink-0 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#78c452] animate-ping" />
                <div>
                  <span className="text-xs font-semibold text-neutral-200">
                    Active Standup Turn: {participants[activeSpeakerIdx]?.name}
                  </span>
                  <span className="text-[11px] text-[#78c452] block font-mono">
                    {participants[activeSpeakerIdx]?.role} • {participants[activeSpeakerIdx]?.quote}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-neutral-400">Speaker Time Remaining:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded ${
                    standupSpeakerTime < 20
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-[#78c452]/20 text-[#78c452]'
                  }`}
                >
                  {formatTime(standupSpeakerTime)}
                </span>
                <button
                  onClick={() => {
                    setActiveSpeakerIdx((prev) => (prev + 1) % participants.length);
                    setStandupSpeakerTime(120);
                  }}
                  className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 flex items-center gap-1 transition-colors"
                >
                  Next Speaker <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Video Grid Tiles */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
            {participants.map((p, idx) => {
              const isLocalUser = idx === 0;

              return (
                <div
                  key={p.id}
                  className={`relative rounded-2xl overflow-hidden bg-neutral-900/90 border transition-all duration-300 flex flex-col items-center justify-center group ${
                    p.isSpeaking
                      ? 'border-[#78c452] shadow-[0_0_20px_rgba(120,196,82,0.25)] ring-1 ring-[#78c452]'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                  style={{ minHeight: '180px' }}
                >
                  {/* Video Stream or Avatar fallback */}
                  {isLocalUser && isVideoOn && cameraPermissionGranted ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-neutral-800/40 via-neutral-900 to-neutral-950">
                      <div
                        className={`w-18 h-18 rounded-2xl flex items-center justify-center text-xl shadow-lg border border-white/10 ${
                          p.avatarColor
                        } ${p.isSpeaking ? 'scale-105 ring-4 ring-[#78c452]/40' : ''}`}
                      >
                        {p.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div className="mt-3 text-center">
                        <span className="text-sm font-semibold text-neutral-200 block">
                          {p.name}
                        </span>
                        <span className="text-xs text-neutral-400 block font-mono">
                          {p.role}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Speaking Waveform Pulse Indicator */}
                  {p.isSpeaking && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-[#78c452]/20 border border-[#78c452]/40 text-[#78c452] flex items-center gap-1.5 text-[10px] font-mono animate-pulse">
                      <Volume2 className="w-3 h-3" />
                      <span>Speaking</span>
                    </div>
                  )}

                  {/* Status Overlay Tags (Bottom) */}
                  <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between z-10 pointer-events-none">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-950/80 backdrop-blur-md border border-neutral-800/60 text-xs">
                      <span className="font-semibold text-neutral-200 text-xs">{p.name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">({p.role})</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {p.isMuted && (
                        <div className="p-1 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          <MicOff className="w-3 h-3" />
                        </div>
                      )}
                      {p.isVideoOff && (
                        <div className="p-1 rounded-md bg-neutral-800 text-neutral-400 border border-neutral-700">
                          <VideoOff className="w-3 h-3" />
                        </div>
                      )}
                      {p.handRaised && (
                        <div className="p-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <Hand className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Floating Control Bar */}
          <div className="mt-3 py-2.5 px-6 rounded-2xl bg-neutral-900/95 border border-neutral-800 flex items-center justify-between shrink-0 shadow-2xl backdrop-blur-xl">
            {/* Left controls: Audio & Video */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all ${
                  isMicOn
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {isMicOn ? <Mic className="w-4 h-4 text-[#78c452]" /> : <MicOff className="w-4 h-4" />}
                <span>{isMicOn ? 'Mute' : 'Unmuted'}</span>
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all ${
                  isVideoOn
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {isVideoOn ? <Video className="w-4 h-4 text-[#78c452]" /> : <VideoOff className="w-4 h-4" />}
                <span>{isVideoOn ? 'Stop Camera' : 'Start Camera'}</span>
              </button>
            </div>

            {/* Middle controls: Collaboration Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all ${
                  isScreenSharing
                    ? 'bg-[#78c452] text-neutral-950'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                }`}
              >
                <ScreenShare className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isScreenSharing ? 'Sharing Screen' : 'Share Screen'}
                </span>
              </button>

              <button
                onClick={() => setIsHandRaised(!isHandRaised)}
                className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all ${
                  isHandRaised
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                }`}
              >
                <Hand className="w-4 h-4" />
                <span className="hidden sm:inline">Raise Hand</span>
              </button>

              <button
                onClick={() => setIsStandupActive(!isStandupActive)}
                className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all ${
                  isStandupActive
                    ? 'bg-[#78c452]/20 text-[#78c452] border border-[#78c452]/40'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Standup Timer</span>
              </button>
            </div>

            {/* Right: End Meeting & Auto-Sync to Hub */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleEndAndSyncCall}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call & Sync Outcomes</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live AI Intelligence Sidebar */}
        <div className="w-80 lg:w-96 border-l border-neutral-800 bg-neutral-900/60 flex flex-col shrink-0">
          {/* Sidebar Tabs */}
          <div className="h-12 border-b border-neutral-800 px-3 flex items-center justify-between shrink-0 bg-neutral-900/80">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('ai_notes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'ai_notes'
                    ? 'bg-[#78c452]/20 text-[#78c452] font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Live Notes</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#78c452] animate-ping" />
              </button>

              <button
                onClick={() => setActiveTab('standup')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'standup'
                    ? 'bg-[#78c452]/20 text-[#78c452] font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Standup Roles</span>
              </button>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
              <Users className="w-3 h-3" />
              <span>{participants.length} online</span>
            </div>
          </div>

          {/* Tab 1: Live AI Notes & Extracted Action Items */}
          {activeTab === 'ai_notes' && (
            <div className="flex-1 flex flex-col p-3 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* Real-time Extracted Decisions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#78c452]" />
                      Live Extracted Decisions ({liveDecisions.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {liveDecisions.map((dec) => (
                      <div
                        key={dec.id}
                        className="p-2.5 rounded-xl bg-neutral-900 border border-[#78c452]/30 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-medium text-neutral-200 leading-snug">
                            {dec.text}
                          </p>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#78c452]/20 text-[#78c452] shrink-0">
                            {Math.round(dec.confidence * 100)}% Match
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                          Logged at {dec.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-time Extracted Action Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#78c452]" />
                      Assigned Action Items ({liveActions.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {liveActions.map((act) => (
                      <div
                        key={act.id}
                        className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-neutral-200 leading-snug">
                            {act.title}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/80 text-[11px]">
                          <span className="font-mono text-[#78c452] font-semibold">
                            👤 {act.owner}
                          </span>
                          <span className="text-neutral-400 font-mono">📅 {act.dueDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Real-Time Transcript Stream */}
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                    Live Audio Transcription
                  </span>
                  <div className="space-y-2 font-mono text-xs">
                    {liveTranscript.map((t) => (
                      <div
                        key={t.id}
                        className={`p-2 rounded-lg text-xs leading-relaxed ${
                          t.isAiExtracted
                            ? 'bg-[#78c452]/10 border-l-2 border-[#78c452] text-neutral-200'
                            : 'bg-neutral-900/60 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1">
                          <span className="font-semibold text-neutral-400">{t.speaker}</span>
                          <span>{t.time}</span>
                        </div>
                        <p>{t.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Note Input */}
              <form onSubmit={handleAddManualNote} className="mt-3 pt-2 border-t border-neutral-800">
                <div className="relative">
                  <input
                    type="text"
                    value={newManualNote}
                    onChange={(e) => setNewManualNote(e.target.value)}
                    placeholder="Type an instant note or decision..."
                    className="w-full pl-3 pr-8 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#78c452]"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-[#78c452]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 2: Standup Roles & Alignment Agenda */}
          {activeTab === 'standup' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#78c452] mb-1">
                  FounderMacha Huddle Protocol
                </h4>
                <p className="text-xs text-neutral-400">
                  Daily syncs are structured around Founder & Engineering compatibility and shipping velocity:
                </p>
              </div>

              {/* 3 Standup Questions */}
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <span className="text-[11px] font-bold text-neutral-300 uppercase block">
                  3 Core Huddle Questions:
                </span>
                <ol className="text-xs text-neutral-400 space-y-1.5 list-decimal pl-4">
                  <li>
                    <strong className="text-neutral-200">What shipped yesterday?</strong> (Engine, PRs, growth)
                  </li>
                  <li>
                    <strong className="text-neutral-200">Today’s critical sprint path?</strong> (Priorities)
                  </li>
                  <li>
                    <strong className="text-neutral-200">Blockers & Chemistry?</strong> (Where do you need alignment?)
                  </li>
                </ol>
              </div>

              {/* Participant Roles Status */}
              <div>
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                  Company Roles Checklist
                </span>
                <div className="space-y-2">
                  {participants.map((p, idx) => (
                    <div
                      key={p.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        idx === activeSpeakerIdx
                          ? 'bg-[#78c452]/10 border-[#78c452] text-neutral-200'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <div>
                        <span className="font-semibold block text-neutral-200">{p.name}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">{p.role}</span>
                      </div>
                      {idx <= activeSpeakerIdx ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#78c452]/20 text-[#78c452] font-mono">
                          Completed
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-500 font-mono">
                          Up next
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
