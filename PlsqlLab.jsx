import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientService, plsqlService, auditService } from '../services/api';
import { Database, Play, ArrowUpRight, ShieldAlert, CheckCircle2, Timer, Code2 } from 'lucide-react';

/**
 * Lab Assignment 10 — PL/SQL Backend Logic
 * One card per requirement (10.1 – 10.10). Each card shows the SQL it runs,
 * a Run button that executes it live against MySQL, and the result.
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
    <div className="overflow-x-auto mt-2 border border-white/10 rounded-sm max-h-56">
      <table className="w-full text-[11px] font-mono">
        <thead className="bg-[#2e231b] text-[#f5f0e7]/80 sticky top-0">
          <tr>{cols.map((c) => <th key={c} className="px-2 py-1.5 text-left whitespace-nowrap">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-white/5 text-[#f5f0e7]/85">
              {cols.map((c) => <td key={c} className="px-2 py-1 whitespace-nowrap">{r[c] === null ? '—' : String(r[c])}</td>)}
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
    <div className="bc-card bg-[#1c1510] border border-white/10 rounded-sm p-4 shadow-md flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[#c8a27a]/10 border border-[#c8a27a]/40 text-[#ecdcc0]">{req.id}</span>
          <h3 className="mt-2 text-sm font-serif font-semibold text-white">{req.title}</h3>
          <p className="text-[11px] text-[#f5f0e7]/65 mt-1">{req.desc}</p>
        </div>
      </div>

      <pre className="mt-3 p-2.5 bg-[#120d0a] border border-white/5 rounded-sm text-[10.5px] font-mono text-[#e6cfa9] whitespace-pre-wrap">{req.sql}</pre>

      <div className="mt-3 flex flex-wrap gap-2">
        {req.run && (
          <button onClick={() => execute(req.run)} disabled={state.loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-b from-[#e6cfa9] to-[#a47a52] hover:from-[#ecdcc0] hover:to-[#c8a27a] shadow-[0_6px_20px_-6px_rgba(200,162,122,0.55)] text-[#120d0a] rounded-sm text-[11px] font-mono font-semibold uppercase tracking-wider disabled:opacity-50">
            <Play className="w-3 h-3" /> {state.loading ? 'Running…' : 'Run'}
          </button>
        )}
        {req.extra && (
          <button onClick={() => execute(req.extra.run)} disabled={state.loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2e231b] hover:bg-[#3d2f24] text-[#f5f0e7] border border-white/15 rounded-sm text-[11px] font-mono uppercase tracking-wider">
            <Play className="w-3 h-3" /> {req.extra.label}
          </button>
        )}
        {req.link && (
          <Link to={req.link.to}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2e231b] hover:bg-[#3d2f24] text-[#f5f0e7] border border-white/15 rounded-sm text-[11px] font-mono uppercase tracking-wider">
            {req.link.label} <ArrowUpRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {state.ms !== null && (
        <div className="mt-3 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
          <Timer className="w-3 h-3" /> Execution time: {state.ms} ms
        </div>
      )}

      {state.error && (
        <div className="mt-2 p-2 text-[11px] bg-red-950/40 border border-red-500/30 rounded-sm text-red-200 flex gap-2">
          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {state.error}
        </div>
      )}

      {res && res.message && (
        <div className={`mt-2 p-2 text-[11px] rounded-sm flex gap-2 border ${res.blocked ? 'bg-red-950/40 border-red-500/30 text-red-200' : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'}`}>
          {res.blocked ? <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> : <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
          <span>{res.blocked ? `Trigger ${res.trigger} blocked the row: ` : ''}{res.message}</span>
        </div>
      )}

      {res && !res.message && rows.length === 0 && (
        <div className="mt-2 text-[11px] text-[#f5f0e7]/60">No rows returned.</div>
      )}

      {res?.pagination && (
        <div className="mt-2 text-[10px] font-mono text-[#f5f0e7]/70">
          Page {res.pagination.current_page} of {res.pagination.total_pages} · {res.pagination.total_records} matching records
        </div>
      )}
      {res?.cursorType && <div className="mt-2 text-[10px] font-mono text-[#f5f0e7]/70">{res.cursorType} · {res.count} rows fetched</div>}

      <ResultTable rows={rows} />
    </div>
  );
}

export default function PlsqlLab() {
  const [catalog, setCatalog] = useState(null);

  useEffect(() => {
    plsqlService.getCatalog().then((r) => setCatalog(r.data)).catch(() => setCatalog(null));
  }, []);

  return (
    <div className="space-y-6 pb-6">
      <div className="rounded-sm border border-white/10 bg-gradient-to-r from-[#1c1510] via-[#241b15] to-[#2e231b] p-5 sm:p-6 shadow-xl">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-[#c8a27a]">
          <Database className="w-3.5 h-3.5 text-white" /> Lab Assignment 10 · CS203 DBMS
        </div>
        <h1 className="mt-1.5 text-2xl sm:text-3xl font-serif text-white tracking-tight">
          PL/SQL Backend Logic <span className="italic text-[#d9b98f]">Lab</span>
        </h1>
        <p className="text-xs text-[#f5f0e7]/75 mt-1 max-w-2xl">
          Every requirement from 10.1 to 10.10, executed live against MySQL. Trigger tests run inside a transaction
          that is rolled back, so no test data is saved.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {REQUIREMENTS.map((r) => <RequirementCard key={r.id} req={r} />)}
      </div>

      {catalog && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#1c1510] border border-white/10 rounded-sm p-4">
            <h3 className="text-sm font-serif font-semibold text-white flex items-center gap-2"><Code2 className="w-4 h-4" /> Stored Procedures & Functions ({catalog.routines.length})</h3>
            <ResultTable rows={catalog.routines} />
          </div>
          <div className="bg-[#1c1510] border border-white/10 rounded-sm p-4">
            <h3 className="text-sm font-serif font-semibold text-white flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Triggers ({catalog.triggers.length})</h3>
            <ResultTable rows={catalog.triggers} />
          </div>
        </div>
      )}
    </div>
  );
}
