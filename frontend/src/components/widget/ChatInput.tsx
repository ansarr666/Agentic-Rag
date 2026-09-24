import { Send } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface Props {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function ChatInput({ value, disabled, onChange, onSubmit }: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  return (
    <form className="os-chat-input" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
      <label htmlFor="orionsoft-chat-input" className="sr-only">Type your message</label>
      <textarea
        ref={inputRef}
        id="orionsoft-chat-input"
        value={value}
        disabled={disabled}
        rows={1}
        placeholder="Type your message..."
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSubmit();
          }
        }}
      />
      <button type="submit" disabled={disabled || !value.trim()} aria-label="Send message">
        <Send aria-hidden="true" />
      </button>
    </form>
  );
}
