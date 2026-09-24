import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FileText, Download, Clock, HardDrive, CheckCircle } from 'lucide-react';
import { DocumentRecord } from '../../types';

export interface DocumentModalProps {
  document: DocumentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  fullText?: string;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  document,
  isOpen,
  onClose,
  fullText
}) => {
  if (!document) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={document.title || document.filename}
      description={`Collection: ${document.collection} · Access: ${document.accessScope}`}
      maxWidth="3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Index Status: <strong>{document.status}</strong> ({document.totalChunks} chunks)</span>
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Quick specs pill row */}
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-surface-card border border-border text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            <span>{(document.fileSizeBytes / 1024).toFixed(1)} KB</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Indexed: {document.lastIndexedAt}</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div>
            <Badge variant="primary" size="sm">{document.accessScope}</Badge>
          </div>
        </div>

        {/* Executive summary */}
        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Executive Summary
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed bg-surface-elevated/40 p-3 rounded-lg border border-border/80">
            {document.summary}
          </p>
        </div>

        {/* Full content preview */}
        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Indexed Text Preview</span>
            <span className="text-[11px] font-mono text-slate-500 lowercase">normalized UTF-8</span>
          </h4>
          <div className="p-4 rounded-xl bg-slate-950 border border-border-strong text-slate-300 text-xs font-mono leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap select-text">
            {fullText || document.rawText || `[Document preview for ${document.filename}]\n\nAbout OrionSoft Technologies\nQ: What does OrionSoft Technologies do?\nA: We build websites, software, and mobile apps for businesses, and we also help businesses grow online through marketing. So we can handle both your product and your audience.\n\nQ: Can you build on demand service apps like Zomato or Uber?\nA: Yes, we can build on demand and service based apps with features like live tracking, order matching, and payments.\n\nQ: What is staff augmentation exactly?\nA: It means adding our developers to your existing team on a temporary or ongoing basis, instead of hiring full time employees yourself.\n\nQ: What is the difference between Google Ads and Facebook Ads?\nA: Google Ads shows your business to people actively searching for something related to you, while Facebook and Instagram ads show your business to people based on their interests and behavior.`}
          </div>
        </div>
      </div>
    </Modal>
  );
};
