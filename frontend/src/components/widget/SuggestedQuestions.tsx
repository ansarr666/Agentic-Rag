import { CornerDownRight } from 'lucide-react';
import type { SuggestedQuestion } from './types';

interface Props {
  questions: SuggestedQuestion[];
  onSelect: (question: SuggestedQuestion) => void;
}

export function SuggestedQuestions({ questions, onSelect }: Props) {
  if (!questions.length) return null;

  return (
    <div className="os-suggestions" aria-label="Related questions you might explore">
      <span className="os-suggestions__label">Related questions you might explore:</span>
      {questions.map((question) => (
        <button
          key={question.id}
          type="button"
          className="os-suggestions__chip"
          onClick={() => onSelect(question)}
        >
          <CornerDownRight aria-hidden="true" />
          <span>{question.text}</span>
        </button>
      ))}
    </div>
  );
}
