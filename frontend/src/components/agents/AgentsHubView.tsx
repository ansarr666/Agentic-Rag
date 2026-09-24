import React from 'react';
import { 
  Bot, 
  Search, 
  Database, 
  Share2, 
  Globe, 
  Mail, 
  Activity, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Power
} from 'lucide-react';
import { AgentTool } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface AgentsHubViewProps {
  tools: AgentTool[];
  onToggleTool: (id: string) => void;
  onToast: (msg: string) => void;
}

export const AgentsHubView: React.FC<AgentsHubViewProps> = ({
  tools,
  onToggleTool,
  onToast
}) => {
  const categoryIcons: Record<string, React.ReactNode> = {
    Retrieval: <Search className="w-5 h-5 text-blue-400" />,
    Analysis: <Bot className="w-5 h-5 text-emerald-400" />,
    Data: <Database className="w-5 h-5 text-purple-400" />,
    Integration: <Share2 className="w-5 h-5 text-amber-400" />,
    Communication: <Mail className="w-5 h-5 text-indigo-400" />
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            Enterprise Agents & Tools Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Governed tool ecosystem allowing RAG agents to retrieve internal knowledge, execute read-only queries, and coordinate actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="md">
            Agentic Orchestration Active
          </Badge>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-xs text-slate-400 font-medium">Registered Tools</span>
          <div className="text-2xl font-bold text-slate-100 mt-1">{tools.length}</div>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            {tools.filter(t => t.enabled).length} Enabled & Active
          </span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-xs text-slate-400 font-medium">Daily Invocations</span>
          <div className="text-2xl font-bold text-slate-100 mt-1">1,997</div>
          <span className="text-[11px] text-blue-400 mt-1 block">99.8% Success Rate</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-xs text-slate-400 font-medium">Avg Tool Latency</span>
          <div className="text-2xl font-bold text-slate-100 mt-1">84ms</div>
          <span className="text-[11px] text-slate-400 mt-1 block">P95: 142ms</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-xs text-slate-400 font-medium">Security Policy</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">Enforced</div>
          <span className="text-[11px] text-slate-400 mt-1 block">RBAC + Data Masking</span>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className={`p-5 rounded-xl bg-surface border transition-all duration-150 flex flex-col justify-between shadow-xs ${
              tool.enabled ? 'border-border hover:border-slate-600' : 'border-border/50 opacity-65'
            }`}
          >
            <div>
              {/* Tool Top Row */}
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-surface-elevated border border-border">
                  {categoryIcons[tool.category] || <Bot className="w-5 h-5 text-blue-400" />}
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={tool.status === 'Online' ? 'success' : 'warning'} size="sm">
                    {tool.status}
                  </Badge>

                  {/* Toggle Button */}
                  <button
                    onClick={() => {
                      onToggleTool(tool.id);
                      onToast(`Tool ${tool.name} ${tool.enabled ? 'disabled' : 'enabled'}`);
                    }}
                    className={`w-10 h-6 rounded-full transition-colors p-1 flex items-center ${
                      tool.enabled ? 'bg-blue-600 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                    aria-label={`Toggle ${tool.name}`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                  </button>
                </div>
              </div>

              {/* Title & Category */}
              <h3 className="text-sm font-semibold text-slate-100">
                {tool.name}
              </h3>
              <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                id: {tool.code}
              </div>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed min-h-[48px]">
                {tool.description}
              </p>
            </div>

            {/* Bottom Specs */}
            <div className="mt-5 pt-3.5 border-t border-border space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Access Level</span>
                <Badge variant="neutral" size="sm">
                  {tool.accessScope}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>24h Invocations</span>
                <span className="text-slate-300 font-semibold">{tool.executions24h}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Avg Latency</span>
                <span className="text-slate-300">{tool.avgLatencyMs}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
