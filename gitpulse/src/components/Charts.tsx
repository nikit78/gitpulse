import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import type { GitHubRepo } from '../types/github';
import { getLanguageColor } from '../services/githubApi';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface ChartsProps {
  repos: GitHubRepo[];
}

function getLanguageDistribution(repos: GitHubRepo[]) {
  const counts: Record<string, number> = {};
  repos.forEach((r) => {
    if (r.language) counts[r.language] = (counts[r.language] ?? 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
}

function getTopByStars(repos: GitHubRepo[]) {
  return [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 8);
}

export default function Charts({ repos }: ChartsProps) {
  const langData = getLanguageDistribution(repos);
  const topStars = getTopByStars(repos);

  const chartTextColor = 'rgba(148, 163, 184, 0.9)';
  const gridColor = 'rgba(255, 255, 255, 0.06)';

  const doughnutData = {
    labels: langData.map(([lang]) => lang),
    datasets: [
      {
        data: langData.map(([, count]) => count),
        backgroundColor: langData.map(([lang]) => getLanguageColor(lang) + 'cc'),
        borderColor: langData.map(([lang]) => getLanguageColor(lang)),
        borderWidth: 1.5,
        hoverBorderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: topStars.map((r) => r.name),
    datasets: [
      {
        label: 'Stars',
        data: topStars.map((r) => r.stargazers_count),
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: chartTextColor, font: { size: 12 }, boxWidth: 14, padding: 14 },
      },
    },
  };

  const barOptions = {
    ...commonOptions,
    indexAxis: 'y' as const,
    plugins: {
      ...commonOptions.plugins,
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: chartTextColor, font: { size: 11 } },
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: chartTextColor, font: { size: 11 } },
      },
    },
  };

  if (repos.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 animate-fadeIn">
      {/* Language Distribution */}
      {langData.length > 0 && (
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Language Distribution</h3>
          <div className="h-64">
            <Doughnut
              data={doughnutData}
              options={{
                ...commonOptions,
                cutout: '60%',
                plugins: {
                  ...commonOptions.plugins,
                  legend: {
                    ...commonOptions.plugins.legend,
                    position: 'bottom' as const,
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Top Repos by Stars */}
      {topStars.some((r) => r.stargazers_count > 0) && (
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Top Repos by Stars</h3>
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      )}
    </div>
  );
}