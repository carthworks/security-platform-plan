'use client';

import { useToast } from '@/components/Toast';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { useMemo, useState } from 'react';
import { PHASES, ALL_SPRINTS, OWNER_COLORS, ROLE_LABELS } from '@/lib/sprints-data';
export default function ReportsPage() {
  const { users } = useAuth();
  const { isTaskDone, getOverallProgress, getSprintProgress, getTaskAssignee, progress } = useStore();
  const { toast } = useToast();

  // Filters State
  const [filterSprint, setFilterSprint] = useState('all');
  const [filterOwner, setFilterOwner] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const overall = getOverallProgress();

  // 1. Calculate Sprint Completion Rates for Charts
  const sprintData = useMemo(() => {
    return ALL_SPRINTS.map((s) => {
      const stats = getSprintProgress(s.i, s.tasks.length);
      return {
        id: s.i,
        name: s.n,
        phaseColor: s.phase.color,
        pct: stats.pct,
        done: stats.done,
        total: stats.total,
      };
    });
  }, [getSprintProgress]);

  // 2. Calculate Discipline (Owner) Metrics
  const disciplineData = useMemo(() => {
    const counts: Record<string, { total: number; done: number }> = {};
    ALL_SPRINTS.forEach((s) => {
      s.tasks.forEach((task, idx) => {
        if (!counts[task.o]) counts[task.o] = { total: 0, done: 0 };
        counts[task.o].total++;
        if (isTaskDone(s.i, idx)) {
          counts[task.o].done++;
        }
      });
    });
    return Object.entries(counts).map(([owner, counts]) => ({
      name: owner,
      color: OWNER_COLORS[owner] || '#888',
      ...counts,
      pct: counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0,
    }));
  }, [isTaskDone]);

  // 3. Calculate Team Workload Details
  const teamWorkload = useMemo(() => {
    return users.map((u) => {
      // get task keys assigned to this user
      const assignedTaskKeys = progress.assignments
        .filter((a) => a.assigneeId === u.id)
        .map((a) => a.taskKey);

      let total = assignedTaskKeys.length;
      let done = 0;

      // check how many of these assigned tasks are actually done
      ALL_SPRINTS.forEach((s) => {
        s.tasks.forEach((_, idx) => {
          const key = `sprint-${s.i}-task-${idx}`;
          if (assignedTaskKeys.includes(key) && isTaskDone(s.i, idx)) {
            done++;
          }
        });
      });

      return {
        ...u,
        total,
        done,
        pending: total - done,
        pct: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    });
  }, [users, progress.assignments, isTaskDone]);

  // 4. Filterable Checklist Report Table
  const allTasksFlat = useMemo(() => {
    return ALL_SPRINTS.flatMap((s) =>
      s.tasks.map((task, idx) => {
        const taskKey = `sprint-${s.i}-task-${idx}`;
        const assigneeId = getTaskAssignee(taskKey);
        const assignee = assigneeId ? users.find((u) => u.id === assigneeId) : null;
        const done = isTaskDone(s.i, idx);
        return {
          key: taskKey,
          sprintId: s.i,
          sprintName: s.n,
          phaseId: s.phase.id,
          phaseColor: s.phase.color,
          title: task.t,
          owner: task.o,
          assigneeName: assignee ? assignee.name : 'Unassigned',
          assigneeId: assigneeId || 'unassigned',
          status: done ? 'done' : 'todo',
          note: progress.notes[taskKey] || '',
        };
      })
    );
  }, [users, getTaskAssignee, isTaskDone, progress.notes]);

  const filteredTasks = useMemo(() => {
    return allTasksFlat.filter((t) => {
      const matchSprint = filterSprint === 'all' || t.sprintId.toString() === filterSprint;
      const matchOwner = filterOwner === 'all' || t.owner === filterOwner;
      const matchAssignee = filterAssignee === 'all' || t.assigneeId === filterAssignee;
      const matchStatus = filterStatus === 'all' || t.status === filterStatus;
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.note.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSprint && matchOwner && matchAssignee && matchStatus && matchSearch;
    });
  }, [allTasksFlat, filterSprint, filterOwner, filterAssignee, filterStatus, searchQuery]);

  // 5. CSV Export Handler
  const handleExportCSV = () => {
    try {
      const headers = ['Phase', 'Sprint ID', 'Sprint Title', 'Task Title', 'Discipline (Owner)', 'Assignee', 'Status', 'Notes'];
      const rows = filteredTasks.map((t) => [
        `Phase ${t.phaseId}`,
        `Sprint ${t.sprintId}`,
        t.sprintName.replace(/"/g, '""'),
        t.title.replace(/"/g, '""'),
        t.owner,
        t.assigneeName.replace(/"/g, '""'),
        t.status === 'done' ? 'Completed' : 'Pending',
        t.note.replace(/"/g, '""'),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((val) => `"${val}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `securityPlatform_sprint_report_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast('CSV Export completed successfully!', 'success');
    } catch (e) {
      toast('Failed to export CSV report', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="page">
      {/* Dynamic Print Styles Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .nav, .user-bar, .footer, .print-hide, .search-container, .dash-filters, button, select {
            display: none !important;
          }
          body, .page {
            background: #fff !important;
            color: #000 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .page-header {
            margin-bottom: 30px !important;
          }
          .page-title {
            color: #000 !important;
            font-size: 26px !important;
            font-weight: 700 !important;
            background: none !important;
            -webkit-text-fill-color: initial !important;
          }
          .kpi-row {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 10px !important;
          }
          .mcard {
            border: 1.5px solid #ddd !important;
            background: #fff !important;
            color: #000 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          .dash-panels {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            page-break-inside: avoid;
          }
          .dash-panel {
            border: 1.5px solid #ddd !important;
            background: #fff !important;
            color: #000 !important;
            page-break-inside: avoid;
          }
          .sprint-velocity-scroll {
            max-height: none !important;
            overflow: visible !important;
          }
          .report-table-wrapper {
            overflow: visible !important;
          }
          .report-table {
            color: #000 !important;
          }
          .report-table th {
            color: #000 !important;
            border-bottom: 2px solid #000 !important;
          }
          .report-table td {
            color: #333 !important;
            border-bottom: 1px solid #ddd !important;
          }
        }
      `}} />

      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="page-tag" style={{ background: 'rgba(29,158,117,0.12)', color: 'var(--tf-teal)', border: '0.5px solid rgba(29,158,117,0.2)' }}>
            Analytical Reports
          </div>
          <h1 className="page-title">Executive Metrics &amp; Task Audits</h1>
          <p className="page-subtitle">
            Sprint velocity indexes, functional workload comparisons, and deep-dive filtering on project deliverables.
          </p>
        </div>

        <div className="print-hide" style={{ display: 'flex', gap: 8 }}>
          <button className="theme-btn" style={{ background: 'var(--color-background-tertiary)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 6, border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', padding: '8px 16px', fontSize: 13, cursor: 'pointer' }} onClick={handlePrint}>
            <i className="ti ti-printer" style={{ fontSize: 14 }} aria-hidden="true" />
            Print PDF
          </button>
          <button className="theme-btn" style={{ background: 'var(--tf-teal)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, border: 'none', borderRadius: 'var(--border-radius-md)', padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }} onClick={handleExportCSV}>
            <i className="ti ti-download" style={{ fontSize: 14 }} aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>

      {/* High-Level Overview Metrics */}
      <div className="kpi-row" style={{ marginBottom: 20 }}>
        {[
          { label: 'Overall Completion', value: `${overall.pct}%` },
          { label: 'Tasks Completed', value: `${overall.totalDone} / ${overall.totalTasks}` },
          { label: 'Total Sprints', value: '24 Sprints' },
          { label: 'Active Sprint', value: `#${progress.currentSprintId}` },
        ].map((k) => (
          <div className="mcard" key={k.label} style={{ background: 'var(--color-background-secondary)' }}>
            <p className="mcard-label">{k.label}</p>
            <p className="mcard-value">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Visual Analytics Sections */}
      <div className="dash-panels" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
        
        {/* Left Column: Sprints Velocity Tracker */}
        <div className="dash-panel" style={{ height: '100%', minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="dash-panel-title">
            <i className="ti ti-chart-arrows-vertical" aria-hidden="true" /> Sprint Velocities
          </h3>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
            Real-time delivery progress metrics for each of the 24 roadmap sprints.
          </p>
          
          <div className="sprint-velocity-scroll" style={{ flex: 1, overflowY: 'auto', maxHeight: '320px', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sprintData.map((s) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                <span style={{ minWidth: '70px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Sprint {s.id}</span>
                <div style={{ flex: 1, height: '8px', background: 'var(--color-background-primary)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ height: '100%', width: `${s.pct}%`, background: s.phaseColor, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                </div>
                <span style={{ minWidth: '40px', textAlign: 'right', fontWeight: 600, color: s.pct === 100 ? 'var(--tf-teal)' : 'var(--color-text-primary)' }}>{s.pct}%</span>
                <span style={{ minWidth: '45px', textAlign: 'right', color: 'var(--color-text-tertiary)', fontSize: '10px' }}>{s.done}/{s.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Workload Distribution by Discipline */}
        <div className="dash-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h3 className="dash-panel-title">
            <i className="ti ti-chart-pie" aria-hidden="true" /> Discipline Breakdown
          </h3>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
            Overall execution comparison separated by team area.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {disciplineData.map((d) => (
              <div key={d.name} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                  <span style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>{d.name}</span>
                  <span style={{ fontWeight: 600, color: d.color }}>{d.pct}% ({d.done}/{d.total})</span>
                </div>
                <div style={{ height: '5px', background: 'var(--color-background-primary)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${d.pct}%`, background: d.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Team Workload Analysis */}
      <div className="dash-panel" style={{ marginBottom: 20 }}>
        <h3 className="dash-panel-title">
          <i className="ti ti-users" aria-hidden="true" /> Team Workload &amp; Assignment Execution
        </h3>
        <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 14 }}>
          Comparison of completed vs pending tasks for each active team profile.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {teamWorkload.map((m) => (
            <div key={m.id} className="team-card" style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className={`dash-team-avatar ${m.avatarColor}`}>{m.avatar}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{m.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{ROLE_LABELS[m.role] || m.role}</div>
                </div>
              </div>

              <div style={{ height: '4px', background: 'var(--color-background-secondary)', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ height: '100%', width: `${m.pct}%`, background: 'var(--tf-teal)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                <span>{m.pct}% complete</span>
                <span style={{ fontWeight: 500 }}>{m.done} Done · {m.pending} Pending</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filterable Table Section */}
      <div className="dash-panel">
        <h3 className="dash-panel-title">
          <i className="ti ti-table" aria-hidden="true" /> Detailed Deliverables Audit
        </h3>
        <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 14 }}>
          Search and narrow down the roadmap schedule based on phases, sprints, assignees, or completeness.
        </p>

        {/* Audit Filter Panel */}
        <div className="print-hide" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '14px' }}>
          {/* Sprint Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '4px' }}>Sprint ID</label>
            <select
              value={filterSprint}
              onChange={(e) => setFilterSprint(e.target.value)}
              style={{ width: '100%', height: '32px', background: 'var(--color-background-primary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-text-primary)', padding: '0 8px', fontSize: '12px', outline: 'none' }}
            >
              <option value="all">All Sprints</option>
              {Array.from({ length: 24 }, (_, idx) => (
                <option key={idx + 1} value={idx + 1}>Sprint {idx + 1}</option>
              ))}
            </select>
          </div>

          {/* Discipline Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '4px' }}>Discipline</label>
            <select
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              style={{ width: '100%', height: '32px', background: 'var(--color-background-primary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-text-primary)', padding: '0 8px', fontSize: '12px', outline: 'none' }}
            >
              <option value="all">All Disciplines</option>
              {Object.keys(OWNER_COLORS).map((owner) => (
                <option key={owner} value={owner}>{owner}</option>
              ))}
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '4px' }}>Assignee</label>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              style={{ width: '100%', height: '32px', background: 'var(--color-background-primary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-text-primary)', padding: '0 8px', fontSize: '12px', outline: 'none' }}
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '4px' }}>Task Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: '100%', height: '32px', background: 'var(--color-background-primary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-text-primary)', padding: '0 8px', fontSize: '12px', outline: 'none' }}
            >
              <option value="all">All Statuses</option>
              <option value="done">Completed</option>
              <option value="todo">Pending</option>
            </select>
          </div>

          {/* Text Search Filter */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '4px' }}>Query Search</label>
            <div className="search-input-wrapper" style={{ height: '32px' }}>
              <i className="ti ti-search search-icon-left" style={{ fontSize: '12px', left: '10px', top: '10px' }} aria-hidden="true" />
              <input
                type="text"
                className="search-input"
                placeholder="Search description or task notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '28px', fontSize: '12px', height: '100%' }}
              />
              {searchQuery && (
                <button className="search-clear-btn" onClick={() => setSearchQuery('')} title="Clear search" style={{ right: '8px', top: '8px' }}>
                  <i className="ti ti-x" style={{ fontSize: '10px' }} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Count Stats bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '12px', color: 'var(--color-text-secondary)', borderBottom: '0.5px solid var(--color-border-tertiary)', paddingBottom: '8px' }}>
          <span>Showing <strong>{filteredTasks.length}</strong> of {allTasksFlat.length} tasks</span>
          <span className="print-hide">
            Filters: {filterSprint !== 'all' && `Sprint S${filterSprint} · `}{filterOwner !== 'all' && `${filterOwner} · `}{filterAssignee !== 'all' && `User · `}{filterStatus !== 'all' && `${filterStatus === 'done' ? 'Completed' : 'Pending'}`}
          </span>
        </div>

        {/* Task Table */}
        <div className="report-table-wrapper" style={{ overflowX: 'auto', width: '100%' }}>
          <table className="fin-table report-table" style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'var(--color-background-primary)' }}>
                <th style={{ padding: '8px 12px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>Location</th>
                <th style={{ padding: '8px 12px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>Task Deliverable Description</th>
                <th style={{ padding: '8px 12px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>Discipline</th>
                <th style={{ padding: '8px 12px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>Assignee</th>
                <th style={{ padding: '8px 12px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '8px 12px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>Notes Summary</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((t) => (
                <tr key={t.key} style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                    <span style={{ background: `${t.phaseColor}20`, color: t.phaseColor, border: `0.5px solid ${t.phaseColor}30`, padding: '2px 6px', borderRadius: '3px', fontSize: '10px', fontWeight: 600 }}>
                      S{t.sprintId}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--color-text-primary)' }}>{t.title}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ borderColor: `${OWNER_COLORS[t.owner]}40`, color: OWNER_COLORS[t.owner], border: '0.5px solid', padding: '2px 6px', borderRadius: '3px', fontSize: '10px' }}>
                      {t.owner}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{t.assigneeName}</td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                    {t.status === 'done' ? (
                      <span style={{ color: 'var(--tf-teal)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                        <i className="ti ti-circle-check-filled" /> Completed
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <i className="ti ti-circle" /> Pending
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--color-text-tertiary)', fontStyle: t.note ? 'normal' : 'italic', fontSize: '11px' }}>
                    {t.note || 'No notes added'}
                  </td>
                </tr>
              ))}

              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-text-tertiary)' }}>
                    No audit records match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
