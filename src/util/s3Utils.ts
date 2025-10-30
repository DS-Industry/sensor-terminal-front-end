export const getS3LogoUrl = (logoName: string): string => {
  return `${import.meta.env.VITE_S3_URL}/${logoName}`;
};
