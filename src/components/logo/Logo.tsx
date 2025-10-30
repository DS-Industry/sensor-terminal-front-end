import { useState } from 'react';
import { getS3LogoUrl } from '../../util/s3Utils';

const LOGO_URL = "Logo.webp";

interface ClientLogoProps {
  alt?: string;
  className?: string;
}

export default function ClientLogo({ 
  alt, 
  className = '', 
}: ClientLogoProps) {
  const [hasError, setHasError] = useState(false);
  
  const logoUrl = LOGO_URL ? getS3LogoUrl(LOGO_URL) : "";
  
  const handleError = () => {
    setHasError(true);
  };

  if (hasError || !logoUrl) {
    return (
      <div 
        className={`rounded flex items-center justify-center ${className}`}
      >
        <span className="text-gray-900 text-xl font-medium">
          РОБОТ-МОЙКА
        </span>
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={alt || "logo-client"}
      className={className || "h-12"} 
      onError={handleError}
      loading="lazy"
    />
  );
}