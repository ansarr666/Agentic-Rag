import React, { useState } from 'react';
import { 
  Activity, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Filter, 
  RefreshCw, 
  Layers, 
  User 
} from 'lucide-react';
import { ObservabilityLog } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface ActivityViewProps {
  logs: ObservabilityLog[];
  onRefresh: () => void;
  onToast: (msg: string) => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  logs,
  onRefresh,
  onToast
}) => {
  const [filterRole, setFilterRole] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'All' || log.userRole === filterRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            System Activity & Observability
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time query telemetry, latency tracking, retrieval health, and operational audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onRefresh();
              onToast('Telemetry logs refreshed');
            }}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Logs
          </Button>
        </div>
      </div>

      {/* Observability Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-xs text-slate-400 font-medium">Queries Today</span>
          <div className="text-2xl font-bold text-slate-100 mt-1">1,420</div>
          <span className="text-[11px] text-emerald-400 mt-1 block">99.8% Success Rate</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-xs text-slate-400 font-medium">P95 Latency</span>
          <div className="text-2xl font-bold text-blue-400 mt-1">185ms</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Avg: 142ms</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-xs text-slate-400 font-medium">Grounded Queries</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">100%</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Zero unverified outputs</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-xs text-slate-400 font-medium">Active Chunks</span>
          <div className="text-2xl font-bold text-slate-100 mt-1">74</div>
          <span className="text-[11px] text-blue-400 mt-1 block">OrionSoft Chatbot Master</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter logs by query or engine model..."
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs text-slate-400 mr-1">User Role:</span>
          {['All', 'Employee', 'Admin', 'Engineer'].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3 py-1 rounded-md text-xs transition-colors ${
                filterRole === role
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-surface text-slate-400 hover:text-slate-200 border border-border'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Query Logs Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-border">
              <tr>
                <th className="px-5 py-3">Time</th>
                <th className="px-4 py-3">Query</th>
                <th className="px-4 py-3">User Role</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">Retrieved</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3">Engine & Generation Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-elevated/30 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-slate-400">
                    {log.timestamp}
                  </td>

                  <td className="px-4 py-3.5 max-w-sm">
                    <span className="font-medium text-slate-200 truncate block">
                      {log.query}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 capitalize">
                    <Badge variant="neutral" size="sm">
                      {log.userRole}
                    </Badge>
                  </td>

                  <td className="px-4 py-3.5 font-mono text-slate-300">
                    {log.latencyMs}ms
                  </td>

                  <td className="px-4 py-3.5 font-mono text-slate-400">
                    {log.retrievedCount} chunks
                  </td>

                  <td className="px-4 py-3.5">
                    <Badge variant="success" size="sm">
                      {log.status}
                    </Badge>
                  </td>

                  <td className="px-5 py-3.5 text-slate-400 text-[11px] truncate max-w-xs">
                    {log.model}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
