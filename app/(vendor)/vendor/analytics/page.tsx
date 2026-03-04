'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../lib/auth/auth.context';
import { useRouter } from 'next/navigation';
import { bookingsService } from '../../../lib/api/endpoints';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Calendar, TrendingUp, CheckCircle2, XCircle, BarChart3, Eye, Zap, AlertCircle } from 'lucide-react';

interface Analytics {
  total: number; completed: number; cancelled: number; pending: number;
  revenue: number; conversionRate: number; responseRate: number;
}

type Timeframe = 'week' | 'month' | 'year';

function MetricCard({ label, value, sub, color, icon: Icon, border }: {
  label: string; value: string | number; sub?: string;
  color: string; icon: React.ElementType; border?: string;
}) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${border ?? '#E5E7EB'}`, borderRadius: 12, padding: '18px 20px', borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

export default function VendorAnalyticsPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router  = useRouter();
  const [data,     setData]     = useState<Analytics | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [period,   setPeriod]   = useState<Timeframe>('month');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/auth/login'); return; }
    if (!authLoading && user?.role !== 'vendor') { router.push('/dashboard'); }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res      = await bookingsService.getVendorBookings(1, 200);
      const bookings: any[] = Array.isArray(res.data) ? res.data : (res.data as any)?.data ?? [];

      // Filter by timeframe
      const now  = new Date();
      const from = new Date();
      if (period === 'week')  from.setDate(now.getDate() - 7);
      if (period === 'month') from.setMonth(now.getMonth() - 1);
      if (period === 'year')  from.setFullYear(now.getFullYear() - 1);

      const inRange = bookings.filter(b => new Date(b.createdAt) >= from);
      const completed  = inRange.filter(b => b.status === 'completed');
      const cancelled  = inRange.filter(b => b.status === 'cancelled');
      const pending    = inRange.filter(b => b.status === 'pending');
      const revenue    = completed.reduce((s: number, b: any) => s + (b.totalAmount ?? 0), 0);

      setData({
        total:          inRange.length,
        completed:      completed.length,
        cancelled:      cancelled.length,
        pending:        pending.length,
        revenue,
        conversionRate: inRange.length > 0 ? (completed.length / inRange.length) * 100 : 0,
        responseRate:   inRange.length > 0 ? ((inRange.length - pending.length) / inRange.length) * 100 : 100,
      });
    } catch { setError('Failed to load analytics'); }
    finally  { setLoading(false); }
  }, [period]);

  useEffect(() => { if (!authLoading && isAuthenticated) fetchAnalytics(); }, [authLoading, isAuthenticated, fetchAnalytics]);

  if (authLoading) return <LoadingSpinner fullPage text="Loading..." />;

  return (
    <div style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Analytics</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Track your performance metrics</p>
        </div>
        {/* Timeframe pills */}
        <div style={{ display: 'flex', gap: 6, background: '#F3F4F6', padding: 4, borderRadius: 10 }}>
          {(['week', 'month', 'year'] as Timeframe[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: '6px 14px', borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: period === p ? '#111827' : 'transparent',
              color:      period === p ? '#fff'    : '#6B7280',
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
            <MetricCard label="Total Bookings"  value={data.total}                           color="#6366F1" icon={Calendar}       />
            <MetricCard label="Revenue"         value={`KSh ${(data.revenue/1000).toFixed(0)}K`} color="#10B981" icon={TrendingUp} sub="From completed bookings" />
            <MetricCard label="Conversion"      value={`${data.conversionRate.toFixed(0)}%`} color="#F59E0B" icon={Zap}           sub="Completed vs total"      />
            <MetricCard label="Response Rate"   value={`${data.responseRate.toFixed(0)}%`}   color="#8B5CF6" icon={BarChart3}     sub="Non-pending ratio"        />
          </div>

          {/* Secondary row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }} className="analytics-grid2">
            <MetricCard label="Completed"  value={data.completed}  color="#10B981" icon={CheckCircle2} />
            <MetricCard label="Cancelled"  value={data.cancelled}  color="#EF4444" icon={XCircle}      />
            <MetricCard label="Pending"    value={data.pending}    color="#F59E0B" icon={Calendar}     />
          </div>

          {/* Booking breakdown bar */}
          {data.total > 0 && (
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 22px', marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 14px' }}>Booking Breakdown</p>
              <div style={{ display: 'flex', height: 8, borderRadius: 8, overflow: 'hidden', gap: 2, marginBottom: 14 }}>
                {[
                  { count: data.completed, color: '#10B981' },
                  { count: data.pending,   color: '#F59E0B' },
                  { count: data.cancelled, color: '#EF4444' },
                ].map((seg, i) => (
                  <div key={i} style={{ flex: seg.count, background: seg.color, minWidth: seg.count > 0 ? 4 : 0 }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                {[
                  { label: 'Completed', count: data.completed, color: '#10B981' },
                  { label: 'Pending',   count: data.pending,   color: '#F59E0B' },
                  { label: 'Cancelled', count: data.cancelled, color: '#EF4444' },
                ].map(seg => (
                  <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color, display: 'inline-block' }} />
                    <span style={{ fontSize: 12, color: '#6B7280' }}>{seg.label}: <strong style={{ color: '#111827' }}>{seg.count}</strong></span>
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
                'Respond to booking requests within 24 hours to boost response rate',
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
          .analytics-grid2 { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .analytics-grid  { grid-template-columns: 1fr !important; }
          .analytics-grid2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}