import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'Real Estate Analysis Tool',
        short_name: 'RE Analysis',
        description: 'Analyze flip and rental investment opportunities with AI-powered insights',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/script\.google\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'google-apps-script-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://script.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    // Code splitting and chunk optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'charts': ['recharts'],
          'db': ['dexie'],
          // Split by feature
          'partnership': [
            './src/components/partnershipManagement/CapitalContributions.tsx',
            './src/components/partnershipManagement/CashFlowManagement.tsx',
            './src/components/partnershipManagement/DistributionTracking.tsx',
            './src/components/partnershipManagement/PartnerInformation.tsx',
            './src/components/partnershipManagement/PartnerPerformance.tsx',
            './src/components/partnershipManagement/PartnershipSummary.tsx',
            './src/components/partnershipManagement/WaterfallConfiguration.tsx'
          ],
          'project-tracker': [
            './src/components/projectTracker/ChangeOrders.tsx',
            './src/components/projectTracker/ContractorPerformance.tsx',
            './src/components/projectTracker/CriticalMilestones.tsx',
            './src/components/projectTracker/DelaysIssues.tsx',
            './src/components/projectTracker/MaterialOrders.tsx',
            './src/components/projectTracker/PermitTracker.tsx',
            './src/components/projectTracker/ProjectSummary.tsx',
            './src/components/projectTracker/RenovationTimeline.tsx'
          ]
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000, // 1MB warning threshold
    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    }
  }
});
