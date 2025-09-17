import { useLocation } from "react-router-dom";
import { Button, Card, Text, Icon, DropdownMenu } from "@gravity-ui/uikit";
import { ArrowLeft, Globe } from "@gravity-ui/icons";
import Logo from "./../assets/Logo.svg";
import { useEffect, useState } from "react";
import { LANGUAGES, VIDEO_TYPES } from "../components/hard-data";
import { useTranslation } from "react-i18next";

export default function VideoLayout({
  isFisrtPage,
  programUrl,
}: {
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
  }, [pathname, programUrl]);

  return (
    <div className="flex flex-col min-h-screen w-screen bg-white">
      {/* Video Section - 40% of screen height */}
      <div className="h-[40vh] w-full flex justify-center items-center relative overflow-hidden">
        <iframe
          src={`/test_video_sensor_terminal.mp4`}
          allow="autoplay"
          id="video"
          className="hidden"
        />
        {!pathname.includes("/programs") &&
        VIDEO_TYPES.some((ext: string) =>
          attachemntUrl.baseUrl.endsWith(ext)
        ) ? (
          <video
            className="w-full h-full object-cover"
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
              className="w-full h-full object-cover"
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
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <img
            src={`${attachemntUrl.baseUrl}`}
            alt="Promotion img"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Content Section - 60% of screen height */}
      <div className="flex-1 flex flex-col">
        {/* Header with Logo and Controls */}
        <Card className="mx-7 my-5 p-4 shadow-lg border-0">
          <div className="flex justify-between items-center">
            <img src={Logo} alt="Logo" className="h-12" />
            <div className="flex items-center gap-4">
              {/* Language Dropdown */}
              <DropdownMenu
                items={Object.entries(LANGUAGES).map(([key, lng]) => ({
                  action: () => i18n.changeLanguage(key),
                  text: lng.label,
                }))}
              >
                <Button
                  view="action"
                  size="l"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Icon data={Globe} size={20} />
                </Button>
              </DropdownMenu>

              {/* Navigation Button */}
              <Button
                view="outlined"
                size="l"
                className="px-6 py-3 rounded-2xl border-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-300"
              >
                {isFisrtPage ? (
                  <Text className="text-lg font-semibold">{t("Инструкция")}</Text>
                ) : (
                  <Icon data={ArrowLeft} size={20} />
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Content Area */}
        <div className="flex-1 px-7 pb-7">
          {/* This will be replaced with specific content based on the page */}
        </div>
      </div>
    </div>
  );
}
