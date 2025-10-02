import { useEffect, useRef, useState } from "react";
import GooglePlay from "../assets/Frame.svg";
import AppStore from "../assets/Frame_apple.svg";
import Bell from "../assets/Bell_perspective_matte.svg";
import { useTranslation } from "react-i18next";
import { Smartphone, QrCode } from "@gravity-ui/icons";
import MediaCampaign from "../components/mediaCampaign/mediaCampaign";
import { useMediaCampaign } from "../hooks/useMediaCampaign";
import useStore from "../components/state/store";
import HeaderWithLogo from "../components/headerWithLogo/HeaderWithLogo";
import PaymentTitleSection from "../components/paymentTitleSection/PaymentTitleSection";
import { getMobileQr, startRobot } from "../api/services/payment";
import QRCode from "react-qr-code";
import { EOrderStatus } from "../components/state/order/orderSlice";
import { useNavigate } from "react-router-dom";

const IDLE_TIME = 30000;

export default function MobilePayPage() {
  const { t } = useTranslation();
  const { attachemntUrl } = useMediaCampaign();
  const { order, selectedProgram } = useStore();
  const navigate = useNavigate();

  const [qrCode, setQrCode] = useState("");

  const orderCreatedRef = useRef(false);

  const idleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStartRobot = () => {
    console.log("Запускаем робот");
    
    if (order?.id) {
      startRobot(order.id);
      navigate('/success');
    }
  };

  const getQrCodeAsync = async () => {
    if (selectedProgram && !orderCreatedRef.current) {
      orderCreatedRef.current = true;

      const response = await getMobileQr();

      if (response.qr_code) {
        console.log("Response qr", response);

        setQrCode(response.qr_code);

        if (!idleTimeout.current) {
          idleTimeout.current = setTimeout(() => {
            navigate('/');
          }, IDLE_TIME);
        }
      }
    }
  }

  useEffect(() => {
    getQrCodeAsync();
  }, []);

  useEffect(() => {
    if (order?.status === EOrderStatus.PAYED) {
      handleStartRobot();
    }

    return () => {
      if (idleTimeout.current) {
        clearInterval(idleTimeout.current);
        idleTimeout.current = null;
      }
    };
  }, [order]);

  return (
    <div className="flex flex-col min-h-screen w-screen bg-gray-100">
      {/* Video Section - 40% of screen height */}
      <MediaCampaign attachemntUrl={attachemntUrl} />

      {/* Content Section - 60% of screen height */}
      <div className="flex-1 flex flex-col">
        {/* Header with Logo and Controls */}
        <HeaderWithLogo />

        {/* Main Content Area - Full Screen */}
        <div className="flex-1 flex flex-col">
          {/* Title Section */}
          <PaymentTitleSection
            title="Оплата через приложение"
            description="Используйте мобильное приложение для оплаты"
            icon={Smartphone}
          />

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
                  <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center mb-6 p-4">
                    {qrCode ? (
                      <QRCode
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        value={qrCode}
                        viewBox={`0 0 256 256`}
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-white/80 text-sm">QR-код</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Program Info */}
                <div className="bg-white/10 p-4 rounded-2xl mb-6">
                  <div className="text-white/80 text-sm mb-2">{t("Программа")}</div>
                  <div className="text-white font-semibold text-lg">{t(`${selectedProgram?.name}`)}</div>
                </div>

                {/* Payment Details */}
                <div className="space-y-4">
                  <div className="bg-white/10 p-6 rounded-2xl">
                    <div className="text-white/80 text-sm mb-3">{t("К оплате")}</div>
                    <div className="text-white font-bold text-4xl">
                      {Number(selectedProgram?.price)} {t("р.")}
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
