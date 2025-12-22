import { useRef, useState, useEffect } from 'react';
import { VIDEO_TYPES } from '../hard-data';
import { env } from '../../config/env';
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
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const { programUrl, baseUrl } = attachemntUrl || { programUrl: '', baseUrl: '' };
  const mediaUrl = programUrl || baseUrl;

  // Сбрасываем ошибку при смене URL медиа
  useEffect(() => {
    setHasPlaybackError(false);
  }, [mediaUrl]);

  if (!attachemntUrl) {
    return null;
  }

  const handleMediaError = () => {
    logger.error('Media failed to load during playback');
    setHasPlaybackError(true);
  };

  const renderMedia = () => {
    
    // Если статус ошибки или произошла ошибка во время воспроизведения - используем запасное изображение
    if (mediaStatus === 'error' || hasPlaybackError) {
      return (
        <img
          src={env.VITE_ATTACHMENT_BASE_URL}
          alt="Default media"
          className="w-full h-[890px] object-cover"
        />
      );
    }

    // Если еще загружается и нет URL - показываем пустой div
    if (mediaStatus === 'loading' && !mediaUrl) {
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
          key={mediaUrl}
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