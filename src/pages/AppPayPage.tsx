import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sally from "../assets/Saly-24.svg";
import GooglePlay from "../assets/Frame.svg";
import AppStore from "../assets/Frame_apple.svg";
import AttentionTag from "../components/tags/AttentionTag";
import Bell from "../assets/Bell_perspective_matte.svg";
import { useTranslation } from "react-i18next";
import { Button, Card as UICard, Icon, DropdownMenu } from '@gravity-ui/uikit';
import { ArrowLeft, Globe, Smartphone, QrCode } from "@gravity-ui/icons";
import Logo from "../assets/Logo.svg";
import { LANGUAGES, VIDEO_TYPES } from "../components/hard-data";

export default function AppPayPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [attachemntUrl] = useState<{
    baseUrl: string;
    programUrl: string;
  }>({
    baseUrl: `${import.meta.env.VITE_ATTACHMENT_BASE_URL}`,
    programUrl: state?.promoUrl || '',
  });

  useEffect(() => {
    if (!state || (state && (!state.programName || !state.price))) {
      navigate("/");
    }

    console.log(state);
  }, [state, navigate]);
  return (
    <div className="flex flex-col min-h-screen w-screen bg-gray-100">
      {/* Video Section - 40% of screen height */}
      <div className="h-[40vh] w-full flex justify-center items-center relative overflow-hidden">
        <iframe
          src={`/test_video_sensor_terminal.mp4`}
          allow="autoplay"
          id="video"
          className="hidden"
        />
        {attachemntUrl.programUrl && VIDEO_TYPES.some((ext: string) =>
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
        ) : attachemntUrl.programUrl ? (
          <img
            src={attachemntUrl.programUrl}
            alt="Program Image"
            className="w-full h-full object-cover"
          />
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
        <UICard className="mx-7 my-5 p-4 shadow-lg border-0">
          <div className="flex justify-between items-center">
            <img src={Logo} alt="Logo" className="h-12" />
            <div className="flex items-center gap-4">
              {/* Language Dropdown */}
              <DropdownMenu
                items={Object.entries(LANGUAGES).map(([key, lng]) => ({
                  action: () => i18n.changeLanguage(key),
                  text: (lng as { label: string }).label,
                }))}
              >
                <Button
                  view="action"
                  size="l"
                  className="px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105"
                >
                  <Icon data={Globe} size={20} />
                </Button>
              </DropdownMenu>

              {/* Back Button */}
              <button
                className="px-8 py-4 rounded-3xl text-white font-semibold text-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg"
                onClick={() => navigate("/")}
                style={{ backgroundColor: "#0B68E1" }}
              >
                <div className="flex items-center gap-2">
                  <Icon data={ArrowLeft} size={20} />
                  {t("Назад")}
                </div>
              </button>
            </div>
          </div>
        </UICard>

        {/* Main Content Area - Full Screen */}
        <div className="flex-1 flex flex-col">
          {/* Title Section */}
          <div className="text-center py-8 bg-white shadow-sm">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Icon data={Smartphone} size={32} className="text-blue-600" />
              <div className="text-gray-900 font-bold text-4xl">
                {t("Оплата через приложение")}
              </div>
            </div>
            <div className="text-gray-600 text-lg">
              {t("Используйте мобильное приложение для оплаты")}
            </div>
          </div>

          {/* Payment Interface - Full Height */}
          <div className="flex-1 flex">
            {/* Left Side - Instructions */}
            <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="max-w-2xl mx-auto px-8">
                {/* Step 1 */}
                <div className="flex items-start gap-6 mb-12">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-800 text-2xl font-semibold mb-2">
                      {t("Откройте мобильное приложение")}
                    </div>
                    <div className="text-gray-600 text-lg">
                      Запустите приложение "Мой-ка!DS" на вашем смартфоне
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-800 text-2xl font-semibold mb-2">
                      {t("Просканируйте QR-код")}
                    </div>
                    <div className="text-gray-600 text-lg">
                      {t("Используйте камеру приложения для сканирования QR-кода")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - App Details */}
            <div className="w-96 bg-gradient-to-br from-blue-500 to-blue-600 text-white flex flex-col">
              <div className="p-8 h-full flex flex-col justify-between">
                {/* App Download Section */}
                <div className="flex flex-col items-center mb-8">
                  <div className="text-white/80 text-sm mb-6 font-medium">
                    Приложение "Мой-ка!DS" можно скачать:
                  </div>
                  <div className="flex gap-4 mb-8">
                    <img
                      src={AppStore}
                      alt="App Store"
                      className="w-32 h-12 object-contain bg-white/10 rounded-lg p-2"
                    />
                    <img
                      src={GooglePlay}
                      alt="Google Play"
                      className="w-32 h-12 object-contain bg-white/10 rounded-lg p-2"
                    />
                  </div>
                  
                  {/* QR Code Placeholder */}
                  <div className="w-48 h-48 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                    <div className="text-center">
                      <Icon data={QrCode} size={64} className="text-white/60 mb-2" />
                      <div className="text-white/80 text-sm">QR-код</div>
                    </div>
                  </div>
                </div>

                {/* Program Info */}
                <div className="bg-white/10 p-4 rounded-2xl mb-6">
                  <div className="text-white/80 text-sm mb-2">{t("Программа")}</div>
                  <div className="text-white font-semibold text-lg">{t(`${state?.programName}`)}</div>
                </div>

                {/* Payment Details */}
                <div className="space-y-4">
                  <div className="bg-white/10 p-6 rounded-2xl">
                    <div className="text-white/80 text-sm mb-3">{t("К оплате")}</div>
                    <div className="text-white font-bold text-4xl">
                      {state?.price} {t("р.")}
                    </div>
                  </div>
                  
                  <div className="bg-white/20 p-4 rounded-2xl">
                    <div className="text-white/80 text-sm mb-2">{t("Ваш CashBack")}</div>
                    <div className="text-white font-bold text-2xl">+10%</div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                    <img src={Bell} alt="bell" className="w-4 h-4" />
                    <div className="text-white/90 text-sm font-medium">
                      {t("Следуйте инструкции в приложении")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
