import React from 'react';
import { ApiUsageData } from '../services/api';

interface ApiUsageDisplayProps {
  usage: ApiUsageData | null;
}

export const ApiUsageDisplay: React.FC<ApiUsageDisplayProps> = ({ usage }) => {
  if (!usage) {
    return null;
  }

  const getStatusEmoji = (percentage: number): string => {
    if (percentage >= 90) return '🔴';
    if (percentage >= 75) return '🟡';
    return '🟢';
  };

  const apis = [
    { data: usage.privateZillow, name: 'Private Zillow' },
    { data: usage.usRealEstate, name: 'US Real Estate' },
    { data: usage.redfin, name: 'Redfin' },
    { data: usage.gemini, name: 'Gemini AI' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.title}>📊 API Usage</div>

      <div style={styles.grid}>
        {apis.map(api => {
          if (!api.data) return null;

          const percentage = (api.data.used / api.data.limit) * 100;

          return (
            <div key={api.name} style={styles.card}>
              <div style={styles.cardHeader}>
                {getStatusEmoji(percentage)} {api.name}
              </div>
              <div style={styles.cardContent}>
                <strong>{api.data.remaining}</strong> remaining
              </div>
              <div style={styles.cardFooter}>
                {api.data.used}/{api.data.limit}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '12px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '10px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '12px',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  cardHeader: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  },
  cardContent: {
    fontSize: '18px',
    color: '#2196F3',
    marginBottom: '6px',
  },
  cardFooter: {
    fontSize: '11px',
    color: '#999',
  },
};

