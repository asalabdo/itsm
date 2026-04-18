import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ResolutionTimeChart = () => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const data = [
    { category: t('technicalSupport', 'Technical'), avgTime: 4.2, target: 6.0 },
    { category: t('billing', 'Billing'), avgTime: 2.8, target: 4.0 },
    { category: t('sales', 'Sales'), avgTime: 3.5, target: 5.0 },
    { category: t('generalInquiry', 'General'), avgTime: 1.9, target: 3.0 },
    { category: t('accountManagement', 'Account'), avgTime: 3.1, target: 4.5 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-elevation-3">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry?.color }}
                />
                <span className="text-muted-foreground caption">{entry?.name}:</span>
              </span>
              <span className="font-medium text-foreground data-text">{entry?.value}h</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 md:h-80 lg:h-96" aria-label={t('resolutionTimeByCategory', 'Average Resolution Time by Category')}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="category"
            stroke="var(--color-muted-foreground)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="var(--color-muted-foreground)"
            style={{ fontSize: '12px' }}
            label={{ value: t('hours', 'Hours'), angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '14px' }}
            iconType="circle"
          />
          <Bar
            dataKey="avgTime"
            name={t('averageResolutionTime', 'Avg Resolution Time')}
            fill="var(--color-primary)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="target"
            name={t('targetTime', 'Target Time')}
            fill="var(--color-muted)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResolutionTimeChart;
