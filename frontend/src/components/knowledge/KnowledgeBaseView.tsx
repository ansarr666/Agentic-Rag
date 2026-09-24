import React, { useState } from 'react';
import { 
  Building2, 
  Code2, 
  Briefcase, 
  TrendingUp, 
  FileText, 
  ShieldAlert, 
  Plus, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Lock 
} from 'lucide-react';
import { KnowledgeCollection } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface KnowledgeBaseViewProps {
  collections: KnowledgeCollection[];
  onSelectCollection: (col: KnowledgeCollection) => void;
  onToast: (msg: string) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  collections,
  onSelectCollection,
  onToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const iconMap: Record<string, React.ReactNode> = {
    Building2: <Building2 className="w-5 h-5 text-blue-400" />,
    Code2: <Code2 className="w-5 h-5 text-emerald-400" />,
    Briefcase: <Briefcase className="w-5 h-5 text-purple-400" />,
    TrendingUp: <TrendingUp className="w-5 h-5 text-amber-400" />,
    FileText: <FileText className="w-5 h-5 text-indigo-400" />,
    ShieldAlert: <ShieldAlert className="w-5 h-5 text-rose-400" />
  };

  const filtered = collections.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      onToast('All active knowledge collections synchronized with vector index');
    }, 1200);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            Enterprise Knowledge Base
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organized document repositories powering grounded RAG retrieval and agent workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncAll}
            isLoading={isSyncing}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Sync Indices
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onToast('Create Collection wizard available in admin mode')}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Collection
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-xs text-slate-400 font-medium">Total Collections</span>
          <div className="text-2xl font-bold text-slate-100 mt-1">{collections.length}</div>
          <span className="text-[11px] text-emerald-400 mt-1 block">5 Active Repositories</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-xs text-slate-400 font-medium">Total Documents</span>
          <div className="text-2xl font-bold text-slate-100 mt-1">13</div>
          <span className="text-[11px] text-slate-400 mt-1 block">1 Primary Chatbot Doc</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-xs text-slate-400 font-medium">Indexed Chunks</span>
          <div className="text-2xl font-bold text-slate-100 mt-1">452</div>
          <span className="text-[11px] text-blue-400 mt-1 block">74 in OrionSoft Master</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-xs text-slate-400 font-medium">Grounding Precision</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">100%</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Hit Rate @ 3 Verified</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collections by name or description..."
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((col) => (
          <div
            key={col.id}
            className="p-5 rounded-xl bg-surface border border-border hover:border-slate-600 transition-all flex flex-col justify-between shadow-xs group"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-surface-elevated border border-border group-hover:border-blue-500/40 transition-colors">
                  {iconMap[col.iconName] || <Layers className="w-5 h-5 text-blue-400" />}
                </div>

                <Badge 
                  variant={col.status === 'Active' ? 'success' : 'warning'}
                  size="sm"
                >
                  {col.status}
                </Badge>
              </div>

              <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">
                {col.name}
              </h3>
              
              <p className="text-xs text-slate-400 mt-1 leading-relaxed min-h-[36px]">
                {col.description}
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-border/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Documents & Chunks</span>
                <span className="font-semibold text-slate-300 font-mono">
                  {col.docCount} docs · {col.chunkCount} chunks
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-500" />
                  Access Scope
                </span>
                <Badge variant="neutral" size="sm">
                  {col.accessScope}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {col.lastUpdated}
                </span>

                <button
                  onClick={() => onSelectCollection(col)}
                  className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 hover:underline"
                >
                  <span>Explore</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
