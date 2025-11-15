import { useEffect, useState } from 'react';
import { ApiUsageData } from './services/api';
import { mockAnalyzeProperty, getMockApiUsage } from './services/mockApi';
import { PropertyFormData, PropertyAnalysisResult } from './types/property';
import PropertyForm from './components/PropertyForm';
import AnalysisResults from './components/AnalysisResults';

type ViewMode = 'form' | 'results';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<PropertyAnalysisResult | null>(null);
  const [apiUsage, setApiUsage] = useState<ApiUsageData | null>(null);

  useEffect(() => {
    // Fetch API usage on mount (using mock data for now)
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

    fetchUsage();
  }, []);

  const handleFormSubmit = async (data: PropertyFormData) => {
    setLoading(true);
    setError('');

    try {
      // Using mock API for now (no CORS issues)
      const response = await mockAnalyzeProperty(data);

      if (response.success && response.data) {
        setAnalysisResults(response.data as PropertyAnalysisResult);
        setViewMode('results');

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

  const handleNewAnalysis = () => {
    setViewMode('form');
    setAnalysisResults(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
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
        <div className="max-w-4xl mx-auto">
          {viewMode === 'form' ? (
            <PropertyForm onSubmit={handleFormSubmit} loading={loading} />
          ) : analysisResults ? (
            <AnalysisResults results={analysisResults} onNewAnalysis={handleNewAnalysis} />
          ) : null}
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="border-t border-gray-200 pt-8">
              <p className="text-gray-600 text-sm font-medium">
                © 2025 Real Estate Analysis Tool
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
  );
}

export default App;
