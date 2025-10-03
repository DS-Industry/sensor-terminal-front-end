import { useState, useEffect } from 'react';

export const useMediaCampaign = (programUrl?: string) => {
  const [attachemntUrl, setAttachemntUrl] = useState<{
    baseUrl: string;
    programUrl: string;
  }>({
    baseUrl: `${import.meta.env.VITE_ATTACHMENT_BASE_URL}`,
    programUrl: "",
  });

  const [mediaStatus, setMediaStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    if (programUrl) {
      const fullProgramUrl = `${import.meta.env.VITE_S3_URL}/${programUrl}`;
      
      // Сбрасываем статус при смене URL
      setMediaStatus('loading');
      
      // Проверяем загружается ли изображение
      const img = new Image();
      img.onload = () => {
        setMediaStatus('loaded');
        setAttachemntUrl({
          baseUrl: `${import.meta.env.VITE_ATTACHMENT_BASE_URL}`,
          programUrl: fullProgramUrl,
        });
      };
      img.onerror = () => {
        setMediaStatus('error');
        setAttachemntUrl({
          baseUrl: `${import.meta.env.VITE_ATTACHMENT_BASE_URL}`,
          programUrl: "", // Очищаем programUrl при ошибке
        });
      };
      img.src = fullProgramUrl;
    } else {
      setAttachemntUrl({
        baseUrl: `${import.meta.env.VITE_ATTACHMENT_BASE_URL}`,
        programUrl: "",
      });
      setMediaStatus('loaded');
    }
  }, [programUrl]);

  return { 
    attachemntUrl,
    mediaStatus // Возвращаем статус для компонента
  };
};