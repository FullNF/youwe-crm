import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, TrendingUp } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import SourceBreakdownChart from '../components/charts/SourceBreakdownChart';
import StageBreakdownChart from '../components/charts/StageBreakdownChart';
import { useReports } from '../hooks/useReports';

export default function Reports() {
  const [range, setRange] = useState({});
  const { report, loading, downloadExport } = useReports(range);

  const stageMap = (report?.leadStage || []).reduce((acc, r) => ({ ...acc, [r.stage]: r.count }), {});

  return (
    <>
      <Topbar title="Reports">
        <input type="date" className="input-base w-auto min-w-0 shrink-0" onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} />
        <span className="text-ink-faint text-sm shrink-0">to</span>
        <input type="date" className="input-base w-auto min-w-0 shrink-0" onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} />
      </Topbar>

      <div className="p-4 sm:p-6 space-y-6 animate-fadeIn">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => downloadExport('excel')}><FileSpreadsheet size={14} /> Export Excel</Button>
          <Button variant="secondary" onClick={() => downloadExport('csv')}><Download size={14} /> Export CSV</Button>
          <Button variant="secondary" onClick={() => downloadExport('pdf')}><FileText size={14} /> Export PDF</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', value: report?.conversion?.total },
            { label: 'Won', value: report?.conversion?.won },
            { label: 'Lost', value: report?.conversion?.lost },
            { label: 'Conversion Rate', value: report?.conversion ? `${report.conversion.overallConversionRate}%` : undefined },
          ].map((c) => (
            <Card key={c.label} className="p-4">
              {loading ? <Skeleton className="h-7 w-14 mb-1" /> : <p className="text-2xl font-semibold text-ink">{c.value ?? 0}</p>}
              <p className="text-xs text-ink-muted mt-1">{c.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <p className="text-sm font-medium text-ink mb-3">Lead Source</p>
            {loading ? <Skeleton className="h-[220px]" /> : (
              <SourceBreakdownChart data={(report?.leadSource || []).reduce((acc, r) => ({ ...acc, [r.source]: r.count }), {})} />
            )}
          </Card>
          <Card>
            <p className="text-sm font-medium text-ink mb-3">Lead Stage</p>
            {loading ? <Skeleton className="h-[220px]" /> : <StageBreakdownChart data={stageMap} />}
          </Card>
        </div>

        <Card padded={false}>
          <div className="px-5 py-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-accent" />
            <p className="text-sm font-medium text-ink">Agent Performance</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-left text-xs text-ink-muted">
                  <th className="px-5 py-2">Agent</th>
                  <th className="px-5 py-2">Total Leads</th>
                  <th className="px-5 py-2">Active</th>
                  <th className="px-5 py-2">Won</th>
                  <th className="px-5 py-2">Lost</th>
                  <th className="px-5 py-2">Site Visits</th>
                  <th className="px-5 py-2">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {(report?.agentPerformance || []).map((row) => (
                  <tr key={row.agent} className="border-b border-surface-border/60">
                    <td className="px-5 py-2.5 text-ink">{row.agent}</td>
                    <td className="px-5 py-2.5 text-ink-muted">{row.totalLeads}</td>
                    <td className="px-5 py-2.5 text-ink-muted">{row.active}</td>
                    <td className="px-5 py-2.5 text-success">{row.won}</td>
                    <td className="px-5 py-2.5 text-danger">{row.lost}</td>
                    <td className="px-5 py-2.5 text-ink-muted">{row.siteVisits}</td>
                    <td className="px-5 py-2.5 text-ink">{row.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-medium text-ink mb-2">Need Loan</p>
          <p className="text-sm text-ink-muted">
            {report?.needLoan?.totalNeedingLoan ?? 0} leads ({report?.needLoan?.percentOfTotal ?? 0}% of total) need home loan assistance.
          </p>
        </Card>
      </div>
    </>
  );
}
