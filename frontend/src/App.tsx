import React, { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { getAdminKey, setAdminKey } from './lib/api';

function App() {
  const [key, setKey] = useState<string>(getAdminKey());
  const [draft, setDraft] = useState('');

  if (!key) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9] font-sans">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) {
              setAdminKey(draft);
              setKey(draft.trim());
            }
          }}
          className="bg-white border border-slate-200 rounded-xl shadow-card p-8 w-full max-w-sm space-y-4"
        >
          <div>
            <h1 className="text-lg font-bold text-slate-900">Admin Console</h1>
            <p className="text-sm text-slate-500">Enter your admin API key to continue.</p>
          </div>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            type="password"
            placeholder="API key"
            autoFocus
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  return <AppShell />;
}

export default App;
