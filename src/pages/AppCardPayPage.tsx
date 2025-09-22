import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import WifiBlue from "../assets/blue_wifi.svg";
import PromoCard from "../assets/promo_card.svg";
import { useTranslation } from "react-i18next";
import { Button, Card as UICard, Icon, DropdownMenu } from '@gravity-ui/uikit';
import { ArrowLeft, Globe, CreditCard } from "@gravity-ui/icons";
import Logo from "../assets/Logo.svg";
import { LANGUAGES } from "../components/hard-data";
import MediaCampaign from "../components/mediaCampaign/mediaCampaign";
import { useMediaCampaign } from "../hooks/useMediaCampaign";
import useStore from "../components/state/store";
import { EOrderStatus } from "../components/state/order/orderSlice";
import ClientLogo from "../components/logo/Logo";

export default function AppCardPayPage() {
  const { state } = useLocation();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {order, setOrderStatus} = useStore.getState();

  const { attachemntUrl } = useMediaCampaign();

  useEffect(() => {
    if (!state || (state && (!state.programName || !state.price))) {
      navigate("/");
    }
    setOrderStatus(EOrderStatus.PROCESSING_PAYMENT)
    console.log(state);
    console.log(order);
  }, [state, navigate]);

  return (
    <div className="flex flex-col min-h-screen w-screen bg-gray-100">
      {/* Video Section - 40% of screen height */}
      <MediaCampaign attachemntUrl={attachemntUrl}/>
  
      {/* Content Section - 60% of screen height */}
      <div className="flex-1 flex flex-col">
        {/* Header with Logo and Controls */}
        <UICard className="mx-7 my-5 p-4 shadow-lg border-0">
          <div className="flex justify-between items-center">
            <ClientLogo />
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
                {t("Оплата картой лояльности")}
              </div>
            </div>
            <div className="text-gray-600 text-lg">
              {t("Приложите карту лояльности для оплаты")}
            </div>
          </div>

          {/* Payment Interface - Full Height */}
          <div className="flex-1 flex">
            {/* Left Side - Instructions and Graphics */}
            <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="relative mb-12">
                <img src={WifiBlue} alt="wifi" className="w-80 h-80 object-contain" />
                <img
                  src={PromoCard}
                  alt="loyalty card"
                  className="absolute -bottom-12 -right-12 w-96 h-60 object-contain"
                />
              </div>
              <div className="text-center max-w-md">
                <div className="text-gray-800 text-2xl font-semibold mb-4">
                  {t("Поднесите карту лояльности к терминалу")}
                </div>
                <div className="text-gray-600 text-lg">
                  {t("Дождитесь подтверждения оплаты")}
                </div>
              </div>
            </div>

            {/* Right Side - Payment Details */}
            <div className="w-96 bg-gradient-to-br from-blue-500 to-blue-600 text-white flex flex-col">
              <div className="p-8 h-full flex flex-col justify-between">
                {/* Loyalty Card Info */}
                <div className="flex flex-col items-center mb-8">
                  <div className="text-white/80 text-sm mb-6 font-medium">
                    {t("Карта лояльности")}
                  </div>
                  <div className="w-48 h-32 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                    <div className="text-center">
                      <Icon data={CreditCard} size={48} className="text-white/60 mb-2" />
                      <div className="text-white/80 text-sm">Карта лояльности</div>
                    </div>
                  </div>
                </div>

                {/* Program Info */}
                <div className="bg-white/10 p-4 rounded-2xl mb-6">
                  <div className="text-white/80 text-sm mb-2">{t("Программа")}</div>
                  <div className="text-white font-semibold text-lg">{t(`${state?.programName}`)}</div>
                </div>

                {/* Payment Details */}
                <div className="space-y-6">
                  <div className="bg-white/10 p-6 rounded-2xl">
                    <div className="text-white/80 text-sm mb-3">{t("К оплате")}</div>
                    <div className="text-white font-bold text-5xl">
                      {state?.price} {t("р.")}
                    </div>
                  </div>
                  
                  <div className="bg-white/20 p-4 rounded-2xl">
                    <div className="text-white/80 text-sm mb-2">{t("Ваш баланс")}</div>
                    <div className="text-white font-bold text-3xl">
                      1,250 {t("баллов")}
                    </div>
                  </div>

                  <div className="bg-white/20 p-4 rounded-2xl">
                    <div className="text-white/80 text-sm mb-2">{t("Спишется баллов")}</div>
                    <div className="text-white font-bold text-3xl">
                      {state?.price} {t("баллов")}
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    <div className="text-white/90 text-sm font-medium">
                      {t("Ожидание карты лояльности...")}
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mt-6 text-center">
                  <div className="text-white/80 text-sm mb-2">{t("Преимущества карты лояльности:")}</div>
                  <div className="space-y-2">
                    <div className="text-white/90 text-xs">• {t("Накопление баллов")}</div>
                    <div className="text-white/90 text-xs">• {t("Скидки и бонусы")}</div>
                    <div className="text-white/90 text-xs">• {t("Специальные предложения")}</div>
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
