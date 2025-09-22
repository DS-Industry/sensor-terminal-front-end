import { useEffect, useRef } from 'react';
import { VIDEO_TYPES } from '../hard-data';

interface IMediaCampaign {
  attachemntUrl: {
    baseUrl: string;
    programUrl: string;
  };
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

  console.log(attachemntUrl.baseUrl);

  useEffect(() => {
    const preloadMedia = async () => {
      if (attachemntUrl.baseUrl && loading === 'eager') {
        try {
          if (VIDEO_TYPES.some(ext => attachemntUrl.baseUrl.endsWith(ext))) {
            const video = document.createElement('video');
            video.preload = preload;
            video.src = attachemntUrl.baseUrl;
          } else {
            const img = new Image();
            img.src = attachemntUrl.baseUrl;
          }
        } catch (err) {
          console.warn('Preloading failed:', err);
        }
      }
    };

    preloadMedia();
  }, [attachemntUrl.baseUrl, loading, preload]);

  const renderMedia = () => {
    const { programUrl, baseUrl } = attachemntUrl;
    const mediaUrl = programUrl || baseUrl;

    if (!mediaUrl) {
      return (
        <img
          src="../../assets/spare-media.webp"
          alt="Default media"
          className="w-full h-full object-cover"
        />
      );
    }

    const isVideo = VIDEO_TYPES.some(ext => mediaUrl.endsWith(ext));

    if (isVideo) {
      return (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            controls={controls}
            preload={preload}
            playsInline
          >
            <source src={mediaUrl} type="video/mp4" />
            <source src={mediaUrl} type="video/webm" />
          </video>
        </>
      );
    } else {
      return (
        <>
          <img
            src={mediaUrl}
            alt={programUrl ? "Program Image" : "Promotion Image"}
            className="w-full h-full object-cover"
            loading={loading}
          />
        </>
      );
    }
  };

  return (
    <div className="h-[40vh] w-full flex justify-center items-center relative overflow-hidden">
      {renderMedia()}
    </div>
  );
}