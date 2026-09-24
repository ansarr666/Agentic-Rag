export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  tone?: 'default' | 'error';
}

export interface HistoryTurn {
  role: MessageRole;
  content: string;
}

export interface SuggestedQuestion {
  id: string;
  text: string;
}

export interface LeadGateData {
  name: string;
  email: string;
  phone: string;
  company: string;
}

export interface LeadCaptureResult {
  lead_id: string;
  conversation_id: string;
}

export interface ConversationResponse {
  answer: string;
  suggested_questions: string[];
  intent: 'normal' | 'high';
}
