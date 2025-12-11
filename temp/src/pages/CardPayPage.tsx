import Wifi from "./../assets/wifi.svg";
import Card from "./../assets/card-big.svg";
import { CreditCard } from "@gravity-ui/icons";
import { Spin } from "@gravity-ui/uikit";
import PaymentTitleSection from "../components/paymentTitleSection/PaymentTitleSection";
import HeaderWithLogo from "../components/headerWithLogo/HeaderWithLogo";
import { EPaymentMethod } from "../components/state/order/orderSlice";
import { usePaymentFlow } from "../hooks/payment/usePaymentFlow";
import SuccessPayment from "../components/successPayment/SuccessPayment";
import gazpromHeader from "../assets/gazprom-step-2-header.webp"
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../components/state/store";
import { logger } from "../util/logger";
import { navigateToErrorPayment } from "../utils/navigation";

export default function CardPayPage() {
  const navigate = useNavigate();
  const { setErrorCode } = useStore();
  const hasNavigatedToErrorRef = useRef(false);

  const { 
    selectedProgram, 
    handleBack, 
    paymentSuccess,
    isPaymentProcessing,
    paymentError,
    queueFull,
  } = usePaymentFlow(EPaymentMethod.CARD);


  useEffect(() => {
    if (paymentError && !queueFull && !hasNavigatedToErrorRef.current) {
      logger.info('[CardPayPage] Payment error detected, navigating to ErrorPaymentPage');
      hasNavigatedToErrorRef.current = true;
      setErrorCode(1002);
      navigateToErrorPayment(navigate);
    } else if (!paymentError) {
      hasNavigatedToErrorRef.current = false;
    }
  }, [paymentError, queueFull, navigate, setErrorCode]);


  return (
    <div className="flex flex-col min-h-screen w-screen bg-gray-100">
      <div className="w-full flex-shrink-0 h-48 lg:h-62">
        <img 
          src={gazpromHeader} 
          alt="Header" 
          className="w-full h-full object-cover"
          decoding="async"
        />
      </div>
      <div className="flex-1 flex flex-col">
        <HeaderWithLogo backButtonClick={handleBack} paymentSuccess={paymentSuccess} />

        <div className="flex-1 flex flex-col">
          <PaymentTitleSection
            title="Оплата картой"
            description="Приложите банковскую карту для оплаты"
            icon={CreditCard}
          />

          <div className="flex-1 flex justify-end">

            {paymentSuccess && !paymentError && !queueFull
              ? <SuccessPayment />
              : isPaymentProcessing ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="flex flex-col items-center">
                    <Spin size="xl" />
                    <p className="text-gray-800 text-3xl font-semibold mt-8 mb-4">
                      Обработка оплаты...
                    </p>
                    <p className="text-gray-600 text-xl font-medium">
                      Пожалуйста, подождите подтверждения оплаты
                    </p>
                  </div>
                </div>
              ) : queueFull ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-red-100 px-8">
                  <div className="text-center max-w-2xl">
                    <div className="text-red-600 text-4xl font-bold mb-6">
                      Очередь заполнена
                    </div>
                    <div className="text-gray-800 text-xl mb-8 bg-white p-6 rounded-2xl shadow-lg">
                      В очереди уже находится один автомобиль. Пожалуйста, подождите окончания мойки.
                    </div>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={handleBack}
                        className="px-8 py-4 bg-gray-600 text-white rounded-2xl font-semibold text-lg hover:bg-gray-700 transition-all duration-300 hover:scale-105 shadow-lg"
                        aria-label="Назад"
                      >
                        Назад
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-[#EEEEEE]">
                  <div className="relative mb-12">
                    <img 
                      src={Wifi} 
                      alt="wifi" 
                      className="w-68 h-68 object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                    <img
                      src={Card}
                      alt="card"
                      className="absolute -bottom-12 -right-12 w-96 h-60 object-contain"
                      style={{
                        animation: 'cardEnter 5s ease-in-out infinite'
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="text-center max-w-md">
                    <div className="text-gray-800 text-2xl font-semibold mb-4">
                      Поднесите карту к терминалу
                    </div>
                    <div className="text-gray-600 text-lg">
                      Дождитесь подтверждения оплаты
                    </div>
                  </div>
                </div>
              )}

            <div className="w-96 bg-[#0967E1] text-white flex flex-col">
              <div className="pt-3 px-6 h-full flex flex-col justify-start">
                <div className="flex flex-col items-center">
                </div>

                <div className="flex flex-col gap-10 py-10 justify-start h-full">
                  <div className="bg-white/10 p-4 rounded-2xl text-center">
                    <div className="text-white/80 text-sm mb-2 text-center">Программа</div>
                    <div className="text-white font-semibold text-lg text-center">{selectedProgram?.name}</div>
                  </div>

                  <div>
                    <div className="mt-3 bg-white/10 p-6 rounded-2xl">
                      <div className="flex justify-center">

                        <div className="text-white/80 text-sm mb-3 flex gap-2 items-center text-center">
                          <CreditCard />
                          {paymentSuccess && !paymentError && !queueFull 
                            ? "Оплачено" 
                            : isPaymentProcessing 
                            ? "Обработка..." 
                            : "К оплате"}
                        </div>
                      </div>
                      <div className="text-white font-bold text-5xl text-center">
                        {selectedProgram?.price} ₽
                      </div>
                    </div>

                    {paymentSuccess && !paymentError && !queueFull
                      ? (
                        <div className="mt-3 flex items-center justify-center gap-2 bg-white/20 px-4 py-2 rounded-full w-full">
                          <div className="w-3 h-3 bg-[#15FF00] rounded-full animate-pulse"></div>
                          <div className="text-white/90 text-sm font-medium">
                            Оплата успешна!
                          </div>
                        </div>
                      )
                      : isPaymentProcessing ? (
                        <div className="mt-3 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                          <div className="text-white">
                            <Spin size="s" />
                          </div>
                          <div className="text-white/90 text-sm font-medium">
                            Обработка оплаты...
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center justify-center gap-2 bg-white/20 px-4 py-2 rounded-full w-full">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                          <div className="text-white/90 text-sm font-medium">
                            Ожидание карты...
                          </div>
                        </div>
                      )}
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
