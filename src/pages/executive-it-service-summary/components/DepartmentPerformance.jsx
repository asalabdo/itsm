import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import { loadErpDepartmentDirectory, matchOrganizationUnitLabel } from '../../../services/organizationUnits';

const DepartmentPerformance = ({ data = [] }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = language === 'ar';
  const [erpDepartments, setErpDepartments] = useState([]);

  useEffect(() => {
    let mounted = true;

    loadErpDepartmentDirectory()
      .then((departments) => {
        if (mounted) {
          setErpDepartments(Array.isArray(departments) ? departments : []);
        }
      })
      .catch((error) => {
        console.error('Failed to load ERP departments:', error);
        if (mounted) {
          setErpDepartments([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const departmentData = useMemo(() => {
    if (!data.length) return [];
      return data.map((d) => ({
      department: matchOrganizationUnitLabel(d.metricName, erpDepartments) || d.metricName,
      satisfaction: Number(d.value),
      incidents: Math.max(1, Math.round(10 - Number(d.value || 0))),
      resolution: Number(Math.max(0.7, 3 - Number(d.value || 0) / 2).toFixed(1)),
      users: Math.max(50, Math.round(Number(d.value || 0) * 60)),
      ticketVolume: Math.max(5, Math.round(Number(d.value || 0) * 8)),
    }));
  }, [data, erpDepartments]);

  const getPerformanceStatus = (satisfaction) => {
    if (satisfaction >= 4.5) return { color: 'text-success', bg: 'bg-success/10' };
    if (satisfaction >= 4.0) return { color: 'text-primary', bg: 'bg-primary/10' };
    if (satisfaction >= 3.5) return { color: 'text-warning', bg: 'bg-warning/10' };
    return { color: 'text-error', bg: 'bg-error/10' };
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t('departmentPerformance', 'Department Performance')}</h3>
          <p className="text-sm text-muted-foreground">{isArabic ? 'رضا خدمات تقنية المعلومات حسب وحدة الأعمال' : t('itServiceSatisfactionByBusinessUnit', 'IT service satisfaction by business unit')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Users" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{isArabic ? 'إجمالي 1,730 مستخدمًا' : t('totalUsersCount', '1,730 total users')}</span>
        </div>
      </div>

      <div className="h-64 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="department" stroke="var(--color-muted-foreground)" fontSize={12} angle={-45} textAnchor="end" height={60} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={12} domain={[0, 5]} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-popover)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-popover-foreground)',
              }}
              formatter={(value, name) => [
                name === 'satisfaction' ? `${value}/5.0` : value,
                name === 'satisfaction' ? t('satisfactionScore', 'Satisfaction Score') : name,
              ]}
            />
            <Bar dataKey="satisfaction" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="satisfaction" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {departmentData.map((dept, index) => {
          const performance = getPerformanceStatus(dept.satisfaction);
          return (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 micro-interaction">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${performance.bg}`}>
                  <span className={`text-sm font-bold ${performance.color}`}>{dept.department?.charAt(0)}</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{dept.department}</h4>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{dept.users} {isArabic ? 'مستخدم' : t('users', 'users')}</span>
                    <span>•</span>
                    <span>{dept.ticketVolume} {isArabic ? 'تذكرة/شهر' : t('ticketsPerMonth', 'tickets/month')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className={`font-semibold ${performance.color}`}>{dept.satisfaction}/5.0</div>
                  <div className="text-xs text-muted-foreground">{isArabic ? 'الرضا' : t('satisfaction', 'Satisfaction')}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground">{dept.incidents}</div>
                  <div className="text-xs text-muted-foreground">{isArabic ? 'حوادث' : t('incidents', 'Incidents')}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground">{dept.resolution}h</div>
                  <div className="text-xs text-muted-foreground">{isArabic ? 'متوسط الحل' : t('avgResolution', 'Avg Resolution')}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-success">4.5/5.0</div>
            <div className="text-sm text-muted-foreground">{isArabic ? 'متوسط الرضا' : t('averageSatisfaction', 'Average Satisfaction')}</div>
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">53</div>
            <div className="text-sm text-muted-foreground">{isArabic ? 'إجمالي الحوادث' : t('totalIncidents', 'Total Incidents')}</div>
          </div>
          <div>
            <div className="text-lg font-bold text-accent">1.5h</div>
            <div className="text-sm text-muted-foreground">{isArabic ? 'متوسط وقت الحل' : t('avgResolutionTime', 'Avg Resolution Time')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentPerformance;
