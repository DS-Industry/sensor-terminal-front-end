import { useLocation } from "react-router-dom";
import NavigationButton from "../components/buttons/NavigationButton";
import Logo from "./../assets/Logo.svg";
import Back from "./../assets/exit_to_app.svg";
import { useEffect, useState } from "react";
import { VIDEO_TYPES } from "../components/hard-data";

export default function VideoLayout({
  children,
  isFisrtPage,
  programUrl,
}: {
  children: React.ReactNode;
  isFisrtPage?: boolean;
  programUrl?: string;
}) {
  const { pathname } = useLocation();

  const [attachemntUrl, setAttachmentUrl] = useState<{
    baseUrl: string;
    programUrl: string;
  }>({
    baseUrl: `${import.meta.env.VITE_ATTACHMENT_BASE_URL}`,
    programUrl: ``,
  });

  useEffect(() => {
    if (pathname.includes("/programs") && programUrl) {
      console.log("here");
      setAttachmentUrl((prevValue) => {
        return {
          ...prevValue,
          programUrl: programUrl,
        };
      });
    }
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen w-screen bg-white-500">
      <div className=" min-h-[50vh] h-[50vh] w-full flex justify-center items-center text-white">
        <iframe
          src={`/test_video_sensor_terminal.mp4`}
          allow="autoplay"
          id="video"
          className=" hidden"
        ></iframe>
        {!pathname.includes("/programs") &&
        VIDEO_TYPES.some((ext: string) =>
          attachemntUrl.baseUrl.endsWith(ext)
        ) ? (
          <video
            className="w-full h-[50vh] object-cover"
            width="320"
            height="240"
            autoPlay
            loop
            muted
          >
            <source src={attachemntUrl.baseUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : pathname.includes("/programs") && attachemntUrl.programUrl ? (
          VIDEO_TYPES.some((ext: string) =>
            attachemntUrl.programUrl.endsWith(ext)
          ) ? (
            <video
              className="w-full h-[50vh] object-cover"
              width="320"
              height="240"
              autoPlay
              loop
              muted
            >
              <source src={attachemntUrl.programUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={attachemntUrl.programUrl}
              alt="Program Image"
              className="w-full h-[50vh] object-cover"
            />
          )
        ) : (
          <img
            src={`${attachemntUrl.baseUrl}`}
            alt="Promotion img"
            className="w-full h-[50vh] object-cover"
          />
        )}
      </div>
      <div className="px-7 z-10">
        <div className=" w-full flex justify-between py-5">
          <img src={Logo} alt="Logo" />
          <NavigationButton
            label={isFisrtPage ? "Инструкция" : <img src={Back} alt="Back" />}
          />
        </div>
        {children}
      </div>
    </div>
  );
}
