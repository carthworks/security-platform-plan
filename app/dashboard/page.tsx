'use client';

import TaskAssign from '@/components/TaskAssign';
import TaskNotes, { TaskNoteIndicator } from '@/components/TaskNotes';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { useCallback, useState } from 'react';
import { PHASES, ALL_SPRINTS, OWNER_COLORS } from '@/lib/sprints-data';

export default function DashboardPage() {
  const { user, users } = useAuth();
  const canManageTasks = user?.role === 'admin' || user?.role === 'pm';
  const { 
    toggleTask, 
    isTaskDone, 
    getSprintProgress, 
    setCurrentSprint, 
    getTaskAssignee, 
    getOverallProgress, 
    progress,
    addCustomTask,
    editTask,
    deleteCustomTask
  } = useStore();
  const { toast } = useToast();
  
  const [selectedSprint, setSelectedSprint] = useState(progress.currentSprintId);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNotesKey, setActiveNotesKey] = useState<string | null>(null);

  // Quick filters states
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null);
  const [filterOwner, setFilterOwner] = useState<string | null>(null);

  // Dynamic tasks addition/editing states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskOwner, setNewTaskOwner] = useState('BE');
  const [editingTaskKey, setEditingTaskKey] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskOwner, setEditTaskOwner] = useState('');

  // Task list resolver combining static and custom tasks with overrides
  const getSprintTasks = useCallback((sprintId: number) => {
    const sprintObj = ALL_SPRINTS.find((s) => s.i === sprintId);
    if (!sprintObj) return [];
    const staticTasks = sprintObj.tasks;
    const customTasks = progress.customTasks?.[sprintId] || [];
    
    return [...staticTasks, ...customTasks].map((task, idx) => {
      const taskKey = `sprint-${sprintId}-task-${idx}`;
      const edited = progress.editedTasks?.[taskKey];
      return {
        t: edited?.t ?? task.t,
        o: edited?.o ?? task.o,
        isCustom: idx >= staticTasks.length,
        customIdx: idx >= staticTasks.length ? idx - staticTasks.length : -1,
        taskIdx: idx,
        taskKey,
      };
    });
  }, [progress.customTasks, progress.editedTasks]);

  const currentSprintTasks = getSprintTasks(selectedSprint);
  const overall = getOverallProgress();
  const sprint = ALL_SPRINTS.find((s) => s.i === selectedSprint) || ALL_SPRINTS[0];
  const sp = getSprintProgress(sprint.i, currentSprintTasks.length);

  // Calculate stats per phase (including custom tasks)
  const phaseStats = PHASES.map((p) => {
    let total = 0;
    let done = 0;
    p.sprints.forEach((s) => {
      const tasks = getSprintTasks(s.i);
      tasks.forEach((task) => {
        total++;
        if (isTaskDone(s.i, task.taskIdx)) done++;
      });
    });
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return {
      id: p.id,
      name: p.name,
      color: p.color,
      period: p.period,
      total,
      done,
      pct,
    };
  });

  // Team workload: count assigned tasks per team member
  const workload = users.reduce<Record<string, number>>((acc, m) => {
    acc[m.id] = progress.assignments.filter((a) => {
      if (a.assigneeId !== m.id) return false;
      const match = a.taskKey.match(/sprint-(\d+)-task-(\d+)/);
      if (!match) return false;
      const sprintId = parseInt(match[1], 10);
      const taskIdx = parseInt(match[2], 10);
      const tasks = getSprintTasks(sprintId);
      return taskIdx < tasks.length;
    }).length;
    return acc;
  }, {});

  // Filter tasks for current sprint
  const filteredTasks = currentSprintTasks.filter((task) => {
    const done = isTaskDone(sprint.i, task.taskIdx);
    if (filter === 'todo' && done) return false;
    if (filter === 'done' && !done) return false;
    
    if (filterAssignee) {
      const assigneeId = getTaskAssignee(task.taskKey);
      if (assigneeId !== filterAssignee) return false;
    }
    if (filterOwner) {
      if (task.o.toLowerCase() !== filterOwner.toLowerCase()) return false;
    }
    return true;
  });

  // Global search matching (searching all combined tasks)
  const allMatches = ALL_SPRINTS.flatMap((s) =>
    getSprintTasks(s.i).map((t) => ({
      ...t,
      sprintId: s.i,
      sprintName: s.n,
      phaseColor: s.phase.color,
    }))
  ).filter(t =>
    t.t.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.o.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply filters to search results
  const filteredMatches = allMatches.filter((match) => {
    if (filterAssignee) {
      const assigneeId = getTaskAssignee(match.taskKey);
      if (assigneeId !== filterAssignee) return false;
    }
    if (filterOwner) {
      if (match.o.toLowerCase() !== filterOwner.toLowerCase()) return false;
    }
    return true;
  });

  // Owner distribution for current sprint
  const ownerCounts: Record<string, { total: number; done: number }> = {};
  currentSprintTasks.forEach((task) => {
    if (!ownerCounts[task.o]) ownerCounts[task.o] = { total: 0, done: 0 };
    ownerCounts[task.o].total++;
    if (isTaskDone(sprint.i, task.taskIdx)) ownerCounts[task.o].done++;
  });

  return (
    <main className="dash">
      {/* ── Sidebar ──────────────────────────────────── */}
      <aside className={`dash-sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
        <div className="dash-sidebar-header">
          <span className="dash-sidebar-title">
            {!sidebarCollapsed && 'Sprints'}
          </span>
          <button className="dash-collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title={sidebarCollapsed ? 'Expand' : 'Collapse'}>
            <i className={`ti ti-layout-sidebar-left-${sidebarCollapsed ? 'expand' : 'collapse'}`} aria-hidden="true" />
          </button>
        </div>

        <div className="dash-sidebar-body">
          {PHASES.map((phase) => (
            <div key={phase.id} className="dash-phase-group">
              {!sidebarCollapsed && (
                <div className="dash-phase-label" style={{ color: phase.color }}>
                  <i className={`ti ${phase.icon}`} style={{ fontSize: 12 }} aria-hidden="true" />
                  <span>Phase {phase.id} · {phase.period}</span>
                </div>
              )}
              {phase.sprints.map((s) => {
                const p = getSprintProgress(s.i, s.tasks.length);
                const active = s.i === selectedSprint;
                return (
                  <button
                    key={s.i}
                    className={`dash-sprint-btn${active ? ' active' : ''}`}
                    style={active ? { borderColor: phase.color, background: `${phase.color}10` } : {}}
                    onClick={() => { setSelectedSprint(s.i); setCurrentSprint(s.i, phase.id - 1); }}
                    title={sidebarCollapsed ? `Sprint ${s.i}: ${s.n}` : undefined}
                  >
                    <div className="dash-sprint-num" style={active ? { color: phase.color } : {}}>
                      {sidebarCollapsed ? s.i : `S${s.i}`}
                    </div>
                    {!sidebarCollapsed && (
                      <>
                        <div className="dash-sprint-info">
                          <div className="dash-sprint-name">{s.n}</div>
                          <div className="dash-sprint-meta">{s.w} · {p.done}/{p.total}</div>
                        </div>
                        <div className="dash-sprint-ring">
                          <svg width="20" height="20" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="8" fill="none" stroke="var(--color-border-tertiary)" strokeWidth="2" />
                            <circle
                              cx="10" cy="10" r="8" fill="none"
                              stroke={p.pct === 100 ? phase.color : 'var(--color-text-tertiary)'}
                              strokeWidth="2"
                              strokeDasharray={`${p.pct * 0.5} 50`}
                              strokeLinecap="round"
                              transform="rotate(-90 10 10)"
                            />
                          </svg>
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────── */}
      <div className="dash-main">
        {/* Stats row */}
        <div className="dash-stats">
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: 'rgba(29,158,117,0.12)', color: '#1D9E75' }}>
              <i className="ti ti-chart-pie" aria-hidden="true" />
            </div>
            <div>
              <div className="dash-stat-value">{overall.pct}%</div>
              <div className="dash-stat-label">Overall progress</div>
            </div>
            <div className="dash-stat-bar">
              <div className="dash-stat-bar-fill" style={{ width: `${overall.pct}%`, background: '#1D9E75' }} />
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: 'rgba(127,119,221,0.12)', color: '#9B93F0' }}>
              <i className="ti ti-checkbox" aria-hidden="true" />
            </div>
            <div>
              <div className="dash-stat-value">{overall.totalDone}<span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 400 }}>/{overall.totalTasks}</span></div>
              <div className="dash-stat-label">Tasks completed</div>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: `${sprint.phase.color}18`, color: sprint.phase.color }}>
              <i className="ti ti-flame" aria-hidden="true" />
            </div>
            <div>
              <div className="dash-stat-value">Sprint {sprint.i}</div>
              <div className="dash-stat-label">{sprint.n}</div>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: 'rgba(186,117,23,0.12)', color: '#BA7517' }}>
              <i className="ti ti-users" aria-hidden="true" />
            </div>
            <div>
              <div className="dash-stat-value">{progress.assignments.length}</div>
              <div className="dash-stat-label">Assigned tasks</div>
            </div>
          </div>
        </div>

        {/* ── Project Status Chart ─────────────────────── */}
        <div style={{
          background: 'var(--color-background-secondary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '18px 20px',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                Project Status
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: '2px 0 0' }}>
                Phase Completion Overview
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Overall</span>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: overall.pct === 100 ? '#1D9E75' : 'var(--color-text-primary)',
                background: overall.pct === 100 ? 'rgba(29,158,117,0.1)' : 'var(--color-background-tertiary)',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 20, padding: '2px 10px',
              }}>
                {overall.pct}%
              </span>
            </div>
          </div>

          {/* Donut rings row */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Donuts */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {phaseStats.map((ph) => {
                const r = 32;
                const circ = 2 * Math.PI * r;
                const dash = (ph.pct / 100) * circ;
                return (
                  <div key={ph.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ position: 'relative', width: 84, height: 84 }}>
                      <svg width="84" height="84" viewBox="0 0 84 84" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="42" cy="42" r={r} fill="none" stroke="var(--color-background-tertiary)" strokeWidth="8" />
                        <circle
                          cx="42" cy="42" r={r} fill="none"
                          stroke={ph.color}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${dash} ${circ - dash}`}
                          style={{ transition: 'stroke-dasharray 0.6s ease' }}
                        />
                      </svg>
                      {/* Center label */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: ph.color, lineHeight: 1 }}>{ph.pct}%</span>
                        <span style={{ fontSize: 9, color: 'var(--color-text-tertiary)', lineHeight: 1.2 }}>{ph.done}/{ph.total}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: ph.color }}>Phase {ph.id}</div>
                      <div style={{ fontSize: 9, color: 'var(--color-text-tertiary)', maxWidth: 80, lineHeight: 1.3 }}>{ph.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vertical separator */}
            <div style={{ width: 1, background: 'var(--color-border-tertiary)', alignSelf: 'stretch', margin: '0 4px', flexShrink: 0 }} />

            {/* Horizontal bar lanes */}
            <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
              {phaseStats.map((ph) => (
                <div key={ph.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: ph.color, display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                        Ph {ph.id} · {ph.period}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: ph.color, fontWeight: 600 }}>{ph.done}/{ph.total}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--color-background-tertiary)', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${ph.pct}%`,
                      background: `linear-gradient(90deg, ${ph.color}cc, ${ph.color})`,
                      borderRadius: 6,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              ))}
              {/* Mini legend */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 16, height: 3, background: 'var(--color-background-tertiary)', borderRadius: 3, display: 'inline-block' }} />
                  Remaining
                </span>
                <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 16, height: 3, background: 'var(--tf-teal)', borderRadius: 3, display: 'inline-block' }} />
                  Completed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sprint detail header */}
        <div className="dash-section-header">
          <div>
            <h2 className="dash-section-title">
              <span className="dash-sprint-badge" style={{ background: `${sprint.phase.color}18`, color: sprint.phase.color }}>
                Sprint {sprint.i}
              </span>
              {sprint.n}
            </h2>
            <div className="dash-section-meta">
              {sprint.w} · {sprint.m} · {sprint.t.map((tag) => (
                <span key={tag} className="tag" style={{ marginLeft: 4 }}>{tag}</span>
              ))}
            </div>
          </div>
          <div className="dash-sprint-progress">
            <span className="dash-sprint-pct" style={{ color: sprint.phase.color }}>{sp.pct}%</span>
            <div className="dash-sprint-bar">
              <div className="dash-sprint-bar-fill" style={{ width: `${sp.pct}%`, background: sprint.phase.color }} />
            </div>
            <span className="dash-sprint-count">{sp.done}/{sp.total}</span>
          </div>
        </div>

        {/* Filters & Search row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
          <div className="dash-filters" style={{ marginBottom: 0 }}>
            {(['all', 'todo', 'done'] as const).map((f) => (
              <button
                key={f}
                className={`dash-filter-btn${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? `All (${currentSprintTasks.length})` : f === 'todo' ? `To do (${currentSprintTasks.length - sp.done})` : `Done (${sp.done})`}
              </button>
            ))}
          </div>

          <div className="search-container">
            <div className="search-input-wrapper">
              <i className="ti ti-search search-icon-left" aria-hidden="true" />
              <input
                type="text"
                className="search-input"
                placeholder="Search all 120 tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="search-clear-btn" onClick={() => setSearchQuery('')} title="Clear search">
                  <i className="ti ti-x" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters row */}
        {(filterAssignee || filterOwner) && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', animation: 'fade-in 0.2s' }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 500, textTransform: 'uppercase' }}>
              Active Filters:
            </span>
            {filterAssignee && (
              <span className="search-results-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '3px 10px', background: 'rgba(29, 158, 117, 0.08)', color: 'var(--tf-teal)', borderColor: 'rgba(29, 158, 117, 0.2)' }}>
                Assignee: {users.find(u => u.id === filterAssignee)?.name || filterAssignee}
                <button 
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'inline-flex', padding: 0 }}
                  onClick={() => setFilterAssignee(null)}
                >
                  <i className="ti ti-x" style={{ fontSize: 11 }} />
                </button>
              </span>
            )}
            {filterOwner && (
              <span className="search-results-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '3px 10px' }}>
                Stack: {filterOwner}
                <button 
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'inline-flex', padding: 0 }}
                  onClick={() => setFilterOwner(null)}
                >
                  <i className="ti ti-x" style={{ fontSize: 11 }} />
                </button>
              </span>
            )}
            <button 
              className="task-notes-btn task-notes-btn-cancel" 
              style={{ fontSize: 10, padding: '2px 8px' }}
              onClick={() => {
                setFilterAssignee(null);
                setFilterOwner(null);
              }}
            >
              Clear All
            </button>
          </div>
        )}

        {/* Task list */}
        <div className="dash-task-list">
          {searchQuery ? (
            <>
              <div className="search-results-header">
                <span className="search-results-title">Search Results for &ldquo;{searchQuery}&rdquo;</span>
                <span className="search-results-badge">{filteredMatches.length} matches</span>
              </div>
              {filteredMatches.map((match) => {
                const done = isTaskDone(match.sprintId, match.taskIdx);
                const notesOpen = activeNotesKey === match.taskKey;
                const assigneeId = getTaskAssignee(match.taskKey);
                const assignee = assigneeId ? users.find((m) => m.id === assigneeId) : null;
                const isEditing = editingTaskKey === match.taskKey;

                return (
                  <div key={match.taskKey} className={`dash-task${done ? ' done' : ''}`} style={{ flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: '100%' }}>
                      {!isEditing && (
                        <button
                          className={`dash-task-check${done ? ' checked' : ''}`}
                          style={done ? { background: match.phaseColor, borderColor: match.phaseColor, cursor: (user?.role === 'admin' || user?.role === 'pm' || assigneeId === user?.id) ? 'pointer' : 'not-allowed' } : { cursor: (user?.role === 'admin' || user?.role === 'pm' || assigneeId === user?.id) ? 'pointer' : 'not-allowed' }}
                          onClick={() => {
                            if (user?.role !== 'admin' && user?.role !== 'pm' && assigneeId !== user?.id) {
                              toast('Only the assignee, a PM, or an administrator can toggle task completion.', 'error');
                              return;
                            }
                            toggleTask(match.sprintId, match.taskIdx);
                            toast(!done ? 'Task completed!' : 'Task marked incomplete', 'success');
                          }}
                        >
                          {done && (
                            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          )}
                        </button>
                      )}

                      {isEditing ? (
                        <div style={{ display: 'flex', gap: 8, flex: 1, alignItems: 'center' }}>
                          <input
                            type="text"
                            className="search-input"
                            style={{ flex: 1, paddingLeft: 10 }}
                            value={editTaskTitle}
                            onChange={(e) => setEditTaskTitle(e.target.value)}
                            autoFocus
                          />
                          <select
                            className="search-input"
                            style={{ width: 100, paddingLeft: 6, paddingRight: 6 }}
                            value={editTaskOwner}
                            onChange={(e) => setEditTaskOwner(e.target.value)}
                          >
                            {Object.keys(OWNER_COLORS).map((o) => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                          <button
                            className="task-notes-btn task-notes-btn-save"
                            onClick={() => {
                              if (!editTaskTitle.trim()) {
                                toast('Task title cannot be empty', 'error');
                                return;
                              }
                              editTask(match.taskKey, editTaskTitle, editTaskOwner);
                              setEditingTaskKey(null);
                              toast('Task updated successfully!', 'success');
                            }}
                          >
                            <i className="ti ti-check" />
                          </button>
                          <button
                            className="task-notes-btn task-notes-btn-cancel"
                            onClick={() => setEditingTaskKey(null)}
                          >
                            <i className="ti ti-x" />
                          </button>
                        </div>
                      ) : (
                        <div className="dash-task-body" style={{ flex: 1 }}>
                          <div className="dash-task-text">
                            <span className="search-task-sprint-badge" style={{ background: `${match.phaseColor}20`, color: match.phaseColor, border: `0.5px solid ${match.phaseColor}40` }}>
                              S{match.sprintId}
                            </span>
                            {match.t}
                          </div>
                          <div className="dash-task-tags">
                            <span 
                              className="dash-task-owner" 
                              style={{ borderColor: `${OWNER_COLORS[match.o] || '#888'}40`, color: OWNER_COLORS[match.o] || '#888', cursor: 'pointer' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setFilterOwner(match.o);
                              }}
                              title={`Click to filter by ${match.o}`}
                            >
                              {match.o}
                            </span>
                            {assignee && (
                              <span 
                                className="dash-task-assignee"
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFilterAssignee(assignee.id);
                                }}
                                title={`Click to filter by ${assignee.name}`}
                              >
                                <span className={`dash-task-avatar ${assignee.avatarColor}`}>{assignee.avatar}</span>
                                {assignee.name.split(' ')[0]}
                              </span>
                            )}
                            <TaskNoteIndicator taskKey={match.taskKey} />
                          </div>
                        </div>
                      )}

                      {!isEditing && (
                        <>
                          <TaskAssign taskKey={match.taskKey} />
                          
                          {/* Inline Edit Task Trigger */}
                          {canManageTasks && (
                            <button
                              className="task-notes-trigger-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTaskKey(match.taskKey);
                                setEditTaskTitle(match.t);
                                setEditTaskOwner(match.o);
                              }}
                              title="Edit task"
                            >
                              <i className="ti ti-pencil" aria-hidden="true" />
                            </button>
                          )}

                          {/* Inline Delete Custom Task */}
                          {canManageTasks && match.isCustom && (
                            <button
                              className="task-notes-trigger-btn"
                              style={{ color: 'var(--tf-red)', background: 'transparent' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this custom task?')) {
                                  deleteCustomTask(match.sprintId, match.customIdx);
                                  toast('Custom task deleted', 'info');
                                }
                              }}
                              title="Delete task"
                            >
                              <i className="ti ti-trash" aria-hidden="true" />
                            </button>
                          )}

                          <button
                            className={`task-notes-trigger-btn${notesOpen ? ' active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setActiveNotesKey(notesOpen ? null : match.taskKey); }}
                            title="Edit task notes"
                          >
                            <i className="ti ti-note" aria-hidden="true" />
                          </button>
                        </>
                      )}
                    </div>
                    {!isEditing && <TaskNotes taskKey={match.taskKey} isOpen={notesOpen} onClose={() => setActiveNotesKey(null)} />}
                  </div>
                );
              })}
              {filteredMatches.length === 0 && (
                <div className="dash-empty">
                  <i className="ti ti-search" style={{ fontSize: 24, color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
                  <p>No matching tasks found</p>
                </div>
              )}
            </>
          ) : (
            <>
              {filteredTasks.map((task) => {
                const done = isTaskDone(sprint.i, task.taskIdx);
                const taskKey = task.taskKey;
                const assigneeId = getTaskAssignee(taskKey);
                const assignee = assigneeId ? users.find((m) => m.id === assigneeId) : null;
                const notesOpen = activeNotesKey === taskKey;
                const isEditing = editingTaskKey === taskKey;

                return (
                  <div key={taskKey} className={`dash-task${done ? ' done' : ''}`} style={{ flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: '100%' }}>
                      {!isEditing && (
                        <button
                          className={`dash-task-check${done ? ' checked' : ''}`}
                          style={done ? { background: sprint.phase.color, borderColor: sprint.phase.color, cursor: (user?.role === 'admin' || user?.role === 'pm' || assigneeId === user?.id) ? 'pointer' : 'not-allowed' } : { cursor: (user?.role === 'admin' || user?.role === 'pm' || assigneeId === user?.id) ? 'pointer' : 'not-allowed' }}
                          onClick={() => {
                            if (user?.role !== 'admin' && user?.role !== 'pm' && assigneeId !== user?.id) {
                              toast('Only the assignee, a PM, or an administrator can toggle task completion.', 'error');
                              return;
                            }
                            toggleTask(sprint.i, task.taskIdx);
                            toast(!done ? 'Task completed!' : 'Task marked incomplete', 'success');
                          }}
                        >
                          {done && (
                            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          )}
                        </button>
                      )}

                      {isEditing ? (
                        <div style={{ display: 'flex', gap: 8, flex: 1, alignItems: 'center' }}>
                          <input
                            type="text"
                            className="search-input"
                            style={{ flex: 1, paddingLeft: 10 }}
                            value={editTaskTitle}
                            onChange={(e) => setEditTaskTitle(e.target.value)}
                            autoFocus
                          />
                          <select
                            className="search-input"
                            style={{ width: 100, paddingLeft: 6, paddingRight: 6 }}
                            value={editTaskOwner}
                            onChange={(e) => setEditTaskOwner(e.target.value)}
                          >
                            {Object.keys(OWNER_COLORS).map((o) => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                          <button
                            className="task-notes-btn task-notes-btn-save"
                            onClick={() => {
                              if (!editTaskTitle.trim()) {
                                toast('Task title cannot be empty', 'error');
                                return;
                              }
                              editTask(taskKey, editTaskTitle, editTaskOwner);
                              setEditingTaskKey(null);
                              toast('Task updated successfully!', 'success');
                            }}
                          >
                            <i className="ti ti-check" />
                          </button>
                          <button
                            className="task-notes-btn task-notes-btn-cancel"
                            onClick={() => setEditingTaskKey(null)}
                          >
                            <i className="ti ti-x" />
                          </button>
                        </div>
                      ) : (
                        <div className="dash-task-body" style={{ flex: 1 }}>
                          <div className="dash-task-text">{task.t}</div>
                          <div className="dash-task-tags">
                            <span 
                              className="dash-task-owner" 
                              style={{ borderColor: `${OWNER_COLORS[task.o] || '#888'}40`, color: OWNER_COLORS[task.o] || '#888', cursor: 'pointer' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setFilterOwner(task.o);
                              }}
                              title={`Click to filter by ${task.o}`}
                            >
                              {task.o}
                            </span>
                            {assignee && (
                              <span 
                                className="dash-task-assignee"
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFilterAssignee(assignee.id);
                                }}
                                title={`Click to filter by ${assignee.name}`}
                              >
                                <span className={`dash-task-avatar ${assignee.avatarColor}`}>{assignee.avatar}</span>
                                {assignee.name.split(' ')[0]}
                              </span>
                            )}
                            <TaskNoteIndicator taskKey={taskKey} />
                          </div>
                        </div>
                      )}

                      {!isEditing && (
                        <>
                          <TaskAssign taskKey={taskKey} />
                          
                          {/* Inline Edit Task Trigger */}
                          {canManageTasks && (
                            <button
                              className="task-notes-trigger-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTaskKey(taskKey);
                                setEditTaskTitle(task.t);
                                setEditTaskOwner(task.o);
                              }}
                              title="Edit task"
                            >
                              <i className="ti ti-pencil" aria-hidden="true" />
                            </button>
                          )}

                          {/* Inline Delete Custom Task */}
                          {canManageTasks && task.isCustom && (
                            <button
                              className="task-notes-trigger-btn"
                              style={{ color: 'var(--tf-red)', background: 'transparent' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this custom task?')) {
                                  deleteCustomTask(sprint.i, task.customIdx);
                                  toast('Custom task deleted', 'info');
                                }
                              }}
                              title="Delete task"
                            >
                              <i className="ti ti-trash" aria-hidden="true" />
                            </button>
                          )}

                          <button
                            className={`task-notes-trigger-btn${notesOpen ? ' active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setActiveNotesKey(notesOpen ? null : taskKey); }}
                            title="Edit task notes"
                          >
                            <i className="ti ti-note" aria-hidden="true" />
                          </button>
                        </>
                      )}
                    </div>
                    {!isEditing && <TaskNotes taskKey={taskKey} isOpen={notesOpen} onClose={() => setActiveNotesKey(null)} />}
                  </div>
                );
              })}
              {filteredTasks.length === 0 && (
                <div className="dash-empty">
                  <i className="ti ti-checks" style={{ fontSize: 24, color: sprint.phase.color }} aria-hidden="true" />
                  <p>{filter === 'done' ? 'No completed tasks yet' : 'All tasks completed!'}</p>
                </div>
              )}
            </>
          )}

          {/* Add Custom Task Form/Button */}
          {canManageTasks && (
            <div style={{ marginTop: 14, paddingTop: 10, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
              {showAddForm ? (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', padding: 10 }}>
                  <input
                    type="text"
                    className="search-input"
                    style={{ flex: 1, paddingLeft: 10 }}
                    placeholder="Enter new task description..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    autoFocus
                  />
                  <select
                    className="search-input"
                    style={{ width: 120, paddingLeft: 6, paddingRight: 6 }}
                    value={newTaskOwner}
                    onChange={(e) => setNewTaskOwner(e.target.value)}
                  >
                    {Object.keys(OWNER_COLORS).map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <button
                    className="task-notes-btn task-notes-btn-save"
                    onClick={() => {
                      if (!newTaskTitle.trim()) {
                        toast('Please enter a task description', 'error');
                        return;
                      }
                      addCustomTask(sprint.i, newTaskTitle, newTaskOwner);
                      setNewTaskTitle('');
                      setShowAddForm(false);
                      toast('Custom task added!', 'success');
                    }}
                  >
                    Add Task
                  </button>
                  <button
                    className="task-notes-btn task-notes-btn-cancel"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewTaskTitle('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="task-notes-btn task-notes-btn-cancel"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '6px 12px' }}
                  onClick={() => setShowAddForm(true)}
                >
                  <i className="ti ti-plus" /> Add Custom Task
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom panels: Owner breakdown + Team workload */}
        <div className="dash-panels">
          <div className="dash-panel" style={{ gridColumn: 'span 2' }}>
            <h3 className="dash-panel-title"><i className="ti ti-chart-pie" aria-hidden="true" /> Project Status Overview</h3>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.5rem' }}>
              {/* Radial/Donut Chart */}
              <div style={{ position: 'relative', width: 110, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, margin: '0 auto' }}>
                <svg width="110" height="110" viewBox="0 0 110 110">
                  <circle cx="55" cy="55" r="45" fill="none" stroke="var(--color-background-primary)" strokeWidth="10" />
                  <circle
                    cx="55" cy="55" r="45" fill="none"
                    stroke="var(--tf-teal)"
                    strokeWidth="10"
                    strokeDasharray={`${overall.pct * 2.82} 282`}
                    strokeLinecap="round"
                    transform="rotate(-90 55 55)"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{overall.pct}%</div>
                  <div style={{ fontSize: '9px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Complete</div>
                </div>
              </div>

              {/* Phase stats list */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', width: '100%' }}>
                {phaseStats.map((p) => (
                  <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                        Phase {p.id}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: p.color }}>
                        {p.pct}%
                      </span>
                    </div>
                    <div style={{ height: 5, background: 'var(--color-background-primary)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p.pct}%`, background: p.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
                        {p.done} / {p.total} tasks
                      </span>
                      <span style={{ fontSize: '9px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>
                        {p.period}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dash-panel">
            <h3 className="dash-panel-title"><i className="ti ti-chart-bar" aria-hidden="true" /> Owner Breakdown</h3>
            {Object.entries(ownerCounts).map(([owner, { total, done }]) => (
              <div 
                key={owner} 
                className="dash-owner-row" 
                style={{ cursor: 'pointer' }}
                onClick={() => setFilterOwner(owner)}
                title={`Click to filter by ${owner}`}
              >
                <span className="dash-owner-name" style={{ color: OWNER_COLORS[owner] || '#888' }}>{owner}</span>
                <div className="dash-owner-bar-track">
                  <div className="dash-owner-bar-fill" style={{ width: `${(done / total) * 100}%`, background: OWNER_COLORS[owner] || '#888' }} />
                </div>
                <span className="dash-owner-count">{done}/{total}</span>
              </div>
            ))}
          </div>

          <div className="dash-panel">
            <h3 className="dash-panel-title"><i className="ti ti-users" aria-hidden="true" /> Team Workload</h3>
            {users.map((m) => (
              <div 
                key={m.id} 
                className="dash-team-row"
                style={{ cursor: 'pointer' }}
                onClick={() => setFilterAssignee(m.id)}
                title={`Click to filter tasks assigned to ${m.name}`}
              >
                <span className={`dash-team-avatar ${m.avatarColor}`}>{m.avatar}</span>
                <span className="dash-team-name">{m.name}</span>
                <span className="dash-team-role">{m.role}</span>
                <span className="dash-team-count">{workload[m.id] || 0} tasks</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
