import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import type { LeadGateData } from './types';

interface Props {
  onSubmit: (lead: LeadGateData) => Promise<void>;
}

export function LeadGate({ onSubmit }: Props) {
  const [lead, setLead] = useState<LeadGateData>({ name: '', email: '', phone: '', company: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (field: keyof LeadGateData, value: string) => {
    setLead((current) => ({ ...current, [field]: value }));
  };

  return (
    <section className="os-lead-gate" aria-labelledby="lead-gate-title">
      <p className="os-lead-gate__intro">
        A quick hello first. Share a few details so our team can follow up, then you can start chatting right away.
      </p>
      <form
        className="os-lead-gate__form"
        onSubmit={async (event) => {
          event.preventDefault();
          setError('');
          if (!/^\S+@\S+\.\S+$/.test(lead.email)) return setError('Enter a valid work email.');
          if (lead.phone.replace(/\D/g, '').length < 7) return setError('Enter a valid phone number.');
          setSubmitting(true);
          try {
            await onSubmit({ ...lead, email: lead.email.trim(), name: lead.name.trim() });
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Something went wrong. Please try again.');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <label>
          Name *
          <input
            required
            autoComplete="name"
            autoFocus
            placeholder="Your full name"
            value={lead.name}
            onChange={(e) => update('name', e.target.value)}
          />
        </label>
        <label>
          Work email *
          <input
            required
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={lead.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </label>
        <label>
          Phone number *
          <input
            required
            type="tel"
            autoComplete="tel"
            placeholder="+1 555 123 4567"
            value={lead.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
        </label>
        <label>
          Company
          <input
            autoComplete="organization"
            placeholder="Company name (optional)"
            value={lead.company}
            onChange={(e) => update('company', e.target.value)}
          />
        </label>
        {error && <p className="os-form-error" role="alert">{error}</p>}
        <button className="os-lead-gate__submit" type="submit" disabled={submitting}>
          {submitting ? 'One moment...' : 'Start the conversation'}
          {!submitting && <ArrowRight aria-hidden="true" />}
        </button>
        <p className="os-form-note">By continuing, you agree that OrionSoft may contact you about your enquiry.</p>
      </form>
    </section>
  );
}
