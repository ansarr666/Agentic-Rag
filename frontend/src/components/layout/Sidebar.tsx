import React, { useState } from 'react';
import { 
  MessageSquare, 
  Layers, 
  FileText, 
  Bot, 
  BarChart3, 
  Terminal, 
  Activity, 
  Settings as SettingsIcon, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { Conversation, UserRole } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  userRole: UserRole;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  userRole,
  isMobileOpen,
  onCloseMobile
}) => {
  const [historySearch, setHistorySearch] = useState('');
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const primaryNav = [
    { id: 'chat', label: 'AI Workspace / Chat', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'knowledge', label: 'Knowledge Base', icon: <Layers className="w-4 h-4" /> },
    { id: 'documents', label: 'Documents & Ingestion', icon: <FileText className="w-4 h-4" /> }
  ];

  const adminNav = [
    { id: 'agents', label: 'Agents & Tools Hub', icon: <Bot className="w-4 h-4" /> },
    { id: 'evaluations', label: 'RAG Evaluations', icon: <BarChart3 className="w-4 h-4" />, badge: '100%' },
    { id: 'debug', label: 'Pipeline Trace & Debug', icon: <Terminal className="w-4 h-4" />, badge: 'Dev' },
    { id: 'activity', label: 'Observability & Logs', icon: <Activity className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> }
  ];

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(historySearch.toLowerCase())
  );

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingConvId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteConversation(id);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-surface border-r border-border flex flex-col transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Logo & Title */}
        <div className="h-14 px-5 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-glow">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-tight text-slate-100 flex items-center gap-1.5">
                <span>OrionSoft RAG</span>
                <span className="text-[10px] text-blue-400 font-mono px-1 rounded bg-blue-950/60 border border-blue-900/40">
                  v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Internal AI Platform</p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 md:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Action Button */}
        <div className="p-3.5 pb-2 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onNewConversation();
              onSelectView('chat');
              if (isMobileOpen) onCloseMobile();
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full justify-center shadow-xs"
          >
            New Conversation
          </Button>
        </div>

        {/* Navigation Sections */}
        <div className="px-3 py-2 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Main Views */}
          <div className="space-y-0.5">
            <div className="px-2 pb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Workspace
            </div>
            {primaryNav.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    if (isMobileOpen) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-surface-elevated'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Conversation History */}
          <div className="space-y-1.5 pt-2 border-t border-border/80">
            <div className="px-2 flex items-center justify-between text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              <span>Recent Chats</span>
              <span className="font-mono text-slate-500">{conversations.length}</span>
            </div>

            {/* History Search Input */}
            <div className="relative px-1">
              <Search className="w-3 h-3 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search history..."
                className="w-full bg-surface-elevated/60 border border-border rounded-md pl-7 pr-2 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Conversation List */}
            <div className="space-y-0.5 max-h-44 overflow-y-auto pt-1">
              {filteredConversations.length === 0 ? (
                <div className="px-3 py-2 text-[11px] text-slate-500 italic">
                  No conversations found
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = currentView === 'chat' && activeConversationId === conv.id;
                  const isEditing = editingConvId === conv.id;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        onSelectConversation(conv.id);
                        onSelectView('chat');
                        if (isMobileOpen) onCloseMobile();
                      }}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-surface-elevated text-blue-300 font-medium border border-border'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-surface-elevated/40'
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-surface-elevated border border-blue-500 rounded px-1.5 py-0.5 text-xs text-slate-100 flex-1 focus:outline-none"
                            autoFocus
                          />
                          <button onClick={(e) => saveRename(conv.id, e)} className="p-1 hover:text-emerald-400">
                            <Check className="w-3 h-3" />
                          </button>
                          <button onClick={cancelRename} className="p-1 hover:text-rose-400">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="truncate text-xs flex-1 pr-1">
                            {conv.title}
                          </span>

                          <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => startRename(conv, e)}
                              className="p-1 hover:text-slate-200 text-slate-500 rounded"
                              title="Rename chat"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(conv.id, e)}
                              className="p-1 hover:text-rose-400 text-slate-500 rounded"
                              title="Delete chat"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Administration & Technical Views */}
          <div className="space-y-0.5 pt-2 border-t border-border/80">
            <div className="px-2 pb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Administration & Quality
            </div>
            {adminNav.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    if (isMobileOpen) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-surface-elevated text-blue-400 border border-border shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-surface-elevated/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isActive ? 'text-blue-400' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <Badge variant={item.badge === 'Dev' ? 'purple' : 'success'} size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Footer info: Grounding Guarantee */}
        <div className="p-3 border-t border-border bg-surface-card shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Grounded RAG Pipeline Active</span>
          </div>
        </div>

      </aside>
    </>
  );
};
