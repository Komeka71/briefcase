import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { clientService, plsqlService, auditService } from '../services/api';
import { Database, Play, ArrowUpRight, ShieldAlert, CheckCircle2, Timer, Code2, Scale } from 'lucide-react';

/**
 * Lab Assignment 10 — PL/SQL Backend Logic
 * One card per requirement (10.1 – 10.10). Each card shows the SQL it runs,
 * a Run button that executes it live against MySQL, and the result.
 * Styled in The Courtroom aesthetic.
 */

const REQUIREMENTS = [
  {
    id: '10.1',
    title: 'CRUD Stored Procedures',
    desc: 'InsertClient, UpdateClient and DeleteClient handle all client data manipulation with SIGNAL-based validation.',
    sql: "CALL InsertClient('Name','Individual','9876543210','a@b.com','Surat', @id);\nCALL UpdateClient(1,'Name','Organization',NULL,NULL,NULL);\nCALL DeleteClient(1);",
    link: { to: '/app/clients', label: 'Open Clients (Insert / Update / Delete)' }
  },
  {
    id: '10.2',
    title: 'Database User Accounts & Roles',
    desc: 'Accounts for naïve user, application developer and DBA with GRANT-based privileges.',
    sql: "CREATE USER 'briefcase_naive'@'localhost';\nGRANT SELECT ON briefcase.* TO 'briefcase_naive'@'localhost';\nGRANT ALL PRIVILEGES ON briefcase.* TO 'briefcase_dba'@'localhost';",
    link: { to: '/app/db-users', label: 'Open Security & RBAC' }
  },
  {
    id: '10.3',
    title: 'User Login Data (CRUD on USERS)',
    desc: 'RegisterUser and GetUserByEmail procedures manage login records with bcrypt-hashed passwords.',
    sql: "CALL RegisterUser('Name','user@firm.in','<bcrypt hash>','Lawyer', @uid);\nCALL GetUserByEmail('user@firm.in');",
    link: { to: '/app/db-users', label: 'Open Login Users' }
  },
  {
    id: '10.4A',
    title: 'Explicit Cursor — Without Limit',
    desc: 'DisplayAllClients opens a cursor and iterates through every CLIENT row.',
    sql: 'CALL DisplayAllClients();',
    run: () => clientService.getCursor()
  },
  {
    id: '10.4B',
    title: 'Explicit Cursor — With Limit',
    desc: 'DisplayLimitedClients stops fetching after N rows.',
    sql: 'CALL DisplayLimitedClients(3);',
    run: () => clientService.getCursor(3)
  },
  {
    id: '10.5A',
    title: 'Paginated Search — No Filter',
    desc: 'PaginateClients returns page 1 (size 4) plus page metadata from fn_get_client_search_count.',
    sql: "CALL PaginateClients(1, 4, '');",
    run: () => clientService.getPaginated(1, 4, '')
  },
  {
    id: '10.5B',
    title: 'Paginated Search — With Filter',
    desc: 'Same procedure, filtered by a search term on name / email / type / phone.',
    sql: "CALL PaginateClients(1, 4, 'Organization');",
    run: () => clientService.getPaginated(1, 4, 'Organization')
  },
  {
    id: '10.6A',
    title: 'SUM Function — Without Grouping',
    desc: 'fn_total_case_budget() returns the total of CASES.budget.',
    sql: 'SELECT fn_total_case_budget();',
    run: () => plsqlService.getAggregate('total')
  },
  {
    id: '10.6B',
    title: 'SUM — With Grouping',
    desc: 'GetCaseBudgetSummaryByType groups CASES.budget by case type.',
    sql: 'CALL GetCaseBudgetSummaryByType();',
    run: () => plsqlService.getAggregate('grouped')
  },
  {
    id: '10.7',
    title: 'BEFORE Trigger — 2 Integrity Checks',
    desc: 'trg_client_before_insert_val rejects (1) names shorter than 2 chars and (2) invalid email format.',
    sql: "INSERT INTO CLIENT (name, client_type, email)\nVALUES ('A', 'Individual', 'a@test.com');",
    run: () => plsqlService.runTriggerTest('validation-name'),
    extra: { label: 'Test bad email', run: () => plsqlService.runTriggerTest('validation-email') }
  },
  {
    id: '10.8',
    title: 'Uppercase Conversion Trigger',
    desc: 'trg_client_before_insert_norm converts client names to UPPERCASE before storing.',
    sql: "INSERT INTO CLIENT (name, client_type, email)\nVALUES ('rahul mehta demo', 'Individual', 'rahul.demo@test.com');",
    run: () => plsqlService.runTriggerTest('uppercase')
  },
  {
    id: '10.9',
    title: 'AFTER Trigger — Audit Log',
    desc: 'AFTER INSERT / UPDATE / DELETE triggers write every change into application_audit_log.',
    sql: 'SELECT * FROM application_audit_log ORDER BY audit_id DESC LIMIT 5;',
    run: () => auditService.getLogs(1, 5),
    link: { to: '/app/audit', label: 'Open full Activity History' }
  },
  {
    id: '10.10',
    title: 'Office Hours Restriction Trigger',
    desc: 'Blocks any CLIENT modification on Monday between 2 PM and 4 PM (simulated here).',
    sql: "SET @briefcase_simulate_monday_review = 1;\nINSERT INTO CLIENT (name, client_type, email)\nVALUES ('Office Hours Test', 'Individual', 'oh@test.com');",
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
  const cols = Object.keys(rows[0]).filter((c) => typeof rows[0][c] !== 'object' || rows[0][c] === null).slice(0, 7);
  return (
    <div className="overflow-x-auto mt-2.5 border border-[#2B2D32] rounded-[3px] max-h-56">
      <table className="court-table text-[11px] font-mono">
        <thead className="sticky top-0 bg-[#1E1F23]">
          <tr>{cols.map((c) => <th key={c} className="px-2.5 py-1.5 text-left whitespace-nowrap">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {cols.map((c) => <td key={c} className="px-2.5 py-1 whitespace-nowrap text-[#F6F4EF]">{r[c] === null ? '—' : String(r[c])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RequirementCard({ req }) {
  const [state, setState] = useState({ loading: false, res: null, error: null, ms: null });

  const execute = async (fn) => {
    setState({ loading: true, res: null, error: null, ms: null });
    const t0 = performance.now();
    try {
      const r = await fn();
      setState({ loading: false, res: r.data, error: null, ms: r.data?.executionTimeMs ?? (performance.now() - t0).toFixed(1) });
    } catch (err) {
      setState({ loading: false, res: null, error: err.response?.data?.message || err.message, ms: (performance.now() - t0).toFixed(1) });
    }
  };

  const res = state.res;
  const rows = pickRows(res);

  return (
    <div className="court-card p-4 sm:p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-[#B8975A]/15 border border-[#B8975A]/40 text-[#D4B97E] font-semibold">{req.id}</span>
            <h3 className="mt-2 text-sm font-serif font-semibold text-white">{req.title}</h3>
            <p className="text-xs text-[#B4B7BC] font-sans mt-1 leading-relaxed">{req.desc}</p>
          </div>
          {state.ms && (
            <span className="text-[10px] font-mono text-[#72C095] flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-[2px] bg-[#141416] border border-[#3F7D5C]/30">
              <Timer className="w-3 h-3" />{state.ms} ms
            </span>
          )}
        </div>

        <pre className="mt-3 p-2.5 bg-[#0A0A0B] border border-[#2B2D32] rounded-[3px] text-[11px] font-mono text-[#D4B97E] overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {req.sql}
        </pre>
      </div>

      <div className="mt-4 pt-3 border-t border-[#2B2D32]/80">
        <div className="flex flex-wrap items-center gap-2">
          {req.run && (
            <button
              onClick={() => execute(req.run)}
              disabled={state.loading}
              className="court-btn-brass px-3 py-1.5 rounded-[3px] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Play className="w-3 h-3 text-[#0A0A0B] fill-current" />
              <span>{state.loading ? 'Executing...' : 'Run Query'}</span>
            </button>
          )}

          {req.extra && (
            <button
              onClick={() => execute(req.extra.run)}
              disabled={state.loading}
              className="court-btn-outline px-3 py-1.5 rounded-[3px] text-xs font-mono uppercase tracking-wider transition-all"
            >
              <span>{req.extra.label}</span>
            </button>
          )}

          {req.link && (
            <Link
              to={req.link.to}
              className="court-btn-outline px-3 py-1.5 rounded-[3px] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <span>{req.link.label}</span>
              <ArrowUpRight className="w-3 h-3 text-[#B8975A]" />
            </Link>
          )}
        </div>

        {state.error && (
          <div className="mt-3 p-2.5 rounded-[3px] bg-[#9B2C2C]/20 border border-[#9B2C2C]/60 text-[#E67272] text-xs flex items-start gap-2 font-mono">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="break-all">{state.error}</span>
          </div>
        )}

        {res && !state.error && (
          <div className="mt-3 space-y-1.5">
            <div className="text-[10px] font-mono text-[#72C095] flex items-center gap-1 font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Execution Verified Successfully</span>
            </div>
            {res.message && <div className="text-xs text-white font-sans">{res.message}</div>}
            {res.data && typeof res.data !== 'object' && (
              <div className="text-xs font-mono text-white p-2 bg-[#0A0A0B] border border-[#2B2D32] rounded-[3px]">
                Result: <span className="text-[#D4B97E] font-bold">{String(res.data)}</span>
              </div>
            )}
            <ResultTable rows={rows} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlsqlLab() {
  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B2D32]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B8975A] flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>Lab Assignment 10 • Stored Procedures & Triggers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight mt-1 font-semibold">
            PL/SQL Execution Laboratory
          </h2>
          <p className="text-xs text-[#B4B7BC] font-sans mt-0.5">
            10 practical requirements (10.1 – 10.10) running directly against MySQL 8.0 with real-time execution timing.
          </p>
        </div>

        <Link
          to="/app/reports"
          className="court-btn-outline px-4 py-2 rounded-[3px] text-xs font-mono uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto"
        >
          <span>SQL Lab 11 (Queries)</span>
          <ArrowUpRight className="w-4 h-4 text-[#B8975A]" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REQUIREMENTS.map((req) => (
          <RequirementCard key={req.id} req={req} />
        ))}
      </div>
    </div>
  );
}
