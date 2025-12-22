import { useState, useEffect, useRef } from 'react';
import { env } from '../config/env';
import useStore from '../components/state/store';

export const useMediaCampaign = (_programUrl?: string) => {
  const car_wash_id = useStore((state) => state.car_wash_id);
  const cachedBannerUrl = useStore((state) => state.bannerUrl);
  const setBannerUrl = useStore((state) => state.setBannerUrl);
  const [bannerUrl, setLocalBannerUrl] = useState<string>(cachedBannerUrl || '');
  const [mediaStatus, setMediaStatus] = useState<'loading' | 'loaded' | 'error'>(
    cachedBannerUrl ? 'loaded' : 'loading'
  );
  const isLoadingRef = useRef(false);

  useEffect(() => {
    // Если есть car_wash_id, сначала пробуем car_wash_id/banner.webp, затем fallback на /banner.webp
    if (car_wash_id) {
      const carWashBannerUrl = `${env.VITE_S3_URL}/${car_wash_id}/banner.webp`;
      const fallbackBannerUrl = `${env.VITE_S3_URL}/banner.webp`;
      
      // Если уже есть закешированный URL и он соответствует текущему car_wash_id, используем его сразу
      if (cachedBannerUrl === carWashBannerUrl || cachedBannerUrl === fallbackBannerUrl) {
        setLocalBannerUrl(cachedBannerUrl);
        setMediaStatus('loaded');
        return;
      }

      // Если уже загружаем, не начинаем заново
      if (isLoadingRef.current) {
        return;
      }

      isLoadingRef.current = true;
      setMediaStatus('loading');
      
      // Пробуем загрузить car_wash_id специфичный banner
      const img = new Image();
      
      img.onload = () => {
        setLocalBannerUrl(carWashBannerUrl);
        setBannerUrl(carWashBannerUrl); // Сохраняем в store для кеширования
        setMediaStatus('loaded');
        isLoadingRef.current = false;
      };
      
      img.onerror = () => {
        // Если не загрузился, пробуем fallback banner
        const fallbackImg = new Image();
        
        fallbackImg.onload = () => {
          setLocalBannerUrl(fallbackBannerUrl);
          setBannerUrl(fallbackBannerUrl); // Сохраняем в store для кеширования
          setMediaStatus('loaded');
          isLoadingRef.current = false;
        };
        
        fallbackImg.onerror = () => {
          setLocalBannerUrl('');
          setMediaStatus('error');
          isLoadingRef.current = false;
        };
        
        fallbackImg.src = fallbackBannerUrl;
      };
      
      img.src = carWashBannerUrl;
      return;
    }

    // Если нет car_wash_id, используем дефолтное изображение
    setLocalBannerUrl('');
    setMediaStatus('loaded');
    isLoadingRef.current = false;
  }, [car_wash_id, cachedBannerUrl, setBannerUrl]);

  return { 
    attachemntUrl: {
      baseUrl: '', // Не используем baseUrl, чтобы избежать fallback на media-campaign.webp
      programUrl: bannerUrl,
    },
    mediaStatus
  };
};