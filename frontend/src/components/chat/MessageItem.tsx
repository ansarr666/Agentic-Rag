import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  RotateCw, 
  ThumbsUp, 
  ThumbsDown, 
  FileText, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  User, 
  ShieldCheck,
  Database,
  HardDrive,
  Globe,
  Calculator,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';
import { Message, Citation, SourceItem, AgentDecision, EvidenceState } from '../../types';
import { AgentActivityTrace } from './AgentActivityTrace';
import { Badge } from '../ui/Badge';

export interface MessageItemProps {
  message: Message;
  onSelectCitation: (citation: Citation) => void;
  onRegenerate?: () => void;
  onToast: (msg: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onSelectCitation,
  onRegenerate,
  onToast
}) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);
  const [openInternalDocs, setOpenInternalDocs] = useState(true);
  const [openDriveDocs, setOpenDriveDocs] = useState(true);
  const [openWebDocs, setOpenWebDocs] = useState(true);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    onToast('Response copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: 'liked' | 'disliked') => {
    if (feedback === type) {
      setFeedback(null);
    } else {
      setFeedback(type);
      onToast(type === 'liked' ? 'Marked as helpful' : 'Feedback recorded for RAG benchmark');
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-6 animate-in fade-in duration-200">
        <div className="flex items-start gap-3 max-w-2xl">
          <div className="bg-blue-600 rounded-2xl rounded-tr-sm px-4 py-3 text-white text-sm shadow-sm leading-relaxed">
            <p className="whitespace-pre-wrap font-sans text-white">{message.content}</p>
            <div className="text-[10px] text-blue-100/80 text-right mt-1 font-mono">
              {message.timestamp}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
            <User className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>
    );
  }

  // Helper to parse simple markdown formatting for clean readability
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Bold headers
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={idx} className="font-semibold text-slate-100 mt-2 mb-1">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      }
      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const text = line.trim().substring(2);
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return (
          <div key={idx} className="flex items-start gap-2 ml-1 my-1 text-slate-200">
            <span className="text-blue-400 font-bold shrink-0 mt-1">•</span>
            <span className="leading-relaxed">
              {parts.map((p, i) => {
                if (p.startsWith('**') && p.endsWith('**')) {
                  return <strong key={i} className="text-slate-100">{p.slice(2, -2)}</strong>;
                }
                return p;
              })}
            </span>
          </div>
        );
      }
      // Numbered lists
      const numberedMatch = line.match(/^(\d+\.)\s*(.*)/);
      if (numberedMatch) {
        const num = numberedMatch[1];
        const text = numberedMatch[2];
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return (
          <div key={idx} className="flex items-start gap-2 ml-1 my-1 text-slate-200">
            <span className="text-blue-400 font-semibold shrink-0">{num}</span>
            <span className="leading-relaxed">
              {parts.map((p, i) => {
                if (p.startsWith('**') && p.endsWith('**')) {
                  return <strong key={i} className="text-slate-100">{p.slice(2, -2)}</strong>;
                }
                return p;
              })}
            </span>
          </div>
        );
      }
      // Normal line
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="leading-relaxed text-slate-200 my-1">
          {line}
        </p>
      );
    });
  };

  // Convert SourceItem to Citation for drawer inspection
  const handleSourceClick = (s: SourceItem) => {
    const citation: Citation = {
      id: `src-${s.document_id}-${Date.now()}`,
      chunkId: s.document_id,
      docId: s.document_id,
      docTitle: s.title,
      section: s.section || (s.type === 'google_drive' ? 'Google Drive Document' : s.type === 'web_search' ? (s.authority ? `Domain: ${s.authority}` : 'External Web Source') : 'Company Knowledge'),
      page: s.page,
      snippet: s.snippet,
      highlightedText: s.snippet,
      confidenceScore: s.score || message.confidenceScore || 0.95,
      category: s.type === 'google_drive' ? 'Google Drive Workspace' : s.type === 'web_search' ? (s.authority || 'External Web') : 'Company Documents'
    };
    onSelectCitation(citation);
  };

  // Partition sources into 3 clean groups
  const internalDocs: SourceItem[] = message.sources 
    ? message.sources.filter(s => s.type === 'internal_document')
    : (message.citations || []).filter(c => !c.category?.includes('Drive') && !c.category?.includes('Web')).map(c => ({
        type: 'internal_document' as const,
        document_id: c.docId,
        title: c.docTitle,
        section: c.section,
        page: c.page,
        snippet: c.snippet,
        score: c.confidenceScore
      }));

  const driveDocs: SourceItem[] = message.sources
    ? message.sources.filter(s => s.type === 'google_drive')
    : (message.citations || []).filter(c => c.category?.includes('Drive')).map(c => ({
        type: 'google_drive' as const,
        document_id: c.docId,
        title: c.docTitle,
        section: c.section,
        page: c.page,
        snippet: c.snippet,
        score: c.confidenceScore
      }));

  const webDocs: SourceItem[] = message.sources
    ? message.sources.filter(s => s.type === 'web_search')
    : (message.citations || []).filter(c => c.category?.includes('Web')).map(c => ({
        type: 'web_search' as const,
        document_id: c.docId,
        title: c.docTitle,
        section: c.section,
        page: c.page,
        snippet: c.snippet,
        score: c.confidenceScore
      }));

  // Calibrated decision pill styling
  const renderDecisionBadge = () => {
    switch (message.decision) {
      case 'internal_rag':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-950/60 text-blue-300 border border-blue-800/60">
            <Database className="w-3 h-3 text-blue-400" />
            Internal RAG
          </span>
        );
      case 'google_drive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
            <HardDrive className="w-3 h-3 text-emerald-400" />
            Google Drive
          </span>
        );
      case 'web_search':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-950/60 text-purple-300 border border-purple-800/60">
            <Globe className="w-3 h-3 text-purple-400" />
            External Web Search
          </span>
        );
      case 'calculator':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60">
            <Calculator className="w-3 h-3 text-amber-400" />
            Deterministic Calculator
          </span>
        );
      case 'multi_tool':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
            <Layers className="w-3 h-3 text-cyan-400" />
            Multi-Tool Agent
          </span>
        );
      case 'clarification':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60">
            <HelpCircle className="w-3 h-3 text-amber-400" />
            Clarification
          </span>
        );
      case 'abstain':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-950/60 text-rose-300 border border-rose-800/60">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            Abstained (Unanswerable)
          </span>
        );
      default:
        return null;
    }
  };

  const renderEvidenceBadge = () => {
    switch (message.evidenceState) {
      case 'sufficient':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Sufficient Evidence
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Partial Evidence
          </span>
        );
      case 'insufficient':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/30">
            Insufficient Internal Evidence
          </span>
        );
      case 'conflicting':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30">
            Conflicting Sources
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-start mb-8 animate-in fade-in duration-200">
      <div className="flex items-start gap-3.5 max-w-3xl w-full">
        {/* Assistant Avatar */}
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 mt-1 shadow-glow">
          <Sparkles className="w-4 h-4" />
        </div>

        {/* Message Container */}
        <div className="flex-1 min-w-0 bg-surface rounded-2xl rounded-tl-sm border border-border px-5 py-4 shadow-subtle space-y-4">
          
          {/* Calibrated Route & Confidence Banner */}
          {(message.decision || message.confidenceLabel || message.evidenceState) && (
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border/70 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {renderDecisionBadge()}
                {renderEvidenceBadge()}
              </div>

              {message.confidenceLabel && (
                <span className="text-[11px] font-medium text-slate-300 italic">
                  "{message.confidenceLabel}"
                </span>
              )}
            </div>
          )}

          {/* Main Answer Text */}
          <div className="text-sm font-sans space-y-1">
            {renderFormattedContent(message.content)}
          </div>

          {/* Structured Supporting Sources: 3 Collapsible Groups */}
          {(internalDocs.length > 0 || driveDocs.length > 0 || webDocs.length > 0) && (
            <div className="pt-3 border-t border-border/70 space-y-3">
              
              {/* Group 1: Company Documents */}
              {internalDocs.length > 0 && (
                <div className="rounded-xl bg-surface-card/60 border border-border overflow-hidden">
                  <button
                    onClick={() => setOpenInternalDocs(!openInternalDocs)}
                    className="w-full px-3.5 py-2 flex items-center justify-between bg-surface-elevated/40 hover:bg-surface-elevated/70 transition-colors text-xs font-semibold text-slate-200 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-blue-400" />
                      <span>Company Documents</span>
                      <span className="text-[11px] font-normal text-slate-400">
                        ({internalDocs.length} {internalDocs.length === 1 ? 'source' : 'sources'})
                      </span>
                    </div>
                    {openInternalDocs ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                  </button>

                  {openInternalDocs && (
                    <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {internalDocs.map((doc, idx) => (
                        <div
                          key={doc.document_id || idx}
                          onClick={() => handleSourceClick(doc)}
                          className="p-2.5 rounded-lg bg-surface hover:bg-surface-elevated border border-border hover:border-blue-500/50 cursor-pointer transition-all text-xs space-y-1 group"
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-semibold text-slate-200 group-hover:text-blue-300 truncate">
                              [{idx + 1}] {doc.title}
                            </span>
                            {doc.page && (
                              <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                p.{doc.page}
                              </span>
                            )}
                          </div>
                          {doc.section && (
                            <div className="text-[11px] text-slate-400 truncate">
                              {doc.section}
                            </div>
                          )}
                          <p className="text-[11px] text-slate-400 line-clamp-2 italic leading-relaxed pt-0.5">
                            "{doc.snippet}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Group 2: Google Drive Workspace */}
              {driveDocs.length > 0 && (
                <div className="rounded-xl bg-emerald-950/20 border border-emerald-900/40 overflow-hidden">
                  <button
                    onClick={() => setOpenDriveDocs(!openDriveDocs)}
                    className="w-full px-3.5 py-2 flex items-center justify-between bg-emerald-950/40 hover:bg-emerald-950/60 transition-colors text-xs font-semibold text-emerald-300 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Google Drive Workspace</span>
                      <span className="text-[11px] font-normal text-emerald-400/80">
                        ({driveDocs.length} {driveDocs.length === 1 ? 'file' : 'files'})
                      </span>
                    </div>
                    {openDriveDocs ? <ChevronUp className="w-3.5 h-3.5 text-emerald-400" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  {openDriveDocs && (
                    <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {driveDocs.map((doc, idx) => (
                        <div
                          key={doc.document_id || idx}
                          onClick={() => handleSourceClick(doc)}
                          className="p-2.5 rounded-lg bg-surface hover:bg-surface-elevated border border-emerald-900/40 hover:border-emerald-500/50 cursor-pointer transition-all text-xs space-y-1 group"
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-semibold text-emerald-200 group-hover:text-emerald-100 truncate">
                              [{idx + 1}] {doc.title}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono shrink-0">
                              Drive RBAC
                            </span>
                          </div>
                          {doc.section && (
                            <div className="text-[11px] text-slate-400 truncate">
                              {doc.section}
                            </div>
                          )}
                          <p className="text-[11px] text-slate-300/90 line-clamp-2 italic leading-relaxed pt-0.5">
                            "{doc.snippet}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Group 3: External Web Sources */}
              {webDocs.length > 0 && (
                <div className="rounded-xl bg-purple-950/20 border border-purple-900/40 overflow-hidden">
                  <button
                    onClick={() => setOpenWebDocs(!openWebDocs)}
                    className="w-full px-3.5 py-2 flex items-center justify-between bg-purple-950/40 hover:bg-purple-950/60 transition-colors text-xs font-semibold text-purple-300 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-purple-400" />
                      <span>External Web Sources</span>
                      <span className="text-[11px] font-normal text-purple-400/80">
                        ({webDocs.length} {webDocs.length === 1 ? 'citation' : 'citations'})
                      </span>
                    </div>
                    {openWebDocs ? <ChevronUp className="w-3.5 h-3.5 text-purple-400" /> : <ChevronDown className="w-3.5 h-3.5 text-purple-400" />}
                  </button>

                  {openWebDocs && (
                    <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {webDocs.map((doc, idx) => (
                        <div
                          key={doc.document_id || idx}
                          onClick={() => handleSourceClick(doc)}
                          className="p-2.5 rounded-lg bg-surface hover:bg-surface-elevated border border-purple-900/40 hover:border-purple-500/50 cursor-pointer transition-all text-xs space-y-1.5 group"
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-semibold text-purple-200 group-hover:text-purple-100 truncate">
                              [{idx + 1}] {doc.title}
                            </span>
                            {doc.authority && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/50 text-purple-300 font-mono shrink-0">
                                {doc.authority}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[11px] text-slate-300/90 line-clamp-2 italic leading-relaxed">
                            "{doc.snippet}"
                          </p>

                          {doc.url && (
                            <div className="pt-1 border-t border-purple-900/30 flex items-center justify-between">
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 underline font-mono truncate max-w-[200px]"
                              >
                                {doc.url.replace(/^https?:\/\//, '')}
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* Optional Collapsible Agent Activity Trace */}
          {message.agentActivity && message.agentActivity.length > 0 && (
            <AgentActivityTrace steps={message.agentActivity} />
          )}

          {/* Footer Toolbar */}
          <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              {message.latencyMs && (
                <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {message.latencyMs}ms
                </span>
              )}
              {message.confidenceScore && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400/90 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {Math.round(message.confidenceScore * 100)}% Grounded
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md hover:text-slate-200 hover:bg-surface-elevated transition-colors"
                title="Copy response"
                aria-label="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1.5 rounded-md hover:text-slate-200 hover:bg-surface-elevated transition-colors"
                  title="Regenerate answer"
                  aria-label="Regenerate answer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="h-3 w-px bg-border mx-1" />

              <button
                onClick={() => handleFeedback('liked')}
                className={`p-1.5 rounded-md transition-colors ${
                  feedback === 'liked' ? 'text-emerald-400 bg-emerald-950/40' : 'hover:text-slate-200 hover:bg-surface-elevated'
                }`}
                title="Good response"
                aria-label="Helpful response"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleFeedback('disliked')}
                className={`p-1.5 rounded-md transition-colors ${
                  feedback === 'disliked' ? 'text-rose-400 bg-rose-950/40' : 'hover:text-slate-200 hover:bg-surface-elevated'
                }`}
                title="Poor response"
                aria-label="Unhelpful response"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
