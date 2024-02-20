export const secondsToTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
  return formattedTime;
};

export const getVideoType = (url: string) => {
  const extension = url.substring(url.lastIndexOf(".") + 1);
  switch (extension.toLowerCase()) {
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "flv":
      return "video/flv";
    case "mov":
      return "video/quicktime";
    case "avi":
      return "video/x-msvideo";
    case "wmv":
      return "video/x-ms-wmv";
    case "avchd":
      return "video/x-ms-avchd";
    default:
      return null;
  }
};
