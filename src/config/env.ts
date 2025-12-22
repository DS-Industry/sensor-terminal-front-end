interface EnvConfig {
  VITE_API_BASE_URL: string;
  VITE_API_BASE_WS_URL: string;
  VITE_S3_URL?: string;
  VITE_ATTACHMENT_BASE_URL?: string;
  VITE_REFRESH_INTERVAL?: string;
  VITE_S3_ENDPOINT?: string;
  VITE_AWS_ACCESS_KEY_ID?: string;
  VITE_AWS_SECRET_ACCESS_KEY?: string;
  VITE_S3_BUCKET_NAME?: string;
}

const REQUIRED_ENV_VARS = [
  'VITE_API_BASE_URL',
  'VITE_API_BASE_WS_URL',
] as const;

const OPTIONAL_ENV_VARS = {
  VITE_S3_URL: '',
  VITE_ATTACHMENT_BASE_URL: '',
  VITE_REFRESH_INTERVAL: '3600000',
  VITE_S3_ENDPOINT: '',
  VITE_AWS_ACCESS_KEY_ID: '',
  VITE_AWS_SECRET_ACCESS_KEY: '',
  VITE_S3_BUCKET_NAME: '',
} as const;

function validateEnv(): EnvConfig {
  const missingVars: string[] = [];
  const config: Partial<EnvConfig> = {};

  for (const varName of REQUIRED_ENV_VARS) {
    const value = import.meta.env[varName];
    if (!value || value.trim() === '') {
      missingVars.push(varName);
    } else {
      config[varName as keyof EnvConfig] = value;
    }
  }

  for (const [varName, defaultValue] of Object.entries(OPTIONAL_ENV_VARS)) {
    const rawValue = import.meta.env[varName];
    const value = rawValue || defaultValue;
    config[varName as keyof EnvConfig] = value;
    
    if (varName.includes('S3') || varName.includes('AWS')) {
      console.debug(`[Env] ${varName}:`, {
        raw: rawValue || 'undefined',
        final: value || 'empty',
        hasValue: !!rawValue,
      });
    }
  }

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}\n` +
      `Please ensure these variables are set in your .env file or build configuration.`;
    
    // Note: Logger is not available during bootstrap, console.error is acceptable here
    console.error('❌ Environment Configuration Error:', errorMessage);

    if (import.meta.env.DEV) {
      throw new Error(errorMessage);
    }
    
    throw new Error('Application configuration error. Please contact support.');
  }

  return config as EnvConfig;
}

export const env = validateEnv();

export const getRefreshInterval = (): number => {
  const interval = env.VITE_REFRESH_INTERVAL || OPTIONAL_ENV_VARS.VITE_REFRESH_INTERVAL;
  return parseInt(interval, 10) || 3600000;
};

// Note: Logger is not available at this point during module initialization
// These logs only appear in development mode and are acceptable
if (import.meta.env.DEV) {
  console.log('✅ Environment variables validated successfully');
  console.log('📋 Configuration:', {
    API_BASE_URL: env.VITE_API_BASE_URL,
    WS_BASE_URL: env.VITE_API_BASE_WS_URL,
    S3_URL: env.VITE_S3_URL || 'Not set',
    ATTACHMENT_BASE_URL: env.VITE_ATTACHMENT_BASE_URL || 'Not set',
    REFRESH_INTERVAL: getRefreshInterval(),
    S3_ENDPOINT: env.VITE_S3_ENDPOINT || 'Not set',
    S3_BUCKET: env.VITE_S3_BUCKET_NAME || 'Not set',
    AWS_ACCESS_KEY_ID: env.VITE_AWS_ACCESS_KEY_ID ? '***' : 'Not set',
  });
}

