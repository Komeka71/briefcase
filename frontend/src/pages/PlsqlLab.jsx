import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clientService, plsqlService, auditService } from '../services/api';
import {
  Database,
  Play,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { PageHeader, GlassCard, StatusPill } from '../components/ui';

const REQUIREMENTS = [
  {
    id: 'OP-01',
    title: 'Client Management Procedures',
    desc: 'Automated procedures handling client records with validation checks.',
    run: () => clientService.getPaginated(1, 4, ''),
    link: { to: '/app/clients', label: 'Open Clients Registry' }
  },
  {
    id: 'OP-02',
    title: 'Access Control & Role Privileges',
    desc: 'Database security accounts enforcing read-only, application service, and administrative roles.',
    link: { to: '/app/db-users', label: 'Open Security & Access' }
  },
  {
    id: 'OP-03',
    title: 'Authentication & Credential Storage',
    desc: 'Secure user registration and retrieval procedures managing login credentials.',
    link: { to: '/app/db-users', label: 'Open Login Users' }
  },
  {
    id: 'OP-04',
    title: 'Client Directory Batch Retrieval',
    desc: 'Iterates and fetches client records using database cursor controls.',
    run: () => clientService.getCursor()
  },
  {
    id: 'OP-05',
    title: 'Limited Cursor Fetch',
    desc: 'Controlled record batch fetching with specific row count constraints.',
    run: () => clientService.getCursor(3)
  },
  {
    id: 'OP-06',
    title: 'Client Paginated Search',
    desc: 'Paginated client query retrieving record subsets with pagination metadata.',
    run: () => clientService.getPaginated(1, 4, '')
  },
  {
    id: 'OP-07',
    title: 'Filtered Entity Query',
    desc: 'Targeted search filtering client records by organizational classification.',
    run: () => clientService.getPaginated(1, 4, 'Organization')
  },
  {
    id: 'OP-08',
    title: 'Matter Budget Aggregate Calculation',
    desc: 'Calculates the cumulative budget across all registered legal matters.',
    run: () => plsqlService.getAggregate('total')
  },
  {
    id: 'OP-09',
    title: 'Budget Summary by Practice Area',
    desc: 'Groups and calculates total allocated budgets across matter practice areas.',
    run: () => plsqlService.getAggregate('grouped')
  },
  {
    id: 'OP-10',
    title: 'Input Integrity & Validation Policy',
    desc: 'Enforces character length and email format integrity before committing client records.',
    run: () => plsqlService.runTriggerTest('validation-name'),
    extra: { label: 'Verify Email Rule', run: () => plsqlService.runTriggerTest('validation-email') }
  },
  {
    id: 'OP-11',
    title: 'Automatic Normalization Routine',
    desc: 'Normalizes and standardizes client names upon entry into the database.',
    run: () => plsqlService.runTriggerTest('uppercase')
  },
  {
    id: 'OP-12',
    title: 'Comprehensive Activity Audit Trail',
    desc: 'Automatically records mutation snapshots into the audit log upon change.',
    run: () => auditService.getLogs(1, 5),
    link: { to: '/app/audit', label: 'Open Activity History' }
  },
  {
    id: 'OP-13',
    title: 'Office Hours Operation Window',
    desc: 'Enforces business operating hours policies on database modifications.',
    run: () => plsqlService.runTriggerTest('office-hours')
  }
];

function pickRows(data) {
  if (!data) return [];
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.logs)) return data.logs;
  if (data.data && Array.isArray(data.data.logs)) return data.data.logs;
  return [];
}

function ResultTable({ rows }) {
  if (!rows || rows.length === 0) return null;
  const cols = Object.keys(rows[0])
    .filter((c) => typeof rows[0][c] !== 'object' || rows[0][c] === null)
    .slice(0, 7);

  return (
    <div className="overflow-x-auto mt-3 border border-brass-500/20 rounded bg-ink-950/60 max-h-60 scrollbar-thin">
      <table className="court-table text-[11px] font-mono w-full">
        <thead className="sticky top-0 bg-charcoal-900 border-b border-brass-500/20">
          <tr>
            {cols.map((c) => (
              <th key={c} className="px-3 py-2 text-left whitespace-nowrap text-brass-400 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brass-500/10">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-charcoal-850/60 transition-colors">
              {cols.map((c) => (
                <td key={c} className="px-3 py-1.5 whitespace-nowrap text-ivory-100">
                  {r[c] === null ? (
                    <span className="text-graphite-500 italic">NULL</span>
                  ) : (
                    String(r[c])
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RequirementCard({ req, index }) {
  const [state, setState] = useState({ loading: false, res: null, error: null });

  const execute = async (fn) => {
    setState({ loading: true, res: null, error: null });
    try {
      const r = await fn();
      setState({
        loading: false,
        res: r.data,
        error: null
      });
    } catch (err) {
      setState({
        loading: false,
        res: null,
        error: err.response?.data?.message || err.message
      });
    }
  };

  const res = state.res;
  const rows = pickRows(res);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="court-card p-5 flex flex-col justify-between group hover:border-brass-500/40 transition-all duration-300 relative"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brass-500/15 border border-brass-500/40 text-brass-300 font-semibold tracking-wider">
                {req.id}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-graphite-400">
                System Routine
              </span>
            </div>
            <h3 className="text-base font-serif font-semibold text-ivory-100 group-hover:text-brass-300 transition-colors">
              {req.title}
            </h3>
            <p className="text-xs text-graphite-300 leading-relaxed font-sans">
              {req.desc}
            </p>
          </div>
        </div>
      </div>

      {/* Action / Result Bar */}
      <div className="mt-5 pt-3.5 border-t border-brass-500/10 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {req.run && (
            <button
              onClick={() => execute(req.run)}
              disabled={state.loading}
              className="court-btn-brass px-3.5 py-1.5 rounded text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-3 h-3 text-ink-950 fill-current" />
              <span>{state.loading ? 'Executing...' : 'Run Procedure'}</span>
            </button>
          )}

          {req.extra && (
            <button
              onClick={() => execute(req.extra.run)}
              disabled={state.loading}
              className="court-btn-outline px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{req.extra.label}</span>
            </button>
          )}

          {req.link && (
            <Link
              to={req.link.to}
              className="court-btn-outline px-3.5 py-1.5 rounded text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all text-brass-300 hover:text-brass-200"
            >
              <span>{req.link.label}</span>
              <ArrowUpRight className="w-3 h-3 text-brass-400" />
            </Link>
          )}
        </div>

        <AnimatePresence>
          {state.error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5 font-mono"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div className="space-y-1">
                <div className="font-semibold text-red-200 uppercase text-[10px] tracking-wider">
                  Validation Notice
                </div>
                <div className="break-all text-[11px] leading-relaxed">{state.error}</div>
              </div>
            </motion.div>
          )}

          {res && !state.error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 pt-1"
            >
              <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 font-semibold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Routine Executed Successfully</span>
              </div>
              {res.message && (
                <div className="text-xs text-ivory-200 font-sans leading-relaxed">
                  {res.message}
                </div>
              )}
              {res.data && typeof res.data !== 'object' && (
                <div className="text-xs font-mono text-ivory-100 p-2.5 bg-ink-950 border border-brass-500/20 rounded">
                  Result:{' '}
                  <span className="text-brass-300 font-bold">{String(res.data)}</span>
                </div>
              )}
              <ResultTable rows={rows} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function PlsqlLab() {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="System Operations • Database Automation"
        title="Automated Procedures & Routines"
        subtitle="Server-side stored procedures, automated constraints, and audit logging routines executing against the Chambers database."
      />

      {/* Overview Bar */}
      <GlassCard className="p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-brass-500/15 border border-brass-500/30 flex items-center justify-center text-brass-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-ivory-100 font-semibold font-serif">Database Engine Online</div>
            <div className="text-[11px] text-graphite-400">Relational Schema • Automated Procedures & Constraint Triggers</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status="Operational" variant="success" size="sm" />
          <span className="text-graphite-400">Routines Ready</span>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REQUIREMENTS.map((req, idx) => (
          <RequirementCard key={req.id} req={req} index={idx} />
        ))}
      </div>
    </div>
  );
}
