import { useState } from 'react';
import { Activity } from 'lucide-react';
import type { GitHubRepo } from '../types/github';

interface Props { repos: GitHubRepo[]; }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

interface Cell {
  date: string;   // YYYY-MM-DD
  count: number;
  day: number;    // 0=Sun
  week: number;
  future: boolean;
}

function buildGrid(repos: GitHubRepo[]): Cell[] {
  // Count repos pushed per calendar day
  const counts: Record<string, number> = {};
  for (const repo of repos) {
    const d = repo.pushed_at?.split('T')[0];
    if (d) counts[d] = (counts[d] ?? 0) + 1;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Go back 52 weeks from today, align to Sunday
  const start = new Date(today);
  start.setDate(start.getDate() - 52 * 7);
  start.setDate(start.getDate() - start.getDay()); // align to Sunday

  const cells: Cell[] = [];
  const cur = new Date(start);
  while (cur <= today) {
    const dateStr = cur.toISOString().split('T')[0];
    cells.push({
      date: dateStr,
      count: counts[dateStr] ?? 0,
      day: cur.getDay(),
      week: Math.floor((cur.getTime() - start.getTime()) / (7 * 86400000)),
      future: cur > today,
    });
    cur.setDate(cur.getDate() + 1);
  }
  return cells;
}

function cellColor(count: number): string {
  if (count === 0) return 'bg-white/[0.04] border-white/5';
  if (count === 1) return 'bg-violet-900/70 border-violet-800/40';
  if (count === 2) return 'bg-violet-700/80 border-violet-600/50';
  if (count <= 4) return 'bg-violet-500/90 border-violet-400/50';
  return 'bg-violet-400 border-violet-300/50';
}

function getMonthLabels(cells: Cell[]) {
  const seen = new Set<string>();
  const labels: { week: number; label: string }[] = [];
  for (const c of cells) {
    if (c.day === 0) {
      const month = c.date.slice(0, 7); // YYYY-MM
      if (!seen.has(month)) {
        seen.add(month);
        labels.push({ week: c.week, label: MONTHS[parseInt(c.date.slice(5, 7)) - 1] });
      }
    }
  }
  return labels;
}

// Group cells by week
function groupByWeek(cells: Cell[]): Cell[][] {
  const weeks: Cell[][] = [];
  for (const cell of cells) {
    if (!weeks[cell.week]) weeks[cell.week] = [];
    weeks[cell.week].push(cell);
  }
  return weeks;
}

export default function ActivityHeatmap({ repos }: Props) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number } | null>(null);
  const cells = buildGrid(repos);
  const weeks = groupByWeek(cells);
  const monthLabels = getMonthLabels(cells);
  const totalActive = cells.filter(c => c.count > 0).length;
  const maxCount = Math.max(...cells.map(c => c.count), 1);

  return (
    <div className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Activity size={15} className="text-violet-400" />
          Repository Activity
          <span className="ml-1 text-xs text-slate-500 font-normal">last 52 weeks</span>
        </h3>
        <span className="text-xs text-slate-500">{totalActive} active days · peak {maxCount} repos/day</span>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Month labels */}
          <div className="flex mb-1 pl-7">
            {monthLabels.map(({ week, label }) => (
              <div
                key={week + label}
                className="text-[10px] text-slate-500"
                style={{ width: `${(week / weeks.length) * 100}%`, minWidth: '28px' }}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 pr-1.5">
              {DAYS.map((d, i) => (
                <div key={d} className="h-3 text-[10px] text-slate-600 leading-none flex items-center">
                  {i % 2 === 1 ? d.slice(0, 1) : ''}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {/* Pad missing days at start */}
                {wi === 0 && week[0]?.day > 0 &&
                  Array.from({ length: week[0].day }).map((_, i) => (
                    <div key={`pad-${i}`} className="w-3 h-3" />
                  ))
                }
                {week.map(cell => (
                  <div
                    key={cell.date}
                    className={`w-3 h-3 rounded-sm border transition-transform hover:scale-125 cursor-pointer ${cellColor(cell.count)}`}
                    onMouseEnter={() => setTooltip({ date: cell.date, count: cell.count })}
                    onMouseLeave={() => setTooltip(null)}
                    aria-label={`${cell.date}: ${cell.count} active repo${cell.count !== 1 ? 's' : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 pl-7">
            <span className="text-[10px] text-slate-600">Less</span>
            {[0, 1, 2, 3, 4].map(n => (
              <div key={n} className={`w-3 h-3 rounded-sm border ${cellColor(n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n === 3 ? 3 : 5)}`} />
            ))}
            <span className="text-[10px] text-slate-600">More</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="mt-2 text-xs text-slate-400 text-center">
          {tooltip.count === 0
            ? `No activity on ${tooltip.date}`
            : `${tooltip.count} repo${tooltip.count !== 1 ? 's' : ''} active on ${tooltip.date}`}
        </div>
      )}
    </div>
  );
}
