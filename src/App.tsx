import React, { useState } from 'react';
import { MeetingFlowProvider, useMeetingFlow } from './context/MeetingFlowContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { TaskEditModal } from './components/ui/TaskEditModal';
import { StartMeetingModal } from './components/screens/StartMeetingModal';
import { AddTeamMemberModal } from './components/screens/AddTeamMemberModal';
import { OverviewScreen } from './components/screens/OverviewScreen';
import { MeetingsScreen } from './components/screens/MeetingsScreen';
import { MeetingDetailScreen } from './components/screens/MeetingDetailScreen';
import { ActionItemsScreen } from './components/screens/ActionItemsScreen';
import { DecisionsScreen } from './components/screens/DecisionsScreen';
import { TeamScreen } from './components/screens/TeamScreen';
import { ReportsScreen } from './components/screens/ReportsScreen';
import { ProcessingScreen } from './components/screens/ProcessingScreen';
import { AiReviewScreen } from './components/screens/AiReviewScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { AuthScreen } from './components/auth/AuthScreen';
import { X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentScreen, isAddMemberModalOpen, setIsAddMemberModalOpen, isAuthenticated } =
    useMeetingFlow();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'overview':
        return <OverviewScreen />;
      case 'meetings':
        return <MeetingsScreen />;
      case 'meeting_detail':
        return <MeetingDetailScreen />;
      case 'action_items':
        return <ActionItemsScreen />;
      case 'decisions':
        return <DecisionsScreen />;
      case 'team':
        return <TeamScreen />;
      case 'reports':
        return <ReportsScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'ai_processing':
        return <ProcessingScreen />;
      case 'ai_review':
        return <AiReviewScreen />;
      default:
        return <OverviewScreen />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50 text-neutral-900">
      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-neutral-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-64 h-full bg-white flex flex-col shadow-2xl">
            <div className="p-3 flex justify-end border-b border-neutral-100">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" onClick={() => setMobileMenuOpen(false)}>
              <Sidebar />
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main App Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Persistent Top Navigation Bar */}
        <Header onMobileMenuToggle={() => setMobileMenuOpen(true)} />

        {/* Scrollable Viewport Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderScreen()}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <StartMeetingModal />
      <CommandPalette />
      <TaskEditModal />
      <AddTeamMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <MeetingFlowProvider>
      <AppContent />
    </MeetingFlowProvider>
  );
}
