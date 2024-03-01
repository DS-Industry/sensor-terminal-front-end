import { useLocation } from "react-router-dom";
import NavigationButton from "../components/buttons/NavigationButton";
import Logo from "./../assets/Logo.svg";
import Back from "./../assets/exit_to_app.svg";
import { IoLanguageSharp } from "react-icons/io5";
import { useEffect, useState } from "react";
import { LANGUAGES, VIDEO_TYPES } from "../components/hard-data";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "../components/ui/menubar";
import { useTranslation } from "react-i18next";

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
  const { t, i18n } = useTranslation();

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
        <div className=" w-full flex justify-between items-center py-5">
          <img src={Logo} alt="Logo" />
          <div className=" flex items-center gap-10">
            <Menubar className=" border-0">
              <MenubarMenu>
                <MenubarTrigger className="text-lg bg-gradient-to-t from-primary to-blue-650 px-5 py-2 rounded-3xl text-white-500 font-inter-semibold shadow-[0px_10px_20px_5px_rgba(0,0,0,0.3)] h-fit ">
                  <IoLanguageSharp className=" text-3xl" />
                </MenubarTrigger>
                <MenubarContent className=" bg-gradient-to-tr from-blue-500 to-blue-100 border-0 max-w-[150px] min-w-[150px] p-1 rounded-2xl">
                  {Object.entries(LANGUAGES).map(([key, lng]) => (
                    <MenubarItem
                      key={key}
                      className=" bg-primary text-white-500 w-full  text-xl my-1 rounded-3xl first:mt-0 last:mb-0"
                      onClick={() => i18n.changeLanguage(key)}
                    >
                      <p className=" w-full text-center"> {lng.label}</p>
                    </MenubarItem>
                  ))}
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
            <NavigationButton
              label={
                isFisrtPage ? t("Инструкция") : <img src={Back} alt="Back" />
              }
            />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
