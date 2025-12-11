import Wifi from "./../assets/wifi.svg";
import Card from "./../assets/card-big.svg";
import Mir from "./../assets/mir-logo 1.svg";
import { FaApplePay, FaGooglePay } from "react-icons/fa6";
import { RiMastercardLine, RiVisaLine } from "react-icons/ri";
import { useTranslation } from "react-i18next";
import { CreditCard } from "@gravity-ui/icons";
import MediaCampaign from "../components/mediaCampaign/mediaCampaign";
import { useMediaCampaign } from "../hooks/useMediaCampaign";
import PaymentTitleSection from "../components/paymentTitleSection/PaymentTitleSection";
import HeaderWithLogo from "../components/headerWithLogo/HeaderWithLogo";
import { EPaymentMethod } from "../components/state/order/orderSlice";
import { usePaymentFlow } from "../hooks/payment/usePaymentFlow";
import SuccessPayment from "../components/successPayment/SuccessPayment";

const CARD_PAGE_URL = "CardPage.webp";

export default function CardPayPage() {
  const { t } = useTranslation();
  const { attachemntUrl, mediaStatus } = useMediaCampaign(CARD_PAGE_URL);

  const { 
    selectedProgram, 
    handleBack, 
    paymentSuccess,
    handleStartRobot,
    timeUntilRobotStart 
  } = usePaymentFlow(EPaymentMethod.CARD);

  return (
    <div className="flex flex-col min-h-screen w-screen bg-gray-100">
      {/* Video Section - 40% of screen height */}
      <MediaCampaign attachemntUrl={attachemntUrl} mediaStatus={mediaStatus}/>
      
      {/* Content Section - 60% of screen height */}
      <div className="flex-1 flex flex-col">
        {/* Header with Logo and Controls */}
        <HeaderWithLogo backButtonClick={handleBack} />

        {/* Main Content Area - Full Screen */}
        <div className="flex-1 flex flex-col">
          {/* Title Section */}
          <PaymentTitleSection
            title="Оплата картой"
            description="Приложите банковскую карту для оплаты"
            icon={CreditCard}
          />

          {/* Payment Interface - Full Height */}
          <div className="flex-1 flex justify-end">
            {/* Left Side - Instructions and Graphics */}

            {paymentSuccess
              ? <SuccessPayment />
              : (
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
              )}

            {/* Right Side - Payment Details */}
            <div className="w-96 bg-gradient-to-br from-blue-500 to-blue-600 text-white flex flex-col">
              <div className="p-8 h-full flex flex-col justify-start gap-6">
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
                    <div className="text-white font-semibold text-lg">{t(`${selectedProgram?.name}`)}</div>
                  </div>

                  <div className="bg-white/10 p-6 rounded-2xl">
                    <div className="text-white/80 text-sm mb-3">{paymentSuccess ? t("Оплачено") : t("К оплате")}</div>
                    <div className="text-white font-bold text-5xl">
                      {selectedProgram?.price} {t("р.")}
                    </div>
                  </div>

                  {paymentSuccess
                    ? (
                      <div className="flex flex-col items-center">
                        <button
                          className="w-full px-8 py-4 rounded-3xl text-blue-600 font-semibold text-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg z-50 mb-2"
                          onClick={handleStartRobot}
                          style={{ backgroundColor: "white" }}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {t("Запустить")}
                          </div>
                        </button>
                        {timeUntilRobotStart > 0 && (
                          <div className="text-white/80 text-l">
                            {t("Автоматический запуск через")} {timeUntilRobotStart} {t("сек.")}
                          </div>
                        )}
                      </div>
                    )
                    : (
                      <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                        <div className="text-white/90 text-sm font-medium">
                          {t("Ожидание карты...")}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/*{isLoyaltyCardModalOpen && (*/}
      {/*  <LoyaltyCardModal onSkipLoyalty={handleSkipLoyalty} />*/}
      {/*)}*/}
    </div>
  );
}
