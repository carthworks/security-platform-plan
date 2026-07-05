'use client';

import { useState, useEffect } from 'react';
import { useStore, PlatformSettings, DEFAULT_SETTINGS } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const { progress, updateSettings } = useStore();
  const { toast } = useToast();

  const settings = progress.settings || DEFAULT_SETTINGS;
  const [formData, setFormData] = useState<PlatformSettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'apis' | 'integrations' | 'security'>('general');

  const isAdmin = user?.role === 'admin';

  // Hydrate local state when store settings load
  useEffect(() => {
    if (progress.settings) {
      setFormData(progress.settings);
    }
  }, [progress.settings]);

  const handleChange = (key: keyof PlatformSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    if (!isAdmin) return;
    
    // Validations
    if (!formData.platformName.trim()) {
      toast('Platform Name cannot be empty', 'error');
      return;
    }
    if (!formData.orgName.trim()) {
      toast('Organization Name cannot be empty', 'error');
      return;
    }
    if (!formData.subdomain.trim()) {
      toast('Subdomain cannot be empty', 'error');
      return;
    }

    updateSettings(formData);
    toast('Platform settings updated successfully!', 'success');
  };

  // Helper Toggle Component
  const ToggleSwitch = ({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, background: 'var(--color-background-tertiary)', border: '1px solid var(--color-border-tertiary)', padding: 14, borderRadius: 'var(--border-radius-md)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2, lineHeight: 1.4 }}>{description}</div>
      </div>
      <button
        type="button"
        disabled={!isAdmin}
        onClick={() => onChange(!checked)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: checked ? 'var(--tf-teal)' : 'var(--color-border-secondary)',
          border: 'none',
          position: 'relative',
          cursor: isAdmin ? 'pointer' : 'not-allowed',
          opacity: isAdmin ? 1 : 0.6,
          transition: 'background-color 0.2s',
          padding: 0,
          flexShrink: 0,
          marginTop: 2
        }}
      >
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#fff',
            position: 'absolute',
            top: 3,
            left: checked ? 23 : 3,
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </button>
    </div>
  );

  // Helper Select Card Component
  const SelectCard = ({ active, title, subtitle, icon, onClick }: { active: boolean; title: string; subtitle: string; icon: string; onClick: () => void }) => (
    <div
      onClick={!isAdmin ? undefined : onClick}
      style={{
        border: `1px solid ${active ? 'var(--tf-teal)' : 'var(--color-border-secondary)'}`,
        background: active ? 'rgba(29, 158, 117, 0.04)' : 'var(--color-background-tertiary)',
        borderRadius: 'var(--border-radius-md)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: isAdmin ? 'pointer' : 'default',
        opacity: !isAdmin && !active ? 0.6 : 1,
        transition: 'all 0.2s',
        flex: 1,
        minWidth: '180px',
      }}
    >
      <div style={{ color: active ? 'var(--tf-teal)' : 'var(--color-text-secondary)', fontSize: '18px', display: 'flex' }}>
        <i className={`ti ${icon}`} />
      </div>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{title}</div>
        <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: 1 }}>{subtitle}</div>
      </div>
    </div>
  );

  return (
    <main className="page">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="page-tag" style={{ background: 'rgba(216, 90, 48, 0.12)', color: 'var(--tf-orange)', border: '0.5px solid rgba(216, 90, 48, 0.2)' }}>
            System Settings Panel
          </div>
          <h1 className="page-title">Platform Configuration</h1>
          <p className="page-subtitle">
            Configure scanners, threat intelligence APIs, AI integrations, Jira/Slack outputs, and subscription billing parameters.
          </p>
        </div>
      </div>

      {/* Roster Protection Banner */}
      {!isAdmin && (
        <div style={{ background: 'rgba(186, 117, 23, 0.1)', border: '1px solid rgba(186, 117, 23, 0.25)', color: 'var(--tf-amber)', borderRadius: 'var(--border-radius-lg)', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
          <i className="ti ti-eye" style={{ fontSize: 16 }} aria-hidden="true" />
          <span><strong>View-Only Mode:</strong> Only administrators can edit and update platform settings configuration.</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Navigation Sidebar */}
        <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
          {[
            { id: 'general', label: 'General Setup', icon: 'ti-settings' },
            { id: 'apis', label: 'Scanners & APIs', icon: 'ti-server' },
            { id: 'integrations', label: 'Outputs & Jira/Slack', icon: 'ti-git-branch' },
            { id: 'security', label: 'Security & Billing Tiers', icon: 'ti-shield-lock' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--border-radius-md)',
                background: activeTab === tab.id ? 'var(--color-background-tertiary)' : 'transparent',
                border: 'none',
                color: activeTab === tab.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 500 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              <i className={`ti ${tab.icon}`} style={{ fontSize: 14, color: activeTab === tab.id ? 'var(--tf-orange)' : 'inherit' }} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Configurations Form Panel */}
        <div style={{ flex: 1, minWidth: '300px', background: 'var(--color-background-secondary)', border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-lg)', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-settings" style={{ color: 'var(--tf-orange)' }} /> General Platform Setup
              </h3>

              <div className="login-field">
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Platform Display Name</label>
                <div className="login-input-wrap">
                  <i className="ti ti-device-desktop" />
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={formData.platformName || ''}
                    onChange={(e) => handleChange('platformName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Organization Name</label>
                <div className="login-input-wrap">
                  <i className="ti ti-building" />
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={formData.orgName || ''}
                    onChange={(e) => handleChange('orgName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Custom Portal Subdomain</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="login-input-wrap" style={{ flex: 1 }}>
                    <i className="ti ti-link" />
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={formData.subdomain || ''}
                      onChange={(e) => handleChange('subdomain', e.target.value)}
                      required
                    />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>.securityPlatform.in</span>
                </div>
              </div>

              <div className="login-field">
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Primary Theme Accent Color</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--border-radius-md)', background: formData.themeColor || '#1D9E75', border: '1px solid var(--color-border-secondary)', flexShrink: 0 }} />
                  <div className="login-input-wrap" style={{ flex: 1 }}>
                    <i className="ti ti-color-swatch" />
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={formData.themeColor || ''}
                      onChange={(e) => handleChange('themeColor', e.target.value)}
                      placeholder="#1D9E75"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="login-field">
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Security Posture Target Score (0-100)</label>
                <div className="login-input-wrap">
                  <i className="ti ti-target" />
                  <input
                    type="number"
                    disabled={!isAdmin}
                    min="1"
                    max="100"
                    value={formData.postureTarget || 85}
                    onChange={(e) => handleChange('postureTarget', parseInt(e.target.value, 10) || 85)}
                    required
                  />
                </div>
                <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 4, display: 'block' }}>
                  The benchmark threshold used in CISO reports to indicate compliance against targeted baseline posture.
                </span>
              </div>

              <div className="login-field">
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>Executive View Present Theme</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { theme: 'dark', label: 'Boardroom Dark', sub: 'Premium pitch-black palette', icon: 'ti-moon' },
                    { theme: 'light', label: 'Executive Light', sub: 'High-contrast clean view', icon: 'ti-sun' }
                  ].map((item) => (
                    <SelectCard
                      key={item.theme}
                      active={formData.executiveTheme === item.theme}
                      title={item.label}
                      subtitle={item.sub}
                      icon={item.icon}
                      onClick={() => handleChange('executiveTheme', item.theme)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apis' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-server" style={{ color: 'var(--tf-orange)' }} /> Threat Intelligence & AI APIs
              </h3>

              <div className="login-field">
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>NVD API Key (National Vulnerability Database)</label>
                <div className="login-input-wrap">
                  <i className="ti ti-key" />
                  <input
                    type="password"
                    disabled={!isAdmin}
                    value={formData.nvdApiKey || ''}
                    onChange={(e) => handleChange('nvdApiKey', e.target.value)}
                    placeholder="Enter NVD Developer API Key for rate limit elevation"
                  />
                </div>
              </div>

              <div className="login-field">
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Anthropic Claude AI API Key</label>
                <div className="login-input-wrap">
                  <i className="ti ti-brain" />
                  <input
                    type="password"
                    disabled={!isAdmin}
                    value={formData.claudeApiKey || ''}
                    onChange={(e) => handleChange('claudeApiKey', e.target.value)}
                    placeholder="sk-ant-xxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>
                <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 4, display: 'block' }}>
                  Used to generate plain-English vulnerability summaries, remediation playbooks, and run the agentic scanner chat.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-git-branch" style={{ color: 'var(--tf-orange)' }} /> Jira, Slack & GitHub Integrations
              </h3>

              <div style={{ borderBottom: '1px solid var(--color-border-tertiary)', paddingBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Jira Configuration (FR-OUT-01)</h4>
                
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div className="login-field" style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Jira Base URL</label>
                    <div className="login-input-wrap">
                      <i className="ti ti-link" />
                      <input
                        type="text"
                        disabled={!isAdmin}
                        value={formData.jiraBaseUrl || ''}
                        onChange={(e) => handleChange('jiraBaseUrl', e.target.value)}
                        placeholder="https://company.atlassian.net"
                      />
                    </div>
                  </div>
                  <div className="login-field" style={{ width: 100 }}>
                    <label style={{ fontSize: 10, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Project Key</label>
                    <div className="login-input-wrap">
                      <i className="ti ti-bookmark" />
                      <input
                        type="text"
                        disabled={!isAdmin}
                        value={formData.jiraProjectKey || ''}
                        onChange={(e) => handleChange('jiraProjectKey', e.target.value)}
                        placeholder="SEC"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div className="login-field" style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Jira User Email</label>
                    <div className="login-input-wrap">
                      <i className="ti ti-mail" />
                      <input
                        type="text"
                        disabled={!isAdmin}
                        value={formData.jiraEmail || ''}
                        onChange={(e) => handleChange('jiraEmail', e.target.value)}
                        placeholder="user@company.com"
                      />
                    </div>
                  </div>
                  <div className="login-field" style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Jira API Token</label>
                    <div className="login-input-wrap">
                      <i className="ti ti-key" />
                      <input
                        type="password"
                        disabled={!isAdmin}
                        value={formData.jiraApiToken || ''}
                        onChange={(e) => handleChange('jiraApiToken', e.target.value)}
                        placeholder="Enter API token"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ borderBottom: '1px solid var(--color-border-tertiary)', paddingBottom: 16, display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Slack Webhook Configuration (FR-OUT-02)</h4>
                
                <div className="login-field">
                  <label style={{ fontSize: 10, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Incoming Webhook URL</label>
                  <div className="login-input-wrap">
                    <i className="ti ti-link" />
                    <input
                      type="password"
                      disabled={!isAdmin}
                      value={formData.slackWebhookUrl || ''}
                      onChange={(e) => handleChange('slackWebhookUrl', e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div className="login-field" style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Slack Alert Channel</label>
                    <div className="login-input-wrap">
                      <i className="ti ti-messages" />
                      <input
                        type="text"
                        disabled={!isAdmin}
                        value={formData.slackChannel || ''}
                        onChange={(e) => handleChange('slackChannel', e.target.value)}
                        placeholder="#security-alerts"
                      />
                    </div>
                  </div>
                  
                  <div style={{ width: '220px', marginTop: 14 }}>
                    <ToggleSwitch
                      checked={formData.slackCriticalOnly}
                      onChange={(v) => handleChange('slackCriticalOnly', v)}
                      label="Critical/KEV Only"
                      description="Only trigger alerts for critical or known-exploited findings."
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>GitHub App Credentials (FR-SCN-12 / FR-OUT-04)</h4>
                
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div className="login-field" style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Installation ID</label>
                    <div className="login-input-wrap">
                      <i className="ti ti-bookmark" />
                      <input
                        type="text"
                        disabled={!isAdmin}
                        value={formData.githubInstallationId || ''}
                        onChange={(e) => handleChange('githubInstallationId', e.target.value)}
                        placeholder="e.g. 543210"
                      />
                    </div>
                  </div>
                  <div className="login-field" style={{ flex: 2 }}>
                    <label style={{ fontSize: 10, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Integration Access Token</label>
                    <div className="login-input-wrap">
                      <i className="ti ti-key" />
                      <input
                        type="password"
                        disabled={!isAdmin}
                        value={formData.githubAccessToken || ''}
                        onChange={(e) => handleChange('githubAccessToken', e.target.value)}
                        placeholder="Enter GitHub App access token"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-shield-lock" style={{ color: 'var(--tf-orange)' }} /> Security Compliance & Billing
              </h3>

              <ToggleSwitch
                checked={formData.dpdpEnabled}
                onChange={(v) => handleChange('dpdpEnabled', v)}
                label="DPDP Act 2023 Compliance Mode"
                description="Enforce strict local user data residency limits, require dynamic cookie consent on sign-in, and auto-delete inactive grading logs after 90 days."
              />

              <ToggleSwitch
                checked={formData.soc2Enabled}
                onChange={(v) => handleChange('soc2Enabled', v)}
                label="SOC 2 Audit Trail Logging"
                description="Maintain cryptographic event logs for all administrative operations, team additions, role changes, and API overrides."
              />

              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>Active Subscription Tier (FR-BIL-01)</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { tier: 'free', label: 'Free Tier', sub: '10 scans/mo limit', icon: 'ti-gift' },
                    { tier: 'starter', label: 'Starter ($29/mo)', sub: '100 scans/mo limit', icon: 'ti-bolt' },
                    { tier: 'pro', label: 'Pro ($199/mo)', sub: '1000 scans/mo limit', icon: 'ti-award' },
                    { tier: 'enterprise', label: 'Enterprise', sub: 'Unlimited scans & SLA', icon: 'ti-building' }
                  ].map((item) => (
                    <SelectCard
                      key={item.tier}
                      active={formData.activeTier === item.tier}
                      title={item.label}
                      subtitle={item.sub}
                      icon={item.icon}
                      onClick={() => handleChange('activeTier', item.tier)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Form Save Button Footer */}
          {isAdmin && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: 16 }}>
              <button
                type="button"
                className="theme-btn"
                onClick={handleSave}
                style={{
                  background: 'var(--tf-orange)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '8px 16px',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <i className="ti ti-device-floppy" style={{ fontSize: 13 }} />
                Save Configurations
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
