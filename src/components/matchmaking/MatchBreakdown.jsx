import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const METRICS = [
  { key: 'skills', label: 'Skills' },
  { key: 'text', label: 'Text Similarity' },
  { key: 'sectors', label: 'Sector Fit' },
  { key: 'reputation', label: 'Reputation' },
  { key: 'availability', label: 'Availability' },
  { key: 'location', label: 'Location' },
];

const toPercent = (value) => {
  if (value == null || value === '') return null;

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return null;

  return Math.max(0, Math.min(100, Math.round(numericValue * 100)));
};

function MatchBreakdown({ breakdown, className }) {
  if (!breakdown) return null;

  const rows = METRICS.map((metric) => {
    const percent = toPercent(breakdown[metric.key]);
    return percent == null ? null : { ...metric, percent };
  }).filter(Boolean);

  if (rows.length === 0) return null;

  return (
    <Card
      className={cn(
        'rounded-2xl border border-white/10 bg-slate-950/80 shadow-sm backdrop-blur-xl',
        className
      )}
    >
      <CardHeader className="border-b border-white/5 px-4 py-4 sm:px-6">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-white">Match Breakdown</h3>
          <p className="text-sm text-slate-400">
            Component scores are shown as percentages for quick comparison.
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 py-4 sm:px-6">
        <div className="space-y-4" role="list" aria-label="Match breakdown metrics">
          {rows.map((row) => (
            <div key={row.key} role="listitem" className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-200">{row.label}</span>
                <span className="text-sm font-semibold tabular-nums text-white">
                  {row.percent}%
                </span>
              </div>

              <Progress
                value={row.percent}
                aria-label={`${row.label} match score ${row.percent}%`}
                className={cn(
                  'h-2.5 bg-white/10',
                  '*:data-[slot=progress-indicator]:bg-cyan-400'
                )}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

MatchBreakdown.propTypes = {
  className: PropTypes.string,
  breakdown: PropTypes.shape({
    skills: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    text: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    sectors: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    reputation: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    availability: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    location: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
};

export default MatchBreakdown;
