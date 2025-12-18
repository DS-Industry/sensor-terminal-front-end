import { useRef } from 'react';
import { VIDEO_TYPES } from '../hard-data';
import SpareMedia from '../../assets/spare-media.jpg';
import { logger } from '../../util/logger';

interface IMediaCampaign {
  attachemntUrl: {
    baseUrl: string;
    programUrl: string;
  };
  mediaStatus: 'loading' | 'loaded' | 'error';
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  loading?: 'eager' | 'lazy';
  preload?: 'auto' | 'metadata' | 'none';
}

export default function MediaCampaign(props: IMediaCampaign) {
  const {
    attachemntUrl,
    mediaStatus,
    autoPlay = true,
    loop = true,
    muted = true,
    controls = false,
    loading = 'eager',
    preload = 'auto',
  } = props;

  const videoRef = useRef<HTMLVideoElement>(null);

  if (!attachemntUrl) {
    return null;
  }

  const handleMediaError = () => {
    logger.error('Media failed to load during playback');
  };

  const renderMedia = () => {
    const { programUrl, baseUrl } = attachemntUrl;
    
    // Определяем какой URL использовать в приоритете
    const mediaUrl = programUrl || baseUrl;
    
    // Если статус ошибки - используем запасное изображение
    if (mediaStatus === 'error') {
      return (
        <img
          src={SpareMedia}
          alt="Default media"
          className="w-full h-[890px] object-cover"
        />
      );
    }

    // Если еще загружается - показываем пустой div
    if (mediaStatus === 'loading') {
      return (
        <div className="w-full h-[890px] bg-transparent" />
      );
    }

    // Если загружено успешно - показываем контент
    const isVideo = VIDEO_TYPES.some(ext => mediaUrl.endsWith(ext));
    
    if (isVideo) {
      return (
        <video
          ref={videoRef}
          className="w-full h-[890px] object-cover"
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          controls={controls}
          preload={preload}
          playsInline
          onError={handleMediaError}
        >
          <source src={mediaUrl} type="video/mp4" />
          <source src={mediaUrl} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      return (
        <img
          src={mediaUrl}
          alt={programUrl ? "Program Image" : "Promotion Image"}
          className="w-full h-[890px] object-cover"
          loading={loading}
          onError={handleMediaError}
        />
      );
    }
  };

  return (
    <div className="h-[890px] w-full flex justify-center items-center relative overflow-hidden">
      {renderMedia()}
    </div>
  );
}