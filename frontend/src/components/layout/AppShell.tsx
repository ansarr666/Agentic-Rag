import React, { useState } from 'react';
import { 
  UserRole, 
  Conversation, 
  DocumentRecord, 
  KnowledgeCollection, 
  AgentTool, 
  EvaluationBenchmark, 
  ObservabilityLog, 
  SystemSettings 
} from '../../types';
import { 
  initialCollections, 
  initialDocuments, 
  initialConversations, 
  initialAgentTools, 
  benchmarkResults, 
  initialObservabilityLogs, 
  initialSystemSettings 
} from '../../data/mockData';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ChatWorkspace } from '../chat/ChatWorkspace';
import { KnowledgeBaseView } from '../knowledge/KnowledgeBaseView';
import { DocumentsView } from '../documents/DocumentsView';
import { AgentsHubView } from '../agents/AgentsHubView';
import { EvaluationsView } from '../evaluations/EvaluationsView';
import { PipelineDebugView } from '../debug/PipelineDebugView';
import { ActivityView } from '../activity/ActivityView';
import { SettingsView } from '../settings/SettingsView';
import { Toast } from '../ui/Toast';

export const AppShell: React.FC = () => {
  // Navigation & Role State
  const [currentView, setCurrentView] = useState<string>('chat');
  const [userRole, setUserRole] = useState<UserRole>('employee');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Core Data State
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const freshConv: Conversation = {
      id: 'conv-fresh-start',
      title: 'New Conversation',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      messages: []
    };
    return [freshConv, ...initialConversations];
  });
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-fresh-start');
  const [documents, setDocuments] = useState<DocumentRecord[]>(initialDocuments);
  const [collections, setCollections] = useState<KnowledgeCollection[]>(initialCollections);
  const [tools, setTools] = useState<AgentTool[]>(initialAgentTools);
  const [benchmark, setBenchmark] = useState<EvaluationBenchmark>(benchmarkResults);
  const [logs, setLogs] = useState<ObservabilityLog[]>(initialObservabilityLogs);
  const [settings, setSettings] = useState<SystemSettings>(initialSystemSettings);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isOpen: boolean }>({
    message: '',
    type: 'success',
    isOpen: false
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, isOpen: true });
  };

  // Active Conversation Handler
  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];

  const handleUpdateConversation = (updated: Conversation) => {
    setConversations(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Conversation',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      messages: []
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    showToast('New conversation initialized');
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (activeConversationId === id && filtered.length > 0) {
        setActiveConversationId(filtered[0].id);
      }
      return filtered;
    });
    showToast('Conversation removed');
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
    showToast('Conversation renamed');
  };

  // Documents Handlers
  const handleAddDocument = (doc: DocumentRecord) => {
    setDocuments(prev => [doc, ...prev]);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    showToast('Document removed from index');
  };

  const handleReindexDocument = (id: string) => {
    showToast('Re-indexing document chunks and updating BM25 postings...');
    setTimeout(() => {
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, lastIndexedAt: 'Just now' } : d));
      showToast('Document re-indexed successfully');
    }, 1000);
  };

  // Tools Handlers
  const handleToggleTool = (id: string) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  // Benchmark Run Handler
  const handleRunBenchmark = () => {
    setBenchmark(prev => ({
      ...prev,
      timestamp: new Date().toLocaleString(),
      avgLatencyMs: Math.floor(Math.random() * 20) + 135
    }));
  };

  return (
    <div className="flex h-screen w-screen bg-background text-slate-100 overflow-hidden select-none font-sans">
      
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        userRole={userRole}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Header Bar */}
        <Header
          currentView={currentView}
          userRole={userRole}
          onChangeRole={(newRole) => {
            setUserRole(newRole);
            showToast(`Switched perspective to: ${newRole.toUpperCase()}`);
          }}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* View Switcher */}
        <main className="flex-1 flex overflow-hidden">
          {currentView === 'chat' && (
            <ChatWorkspace
              conversation={activeConversation}
              onUpdateConversation={handleUpdateConversation}
              onToast={showToast}
              onOpenDocuments={() => setCurrentView('documents')}
            />
          )}

          {currentView === 'knowledge' && (
            <KnowledgeBaseView
              collections={collections}
              onSelectCollection={(col) => {
                showToast(`Viewing documents in ${col.name}`);
                setCurrentView('documents');
              }}
              onToast={showToast}
            />
          )}

          {currentView === 'documents' && (
            <DocumentsView
              documents={documents}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
              onReindexDocument={handleReindexDocument}
              onToast={showToast}
            />
          )}

          {currentView === 'agents' && (
            <AgentsHubView
              tools={tools}
              onToggleTool={handleToggleTool}
              onToast={showToast}
            />
          )}

          {currentView === 'evaluations' && (
            <EvaluationsView
              benchmark={benchmark}
              onRunBenchmark={handleRunBenchmark}
              onToast={showToast}
            />
          )}

          {currentView === 'debug' && (
            <PipelineDebugView
              onToast={showToast}
            />
          )}

          {currentView === 'activity' && (
            <ActivityView
              logs={logs}
              onRefresh={() => showToast('Logs updated')}
              onToast={showToast}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={setSettings}
              onToast={showToast}
            />
          )}
        </main>

      </div>

      {/* Global Toast Feedback */}
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
};
