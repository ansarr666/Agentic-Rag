import React from 'react';
import { 
  Building2, 
  Smartphone, 
  Users, 
  Search, 
  ShieldCheck, 
  Layers, 
  HelpCircle, 
  ArrowUpRight 
} from 'lucide-react';

export interface EmptyStateProps {
  onSelectSuggestion: (query: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectSuggestion }) => {
  const suggestions = [
    {
      icon: <Building2 className="w-4 h-4 text-blue-400" />,
      title: "Company Services Overview",
      description: "What core software, web, and marketing services does OrionSoft provide?",
      query: "What does OrionSoft Technologies do and what services do you provide?"
    },
    {
      icon: <Smartphone className="w-4 h-4 text-emerald-400" />,
      title: "On-Demand Mobile Applications",
      description: "Can OrionSoft build apps like Uber or Zomato with live tracking and dispatcher panels?",
      query: "Can you build on-demand service apps like Zomato or Uber?"
    },
    {
      icon: <Users className="w-4 h-4 text-purple-400" />,
      title: "Staff Augmentation & Dedicated Devs",
      description: "How does hiring dedicated developers work and what skill sets are available?",
      query: "What is staff augmentation and can I hire dedicated developers from your team?"
    },
    {
      icon: <Search className="w-4 h-4 text-amber-400" />,
      title: "Google Ads vs Facebook Ads",
      description: "What is the strategic difference between search intent ads and demographic targeting?",
      query: "What is the difference between Google Ads and Facebook Ads?"
    },
    {
      icon: <ShieldCheck className="w-4 h-4 text-rose-400" />,
      title: "Cybersecurity & Website Audits",
      description: "Do we offer security gap reviews and vulnerability assessments for web applications?",
      query: "Do you offer cybersecurity services and website security audits?"
    },
    {
      icon: <HelpCircle className="w-4 h-4 text-indigo-400" />,
      title: "Enterprise Policy Check (Rule 6 Test)",
      description: "Check how the system handles non-indexed documents with zero hallucination.",
      query: "What is the probation period duration and taking leaves policy?"
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto my-auto animate-in fade-in duration-300">
      
      {/* Brand Icon & Heading */}
      <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white mb-5 shadow-lg shadow-blue-500/25">
        <Layers className="w-7 h-7 text-white" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 mb-2">
        How can I help you today?
      </h1>
      <p className="text-sm text-slate-400 max-w-lg mb-8 leading-relaxed">
        Ask anything about our company capabilities, engineering standards, marketing playbooks, and service workflows. Every response is verified strictly against trusted internal knowledge.
      </p>

      {/* Suggestion Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full text-left">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectSuggestion(item.query)}
            className="group p-4 rounded-xl bg-surface border border-border hover:border-blue-500 hover:shadow-subtle transition-all duration-150 flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="p-2 rounded-lg bg-surface-elevated border border-border/80 group-hover:border-blue-500/30 transition-colors">
                  {item.icon}
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <h3 className="text-xs font-semibold text-slate-100 group-hover:text-blue-600 transition-colors mb-1">
                {item.title}
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                {item.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Trust reassurance banner */}
      <div className="mt-8 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-elevated/40 border border-border text-xs text-slate-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Authoritative Knowledge: <strong>OrionSoft Internal Records</strong></span>
      </div>

    </div>
  );
};
