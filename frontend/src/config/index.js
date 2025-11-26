/**
 * Application Configuration
 * 
 * This file centralizes all environment-based configuration.
 * React will automatically use:
 * - .env.local for development (npm start)
 * - .env.production for production builds (npm run build)
 * 
 * All environment variables must be prefixed with REACT_APP_ to be accessible.
 */

const config = {
  // API Configuration
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  
  // Feature Flags
  featureFlag: process.env.REACT_APP_FEATURE_FLAG === 'true',
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Other configuration can be added here as needed
};

// Freeze the config object to prevent modifications
export default Object.freeze(config);
