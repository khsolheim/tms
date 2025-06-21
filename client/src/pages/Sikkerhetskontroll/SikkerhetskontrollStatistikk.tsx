import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../design-system";
import { sikkerhetskontrollService, SikkerhetskontrollStatistikk as ServiceStatistikk, MonthlyTrend, TopIssue, CompanyComparison } from '../../services/sikkerhetskontroll.service';
import { 
  ChartBarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  FunnelIcon,
  CalendarIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';

interface StatisticsFilter {
  dateFrom?: string;
  dateTo?: string;
  company?: string;
  controlType?: string;
  status?: 'all' | 'completed' | 'pending' | 'failed';
}

const SikkerhetskontrollStatistikk: React.FC = () => {
  const [filters, setFilters] = useState<StatisticsFilter>({
    status: 'all'
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for service data
  const [overallStats, setOverallStats] = useState<ServiceStatistikk | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [topIssues, setTopIssues] = useState<TopIssue[]>([]);
  const [companyComparison, setCompanyComparison] = useState<CompanyComparison[]>([]);

  useEffect(() => {
    hentData();
  }, [filters]);

  const hentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await sikkerhetskontrollService.hentStatistikkMock();
      
      setOverallStats(data.overallStats);
      setMonthlyTrends(data.monthlyTrends);
      setTopIssues(data.topIssues);
      setCompanyComparison(data.companyComparison);
      
    } catch (error) {
      console.error('Feil ved henting av statistikk:', error);
      setError('Kunne ikke laste statistikk. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof StatisticsFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4"></div>;
    }
  };

  if (loading) {
    return (
      <div className="px-2 py-1 cards-spacing-vertical">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laster statistikk...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-2 py-1 cards-spacing-vertical">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={hentData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Prøv igjen
          </button>
        </div>
      </div>
    );
  }

  if (!overallStats) {
    return (
      <div className="px-2 py-1 cards-spacing-vertical">
        <div className="text-center py-12">
          <p className="text-gray-600">Ingen data tilgjengelig</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 py-1 cards-spacing-vertical">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sikkerhetskontroll Statistikk</h1>
        <p className="text-gray-600 mt-2">
          Detaljert analyse av sikkerhetskontroller og avvik
        </p>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5" />
            <span>Filtere</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 cards-spacing-grid">
            <div className="space-y-6">
              <label className="text-sm font-medium text-gray-700">Fra dato</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div className="space-y-6">
              <label className="text-sm font-medium text-gray-700">Til dato</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            <div className="space-y-6">
              <label className="text-sm font-medium text-gray-700">Bedrift</label>
              <input
                type="text"
                placeholder="Alle bedrifter"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filters.company || ''}
                onChange={(e) => handleFilterChange('company', e.target.value)}
              />
            </div>

            <div className="space-y-6">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value as any)}
              >
                <option value="all">Alle statuser</option>
                <option value="completed">Fullført</option>
                <option value="pending">Venter</option>
                <option value="failed">Ikke bestått</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 cards-spacing-grid">
        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Totale kontroller</p>
              <p className="text-2xl font-bold">{overallStats.totalControls.toLocaleString()}</p>
            </div>
            <ShieldCheckIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Compliance rate</p>
              <p className="text-2xl font-bold text-green-600">{overallStats.complianceRate}%</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Kritiske avvik</p>
              <p className="text-2xl font-bold text-red-600">{overallStats.criticalIssues}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Snitt tid (timer)</p>
              <p className="text-2xl font-bold">{overallStats.averageCompletionTime}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
        {/* Monthly Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DocumentChartBarIcon className="h-5 w-5" />
              <span>Månedlige trender</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="cards-spacing-vertical">
              {monthlyTrends.map((month, index) => (
                <div key={month.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 w-12">{month.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="flex space-x-1">
                      <div 
                        className="bg-green-500 h-6 rounded-l"
                        style={{ width: `${(month.completed / 320) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-yellow-500 h-6"
                        style={{ width: `${(month.pending / 320) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-red-500 h-6 rounded-r"
                        style={{ width: `${(month.failed / 320) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right">
                    {month.completed + month.pending + month.failed}
                  </span>
                </div>
              ))}
              
              {/* Legend */}
              <div className="flex justify-center space-x-4 mt-4 pt-4 border-t">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-xs text-gray-600">Fullført</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-xs text-gray-600">Venter</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-xs text-gray-600">Ikke bestått</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span>Hyppigste avvik</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {topIssues.map((issue, index) => (
                <div key={issue.category} className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900 w-4">
                      {index + 1}.
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{issue.category}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getSeverityColor(issue.severity)}`}>
                        {issue.severity === 'high' ? 'Høy' : issue.severity === 'medium' ? 'Medium' : 'Lav'}
                      </span>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{issue.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BuildingOfficeIcon className="h-5 w-5" />
            <span>Bedriftssammenligning</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Bedrift</th>
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Score</th>
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Kontroller</th>
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Trend</th>
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {companyComparison.map((company, index) => (
                  <tr key={company.name} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-1 px-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 w-4">{index + 1}.</span>
                        <span className="text-sm font-medium text-gray-900">{company.name}</span>
                      </div>
                    </td>
                    <td className="py-1 px-2">
                      <span className="text-sm font-bold text-gray-900">{company.score}%</span>
                    </td>
                    <td className="py-1 px-2">
                      <span className="text-sm text-gray-600">{company.controls}</span>
                    </td>
                    <td className="py-1 px-2">
                      {getTrendIcon(company.trend)}
                    </td>
                    <td className="py-1 px-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        company.score >= 90 ? 'text-green-600 bg-green-50' :
                        company.score >= 80 ? 'text-yellow-600 bg-yellow-50' :
                        'text-red-600 bg-red-50'
                      }`}>
                        {company.score >= 90 ? 'Utmerket' : company.score >= 80 ? 'Bra' : 'Forbedring'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Period Selector */}
      <div className="flex justify-center space-x-2">
        {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedPeriod === period
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {period === 'week' ? 'Uke' : 
             period === 'month' ? 'Måned' :
             period === 'quarter' ? 'Kvartal' : 'År'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SikkerhetskontrollStatistikk; 