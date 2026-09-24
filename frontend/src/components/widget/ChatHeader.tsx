import { Minus, Sparkles } from 'lucide-react';

export function ChatHeader({ onClose }: { onClose: () => void }) {
  return (
    <header className="os-chat-header">
      <div className="os-chat-header__identity">
        <span className="os-chat-header__mark"><Sparkles aria-hidden="true" /></span>
        <div>
          <h1 id="orionsoft-chat-title">OrionSoft AI</h1>
          <p>Digital Solution Consultant</p>
          <span className="os-online"><i aria-hidden="true" />Online</span>
        </div>
      </div>
      <button type="button" onClick={onClose} data-chat-close="true" className="os-icon-button" aria-label="Minimize chat">
        <Minus aria-hidden="true" />
      </button>
    </header>
  );
}
