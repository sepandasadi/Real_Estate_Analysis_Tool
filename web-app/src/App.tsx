import { useEffect, useState, lazy, Suspense } from 'react';
import { ApiUsageData } from './services/api';
import { mockAnalyzeProperty, getMockApiUsage } from './services/mockApi';
import { PropertyFormData, PropertyAnalysisResult } from './types/property';
import { TabMode } from './types/tabs';
import {
  clearAllPropertyData,
  getPropertyHistory,
  savePropertyToHistory,
  removePropertyFromHistory,
  clearPropertyHistory,
  PropertyHistoryEntry,
} from './utils/localStorage';
import PropertyForm from './components/PropertyForm';
import PropertyHistory from './components/PropertyHistory';
import Sidebar from './components/Sidebar';
import MenuBar from './components/MenuBar';
import InstallPrompt from './components/InstallPrompt';

// Lazy load tab components for better performance
const InputsSummaryTab = lazy(() => import('./components/tabs/InputsSummaryTab'));
const FlipAnalysisTab = lazy(() => import('./components/tabs/FlipAnalysisTab'));
const RentalAnalysisTab = lazy(() => import('./components/tabs/RentalAnalysisTab'));
const TaxBenefitsTab = lazy(() => import('./components/tabs/TaxBenefitsTab'));
const AmortizationTab = lazy(() => import('./components/tabs/AmortizationTab'));
const CompsTab = lazy(() => import('./components/tabs/CompsTab'));
const SensitivityMatrixTab = lazy(() => import('./components/tabs/SensitivityMatrixTab'));
const ChartsTab = lazy(() => import('./components/tabs/ChartsTab'));
const AdvancedMetricsTab = lazy(() => import('./components/tabs/AdvancedMetricsTab'));
const LoanComparisonTab = lazy(() => import('./components/tabs/LoanComparisonTab'));
const ProjectTrackerTab = lazy(() => import('./components/tabs/ProjectTrackerTab'));
const PartnershipManagementTab = lazy(() => import('./components/tabs/PartnershipManagementTab'));
const FilteredCompsTab = lazy(() => import('./components/tabs/FilteredCompsTab'));
const LocationQualityTab = lazy(() => import('./components/tabs/LocationQualityTab'));
const StateComparisonTab = lazy(() => import('./components/tabs/StateComparisonTab'));

// Loading fallback component
const TabLoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

type ViewMode = 'form' | 'results';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<PropertyAnalysisResult | null>(null);
  const [formData, setFormData] = useState<PropertyFormData | null>(null);
  const [apiUsage, setApiUsage] = useState<ApiUsageData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('inputs');
  const [mode, setMode] = useState<TabMode>(TabMode.SIMPLE);
  const [propertyId, setPropertyId] = useState<string>('');
  const [propertyHistory, setPropertyHistory] = useState<PropertyHistoryEntry[]>([]);
  const [selectedHistoryData, setSelectedHistoryData] = useState<PropertyFormData | null>(null);

  useEffect(() => {
    // Fetch API usage and load property history on mount
    const fetchUsage = async () => {
      try {
        const usageResponse = await getMockApiUsage();
        if (usageResponse.success && usageResponse.data) {
          setApiUsage(usageResponse.data);
        }
      } catch (err) {
        console.error('Failed to fetch API usage:', err);
      }
    };

    const loadHistory = async () => {
      try {
        const history = await getPropertyHistory();
        setPropertyHistory(history);
      } catch (err) {
        console.error('Failed to load property history:', err);
      }
    };

    fetchUsage();
    loadHistory();
  }, []);

  const handleFormSubmit = async (data: PropertyFormData) => {
    setLoading(true);
    setError('');

    try {
      // Generate unique property ID
      const newPropertyId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setPropertyId(newPropertyId);

      // Using mock API for now (no CORS issues)
      const response = await mockAnalyzeProperty(data);

      if (response.success && response.data) {
        setAnalysisResults(response.data as PropertyAnalysisResult);
        setFormData(data);
        setViewMode('results');
        setActiveTab('inputs'); // Start with inputs summary tab

        // Save to history
        await savePropertyToHistory(data);
        const updatedHistory = await getPropertyHistory();
        setPropertyHistory(updatedHistory);

        // Clear selected history data
        setSelectedHistoryData(null);

        // Refresh API usage after analysis
        const usageResponse = await getMockApiUsage();
        if (usageResponse.success && usageResponse.data) {
          setApiUsage(usageResponse.data);
        }
      } else {
        setError(response.error || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = async () => {
    // Clear IndexedDB for current property
    if (propertyId) {
      await clearAllPropertyData(propertyId);
    }

    // Reset state
    setViewMode('form');
    setAnalysisResults(null);
    setFormData(null);
    setError('');
    setActiveTab('inputs');
    setPropertyId('');
    setSelectedHistoryData(null);
  };

  const handleSelectPropertyFromHistory = (formData: PropertyFormData) => {
    setSelectedHistoryData(formData);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemovePropertyFromHistory = async (id: string) => {
    await removePropertyFromHistory(id);
    const updatedHistory = await getPropertyHistory();
    setPropertyHistory(updatedHistory);
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all search history?')) {
      await clearPropertyHistory();
      setPropertyHistory([]);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleModeChange = (newMode: TabMode) => {
    setMode(newMode);
  };

  const renderTabContent = () => {
    if (!analysisResults || !formData) return null;

    return (
      <Suspense fallback={<TabLoadingFallback />}>
        {renderTabContentInner()}
      </Suspense>
    );
  };

  const renderTabContentInner = () => {
    switch (activeTab) {
      case 'inputs':
        return <InputsSummaryTab formData={formData} results={analysisResults} onEdit={handleNewAnalysis} />;
      case 'flip':
        return analysisResults.flip ? (
          <FlipAnalysisTab flip={analysisResults.flip} />
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
            <p className="text-yellow-800">Flip analysis data not available.</p>
          </div>
        );
      case 'rental':
        return analysisResults.rental ? (
          <RentalAnalysisTab rental={analysisResults.rental} />
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
            <p className="text-yellow-800">Rental analysis data not available.</p>
          </div>
        );
      case 'tax':
        return <TaxBenefitsTab results={analysisResults} />;
      case 'amortization':
        return analysisResults.rental ? (
          <AmortizationTab rental={analysisResults.rental} />
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
            <p className="text-yellow-800">Amortization schedule requires rental property data.</p>
          </div>
        );
      case 'comps':
        return <CompsTab comps={analysisResults.comps || []} />;
      case 'flip-sensitivity':
        return analysisResults.flip ? (
          <SensitivityMatrixTab flip={analysisResults.flip} />
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
            <p className="text-yellow-800">Sensitivity matrix requires flip analysis data.</p>
          </div>
        );
      case 'charts':
        return <ChartsTab flip={analysisResults.flip} rental={analysisResults.rental} />;
      case 'advanced-metrics':
        return <AdvancedMetricsTab flip={analysisResults.flip} rental={analysisResults.rental} />;
      case 'loan-comparison':
        return <LoanComparisonTab rental={analysisResults.rental} />;
      case 'project-tracker':
        return <ProjectTrackerTab propertyId={propertyId} />;
      case 'partnership':
        return <PartnershipManagementTab data={analysisResults} propertyId={propertyId} />;
      case 'filtered-comps':
        return <FilteredCompsTab comps={analysisResults.comps || []} />;
      case 'location-quality':
        return <LocationQualityTab locationData={analysisResults.locationQuality} />;
      case 'state-comparison':
        return <StateComparisonTab purchasePrice={formData.purchasePrice} />;
      default:
        return (
          <div className="bg-gray-50 border-l-4 border-gray-400 p-6 rounded-r-lg">
            <p className="text-gray-800">This tab is coming soon!</p>
          </div>
        );
    }
  };

  const handleExport = () => {
    if (!analysisResults || !formData) return;

    const exportData = {
      property: analysisResults.property,
      inputs: formData,
      flip: analysisResults.flip,
      rental: analysisResults.rental,
      comps: analysisResults.comps,
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rei-analysis-${analysisResults.property.address.replace(/\s+/g, '-')}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Menu Bar */}
      <MenuBar
        onNewAnalysis={handleNewAnalysis}
        onExport={handleExport}
        onPrint={handlePrint}
        onModeChange={handleModeChange}
        currentMode={mode}
        hasResults={viewMode === 'results' && !!analysisResults}
        onTabChange={handleTabChange}
      />

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar - only show when results are available */}
        {viewMode === 'results' && analysisResults && (
          <Sidebar
            activeTab={activeTab}
            mode={mode}
            onTabChange={handleTabChange}
            onModeChange={handleModeChange}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-x-hidden">
          <div className="container mx-auto px-4 py-8 lg:px-8">
          {/* Header */}
          <header className="text-center mb-10 animate-fadeIn">
          <div className="inline-block mb-4">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-4 rounded-2xl shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent mb-3">
            Real Estate Analysis Tool
          </h1>
          <p className="text-gray-600 text-lg">Analyze flip and rental investment opportunities with AI-powered insights</p>
        </header>

        {/* API Usage Banner */}
        {apiUsage && (
          <div className="max-w-4xl mx-auto mb-6 animate-slideIn">
            <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-semibold text-gray-700">API Usage:</span>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">Zillow:</span>
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-md font-semibold">
                      {apiUsage.zillow.remaining}/{apiUsage.zillow.limit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">US Real Estate:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md font-semibold">
                      {apiUsage.usRealEstate.remaining}/{apiUsage.usRealEstate.limit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">Gemini:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md font-semibold">
                      {apiUsage.gemini.remaining}/{apiUsage.gemini.limit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6 animate-fadeIn">
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-xl p-5 shadow-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="bg-red-200 rounded-full p-2">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-red-800 font-bold text-lg">Error</p>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* Main Content */}
          <div className="max-w-7xl mx-auto">
            {viewMode === 'form' ? (
              <>
                {/* Property History */}
                <PropertyHistory
                  history={propertyHistory}
                  onSelectProperty={handleSelectPropertyFromHistory}
                  onRemoveProperty={handleRemovePropertyFromHistory}
                  onClearHistory={handleClearHistory}
                />

                {/* Property Form */}
                <PropertyForm
                  onSubmit={handleFormSubmit}
                  loading={loading}
                  selectedHistoryData={selectedHistoryData}
                />
              </>
            ) : analysisResults ? (
              <>
                {/* Header with New Analysis Button */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Analysis Results</h2>
                      <p className="text-gray-600 mt-1">
                        {analysisResults.property.address}, {analysisResults.property.city}, {analysisResults.property.state} {analysisResults.property.zip}
                      </p>
                    </div>
                    <button
                      onClick={handleNewAnalysis}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                    >
                      New Analysis
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="animate-fadeIn">
                  {renderTabContent()}
                </div>
              </>
            ) : null}
          </div>

          {/* Footer */}
          <footer className="text-center mt-16 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="border-t border-gray-200 pt-8">
              <p className="text-gray-600 text-sm font-medium">
                © 2026 Real Estate Analysis Tool
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Built with React, TypeScript, Tailwind CSS & Google Apps Script
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Powered by AI
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  PWA Ready
                </span>
              </div>
            </div>
          </div>
          </footer>
          </div>
        </div>
      </div>
      {/* Install Prompt for PWA */}
      <InstallPrompt />
    </div>
  );
}

export default App;
