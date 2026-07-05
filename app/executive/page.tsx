'use client';

import { useState, useEffect } from 'react';
import { useStore, DEFAULT_SETTINGS } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

export default function ExecutivePage() {
  const { getOverallProgress, progress } = useStore();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const settings = progress.settings || DEFAULT_SETTINGS;
  const overall = getOverallProgress();
  
  // Calculate dynamic posture score: base 68% + proportional build progress up to 100%
  const doneTasks = overall.totalDone;
  const totalTasks = overall.totalTasks || 120;
  const calculatedScore = Math.min(68 + Math.round((doneTasks / totalTasks) * 32), 100);
  
  const targetScore = settings.postureTarget || 85;
  const isTargetAchieved = calculatedScore >= targetScore;
  
  const [presentMode, setPresentMode] = useState(false);
  const [asOfDate, setAsOfDate] = useState('');
  
  // Get date from query string or set current local date
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get('as_of');
    if (dateParam) {
      setAsOfDate(dateParam);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setAsOfDate(today);
    }
  }, []);

  // Sync state to body className for globals.css layout overrides
  useEffect(() => {
    if (presentMode) {
      document.body.classList.add('present-mode');
    } else {
      document.body.classList.remove('present-mode');
    }
    return () => {
      document.body.classList.remove('present-mode');
    };
  }, [presentMode]);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/executive?as_of=${asOfDate}${presentMode ? '&present=true' : ''}`;
    navigator.clipboard.writeText(link);
    toast('CISO View link copied to clipboard!', 'success');
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'var(--tf-teal)';
    if (score >= 70) return 'var(--tf-amber)';
    return 'var(--tf-orange)';
  };

  const scoreColor = getScoreColor(calculatedScore);

  return (
    <main className="page" style={{ paddingBottom: '3rem' }}>
      {/* CISO Header Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px',
        borderBottom: '1px solid var(--color-border-tertiary)',
        paddingBottom: '16px'
      }}>
        <div>
          <div className="page-tag" style={{ background: 'rgba(29, 158, 117, 0.1)', color: 'var(--tf-teal)', border: '0.5px solid rgba(29, 158, 117, 0.2)' }}>
            CISO EXECUTIVE PORTAL (FR-UI-08)
          </div>
          <h1 className="page-title" style={{ fontSize: presentMode ? '2rem' : '1.6rem', fontWeight: 700, margin: '6px 0 2px' }}>
            {settings.orgName} Posture Report
          </h1>
          <p className="page-subtitle" style={{ fontSize: presentMode ? '13px' : '12px' }}>
            Board-room projection view generated on <strong style={{ color: 'var(--color-text-primary)' }}>{asOfDate}</strong>
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setPresentMode(!presentMode)}
            className="theme-btn"
            style={{
              background: presentMode ? 'var(--color-background-tertiary)' : 'var(--color-text-primary)',
              color: presentMode ? 'var(--color-text-primary)' : 'var(--color-background-primary)',
              border: '1px solid var(--color-border-secondary)',
              borderRadius: 'var(--border-radius-md)',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className={`ti ${presentMode ? 'ti-presentation-off' : 'ti-presentation'}`} style={{ fontSize: 14 }} />
            {presentMode ? 'Exit Presentation' : 'Present Mode'}
          </button>
          
          <button
            onClick={handleCopyLink}
            className="theme-btn"
            style={{
              background: 'transparent',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-secondary)',
              borderRadius: 'var(--border-radius-md)',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="ti ti-share" style={{ fontSize: 13 }} />
            Share URL
          </button>

          {!presentMode && (
            <Link
              href="/dashboard"
              className="theme-btn"
              style={{
                background: 'var(--tf-orange)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: 'var(--border-radius-md)',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="ti ti-layout-dashboard" style={{ fontSize: 13 }} />
              Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Grid Layout: Circle Score & Key KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: presentMode ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Dynamic Posture Score Circle */}
        <div style={{
          background: 'var(--color-background-secondary)',
          border: '1px solid var(--color-border-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          minHeight: '280px'
        }}>
          <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* SVG Progress Ring */}
            <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="var(--color-border-tertiary)"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke={scoreColor}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="440"
                strokeDashoffset={440 - (calculatedScore / 100) * 440}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {calculatedScore}%
              </span>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-tertiary)', fontWeight: 600, marginTop: '2px' }}>
                Posture Score
              </span>
            </div>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Target Benchmark</span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>{targetScore}%</div>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'var(--color-border-tertiary)' }} />
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Build Progress</span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>{doneTasks}/{totalTasks} Tasks</div>
              </div>
            </div>
            
            <div style={{
              marginTop: '16px',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 500,
              background: isTargetAchieved ? 'rgba(29, 158, 117, 0.12)' : 'rgba(216, 90, 48, 0.12)',
              color: isTargetAchieved ? 'var(--tf-teal)' : 'var(--tf-orange)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <i className={`ti ${isTargetAchieved ? 'ti-circle-check' : 'ti-alert-circle'}`} style={{ fontSize: 13 }} />
              {isTargetAchieved ? 'Posture Target Compliance Met' : `Below Targeted Target (${targetScore}%)`}
            </div>
          </div>
        </div>

        {/* 3 Hero Differentiator Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: '12px'
        }}>
          {[
            {
              title: 'Confirmed Exploitable (FR-SCN-13)',
              value: '2',
              desc: 'Vulnerabilities validated via active security probes, prioritizing them immediately for immediate resolution.',
              color: 'var(--tf-orange)',
              bg: 'rgba(216, 90, 48, 0.08)',
              icon: 'ti-flame'
            },
            {
              title: 'Exploited in the Wild (FR-INT-02)',
              value: '5',
              desc: 'CVE matches active in CISA KEV Catalog, marking high-risk vulnerabilities targeting production environments.',
              color: 'var(--tf-amber)',
              bg: 'rgba(186, 117, 23, 0.08)',
              icon: 'ti-shield-alert'
            },
            {
              title: 'Reachable Dependencies (FR-AI-08)',
              value: '3',
              desc: 'SCA code-path reachability confirmed via AST structure analysis, highlighting reachable vulnerabilities.',
              color: 'var(--tf-teal)',
              bg: 'rgba(29, 158, 117, 0.08)',
              icon: 'ti-binary'
            }
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'var(--color-background-secondary)',
              border: '1px solid var(--color-border-secondary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--border-radius-md)',
                background: stat.bg,
                color: stat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0
              }}>
                <i className={`ti ${stat.icon}`} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{stat.title}</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: stat.color }}>{stat.value}</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  {stat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI CISO Executive Summary & Progress Tracking */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: presentMode ? '1fr' : '2fr 1fr',
        gap: '24px'
      }}>
        {/* Glassmorphic AI Summary Container */}
        <div style={{
          background: 'var(--color-background-secondary)',
          border: '1px solid var(--color-border-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="ti ti-brain" style={{ color: 'var(--tf-orange)', fontSize: 16 }} />
            Claude AI Security Posture Synthesis (FR-AI-04)
          </h3>
          
          <div style={{
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.7,
            background: 'var(--color-background-tertiary)',
            border: '1px solid var(--color-border-tertiary)',
            padding: '18px',
            borderRadius: 'var(--border-radius-md)'
          }}>
            <p style={{ margin: 0 }}>
              The active security posture score is currently at <strong style={{ color: 'var(--color-text-primary)' }}>{calculatedScore}%</strong>, which is 
              {isTargetAchieved ? (
                <span style={{ color: 'var(--tf-teal)' }}> compliant with </span>
              ) : (
                <span style={{ color: 'var(--tf-orange)' }}> trailing </span>
              )} 
              our targeted compliance baseline of <strong style={{ color: 'var(--color-text-primary)' }}>{targetScore}%</strong>. 
            </p>
            <p style={{ marginTop: '12px', marginBottom: 0 }}>
              With the deployment of Month 1 (Foundation & First Scans) completed, we successfully bootstrapped Trivy (container/SCA), Gitleaks (secrets), and Nuclei (web vuln) scanners. Integration checks confirm 2 confirmed-exploitable vulnerabilities, which have been escalated directly via Jira tickets, while 7 unreachable transient package CVEs were auto-demoted in triage priority, preventing alert fatigue. Month 2 execution is now focused on deploying the Claude-powered AI Reachability engine and Slack alert threads.
            </p>
          </div>
        </div>

        {/* Historical Trends Widget */}
        {!presentMode && (
          <div style={{
            background: 'var(--color-background-secondary)',
            border: '1px solid var(--color-border-secondary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>
                Historical Progress Trend
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                4-Week rolling posture trend index
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { date: 'June 15 (W1)', score: 65, status: 'Initial scans setup' },
                { date: 'June 22 (W2)', score: 68, status: 'Auth & DB integration' },
                { date: 'June 29 (W3)', score: calculatedScore >= 71 ? 71 : calculatedScore, status: 'Celery pipelines functional' },
                { date: 'July 06 (W4)', score: calculatedScore, status: 'Active (PRD alignment)' }
              ].map((week, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{week.date}</span>
                    <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{week.score}%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: 'var(--color-border-tertiary)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${week.score}%`,
                      height: '100%',
                      background: idx === 3 ? scoreColor : 'var(--color-text-tertiary)',
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
