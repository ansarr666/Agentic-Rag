import { MessageCircle, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  showLabel: boolean;
  onClick: () => void;
}

export function ChatLauncher({ isOpen, showLabel, onClick }: Props) {
  const expanded = showLabel && !isOpen;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`os-launcher ${expanded ? 'os-launcher--labeled' : ''}`}
      aria-label={isOpen ? 'Close OrionSoft AI' : 'Open OrionSoft AI'}
      aria-expanded={isOpen}
      aria-controls="orionsoft-chat-window"
    >
      <span className="os-launcher__icon">
        {isOpen ? <MessageCircle aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
      </span>
      <span className={`os-launcher__label ${expanded ? 'is-visible' : ''}`}>
        OrionSoft AI
      </span>
    </button>
  );
}
