import { Sparkles } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="os-message-row" role="status" aria-label="OrionSoft AI is thinking">
      <span className="os-ai-mark"><Sparkles aria-hidden="true" /></span>
      <div className="os-typing"><i /><i /><i /></div>
    </div>
  );
}
