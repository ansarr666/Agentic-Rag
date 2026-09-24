import React, { useRef, useEffect } from 'react';
import { Send, Square, Paperclip, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onStop: () => void;
  onAttachFile?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSubmit,
  isLoading,
  onStop,
  onAttachFile
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      <div className="relative rounded-2xl bg-surface border border-border-strong shadow-card focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200">
        
        {/* Textarea Input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about OrionSoft services, engineering specs, or policies..."
          rows={1}
          disabled={isLoading}
          className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm px-4 pt-3.5 pb-12 focus:outline-none resize-none leading-relaxed min-h-[56px] max-h-[180px]"
        />

        {/* Bottom control bar */}
        <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between pointer-events-none">
          
          {/* Left tools */}
          <div className="flex items-center gap-1 pointer-events-auto">
            <button
              type="button"
              onClick={onAttachFile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-surface-elevated transition-colors"
              title="Attach document reference"
              aria-label="Attach document"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <span className="text-[11px] text-slate-400 font-medium px-2 py-0.5 rounded bg-surface-elevated/40 border border-border/60 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Hybrid Search</span>
            </span>
          </div>

          {/* Right actions: Send or Stop */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-medium shadow-sm transition-all animate-pulse"
                title="Stop generation"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onSubmit}
                disabled={!input.trim()}
                className="h-8 px-3 rounded-lg"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

      </div>

      {/* Grounding guarantee disclaimer */}
      <p className="text-[11px] text-slate-400 text-center mt-2 font-normal">
        Authoritative Enterprise RAG: Answers are synthesized strictly from indexed documents with verifiable citations.
      </p>
    </div>
  );
};
