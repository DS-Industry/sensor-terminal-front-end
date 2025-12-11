import Cash from "./../assets/cash.svg";
import AttentionTag from "../components/tags/AttentionTag";
import { useTranslation } from "react-i18next";
import { CreditCard } from "@gravity-ui/icons";
import MediaCampaign from "../components/mediaCampaign/mediaCampaign";
import { useMediaCampaign } from "../hooks/useMediaCampaign";
import HeaderWithLogo from "../components/headerWithLogo/HeaderWithLogo";
import PaymentTitleSection from "../components/paymentTitleSection/PaymentTitleSection";
import useStore from "../components/state/store";
import { EPaymentMethod } from "../components/state/order/orderSlice";
import { usePaymentFlow } from "../hooks/payment/usePaymentFlow";
import SuccessPayment from "../components/successPayment/SuccessPayment";

const CASH_PAGE_URL = "CashPage.webp";

export default function CashPayPage() {
  const { t } = useTranslation();
  const { attachemntUrl, mediaStatus } = useMediaCampaign(CASH_PAGE_URL);
  const { insertedAmount } = useStore();

  const { selectedProgram, handleBack, paymentSuccess, handleStartRobot, timeUntilRobotStart } = usePaymentFlow(EPaymentMethod.CASH);

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
            title="Оплата Наличными"
            description="Внесите купюры в купюроприемник"
            icon={CreditCard}
            iconClassName="text-green-600"
          />

          {/* Payment Interface - Full Height */}
          <div className="flex-1 flex">
            {/* Left Side - Instructions and Graphics */}

            {paymentSuccess
              ? <SuccessPayment />
              : (
                <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                  <div className="relative mb-12">
                    {/* Cash Machine Visual */}
                    <div className="relative">
                      <div className="w-80 h-48 bg-gradient-to-b from-gray-600 to-gray-700 rounded-t-2xl shadow-lg flex justify-center items-end pb-4">
                        <div className="w-64 h-8 bg-gray-500 rounded"></div>
                      </div>
                      <div className="w-80 h-20 bg-gradient-to-b from-gray-600 to-gray-700 rounded-b-2xl shadow-lg flex justify-center items-start pt-4">
                        <div className="w-64 h-8 bg-gray-500 rounded"></div>
                      </div>
                      <img
                        src={Cash}
                        alt="cash"
                        className="absolute -bottom-8 -right-8 w-80 h-48 object-contain -rotate-90"
                      />
                    </div>
                  </div>

                  <div className="text-center max-w-md">
                    <div className="text-gray-800 text-2xl font-semibold mb-4">
                      {t("Внесите купюры в купюроприемник")}
                    </div>
                    <div className="text-gray-600 text-lg mb-6">
                      {t("Принимаются купюры номиналом:")}
                    </div>
                    <div className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-2xl font-bold text-xl">
                      50 / 100 / 200
                    </div>
                  </div>
                </div>
              )}

            {/* Right Side - Payment Details */}
            <div className="w-96 bg-gradient-to-br from-green-500 to-green-600 text-white flex flex-col">
              <div className="p-8 h-full flex flex-col justify-between">
                {/* Program Info */}
                <div className="bg-white/10 p-4 rounded-2xl mb-6">
                  <div className="text-white/80 text-sm mb-2">{t("Программа")}</div>
                  <div className="text-white font-semibold text-lg">{t(`${selectedProgram?.name}`)}</div>
                </div>

                {/* Payment Details */}
                <div className="space-y-6 flex-1">
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
                          className="w-full px-8 py-4 rounded-3xl text-green-600  font-semibold text-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg z-50 mb-2"
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
                      <>
                        <div className="bg-white/10 p-6 rounded-2xl">
                          <div className="text-white/80 text-sm mb-3">{t("Внесено")}</div>
                          <div className="text-white font-bold text-5xl">
                            {insertedAmount} {t("р.")}
                          </div>
                        </div>

                        {/* Remaining Amount */}
                        <div className="bg-white/20 p-4 rounded-2xl">
                          <div className="text-white/80 text-sm mb-2">{t("Осталось внести")}</div>
                          <div className="text-white font-bold text-3xl">
                            {Math.max(0, (Number(selectedProgram?.price) || 0) - insertedAmount)} {t("р.")}
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                          <div className="text-white/90 text-sm font-medium">
                            {t("Внесите больше средств...")}
                          </div>
                        </div>
                      </>
                    )}
                </div>

                {/* Warning */}
                <div className="mt-6 text-center">
                  <AttentionTag
                    label={t("Терминал сдачу не выдает!")}
                    additionalStyles="text-red-300 bg-red-500/20 px-4 py-2 rounded-full text-sm"
                  />
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
