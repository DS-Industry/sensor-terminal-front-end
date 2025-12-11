import { env } from '../config/env';

export const getS3LogoUrl = (logoName: string): string => {
  return `${env.VITE_S3_URL}/${logoName}`;
};
