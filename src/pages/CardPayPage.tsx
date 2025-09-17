import Wifi from "./../assets/wifi.svg";
import Card from "./../assets/card-big.svg";
import Mir from "./../assets/mir-logo 1.svg";
import { FaApplePay, FaGooglePay } from "react-icons/fa6";
import { RiMastercardLine, RiVisaLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Card as UICard, Icon, DropdownMenu } from '@gravity-ui/uikit';
import { ArrowLeft, Globe, CreditCard } from "@gravity-ui/icons";
import Logo from "../assets/Logo.svg";
import { LANGUAGES, VIDEO_TYPES } from "../components/hard-data";

export default function CardPayPage() {
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
              <Icon data={CreditCard} size={32} className="text-blue-600" />
              <div className="text-gray-900 font-bold text-4xl">
                {t("Оплата картой")}
              </div>
            </div>
            <div className="text-gray-600 text-lg">
              {t("Приложите банковскую карту для оплаты")}
            </div>
          </div>

          {/* Payment Interface - Full Height */}
          <div className="flex-1 flex">
            {/* Left Side - Instructions and Graphics */}
            <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="relative mb-12">
                <img src={Wifi} alt="wifi" className="w-80 h-80 object-contain" />
                <img
                  src={Card}
                  alt="card"
                  className="absolute -bottom-12 -right-12 w-96 h-60 object-contain"
                />
              </div>
              <div className="text-center max-w-md">
                <div className="text-gray-800 text-2xl font-semibold mb-4">
                  {t("Поднесите карту к терминалу")}
                </div>
                <div className="text-gray-600 text-lg">
                  {t("Дождитесь подтверждения оплаты")}
                </div>
              </div>
            </div>

            {/* Right Side - Payment Details */}
            <div className="w-96 bg-gradient-to-br from-blue-500 to-blue-600 text-white flex flex-col">
              <div className="p-8 h-full flex flex-col justify-between">
                {/* Payment Methods */}
                <div className="flex flex-col items-center mb-12">
                  <div className="text-white/80 text-sm mb-6 font-medium">{t("Поддерживаемые карты")}</div>
                  <div className="flex flex-wrap justify-center gap-6">
                    <RiMastercardLine className="text-white text-5xl" />
                    <RiVisaLine className="text-white text-5xl" />
                    <img src={Mir} alt="mir" className="w-16 h-16 object-contain" />
                    <FaGooglePay className="text-white text-5xl" />
                    <FaApplePay className="text-white text-5xl" />
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-6">
                  <div className="bg-white/10 p-4 rounded-2xl">
                    <div className="text-white/80 text-sm mb-2">{t("Программа")}</div>
                    <div className="text-white font-semibold text-lg">{t(`${state?.programName}`)}</div>
                  </div>
                  
                  <div className="bg-white/10 p-6 rounded-2xl">
                    <div className="text-white/80 text-sm mb-3">{t("К оплате")}</div>
                    <div className="text-white font-bold text-5xl">
                      {state?.price} {t("р.")}
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    <div className="text-white/90 text-sm font-medium">
                      {t("Ожидание карты...")}
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
