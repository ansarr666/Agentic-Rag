import React from 'react';
import { 
  Menu, 
  Sparkles, 
  Shield, 
  ChevronDown, 
  Layers, 
  User, 
  Search, 
  Terminal, 
  Wrench,
  BookOpen
} from 'lucide-react';
import { UserRole } from '../../types';
import { Badge } from '../ui/Badge';

export interface HeaderProps {
  currentView: string;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onToggleMobileSidebar: () => void;
  activeKnowledgeTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  userRole,
  onChangeRole,
  onToggleMobileSidebar,
  activeKnowledgeTitle = 'OrionSoft_Chatbot_QA.pdf'
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = React.useState(false);

  const viewTitles: Record<string, string> = {
    chat: 'AI Workspace / Chat',
    knowledge: 'Knowledge Base Collections',
    documents: 'Document Repository & Ingestion',
    agents: 'Agents & Tools Hub',
    evaluations: 'RAG Benchmark & Evaluation Suite',
    debug: 'Retrieval & Pipeline Trace Inspector',
    activity: 'System Activity & Telemetry',
    settings: 'Settings & Configuration'
  };

  const roles = [
    {
      id: 'employee' as UserRole,
      title: 'Employee',
      desc: 'Clean experience: Ask questions, inspect sources, and view verified answers.',
      badgeVariant: 'neutral' as const
    },
    {
      id: 'admin' as UserRole,
      title: 'Knowledge Manager',
      desc: 'Manage collections, upload documents, and monitor agent permissions.',
      badgeVariant: 'primary' as const
    },
    {
      id: 'engineer' as UserRole,
      title: 'AI Engineer / Developer',
      desc: 'Access 8-stage pipeline traces, evaluation benchmarks, and raw RAG retrieval internals.',
      badgeVariant: 'purple' as const
    }
  ];

  const currentRoleObj = roles.find(r => r.id === userRole) || roles[0];

  return (
    <header className="h-14 border-b border-border bg-surface/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
      
      {/* Left: Mobile menu toggle + Current Route Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-surface-elevated md:hidden transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            {viewTitles[currentView] || 'AI Workspace'}
          </h2>
        </div>
      </div>

      {/* Right: Role Switcher & User Profile */}
      <div className="flex items-center gap-3">
        
        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-border text-xs text-slate-200 transition-colors shadow-xs"
            aria-haspopup="true"
            aria-expanded={isRoleDropdownOpen}
          >
            <span className="text-slate-400 hidden sm:inline">Perspective:</span>
            <Badge variant={currentRoleObj.badgeVariant} size="sm">
              {currentRoleObj.title}
            </Badge>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsRoleDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-surface border border-border-strong shadow-2xl z-40 p-2 space-y-1 animate-in fade-in duration-150">
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select User Perspective
                </div>
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onChangeRole(r.id);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg transition-colors ${
                      userRole === r.id
                        ? 'bg-surface-elevated text-slate-100 border border-border'
                        : 'hover:bg-surface-elevated/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-xs text-slate-200">{r.title}</span>
                      {userRole === r.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {r.desc}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 text-xs font-semibold">
            OS
          </div>
        </div>

      </div>

    </header>
  );
};
