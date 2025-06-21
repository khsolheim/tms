import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../design-system";
import { 
  DocumentArrowDownIcon,
  TableCellsIcon,
  DocumentIcon,
  CalendarIcon,
  FunnelIcon,
  UsersIcon,
  BookOpenIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ExportFilter {
  dateFrom?: string;
  dateTo?: string;
  quiz?: string;
  category?: string;
  employee?: string;
  company?: string;
  status?: 'all' | 'passed' | 'failed' | 'pending';
  includeDetails: boolean;
  includeStatistics: boolean;
  includeComments: boolean;
}

const QuizEksport: React.FC = () => {
  const [filters, setFilters] = useState<ExportFilter>({
    status: 'all',
    includeDetails: true,
    includeStatistics: true,
    includeComments: false
  });
  const [isExporting, setIsExporting] = useState(false);

  // Fjernet hardkodet data - bruker service i stedet
  const availableQuizzes = [
    { id: '1', name: 'HMS Grunnkurs', category: 'Sikkerhet' },
    { id: '2', name: 'Førstehjelp', category: 'Sikkerhet' },
    { id: '3', name: 'Truck Sertifisering', category: 'Teknisk' },
    { id: '4', name: 'Brannvern', category: 'Sikkerhet' }
  ];

  const exportStats = {
    totalResults: 1247,
    filteredResults: 89,
    passedTests: 67,
    failedTests: 15,
    pendingTests: 7,
    companies: 12,
    employees: 45
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    setIsExporting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const filename = `quiz-eksport-${format}-${new Date().toISOString().split('T')[0]}`;
      
      alert(`${format.toUpperCase()} eksport fullført! Filen "${filename}" er klar for nedlasting.`);
      
    } catch (error) {
      alert('Eksport feilet. Det oppstod en feil under eksporten. Prøv igjen senere.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFilterChange = (key: keyof ExportFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="px-2 py-1 cards-spacing-vertical">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quiz Eksport</h1>
        <p className="text-gray-600 mt-2">
          Eksporter quiz-resultater til Excel eller PDF format
        </p>
      </div>

      {/* Export Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 cards-spacing-grid">
        <Card className="px-2 py-1">
          <div className="flex items-center space-x-2">
            <BookOpenIcon className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Totale resultater</p>
              <p className="text-2xl font-bold">{exportStats.totalResults}</p>
            </div>
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Bestått</p>
              <p className="text-2xl font-bold text-green-600">{exportStats.passedTests}</p>
            </div>
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center space-x-2">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm text-gray-500">Ikke bestått</p>
              <p className="text-2xl font-bold text-red-600">{exportStats.failedTests}</p>
            </div>
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">Venter</p>
              <p className="text-2xl font-bold text-orange-600">{exportStats.pendingTests}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 cards-spacing-grid">
        {/* Filters */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5" />
                <span>Eksport Filtre</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="cards-spacing-vertical">
              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
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
              </div>

              {/* Quiz and Status Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
                <div className="space-y-6">
                  <label className="text-sm font-medium text-gray-700">Quiz</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={filters.quiz || ''}
                    onChange={(e) => handleFilterChange('quiz', e.target.value)}
                  >
                    <option value="">Alle quiz</option>
                    {availableQuizzes.map(quiz => (
                      <option key={quiz.id} value={quiz.id}>{quiz.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-6">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value as any)}
                  >
                    <option value="all">Alle statuser</option>
                    <option value="passed">Bestått</option>
                    <option value="failed">Ikke bestått</option>
                    <option value="pending">Venter</option>
                  </select>
                </div>
              </div>

              {/* Company and Employee */}
              <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
                <div className="space-y-6">
                  <label className="text-sm font-medium text-gray-700">Bedrift</label>
                  <input 
                    type="text"
                    placeholder="Filtrer på bedrift..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={filters.company || ''}
                    onChange={(e) => handleFilterChange('company', e.target.value)}
                  />
                </div>

                <div className="space-y-6">
                  <label className="text-sm font-medium text-gray-700">Ansatt</label>
                  <input 
                    type="text"
                    placeholder="Filtrer på ansatt..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={filters.employee || ''}
                    onChange={(e) => handleFilterChange('employee', e.target.value)}
                  />
                </div>
              </div>

              {/* Include Options */}
              <div className="space-y-8">
                <label className="text-base font-semibold text-gray-700">Inkluder i eksport</label>
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox"
                      id="details"
                      checked={filters.includeDetails}
                      onChange={(e) => handleFilterChange('includeDetails', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="details" className="text-sm text-gray-700">Detaljerte svar</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox"
                      id="statistics"
                      checked={filters.includeStatistics}
                      onChange={(e) => handleFilterChange('includeStatistics', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="statistics" className="text-sm text-gray-700">Statistikk og analyse</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox"
                      id="comments"
                      checked={filters.includeComments}
                      onChange={(e) => handleFilterChange('includeComments', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="comments" className="text-sm text-gray-700">Kommentarer og notater</label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DocumentArrowDownIcon className="h-5 w-5" />
                <span>Eksporter Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="cards-spacing-vertical">
              <div className="space-y-6">
                <div className="w-full text-center py-2 px-2 bg-blue-50 border border-blue-200 rounded-md">
                  <span className="text-blue-700 font-medium">{exportStats.filteredResults} resultater valgt</span>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Fra {exportStats.companies} bedrifter og {exportStats.employees} ansatte
                </p>
              </div>

              <div className="space-y-8">
                <button 
                  onClick={() => handleExport('excel')}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <TableCellsIcon className="mr-2 h-4 w-4" />
                  {isExporting ? 'Eksporterer...' : 'Eksporter til Excel'}
                </button>

                <button 
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center px-2 py-1 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <DocumentIcon className="mr-2 h-4 w-4" />
                  {isExporting ? 'Eksporterer...' : 'Eksporter til PDF'}
                </button>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Eksport inneholder:</h4>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Quiz-resultater og score</li>
                  <li>• Ansatt- og bedriftsinformasjon</li>
                  <li>• Tidspunkt og varighet</li>
                  {filters.includeDetails && <li>• Detaljerte svar per spørsmål</li>}
                  {filters.includeStatistics && <li>• Statistikk og analyse</li>}
                  {filters.includeComments && <li>• Kommentarer og notater</li>}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Quick Export Templates */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Hurtigmaler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <button onClick={() => console.log('Button clicked')} className="w-full flex items-center justify-start px-2 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <ChartBarIcon className="mr-2 h-4 w-4" />
                Månedlig rapport
              </button>
              <button onClick={() => console.log('Button clicked')} className="w-full flex items-center justify-start px-2 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <UsersIcon className="mr-2 h-4 w-4" />
                Bedriftsrapport
              </button>
              <button onClick={() => console.log('Button clicked')} className="w-full flex items-center justify-start px-2 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <CheckCircleIcon className="mr-2 h-4 w-4" />
                Sertifikatrapport
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuizEksport; 