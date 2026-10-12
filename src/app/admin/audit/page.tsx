'use client';

import { useState, useEffect } from 'react';
import { getAuditLogs, AuditRecord } from '@/lib/storage';
import {
  ShieldAlert,
  Search,
  Filter,
  User,
  Clock,
  KeyRound,
  Trophy,
  DollarSign,
  Heart,
  UserCheck,
  RefreshCw,
  FileText,
} from 'lucide-react';

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/metrics', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.auditLogs) {
        setLogs(data.auditLogs);
      } else {
        setLogs(getAuditLogs());
      }
    } catch {
      setLogs(getAuditLogs());
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dh-storage-update', loadData);
    return () => window.removeEventListener('dh-storage-update', loadData);
  }, []);

  const filteredLogs = logs.filter((log: any) => {
    const adminNameStr = log.adminName || log.admin_name || 'Admin';
    const actionStr = log.action || '';
    const entityIdStr = log.entityId || log.entity_id || '';
    const matchesSearch =
      actionStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adminNameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entityIdStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.oldValue && String(log.oldValue).toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.newValue && String(log.newValue).toLowerCase().includes(searchTerm.toLowerCase()));

    if (selectedEntity === 'all') return matchesSearch;
    return matchesSearch && String(log.entity || '').toUpperCase() === selectedEntity.toUpperCase();
  });

  const getEntityIcon = (entity: string) => {
    switch ((entity || '').toUpperCase()) {
      case 'AUTH':
        return <KeyRound className="w-3.5 h-3.5 text-amber-400" />;
      case 'DRAW':
        return <Trophy className="w-3.5 h-3.5 text-yellow-400" />;
      case 'USER':
        return <User className="w-3.5 h-3.5 text-blue-400" />;
      case 'PAYOUT':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
      case 'CHARITY':
        return <Heart className="w-3.5 h-3.5 text-rose-400" />;
      case 'WINNER':
        return <UserCheck className="w-3.5 h-3.5 text-teal-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/30 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono tracking-widest uppercase mb-1">
            <span>Admin Control Center</span>
            <span>/</span>
            <span>Audit Trail</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" /> Administrative Audit Log
          </h1>
          <p className="text-xs text-slate-400">
            Immutable operation log recording every authentication, user state change, draw trigger, charity modification, and payout disbursement.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded-lg text-xs flex items-center space-x-2 transition-all shadow-md"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Refresh Activity Log</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search action, administrator name, or entity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'AUTH', 'USER', 'DRAW', 'WINNER', 'PAYOUT', 'CHARITY'].map((ent) => (
            <button
              key={ent}
              onClick={() => setSelectedEntity(ent)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                selectedEntity === ent
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {ent}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Administrator</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Action Executed</th>
                <th className="px-5 py-3.5">Target Entity ID</th>
                <th className="px-5 py-3.5">State Change Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No audit records match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log: any) => {
                  const adminName = log.adminName || log.admin_name || 'Admin';
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp || Date.now()).toLocaleString()}
                      </td>

                      <td className="px-5 py-4 font-bold text-white flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-amber-400 font-black">
                          {adminName.charAt(0)}
                        </div>
                        <span>{adminName}</span>
                      </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 text-slate-300 uppercase">
                        {getEntityIcon(log.entity)}
                        <span>{log.entity}</span>
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-200">{log.action}</td>

                    <td className="px-5 py-4 font-mono text-slate-400">{log.entityId}</td>

                    <td className="px-5 py-4">
                      {log.oldValue || log.newValue ? (
                        <div className="space-y-0.5 font-mono text-[10px]">
                          {log.oldValue && <div className="text-rose-400/80 line-through">- {log.oldValue}</div>}
                          {log.newValue && <div className="text-emerald-400">+ {log.newValue}</div>}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">No state mutation</span>
                      )}
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
