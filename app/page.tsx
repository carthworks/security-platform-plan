'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  // Pricing values
  const prices = {
    free: 0,
    starter: billingPeriod === 'monthly' ? 29 : Math.round(29 * 0.8),
    pro: billingPeriod === 'monthly' ? 199 : Math.round(199 * 0.8),
  };

  return (
    <div style={{
      background: 'radial-gradient(circle at top left, #12141c 0%, #0c0d12 100%)',
      color: '#f3f4f6',
      fontFamily: 'var(--font-sans)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Premium Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 2rem',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="ti ti-shield-lock" style={{ fontSize: '22px', color: '#1D9E75' }} />
          <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: '#fff' }}>PostureIntel</span>
        </div>
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="#features" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color 0.2s' }}>Features</a>
          <a href="#pricing" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color 0.2s' }}>Pricing</a>
          <a href="#roadmap" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px', fontWeight: 500, transition: 'color 0.2s' }}>Roadmap</a>
          <Link
            href="/login"
            style={{
              background: '#1D9E75',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(29, 158, 117, 0.25)',
              transition: 'transform 0.15s'
            }}
          >
            Launch Platform
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '5rem 2rem 4rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(29, 158, 117, 0.1)',
          color: '#1D9E75',
          border: '1px solid rgba(29, 158, 117, 0.2)',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 600,
          marginBottom: '20px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          🚀 Next-Gen AI Security Operations
        </div>
        
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          maxWidth: '850px',
          margin: '0 auto 20px'
        }}>
          Unified Scan Intelligence.<br />
          <span style={{ background: 'linear-gradient(135deg, #1D9E75 0%, #378ADD 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Zero Alert Noise.
          </span>
        </h1>
        
        <p style={{
          fontSize: '15px',
          color: '#9ca3af',
          lineHeight: 1.6,
          maxWidth: '640px',
          margin: '0 auto 32px'
        }}>
          Aggregating Nuclei, Trivy, and Gitleaks scans into a single pane of glass. Enriching vulnerabilities with real-time EPSS/KEV exploit intelligence and automatic Claude reachability validation.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/login"
            style={{
              background: '#1D9E75',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 600,
              padding: '12px 24px',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(29, 158, 117, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <i className="ti ti-rocket" />
            Launch Project Tracker
          </Link>
          <Link
            href="/executive"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              color: '#fff',
              textDecoration: 'none',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '13px',
              fontWeight: 600,
              padding: '12px 24px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <i className="ti ti-presentation" />
            CISO Boardroom View
          </Link>
        </div>
      </section>

      {/* Interactive Scan Console Demo */}
      <section style={{
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto 5rem',
        padding: '0 2rem'
      }}>
        <div style={{
          background: '#0d0e14',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}>
          {/* Console Header */}
          <div style={{
            background: '#13151f',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '10px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56' }} />
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e' }} />
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f' }} />
            </div>
            <span style={{ fontSize: '10px', color: '#4b5563', fontFamily: 'monospace' }}>scan-engine-v1.0.sh</span>
            <div style={{ width: '30px' }} />
          </div>
          {/* Console Output */}
          <div style={{
            padding: '20px',
            fontFamily: 'monospace',
            fontSize: '11px',
            lineHeight: 1.6,
            textAlign: 'left',
            color: '#a78bfa'
          }}>
            <div style={{ color: '#4b5563' }}>$ postureintel scan run --target github.com/org/repo-demo</div>
            <div style={{ color: '#10b981' }}>[info] Cloning repository & verifying AST code-tree structure... Done.</div>
            <div style={{ color: '#10b981' }}>[info] Running security scanners in parallel: Nuclei, Trivy, Gitleaks...</div>
            <div style={{ color: '#3b82f6' }}>[trivy] Found 12 container dependencies vulnerabilities.</div>
            <div style={{ color: '#eab308' }}>[gitleaks] Found 1 secret exposure finding on line 124 of config.py.</div>
            <div style={{ color: '#10b981' }}>[info] Fetching threat enrichment signals (NVD CVSS / CISA KEV / EPSS)... Done.</div>
            <div style={{ color: '#8b5cf6' }}>[ai] Triggering Claude reachability parsing & prioritisation analysis...</div>
            
            {/* Finding Highlight Box */}
            <div style={{
              background: 'rgba(216, 90, 48, 0.08)',
              borderLeft: '3px solid #D85A30',
              padding: '12px',
              borderRadius: '4px',
              marginTop: '12px',
              color: '#f3f4f6'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px' }}>
                <span style={{ color: '#ff8a65' }}>⚠️ CRITICAL SCA: CVE-2023-38545 (curl SOCKS5 overflow)</span>
                <span style={{ color: '#ff8a65' }}>SCORE: 9.8</span>
              </div>
              <div style={{ display: 'flex', gap: '14px', fontSize: '10px', color: '#ffab91', marginTop: '4px' }}>
                <span>EPSS: 94.2% (exploitation probable)</span>
                <span>CISA KEV: Yes (exploited in the wild)</span>
              </div>
              <div style={{ fontSize: '10px', color: '#a7f3d0', marginTop: '6px', fontWeight: 600 }}>
                💡 Claude AST Verification: REACHABLE. function `curl_easy_perform` invoked in client.c:42.
              </div>
              <div style={{ fontSize: '10px', color: '#93c5fd', marginTop: '4px' }}>
                🔄 Automated Action: Created fix PR #14 (version bump curl to 8.4.0) + Jira ticket SEC-104 opened.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Architecture Block Diagram */}
      <section style={{
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto 5rem',
        padding: '0 2rem',
        textAlign: 'center'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Platform Architecture Flow</h2>
          <p style={{ fontSize: '12px', color: '#9ca3af', maxWidth: '500px', margin: '0 auto' }}>
            Unified pipeline logic from source-code pull request checks to threat enrichment and automated git fixes.
          </p>
        </div>
        <div style={{
          background: '#0d0e14',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          overflow: 'hidden',
          padding: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/project_block_diagram.png" 
            alt="PostureIntel Platform Architecture Block Diagram" 
            style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block' }} 
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{
        background: '#0a0b0f',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '5rem 2rem'
      }}>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(55, 138, 221, 0.1)',
              color: '#378ADD',
              border: '1px solid rgba(55, 138, 221, 0.2)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              marginBottom: '12px',
              textTransform: 'uppercase'
            }}>
              ⚙️ Pipeline Workflow
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>How It Works</h2>
            <p style={{ fontSize: '13px', color: '#9ca3af', maxWidth: '500px', margin: '0 auto' }}>
              Our automated analysis pipelines secure your code in four simple stages.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px'
          }}>
            {[
              {
                step: '01',
                title: 'Trigger Scans on PR',
                desc: 'On every GitHub Pull Request, PostureIntel spins up lightweight parallel environments running Trivy, Gitleaks, and Nuclei against modified code files.',
                color: '#1D9E75'
              },
              {
                step: '02',
                title: 'Enrich Risk Context',
                desc: 'We cross-reference every finding against NVD CVSS databases, the CISA KEV (Known Exploited Vulnerabilities) catalog, and FIRST EPSS probability scores.',
                color: '#378ADD'
              },
              {
                step: '03',
                title: 'Verify AST Reachability',
                desc: 'Claude AI analyzes your Abstract Syntax Trees (AST) to verify if the vulnerable function is actually called by your code, filtering out transitives.',
                color: '#8b5cf6'
              },
              {
                step: '04',
                title: 'Automate Fixes & Alerts',
                desc: 'Confirmed high-risk findings trigger Slack alert threads, create Jira tickets, and generate automated git Pull Requests with package version upgrades.',
                color: '#D85A30'
              }
            ].map((w, idx) => (
              <div key={idx} style={{
                position: 'relative',
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '10px',
                padding: '30px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <span style={{
                  fontSize: '36px',
                  fontWeight: 900,
                  color: w.color,
                  opacity: 0.8,
                  lineHeight: 1,
                  fontFamily: 'monospace'
                }}>
                  {w.step}
                </span>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', margin: 0 }}>{w.title}</h3>
                <p style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features / Differentiators Section */}
      <section id="features" style={{
        background: '#0c0d12',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '5rem 2rem'
      }}>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(29, 158, 117, 0.1)',
              color: '#1D9E75',
              border: '1px solid rgba(29, 158, 117, 0.2)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              marginBottom: '12px',
              textTransform: 'uppercase'
            }}>
              🌟 Capabilities
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>What Makes Us Different</h2>
            <p style={{ fontSize: '13px', color: '#9ca3af', maxWidth: '500px', margin: '0 auto' }}>
              Unlike DefectDojo which only aggregates third-party outputs, we run scans natively and possess code-level access at scan time.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {[
              { title: 'PR-time scanning (FR-SCN-12)', desc: 'Run security checks on pull requests before they are merged. Inline annotations flag issues directly inside your code review tab.', tag: 'Shift-Left', icon: 'ti-git-pull-request' },
              { title: 'Exploit Validation (FR-SCN-13)', desc: 'Nuclei active validation probes verify exploitability, deprioritizing false confidence logs to cut down alert noise.', tag: 'Active Probing', icon: 'ti-shield-check' },
              { title: 'AST Reachability (FR-AI-08)', desc: 'Verifies if vulnerable libraries are reachable from your active code paths, demoting transient vulnerabilities.', tag: 'AST Analysis', icon: 'ti-hierarchy-2' },
              { title: 'Agentic Chat (FR-AI-10)', desc: 'A native Claude assistant configured to answer queries regarding your specific vulnerability footprint and project tracker boards.', tag: 'Agentic AI', icon: 'ti-brain' },
              { title: 'AI-Generated Fixes (FR-OUT-04)', desc: 'Do not just create tickets. PostureIntel automatically generates git pull requests with fixed version bumps and patches.', tag: 'Auto-Fixes', icon: 'ti-git-branch' },
              { title: 'Executive View (FR-UI-08)', desc: 'Clean, boardroom-ready dashboard displaying compliant posture ratings and trend metrics.', tag: 'CISO-Ready', icon: 'ti-presentation' },
            ].map((feature, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '8px',
                padding: '24px',
                transition: 'border-color 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    background: 'rgba(29, 158, 117, 0.1)',
                    color: '#1D9E75',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                  }}>
                    <i className={`ti ${feature.icon}`} />
                  </div>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: '#1D9E75',
                    background: 'rgba(29, 158, 117, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    letterSpacing: '0.04em'
                  }}>
                    {feature.tag}
                  </span>
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', margin: 0 }}>{feature.title}</h3>
                <p style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.5, margin: 0 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Pricing Section */}
      <section id="pricing" style={{
        padding: '5rem 2rem',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>Simple, Transparent Pricing</h2>
        <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '30px' }}>Choose the tier that fits your engineering team size.</p>
        
        {/* Toggle Switch */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '20px', marginBottom: '40px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setBillingPeriod('monthly')}
            style={{
              background: billingPeriod === 'monthly' ? '#1D9E75' : 'transparent',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            style={{
              background: billingPeriod === 'annual' ? '#1D9E75' : 'transparent',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            Annual (-20%)
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {[
            { name: 'Free Tier', price: prices.free, limit: '10 scans/mo', features: ['3 core scanners (Nuclei, Trivy, Gitleaks)', 'Standard NVD enrichment', 'Jira ticket output (manual)', '1 viewer user seat'], cta: 'Start Free' },
            { name: 'Starter Plan', price: prices.starter, limit: '100 scans/mo', features: ['Slack webhook notifications', 'Jira ticket automation sync', 'CISO boardroom view dashboard', '5 collaborator seats'], cta: 'Upgrade Starter' },
            { name: 'Pro Plan', price: prices.pro, limit: '1000 scans/mo', features: ['AST reachability validation', 'Exploit validation mode', 'AI-generated fix PR commits', 'Unlimited user seats'], cta: 'Upgrade Pro' },
            { name: 'Enterprise', price: 'Custom', limit: 'Unlimited scans', features: ['Dedicated Hetzner CPU node pools', 'Custom SSO (SAML/OIDC)', '24/7 on-call SLA support', 'Personalized integrations'], cta: 'Contact Sales' }
          ].map((tier, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.02)',
              border: i === 1 ? '2px solid #1D9E75' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              padding: '30px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: i === 1 ? '0 10px 30px rgba(29, 158, 117, 0.15)' : 'none'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tier.name}</span>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', margin: '14px 0 6px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
                    {typeof tier.price === 'number' ? `$${tier.price}` : tier.price}
                  </span>
                  {typeof tier.price === 'number' && <span style={{ fontSize: '11px', color: '#6b7280' }}>/mo</span>}
                </div>
                <div style={{ fontSize: '11px', color: '#1D9E75', fontWeight: 500, marginBottom: '20px' }}>{tier.limit}</div>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tier.features.map((f, idx) => (
                    <li key={idx} style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="ti ti-circle-check" style={{ color: '#1D9E75', fontSize: 13 }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/login"
                style={{
                  background: i === 1 ? '#1D9E75' : 'rgba(255,255,255,0.04)',
                  color: '#fff',
                  textDecoration: 'none',
                  border: i === 1 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'block',
                  transition: 'opacity 0.2s'
                }}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        marginTop: 'auto',
        fontSize: '11px',
        color: '#4b5563'
      }}>
        <p style={{ margin: '0 0 4px' }}>© 2026 PostureIntel. All rights reserved.</p>
        <p style={{ margin: 0 }}>Designed for modern engineering teams and boardroom alignment.</p>
      </footer>
    </div>
  );
}
