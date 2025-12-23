import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';

let s3Client: S3Client | null = null;

function getS3Client(): S3Client | null {
  console.debug('[S3] Environment check:', {
    'env.VITE_S3_ENDPOINT': env.VITE_S3_ENDPOINT,
    'env.VITE_S3_BUCKET_NAME': env.VITE_S3_BUCKET_NAME,
    'env.VITE_AWS_ACCESS_KEY_ID': env.VITE_AWS_ACCESS_KEY_ID ? '***' : 'missing',
    'env.VITE_AWS_SECRET_ACCESS_KEY': env.VITE_AWS_SECRET_ACCESS_KEY ? '***' : 'missing',
    'import.meta.env.VITE_S3_ENDPOINT': import.meta.env.VITE_S3_ENDPOINT,
    'import.meta.env.VITE_S3_BUCKET_NAME': import.meta.env.VITE_S3_BUCKET_NAME,
    'import.meta.env.VITE_AWS_ACCESS_KEY_ID': import.meta.env.VITE_AWS_ACCESS_KEY_ID ? '***' : 'missing',
  });

  if (!env.VITE_S3_ENDPOINT || !env.VITE_AWS_ACCESS_KEY_ID || !env.VITE_AWS_SECRET_ACCESS_KEY || !env.VITE_S3_BUCKET_NAME) {
    console.warn('[S3] Missing S3 configuration:', {
      endpoint: !!env.VITE_S3_ENDPOINT,
      accessKeyId: !!env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: !!env.VITE_AWS_SECRET_ACCESS_KEY,
      bucketName: !!env.VITE_S3_BUCKET_NAME,
      'Raw values': {
        endpoint: env.VITE_S3_ENDPOINT || 'EMPTY',
        bucket: env.VITE_S3_BUCKET_NAME || 'EMPTY',
        hasAccessKey: !!env.VITE_AWS_ACCESS_KEY_ID,
        hasSecretKey: !!env.VITE_AWS_SECRET_ACCESS_KEY,
      },
    });
    return null;
  }

  if (!s3Client) {
    const endpoint = env.VITE_S3_ENDPOINT;
    const formattedEndpoint = endpoint.startsWith('http')
      ? endpoint
      : `https://${endpoint}`;

    console.debug('[S3] Initializing S3 client', {
      endpoint: formattedEndpoint,
      region: 'ru-central1',
      bucket: env.VITE_S3_BUCKET_NAME,
    });

    s3Client = new S3Client({
      region: 'ru-central1',
      endpoint: formattedEndpoint,
      credentials: {
        accessKeyId: env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: env.VITE_AWS_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });
  }

  return s3Client;
}

export async function uploadLogsToS3(
  logContent: string,
  carwashId: string | number | null,
  deviceId: string | number | null,
  date: Date
): Promise<string> {
  const client = getS3Client();
  
  if (!client) {
    const errorMsg = 'S3 client not configured. Please set VITE_S3_ENDPOINT, VITE_AWS_ACCESS_KEY_ID, VITE_AWS_SECRET_ACCESS_KEY, and VITE_S3_BUCKET_NAME environment variables.';
    console.error('[S3]', errorMsg);
    throw new Error(errorMsg);
  }

  if (!env.VITE_S3_BUCKET_NAME) {
    throw new Error('VITE_S3_BUCKET_NAME is not set');
  }

  try {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const dateStr = `${day}-${month}-${year}`;
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}-${minutes}`;
    
    const carWashIdStr = carwashId ? String(carwashId) : 'unknown';
    const deviceIdStr = deviceId ? String(deviceId) : 'unknown';
    const key = `logs/pos/${carWashIdStr}/robot/${deviceIdStr}/${dateStr}/${timeStr}.txt`;
    
    const encoder = new TextEncoder();
    const body = encoder.encode(logContent);
    
    console.debug('[S3] Uploading logs', {
      bucket: env.VITE_S3_BUCKET_NAME,
      key,
      size: body.length,
      carWashIdStr: carWashIdStr,
      deviceIdStr: deviceIdStr,
    });
    
    const command = new PutObjectCommand({
      Bucket: env.VITE_S3_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: 'text/plain',
    });

    const response = await client.send(command);
    
    console.info(`[S3] Successfully uploaded logs to S3: ${key}`, {
      etag: response.ETag,
      versionId: response.VersionId,
    });
    return key;
  } catch (error: any) {
    console.error('[S3] Failed to upload logs to S3:', {
      error: error.message,
      code: error.Code || error.code,
      name: error.name,
      bucket: env.VITE_S3_BUCKET_NAME,
      endpoint: env.VITE_S3_ENDPOINT,
    });
    throw error;
  }
}

export function debugS3Config(): void {
  console.log('[S3] Debug - Checking environment variables:');
  console.log('From env config:', {
    VITE_S3_ENDPOINT: env.VITE_S3_ENDPOINT || 'EMPTY',
    VITE_S3_BUCKET_NAME: env.VITE_S3_BUCKET_NAME || 'EMPTY',
    VITE_AWS_ACCESS_KEY_ID: env.VITE_AWS_ACCESS_KEY_ID ? '***SET***' : 'EMPTY',
    VITE_AWS_SECRET_ACCESS_KEY: env.VITE_AWS_SECRET_ACCESS_KEY ? '***SET***' : 'EMPTY',
  });
  console.log('From import.meta.env:', {
    VITE_S3_ENDPOINT: import.meta.env.VITE_S3_ENDPOINT || 'UNDEFINED',
    VITE_S3_BUCKET_NAME: import.meta.env.VITE_S3_BUCKET_NAME || 'UNDEFINED',
    VITE_AWS_ACCESS_KEY_ID: import.meta.env.VITE_AWS_ACCESS_KEY_ID ? '***SET***' : 'UNDEFINED',
    VITE_AWS_SECRET_ACCESS_KEY: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY ? '***SET***' : 'UNDEFINED',
  });
  console.log('All VITE_ env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
}

export async function testS3Upload(): Promise<boolean> {
  try {
    console.log('[S3] Starting test upload...');
    debugS3Config();
    console.log('[S3] Configuration check:', {
      endpoint: env.VITE_S3_ENDPOINT,
      bucket: env.VITE_S3_BUCKET_NAME,
      hasAccessKey: !!env.VITE_AWS_ACCESS_KEY_ID,
      hasSecretKey: !!env.VITE_AWS_SECRET_ACCESS_KEY,
    });

    const testContent = `Test log entry - ${new Date().toISOString()}\nThis is a test upload to verify S3 connectivity.`;
    const testDate = new Date();
    const testKey = await uploadLogsToS3(testContent, 'test', 'test', testDate);
    console.info('[S3] ✅ Test upload successful:', testKey);
    return true;
  } catch (error: any) {
    console.error('[S3] ❌ Test upload failed:', error);
    console.error('[S3] Error details:', {
      message: error.message,
      code: error.Code || error.code,
      name: error.name,
      stack: error.stack,
    });
    return false;
  }
}

if (typeof window !== 'undefined') {
  (window as any).testS3Upload = testS3Upload;
  (window as any).debugS3Config = debugS3Config;
  console.log('[S3] Functions available:');
  console.log('  - window.testS3Upload() - Test S3 upload');
  console.log('  - window.debugS3Config() - Debug environment variables');
}
