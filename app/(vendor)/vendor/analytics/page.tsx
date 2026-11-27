'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../lib/auth/auth.context';
import { bookingsService } from '../../../lib/api/endpoints';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import type { BookingSummary } from '../../../lib/types/booking';
import { Calendar, CheckCircle2, XCircle, BarChart3, Clock, Zap, AlertCircle, Hourglass } from 'lucide-react';

// Booking counts only: LinkMart does not process or know booking payments, so there is no revenue figure.
interface Analytics {
  total: number; requested: number; accepted: number; completed: number;
  declined: number; expired: number; cancelled: number;
  acceptanceRate: number | null; responseRate: number | null;
}

type Timeframe = 'week' | 'month' | 'year';

function MetricCard({ label, value, sub, color, icon: Icon, border }: {
  label: string; value: string | number; sub?: string;
  color: string; icon: React.ElementType; border?: string;
}) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${border ?? 'var(--color-border)'}`, borderRadius: 12, padding: '18px 20px', borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

export default function VendorAnalyticsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [data,     setData]     = useState<Analytics | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [period,   setPeriod]   = useState<Timeframe>('month');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await bookingsService.getVendorBookings({ limit: 100 });
      const bookings: BookingSummary[] = Array.isArray(res.data) ? res.data : [];

      // Filter by when the request was received
      const now  = new Date();
      const from = new Date();
      if (period === 'week')  from.setDate(now.getDate() - 7);
      if (period === 'month') from.setMonth(now.getMonth() - 1);
      if (period === 'year')  from.setFullYear(now.getFullYear() - 1);

      const inRange = bookings.filter(b => new Date(b.createdAt) >= from);
      const n = (s: BookingSummary['status']) => inRange.filter(b => b.status === s).length;
      const requested = n('requested'), accepted = n('accepted'), completed = n('completed');
      const declined = n('declined'), expired = n('expired'), cancelled = n('cancelled');
      // Requests the vendor decided (accepted, later completed, or declined) vs those left to expire.
      const answered = accepted + completed + declined;
      const decidable = answered + expired;

      setData({
        total: inRange.length, requested, accepted, completed, declined, expired, cancelled,
        acceptanceRate: answered > 0 ? ((accepted + completed) / answered) * 100 : null,
        responseRate:   decidable > 0 ? (answered / decidable) * 100 : null,
      });
    } catch { setError('Failed to load analytics'); }
    finally  { setLoading(false); }
  }, [period]);

  useEffect(() => { if (!authLoading && isAuthenticated) fetchAnalytics(); }, [authLoading, isAuthenticated, fetchAnalytics]);

  if (authLoading) return <LoadingSpinner fullPage text="Loading..." />;

  return (
    <div style={{ fontFamily: 'inherit' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Analytics</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>Booking requests and how you responded (latest 100 bookings)</p>
        </div>
        {/* Timeframe pills */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--color-surface-muted)', padding: 4, borderRadius: 10 }}>
          {(['week', 'month', 'year'] as Timeframe[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: '6px 14px', borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: period === p ? 'var(--color-text-primary)' : 'transparent',
              color:      period === p ? '#fff'    : 'var(--color-text-secondary)',
              fontFamily: 'inherit',
            }}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#991B1B' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {loading ? <LoadingSpinner text="Loading analytics..." /> : data && (
        <>
          {/* Primary metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }} className="analytics-grid">
            <MetricCard label="Requests"        value={data.total}    color="#6366F1" icon={Calendar} sub="Received in this period" />
            <MetricCard label="Awaiting reply"  value={data.requested} color="#F59E0B" icon={Clock}   sub="Respond within 24 hours" />
            <MetricCard label="Acceptance"      value={data.acceptanceRate === null ? '–' : `${data.acceptanceRate.toFixed(0)}%`} color="#10B981" icon={Zap}       sub="Accepted vs declined" />
            <MetricCard label="Response Rate"   value={data.responseRate === null ? '–' : `${data.responseRate.toFixed(0)}%`}   color="#8B5CF6" icon={BarChart3} sub="Answered before expiry" />
          </div>

          {/* Secondary row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }} className="analytics-grid2">
            <MetricCard label="Accepted"   value={data.accepted}   color="#10B981" icon={CheckCircle2} />
            <MetricCard label="Completed"  value={data.completed}  color="#8B5CF6" icon={CheckCircle2} />
            <MetricCard label="Expired"    value={data.expired}    color="var(--color-text-muted)" icon={Hourglass}    />
            <MetricCard label="Declined / cancelled" value={data.declined + data.cancelled} color="#EF4444" icon={XCircle} />
          </div>

          {/* Booking breakdown bar */}
          {data.total > 0 && (
            <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 22px', marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 14px' }}>Booking Breakdown</p>
              <div style={{ display: 'flex', height: 8, borderRadius: 8, overflow: 'hidden', gap: 2, marginBottom: 14 }}>
                {[
                  { count: data.requested, color: '#F59E0B' },
                  { count: data.accepted,  color: '#10B981' },
                  { count: data.completed, color: '#8B5CF6' },
                  { count: data.expired,   color: 'var(--color-text-muted)' },
                  { count: data.declined + data.cancelled, color: '#EF4444' },
                ].map((seg, i) => (
                  <div key={i} style={{ flex: seg.count, background: seg.color, minWidth: seg.count > 0 ? 4 : 0 }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { label: 'Awaiting reply', count: data.requested, color: '#F59E0B' },
                  { label: 'Accepted',  count: data.accepted,  color: '#10B981' },
                  { label: 'Completed', count: data.completed, color: '#8B5CF6' },
                  { label: 'Expired',   count: data.expired,   color: 'var(--color-text-muted)' },
                  { label: 'Declined / cancelled', count: data.declined + data.cancelled, color: '#EF4444' },
                ].map(seg => (
                  <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color, display: 'inline-block' }} />
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{seg.label}: <strong style={{ color: 'var(--color-text-primary)' }}>{seg.count}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '18px 22px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>💡 Tips to Improve</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Respond to booking requests within 24 hours; unanswered requests expire',
                'Add high-quality photos to increase listing views and conversion',
                'Ask customers to leave reviews after completed bookings',
                'Keep pricing competitive — check similar listings in your area',
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#10B981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 13, color: '#065F46' }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          .analytics-grid  { grid-template-columns: repeat(2, 1fr) !important; }
          .analytics-grid2 { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .analytics-grid  { grid-template-columns: 1fr !important; }
          .analytics-grid2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}