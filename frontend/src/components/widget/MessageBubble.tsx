import { Sparkles } from 'lucide-react';
import type { ChatMessage } from './types';

function renderLine(line: string, index: number) {
  const clean = line.replace(/\*\*/g, '').trim();
  if (!clean) return <span key={index} className="os-message-gap" />;
  if (clean.startsWith('- ') || clean.startsWith('* ')) {
    return <span key={index} className="os-message-list-item"><i aria-hidden="true" />{clean.slice(2)}</span>;
  }
  return <span key={index}>{clean}</span>;
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <article className={`os-message-row ${isUser ? 'is-user' : ''}`} aria-label={`${isUser ? 'You' : 'OrionSoft AI'} said`}>
      {!isUser && <span className="os-ai-mark"><Sparkles aria-hidden="true" /></span>}
      <div className={`os-message-bubble ${message.tone === 'error' ? 'is-error' : ''}`}>
        {message.content.split('\n').map(renderLine)}
      </div>
    </article>
  );
}
