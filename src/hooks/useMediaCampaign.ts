import { useMemo } from 'react';
import { env } from '../config/env';
import useStore from '../components/state/store';

export const useMediaCampaign = (programUrl?: string) => {
  const car_wash_id = useStore((state) => state.car_wash_id);
  
  const { attachemntUrl, mediaStatus } = useMemo(() => {
    // Если есть car_wash_id, используем banner из S3
    if (car_wash_id) {
      return {
        attachemntUrl: {
          baseUrl: env.VITE_ATTACHMENT_BASE_URL || '',
          programUrl: `${env.VITE_S3_URL}/${car_wash_id}/banner.webp`,
        },
        mediaStatus: 'loaded' as const,
      };
    }

    // Если нет car_wash_id, используем дефолтное изображение
    if (programUrl) {
      return {
        attachemntUrl: {
          baseUrl: env.VITE_ATTACHMENT_BASE_URL || '',
          programUrl: `${env.VITE_S3_URL}/${programUrl}`,
        },
        mediaStatus: 'loaded' as const,
      };
    }

    return {
      attachemntUrl: {
        baseUrl: env.VITE_ATTACHMENT_BASE_URL || '',
        programUrl: "",
      },
      mediaStatus: 'loaded' as const,
    };
  }, [programUrl, car_wash_id]);

  return { 
    attachemntUrl,
    mediaStatus
  };
};