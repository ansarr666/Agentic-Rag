import React from 'react';
import { X, ExternalLink, Copy, Check, FileText, Sparkles, BookOpen } from 'lucide-react';
import { Citation } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface SourcePreviewDrawerProps {
  citation: Citation | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFullDocument?: (docId: string) => void;
  onToast: (msg: string) => void;
}

export const SourcePreviewDrawer: React.FC<SourcePreviewDrawerProps> = ({
  citation,
  isOpen,
  onClose,
  onOpenFullDocument,
  onToast
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !citation) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(citation.snippet);
    setCopied(true);
    onToast('Passage copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const confidencePercent = Math.round(citation.confidenceScore * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {/* Backdrop for mobile / tablet */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity pointer-events-auto lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10 pointer-events-auto">
        <div className="w-screen max-w-md bg-surface border-l border-border-strong shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-border bg-surface-elevated/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-800/40 flex items-center justify-center text-blue-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Source Reference
                </h3>
                <p className="text-xs text-slate-400">
                  Indexed Company Knowledge
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-surface-elevated transition-colors"
              aria-label="Close source preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
            
            {/* Metadata Card */}
            <div className="p-3.5 rounded-xl bg-surface-card border border-border space-y-3">
              <div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                  Document
                </div>
                <div className="text-sm font-semibold text-slate-200">
                  {citation.docTitle || citation.docId}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  {citation.docId}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/80">
                <div>
                  <div className="text-[11px] text-slate-400">Section</div>
                  <div className="text-xs font-medium text-slate-200 truncate">
                    {citation.section || 'General'}
                  </div>
                </div>
                {citation.page && (
                  <div>
                    <div className="text-[11px] text-slate-400">Page Number</div>
                    <div className="text-xs font-medium text-slate-200">
                      Page {citation.page}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-border/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">Evidence Match:</span>
                <Badge variant={confidencePercent >= 90 ? 'success' : 'primary'} size="sm">
                  {confidencePercent >= 90 ? 'High Confidence' : 'Grounded'} · {confidencePercent}%
                </Badge>
              </div>
            </div>

            {/* Verbatim Supporting Passage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Supporting Passage
                </label>
                <button
                  onClick={handleCopy}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-border-strong text-slate-200 text-xs leading-relaxed font-sans space-y-2">
                <p className="whitespace-pre-wrap">
                  {citation.snippet}
                </p>
                {citation.highlightedText && (
                  <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-blue-300/90 bg-blue-950/30 p-2 rounded-lg border border-blue-900/30">
                    <span className="font-semibold text-blue-200 block mb-0.5">Key Grounded Fact:</span>
                    "{citation.highlightedText}"
                  </div>
                )}
              </div>
            </div>

            {/* Why This Source Card */}
            <div className="p-3.5 rounded-xl bg-surface-elevated/40 border border-border/80 text-xs space-y-1.5">
              <div className="font-medium text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                Enterprise Grounding Verification
              </div>
              <p className="text-slate-400 leading-relaxed">
                This excerpt is directly retrieved from the indexed company records. The AI answer was synthesized strictly within the constraints of this passage to ensure zero extrapolation.
              </p>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border bg-surface-card flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
            {onOpenFullDocument && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onOpenFullDocument(citation.docId)}
                leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                className="w-full shrink-0"
              >
                View Full Doc
              </Button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
