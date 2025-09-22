import { useState } from 'react';

export const useMediaCampaign = (programUrl?: string) => {
  const [attachemntUrl] = useState<{
    baseUrl: string;
    programUrl: string;
  }>({
    baseUrl: `${import.meta.env.VITE_ATTACHMENT_BASE_URL}`,
    programUrl: programUrl || '',
  });

  return { attachemntUrl };
};