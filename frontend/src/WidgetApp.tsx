import { useEffect, useMemo, useRef, useState } from 'react';
import { ChatHeader } from './components/widget/ChatHeader';
import { ChatInput } from './components/widget/ChatInput';
import { ChatLauncher } from './components/widget/ChatLauncher';
import { LeadGate } from './components/widget/LeadGate';
import { MessageBubble } from './components/widget/MessageBubble';
import { SuggestedQuestions } from './components/widget/SuggestedQuestions';
import { TypingIndicator } from './components/widget/TypingIndicator';
import type { ChatMessage, HistoryTurn, LeadGateData, SuggestedQuestion } from './components/widget/types';

const STORAGE_KEY = 'orionsoft-ai-conversation-v3';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi 👋 I'm OrionSoft AI.\n\nThink of me as your first step toward building smarter technology.\n\nI can help you explore **AI, Generative AI, intelligent automation, custom software, data solutions, and more** — and understand how OrionSoft can turn your idea into a real-world solution.\n\n**What are you looking to build or solve?**",
};

const message = (role: ChatMessage['role'], content: string, tone?: ChatMessage['tone']): ChatMessage => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  role,
  content,
  tone,
});

interface SavedState {
  phase: 'lead' | 'chat';
  leadId: string;
  conversationId: string;
  leadName: string;
  messages: ChatMessage[];
}

function restoreState(): SavedState {
  const fallback: SavedState = { phase: 'lead', leadId: '', conversationId: '', leadName: '', messages: [] };
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved) as Partial<SavedState>;
    if (parsed.phase === 'chat' && parsed.leadId) {
      return {
        phase: 'chat',
        leadId: parsed.leadId,
        conversationId: parsed.conversationId ?? '',
        leadName: parsed.leadName ?? '',
        messages: Array.isArray(parsed.messages) && parsed.messages.length ? parsed.messages : [WELCOME_MESSAGE],
      };
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export default function WidgetApp() {
  const restored = useMemo(restoreState, []);
  const [isOpen, setIsOpen] = useState(false);
  const [showLabel, setShowLabel] = useState(true);
  const [phase, setPhase] = useState<'lead' | 'chat'>(restored.phase);
  const [leadId, setLeadId] = useState(restored.leadId);
  const [conversationId, setConversationId] = useState(restored.conversationId);
  const [leadName, setLeadName] = useState(restored.leadName);
  const [messages, setMessages] = useState<ChatMessage[]>(restored.messages.length ? restored.messages : [WELCOME_MESSAGE]);
  const [suggestions, setSuggestions] = useState<SuggestedQuestion[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [intent, setIntent] = useState<'normal' | 'high'>('normal');
  const [handoffDone, setHandoffDone] = useState(false);
  const [retry, setRetry] = useState(false);
  const [lastFailedInput, setLastFailedInput] = useState('');
  const [pendingExpert, setPendingExpert] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowLabel(false), 5000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase === 'chat' && leadId) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ phase, leadId, conversationId, leadName, messages }));
    }
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [phase, leadId, conversationId, leadName, messages, suggestions, loading, intent]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) closeChat();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object' || data.type !== 'orionsoft:open') return;
      setIsOpen(true);
      if (data.mode === 'expert') {
        if (phase === 'chat' && leadId) {
          setIntent('high');
        } else {
          setPendingExpert(true);
        }
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [phase, leadId]);

  function closeChat() {
    setIsOpen(false);
    window.setTimeout(() => document.querySelector<HTMLButtonElement>('.os-launcher')?.focus(), 0);
  }

  const submitLead = async (lead: LeadGateData) => {
    const response = await fetch('/api/public/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'We could not save your details. Please try again.');
    }
    setLeadId(data.lead_id);
    setConversationId(data.conversation_id);
    setLeadName(lead.name);
    setMessages([WELCOME_MESSAGE]);
    setSuggestions([]);
    setIntent(pendingExpert ? 'high' : 'normal');
    setPendingExpert(false);
    setHandoffDone(false);
    setRetry(false);
    setPhase('chat');
  };

  const sendMessage = async (provided?: string) => {
    const question = (provided ?? input).trim();
    if (!question || loading) return;
    setInput('');
    setSuggestions([]);
    setIntent('normal');
    setRetry(false);
    setMessages((current) => [...current, message('user', question)]);
    setLoading(true);
    try {
      const history: HistoryTurn[] = messages.map((item) => ({ role: item.role, content: item.content }));
      const response = await fetch('/api/public/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          history,
          lead_id: leadId,
          conversation_id: conversationId,
          name: leadName,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Request failed');
      setMessages((current) => [...current, message('assistant', data.answer || 'I can help you explore that.')]);
      const questions: string[] = Array.isArray(data.suggested_questions) ? data.suggested_questions.slice(0, 4) : [];
      setSuggestions(questions.map((text, index) => ({ id: `q-${Date.now()}-${index}`, text })));
      setIntent(data.intent === 'high' ? 'high' : 'normal');
    } catch {
      setRetry(true);
      setLastFailedInput(question);
      setMessages((current) => [...current, message('assistant', "I'm having trouble responding right now. Please try again in a moment.", 'error')]);
    } finally {
      setLoading(false);
    }
  };

  const requestHandoff = async () => {
    setIntent('normal');
    setSuggestions([]);
    const summary = messages
      .filter((item) => item.role === 'user')
      .map((item) => item.content)
      .join(' | ')
      .slice(0, 4000);
    try {
      const response = await fetch('/api/public/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId,
          conversation_id: conversationId,
          summary,
          requested_action: 'Talk to an OrionSoft expert',
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) throw new Error();
      setHandoffDone(true);
      setMessages((current) => [
        ...current,
        message('assistant', "Thanks! Your request has been recorded, and the OrionSoft team will follow up with you soon. In the meantime, feel free to keep asking me anything."),
      ]);
    } catch {
      setMessages((current) => [...current, message('assistant', "Sorry, I couldn't record your request just now. Please try again in a moment.", 'error')]);
    }
  };

  return (
    <div className="os-widget-root">
      {!isOpen && <ChatLauncher isOpen={false} showLabel={showLabel} onClick={() => setIsOpen(true)} />}
      {isOpen && (
        <section id="orionsoft-chat-window" className="os-chat-window" role="dialog" aria-labelledby="orionsoft-chat-title">
          <ChatHeader onClose={closeChat} />
          <main className="os-chat-messages" aria-live="polite" aria-busy={loading}>
            {phase === 'lead' ? (
              <LeadGate onSubmit={submitLead} />
            ) : (
              <>
                {messages.map((item) => <MessageBubble key={item.id} message={item} />)}
                {loading && <TypingIndicator />}
                {!loading && intent === 'high' && !handoffDone && (
                  <button type="button" className="os-cta" onClick={() => void requestHandoff()}>
                    Talk to an OrionSoft Expert
                  </button>
                )}
                {!loading && retry && (
                  <button type="button" className="os-cta os-cta--retry" onClick={() => void sendMessage(lastFailedInput)}>
                    Try again
                  </button>
                )}
                {!loading && <SuggestedQuestions questions={suggestions} onSelect={(question) => void sendMessage(question.text)} />}
              </>
            )}
            <div ref={endRef} />
          </main>
          {phase === 'chat' && (
            <ChatInput value={input} disabled={loading} onChange={setInput} onSubmit={() => void sendMessage()} />
          )}
          <footer>AI-powered guidance from OrionSoft Technologies</footer>
        </section>
      )}
    </div>
  );
}
