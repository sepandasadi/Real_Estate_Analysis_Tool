import { useEffect, useState, lazy, Suspense } from 'react';
import { ApiUsageData, analyzeProperty, getApiUsage } from './services/api';
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
  const [apiUsageExpanded, setApiUsageExpanded] = useState<boolean>(true);
  const [refreshingUsage, setRefreshingUsage] = useState<boolean>(false);

  // Check if real API is configured
  const API_URL = import.meta.env.VITE_API_URL;
  const isRealApiConfigured = API_URL && API_URL !== '' && !API_URL.includes('YOUR_SCRIPT_ID');

  // Initialize API configuration on mount
  useEffect(() => {
    // API configuration happens automatically based on VITE_API_URL
  }, []);

  useEffect(() => {
    // Fetch API usage and load property history on mount
    const fetchUsage = async () => {
      try {
      const usageResponse = isRealApiConfigured
        ? await getApiUsage()
        : await getMockApiUsage();
      if (usageResponse.success && usageResponse.data) {
        setApiUsage(usageResponse.data);
      }
      } catch (err) {
        // Silently handle API usage fetch errors
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

    // Auto-refresh API usage every 30 seconds
    const usageInterval = setInterval(fetchUsage, 30000);

    return () => {
      clearInterval(usageInterval);
    };
  }, [isRealApiConfigured]);

  const handleFormSubmit = async (data: PropertyFormData) => {
    setLoading(true);
    setError('');

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/bde32f66-859e-484d-8409-cf1887350e6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:100',message:'Analysis started',data:{isRealApi:isRealApiConfigured,address:data.address},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,E'})}).catch(()=>{});
    // #endregion

    try {
      // Generate unique property ID
      const newPropertyId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setPropertyId(newPropertyId);

      // Automatically switch to Advanced mode when using Deep analysis mode
      if (data.analysisMode === 'DEEP') {
        setMode(TabMode.ADVANCED);
      }

      // Use real API if configured, otherwise use mock API
      const response = isRealApiConfigured
        ? await analyzeProperty(data)
        : await mockAnalyzeProperty(data);

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/bde32f66-859e-484d-8409-cf1887350e6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:119',message:'Analysis response received',data:{success:response.success,hasData:!!response.data,isRealApi:isRealApiConfigured},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,E'})}).catch(()=>{});
      // #endregion

      if (response.success && response.data) {
        // Ensure property field exists in the response
        const resultsData = response.data as PropertyAnalysisResult;

        if (!resultsData.property) {
          resultsData.property = {
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip
          };
        }

        setAnalysisResults(resultsData);
        setFormData(data);
        setViewMode('results');
        setActiveTab('inputs'); // Start with inputs summary tab

        // Save to history
        await savePropertyToHistory(data);
        const updatedHistory = await getPropertyHistory();
        setPropertyHistory(updatedHistory);

        // Clear selected history data
        setSelectedHistoryData(null);

        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/bde32f66-859e-484d-8409-cf1887350e6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:146',message:'About to refresh API usage',data:{isRealApi:isRealApiConfigured,currentUsage:apiUsage},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        // Refresh API usage after analysis
        const usageResponse = isRealApiConfigured
          ? await getApiUsage()
          : await getMockApiUsage();

        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/bde32f66-859e-484d-8409-cf1887350e6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:151',message:'API usage refresh response',data:{success:usageResponse.success,data:usageResponse.data,isRealApi:isRealApiConfigured},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        if (usageResponse.success && usageResponse.data) {
          setApiUsage(usageResponse.data);

          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/bde32f66-859e-484d-8409-cf1887350e6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:156',message:'API usage state updated',data:{newUsage:usageResponse.data},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
        }
      } else {
        setError(response.error || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/bde32f66-859e-484d-8409-cf1887350e6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:162',message:'Analysis error',data:{error:err instanceof Error ? err.message : String(err)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
      // #endregion

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
    if (!analysisResults || !formData) return null;

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
    const address = analysisResults.property?.address || formData?.address || 'property';
    link.download = `rei-analysis-${address.replace(/\s+/g, '-')}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRefreshUsage = async () => {
    setRefreshingUsage(true);
    try {
      const usageResponse = isRealApiConfigured
        ? await getApiUsage()
        : await getMockApiUsage();
      if (usageResponse.success && usageResponse.data) {
        setApiUsage(usageResponse.data);
      }
    } catch (err) {
      console.error('Failed to refresh API usage:', err);
    } finally {
      setRefreshingUsage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mock Mode Warning Banner */}
      {!isRealApiConfigured && (
        <div className="bg-yellow-100 border-b-2 border-yellow-400 px-4 py-3">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  ⚠️ Mock Data Mode - Using Simulated Data
                </p>
                <p className="text-xs text-yellow-700">
                  API usage and analysis results are simulated. To use real data, configure VITE_API_URL in web-app/.env
                </p>
              </div>
            </div>
            <a
              href="https://github.com/yourusername/real-estate-tool/blob/main/web-app/env.example"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded transition-colors"
            >
              Setup Guide
            </a>
          </div>
        </div>
      )}

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

        {/* Cache Warning Banner */}
        {isRealApiConfigured && (
          <div className="max-w-7xl mx-auto mb-4 animate-slideIn">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  <strong>Note:</strong> Analyzing the same address within 6 hours uses <strong>cached data</strong> and won't make new API calls.
                  To see API usage numbers update, analyze a <strong>different address</strong>.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* API Usage Banner */}
        {apiUsage && (
          <div className="max-w-7xl mx-auto mb-6">
            <div className="bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-md border border-gray-200">
              <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setApiUsageExpanded(!apiUsageExpanded)}>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-semibold text-gray-800">API Usage Monitor</span>
                  {!isRealApiConfigured && (
                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded font-semibold">
                      MOCK DATA
                    </span>
                  )}
                  {isRealApiConfigured && (
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded font-semibold">
                      LIVE DATA
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRefreshUsage();
                    }}
                    disabled={refreshingUsage}
                    className="p-1.5 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                    title="Refresh API usage"
                  >
                    <svg
                      className={`w-4 h-4 text-gray-600 ${refreshingUsage ? 'animate-spin' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <svg
                    className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${apiUsageExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className={`overflow-hidden transition-all duration-300 ${apiUsageExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-5 pb-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Private Zillow */}
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700">Private Zillow</span>
                        <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">
                          #1
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-gray-900">{apiUsage.privateZillow?.remaining ?? 0}</span>
                        <span className="text-xs text-gray-500">/ {apiUsage.privateZillow?.limit ?? 250}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            ((apiUsage.privateZillow?.remaining ?? 0) / (apiUsage.privateZillow?.limit ?? 250)) > 0.5 ? 'bg-green-500' :
                            ((apiUsage.privateZillow?.remaining ?? 0) / (apiUsage.privateZillow?.limit ?? 250)) > 0.25 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${((apiUsage.privateZillow?.remaining ?? 0) / (apiUsage.privateZillow?.limit ?? 250)) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* US Real Estate */}
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700">US Real Estate</span>
                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                          #2
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-gray-900">{apiUsage.usRealEstate?.remaining ?? 0}</span>
                        <span className="text-xs text-gray-500">/ {apiUsage.usRealEstate?.limit ?? 300}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            ((apiUsage.usRealEstate?.remaining ?? 0) / (apiUsage.usRealEstate?.limit ?? 300)) > 0.5 ? 'bg-green-500' :
                            ((apiUsage.usRealEstate?.remaining ?? 0) / (apiUsage.usRealEstate?.limit ?? 300)) > 0.25 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${((apiUsage.usRealEstate?.remaining ?? 0) / (apiUsage.usRealEstate?.limit ?? 300)) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Redfin */}
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700">Redfin Base</span>
                        <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded font-medium">
                          #3
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-gray-900">{apiUsage.redfin?.remaining ?? 0}</span>
                        <span className="text-xs text-gray-500">/ {apiUsage.redfin?.limit ?? 111}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            ((apiUsage.redfin?.remaining ?? 0) / (apiUsage.redfin?.limit ?? 111)) > 0.5 ? 'bg-green-500' :
                            ((apiUsage.redfin?.remaining ?? 0) / (apiUsage.redfin?.limit ?? 111)) > 0.25 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${((apiUsage.redfin?.remaining ?? 0) / (apiUsage.redfin?.limit ?? 111)) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Gemini AI */}
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700">Gemini AI</span>
                        <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                          Fallback
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-gray-900">{apiUsage.gemini?.remaining ?? 0}</span>
                        <span className="text-xs text-gray-500">/ {apiUsage.gemini?.limit ?? 1500}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            ((apiUsage.gemini?.remaining ?? 0) / (apiUsage.gemini?.limit ?? 1500)) > 0.5 ? 'bg-green-500' :
                            ((apiUsage.gemini?.remaining ?? 0) / (apiUsage.gemini?.limit ?? 1500)) > 0.25 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${((apiUsage.gemini?.remaining ?? 0) / (apiUsage.gemini?.limit ?? 1500)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
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
                  history={propertyHistory.slice(0, 6)}
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
                        {analysisResults.property?.address || formData?.address}, {analysisResults.property?.city || formData?.city}, {analysisResults.property?.state || formData?.state} {analysisResults.property?.zip || formData?.zip}
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
