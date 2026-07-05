'use client';

import { useState, useMemo, useCallback } from 'react';
import { useStore } from '@/lib/store';
import TaskAssign from '@/components/TaskAssign';
import TaskNotes, { TaskNoteIndicator } from '@/components/TaskNotes';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/lib/auth';
import { PHASES, ALL_SPRINTS, OWNER_COLORS, Sprint } from '@/lib/sprints-data';

export default function SprintsPage() {
  const { user, users } = useAuth();
  const [activePhase, setActivePhase] = useState(0);
  const [activeSprint, setActiveSprint] = useState(0);
  const { toggleTask, isTaskDone, getSprintProgress, setCurrentSprint, getTaskAssignee, progress } = useStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNotesKey, setActiveNotesKey] = useState<string | null>(null);

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

  const phase = PHASES[activePhase];
  const sprint = phase.sprints[activeSprint];
  const currentSprintTasks = getSprintTasks(sprint.i);
  const sprintProg = getSprintProgress(sprint.i, currentSprintTasks.length);

  const allMatches = useMemo(() => {
    if (!searchQuery) return [];
    return ALL_SPRINTS.flatMap((s) =>
      getSprintTasks(s.i).map((task) => ({
        sprintId: s.i,
        taskIdx: task.taskIdx,
        taskKey: task.taskKey,
        phaseColor: s.phase.color,
        t: task.t,
        o: task.o,
      }))
    ).filter((match) =>
      match.t.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.o.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, getSprintTasks]);

  return (
    <main className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="page-tag" style={{ background: 'rgba(29,158,117,0.12)', color: 'var(--tf-teal)', border: '0.5px solid rgba(29,158,117,0.2)' }}>
            Sprint Breakdown
          </div>
          <h1 className="page-title">12 Sprints · 120 Tasks · 3 Months</h1>
          <p className="page-subtitle">
            Full sprint-level task breakdown across 3 phases, each with tasks, owners, and definition of done.
          </p>
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

      <div className="kpi-row">
        {[
          { label: 'Total sprints', value: '12' },
          { label: 'Sprint length', value: '1 week' },
          { label: 'Total tasks', value: '120' },
          { label: 'Horizon', value: '12 weeks' },
        ].map((k) => (
          <div className="mcard" key={k.label}>
            <p className="mcard-label">{k.label}</p>
            <p className="mcard-value">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Phase tabs */}
      <div className="phase-tabs">
        {PHASES.map((p, i) => (
          <button
            key={p.id}
            className={`ptb${i === activePhase ? ' active' : ''}`}
            style={i === activePhase ? { borderColor: p.color, color: p.color, background: p.cl, fontWeight: 500 } : {}}
            onClick={() => { setActivePhase(i); setActiveSprint(0); }}
          >
            <span style={{ fontSize: '11px', color: i === activePhase ? p.color : 'var(--color-text-tertiary)', marginRight: 4 }}>
              Phase {p.id}
            </span>
            {p.name}
          </button>
        ))}
      </div>

      {/* Sprint list + detail */}
      <div className="sprint-layout">
        <div>
          {phase.sprints.map((s, i) => {
            const sp = getSprintProgress(s.i, s.tasks.length);
            const act = i === activeSprint;
            return (
              <div
                key={s.i}
                className={`sprint-card${act ? ' active' : ''}`}
                style={act ? { borderColor: phase.color, background: phase.cl } : {}}
                onClick={() => { setActiveSprint(i); setCurrentSprint(s.i, activePhase); }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: act ? phase.color : 'var(--color-text-tertiary)' }}>
                    Sprint {s.i} · {s.m}
                  </span>
                  <span style={{ fontSize: 10, color: sp.done === sp.total ? phase.color : 'var(--color-text-tertiary)' }}>
                    {sp.done}/{sp.total}
                  </span>
                </div>
                <div style={{ fontSize: 12, fontWeight: act ? 500 : 400, color: act ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  {s.n}
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 5 }}>
                  {s.t.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sprint-detail-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 2 }}>
                Sprint {sprint.i} · {sprint.w} · {sprint.m}
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {sprint.n}
              </div>
            </div>
            <span className="pill" style={{ borderColor: phase.color, color: phase.color, flexShrink: 0 }}>
              {sprintProg.done}/{sprintProg.total}
            </span>
          </div>

          <div style={{ height: 3, background: 'var(--color-background-primary)', borderRadius: 2, margin: '10px 0 14px' }}>
            <div style={{
              height: 3,
              background: phase.color,
              borderRadius: 2,
              width: `${sprintProg.pct}%`,
              transition: 'width 0.3s',
            }} />
          </div>

          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            Tasks
          </p>

          {searchQuery ? (
            <>
              <div className="search-results-header">
                <span className="search-results-title">Search Results for &ldquo;{searchQuery}&rdquo;</span>
                <span className="search-results-badge">{allMatches.length} matches</span>
              </div>
              {allMatches.map((match) => {
                const done = isTaskDone(match.sprintId, match.taskIdx);
                const taskKey = match.taskKey;
                const notesOpen = activeNotesKey === taskKey;
                const assigneeId = getTaskAssignee(taskKey);
                const assignee = assigneeId ? users.find((m) => m.id === assigneeId) : null;

                return (
                  <div
                    key={taskKey}
                    className={`task-row${done ? ' done' : ''}`}
                    style={{ flexWrap: 'wrap', cursor: 'default' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                      <div
                        className={`task-checkbox${done ? ' checked' : ''}`}
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
                          <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">
                            <path d="M1.5 4.5l2 2L7.5 2" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>

                      <span
                        className="task-text"
                        style={{ cursor: (user?.role === 'admin' || user?.role === 'pm' || assigneeId === user?.id) ? 'pointer' : 'default', flex: 1 }}
                        onClick={() => {
                          if (user?.role !== 'admin' && user?.role !== 'pm' && assigneeId !== user?.id) {
                            toast('Only the assignee, a PM, or an administrator can toggle task completion.', 'error');
                            return;
                          }
                          toggleTask(match.sprintId, match.taskIdx);
                          toast(!done ? 'Task completed!' : 'Task marked incomplete', 'success');
                        }}
                      >
                        <span className="search-task-sprint-badge" style={{ background: `${match.phaseColor}20`, color: match.phaseColor, border: `0.5px solid ${match.phaseColor}40` }}>
                          S{match.sprintId}
                        </span>
                        {match.t}
                      </span>

                      <span className="task-owner" style={{ borderColor: `${OWNER_COLORS[match.o] || '#888'}40`, color: OWNER_COLORS[match.o] || '#888' }}>
                        {match.o}
                      </span>

                      {assignee && (
                        <span className="dash-task-assignee" style={{ marginRight: 4 }}>
                          <span className={`dash-task-avatar ${assignee.avatarColor}`} style={{ width: 14, height: 14, fontSize: 6 }}>
                            {assignee.avatar}
                          </span>
                          {assignee.name.split(' ')[0]}
                        </span>
                      )}

                      <TaskNoteIndicator taskKey={taskKey} />

                      <TaskAssign taskKey={taskKey} />

                      <button
                        className={`task-notes-trigger-btn${notesOpen ? ' active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setActiveNotesKey(notesOpen ? null : taskKey); }}
                        title="Edit task notes"
                      >
                        <i className="ti ti-note" aria-hidden="true" />
                      </button>
                    </div>

                    <TaskNotes taskKey={taskKey} isOpen={notesOpen} onClose={() => setActiveNotesKey(null)} />
                  </div>
                );
              })}
              {allMatches.length === 0 && (
                <div className="dash-empty">
                  <i className="ti ti-search" style={{ fontSize: 24, color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
                  <p>No matching tasks found</p>
                </div>
              )}
            </>
          ) : (
            currentSprintTasks.map((task) => {
              const done = isTaskDone(sprint.i, task.taskIdx);
              const taskKey = task.taskKey;
              const notesOpen = activeNotesKey === taskKey;
              const assigneeId = getTaskAssignee(taskKey);
              const assignee = assigneeId ? users.find((m) => m.id === assigneeId) : null;

              return (
                <div
                  key={taskKey}
                  className={`task-row${done ? ' done' : ''}`}
                  style={{ flexWrap: 'wrap', cursor: 'default' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                    <div
                      className={`task-checkbox${done ? ' checked' : ''}`}
                      style={done ? { background: phase.color, borderColor: phase.color, cursor: (user?.role === 'admin' || user?.role === 'pm' || assigneeId === user?.id) ? 'pointer' : 'not-allowed' } : { cursor: (user?.role === 'admin' || user?.role === 'pm' || assigneeId === user?.id) ? 'pointer' : 'not-allowed' }}
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
                        <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">
                          <path d="M1.5 4.5l2 2L7.5 2" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    <span
                      className="task-text"
                      style={{ cursor: (user?.role === 'admin' || user?.role === 'pm' || assigneeId === user?.id) ? 'pointer' : 'default', flex: 1 }}
                      onClick={() => {
                        if (user?.role !== 'admin' && user?.role !== 'pm' && assigneeId !== user?.id) {
                          toast('Only the assignee, a PM, or an administrator can toggle task completion.', 'error');
                          return;
                        }
                        toggleTask(sprint.i, task.taskIdx);
                        toast(!done ? 'Task completed!' : 'Task marked incomplete', 'success');
                      }}
                    >
                      {task.t}
                    </span>

                    <span className="task-owner" style={{ borderColor: `${OWNER_COLORS[task.o] || '#888'}40`, color: OWNER_COLORS[task.o] || '#888' }}>
                      {task.o}
                    </span>

                    {assignee && (
                      <span className="dash-task-assignee" style={{ marginRight: 4 }}>
                        <span className={`dash-task-avatar ${assignee.avatarColor}`} style={{ width: 14, height: 14, fontSize: 6 }}>
                          {assignee.avatar}
                        </span>
                        {assignee.name.split(' ')[0]}
                      </span>
                    )}

                    <TaskNoteIndicator taskKey={taskKey} />

                    <TaskAssign taskKey={taskKey} />

                    <button
                      className={`task-notes-trigger-btn${notesOpen ? ' active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setActiveNotesKey(notesOpen ? null : taskKey); }}
                      title="Edit task notes"
                    >
                      <i className="ti ti-note" aria-hidden="true" />
                    </button>
                  </div>

                  <TaskNotes taskKey={taskKey} isOpen={notesOpen} onClose={() => setActiveNotesKey(null)} />
                </div>
              );
            })
          )}

          <div style={{ marginTop: 14, background: 'var(--color-background-tertiary)', borderRadius: 'var(--border-radius-md)', padding: '10px 12px' }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
              Definition of done
            </p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              {sprint.dod}
            </p>
          </div>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <i className="ti ti-git-branch" style={{ fontSize: 13, color: 'var(--color-text-tertiary)', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{sprint.dep}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
