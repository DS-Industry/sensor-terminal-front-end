import { useEffect, useRef, useState } from "react";
import WifiBlue from "../assets/blue_wifi.svg";
import PromoCard from "../assets/promo_card.svg";
import { useTranslation } from "react-i18next";
import { CreditCard } from "@gravity-ui/icons";
import MediaCampaign from "../components/mediaCampaign/mediaCampaign";
import { useMediaCampaign } from "../hooks/useMediaCampaign";
import useStore from "../components/state/store";
import HeaderWithLogo from "../components/headerWithLogo/HeaderWithLogo";
import PaymentTitleSection from "../components/paymentTitleSection/PaymentTitleSection";
import { Icon } from "@gravity-ui/uikit";
import { createOrder, openLoyaltyCardReader, startRobot } from "../api/services/payment";
import { EOrderStatus, EPaymentMethod } from "../components/state/order/orderSlice";
import { useNavigate } from "react-router-dom";
import { IUcnCheckResponse } from "../api/types/payment";
import SuccessPayment from "../components/successPayment/SuccessPayment";
import { globalWebSocketManager } from "../util/websocketManager";

const LOYALTY_PAGE_URL = "LoyaltyPage.webp";
const DEPOSIT_TIME = 30000;
const START_ROBOT_INTERVAL = 35000;

// Типы статусов кард-ридера
enum CardReaderStatus {
  WAITING_CARD = 1,
  SEARCHING_DATA = 2,
  READING_COMPLETE = 3
}

export default function LoyaltyPayPage() {
  const { t } = useTranslation();
  const { attachemntUrl, mediaStatus } = useMediaCampaign(LOYALTY_PAGE_URL);
  const { selectedProgram, setIsLoading } = useStore();
  const navigate = useNavigate();

  const [loyaltyCard, setLoyaltyCard] = useState<IUcnCheckResponse | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [cardNotFound, setCardNotFound] = useState(false); 
  const [cardReaderStatus, setCardReaderStatus] = useState<CardReaderStatus>(CardReaderStatus.WAITING_CARD);

  const { order } = useStore();

  const orderCreatedRef = useRef(false);
  const loyalityEmptyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [timeUntilRobotStart, setTimeUntilRobotStart] = useState(0);

  const handleStartRobot = () => {
    console.log("Запускаем робот");

    if (order?.id) {
      startRobot(order.id);
      navigate('/success');
    }
  };

  const handleFinish = () => {
    navigate("/");
  };

  const clearLoyaltyTimers = () => {
    if (loyalityEmptyTimeoutRef.current) {
      clearTimeout(loyalityEmptyTimeoutRef.current);
      loyalityEmptyTimeoutRef.current = null;
    }
  };

  // Создание заказа только при нажатии "Оплатить"
  const createOrderAsync = async () => {
    if (!selectedProgram || orderCreatedRef.current || !loyaltyCard?.ucn) {
      console.log(`[LoyaltyPayPage] Ошибка создания заказа`);
      return;
    }

    orderCreatedRef.current = true;

    const ucn = loyaltyCard.ucn;

    try {
      setIsLoading(true);
      await createOrder({
        program_id: selectedProgram.id,
        payment_type: EPaymentMethod.LOYALTY,
        ucn: ucn,
      });
      console.log(`[LoyaltyPayPage] Создали заказ с UCN`);
    } catch (err) {
      console.error(`[LoyaltyPayPage] Ошибка создания заказа`, err);
      setIsLoading(false);
    }
  };

  // Обработчик веб-сокет событий кард-ридера
  const handleCardReaderEvent = (data: any) => {
    if (data.type === 'card_reader' && data.code) {
      console.log(`[LoyaltyPayPage] Получен статус кард-ридера:`, data.code);
      setCardReaderStatus(data.code);

      switch (data.code) {
        case CardReaderStatus.WAITING_CARD:
          console.log("Ожидание карты");
          setIsLoading(false);
          break;
        case CardReaderStatus.SEARCHING_DATA:
          console.log("Поиск данных по карте");
          setIsLoading(true);
          break;
        case CardReaderStatus.READING_COMPLETE:
          console.log("Чтение карты завершено");
          // При завершении чтения получаем данные карты
          handleCardReadComplete();
          break;
      }
    }
  };

  // Обработка завершения чтения карты
  const handleCardReadComplete = async () => {
    try {
      // Получаем данные карты из ответа openLoyaltyCardReader
      const cardData = await openLoyaltyCardReader();
      console.log("[LoyaltyPayPage] Данные карты:", cardData);

      if (cardData && cardData.ucn) {
        // Проверяем случай, когда карта не найдена (ucn = -1)
        if (Number(cardData.ucn) === -1) {
          console.log("[LoyaltyPayPage] Карта лояльности не найдена");
          setCardNotFound(true);
          setIsLoading(false);
          return;
        }

        // Если карта найдена и есть баланс
        if (cardData.balance !== undefined) {
          setLoyaltyCard(cardData);
          setIsLoading(false);

          // Проверяем достаточно ли баллов
          const programPrice = Number(selectedProgram?.price) || 0;
          const cardBalance = Number(cardData.balance) || 0;
          
          if (cardBalance < programPrice) {
            console.log(`[LoyaltyPayPage] Недостаточно баллов: ${cardBalance} < ${programPrice}`);
            setInsufficientBalance(true);
            return;
          }

          // Очищаем общий таймаут и запускаем таймаут ожидания оплаты
          clearLoyaltyTimers();
          loyalityEmptyTimeoutRef.current = setTimeout(() => {
            console.log(`[LoyaltyPayPage] Ожидание нажатия кнопки Оплатить истекло`);
            navigate("/");
          }, DEPOSIT_TIME);
        }
      }
    } catch (error) {
      console.error("[LoyaltyPayPage] Ошибка при получении данных карты:", error);
      setIsLoading(false);
    }
  };

  // Очистка отсчета
  const clearCountdown = () => {
    if (idleTimeout.current) {
      clearTimeout(idleTimeout.current);
      idleTimeout.current = null;
    }
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
    setTimeUntilRobotStart(0);
  };

  const startCountdown = () => {
    const initialTime = START_ROBOT_INTERVAL / 1000;
    setTimeUntilRobotStart(initialTime);

    // Запускаем таймер для автоматического старта
    idleTimeout.current = setTimeout(handleStartRobot, START_ROBOT_INTERVAL);

    // Запускаем интервал для обновления отсчета каждую секунду
    countdownInterval.current = setInterval(() => {
      setTimeUntilRobotStart(prev => {
        if (prev <= 1) {
          if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
            countdownInterval.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Обработка кнопки назад
  const handleBack = () => {
    console.log("[LoyaltyPayPage] Нажата кнопка назад");
    clearLoyaltyTimers();
    clearCountdown();
    setIsLoading(false);
    
    // НЕ отменяем заказ, так как он еще не создан (создается только при нажатии Оплатить)
    navigate(-1);
  };

  useEffect(() => {
    console.log("[LoyaltyPayPage] Инициализация страницы оплаты лояльности");

    // Запускаем считыватель карт
    openLoyaltyCardReader().then(() => {
      console.log("[LoyaltyPayPage] Кард-ридер запущен");
    }).catch(error => {
      console.error("[LoyaltyPayPage] Ошибка при запуске кард-ридера:", error);
    });

    // Таймаут ожидания карты (30 секунд)
    loyalityEmptyTimeoutRef.current = setTimeout(() => {
      if (!loyaltyCard && !cardNotFound && !insufficientBalance) {
        console.log(`[LoyaltyPayPage] Таймаут ожидания карты истек`);
        navigate("/");
      }
    }, DEPOSIT_TIME);

    // Подписываемся на события веб-сокета
    const removeCardReaderListener = globalWebSocketManager.addListener('card_reader', handleCardReaderEvent);

    return () => {
      console.log("[LoyaltyPayPage] Очистка таймеров и подписок");
      clearLoyaltyTimers();
      removeCardReaderListener();
    };
  }, []);

  useEffect(() => {
    if (order?.status === EOrderStatus.PAYED) {
      console.log("[LoyaltyPayPage] Заказ оплачен");
      clearLoyaltyTimers();
      setIsLoading(false);
      setPaymentSuccess(true);
    }
  }, [order]);

  useEffect(() => {
    if (paymentSuccess) {
      startCountdown();
    }

    return () => {
      clearCountdown();
    }
  }, [paymentSuccess]);

  // Функция для рендеринга правой части в зависимости от состояния
  const renderRightSideContent = () => {
    // Если успешная оплата
    if (paymentSuccess) {
      return (
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
      );
    }

    // Если карта не найдена
    if (cardNotFound) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          <div className="text-center">
            <div className="text-white text-2xl font-semibold mb-4">
              {t("Карта не найдена")}
            </div>
            <div className="text-white/80 text-lg">
              {t("Пожалуйста, проверьте карту и попробуйте снова")}
            </div>
          </div>

          <button
            className="w-full px-8 py-4 rounded-3xl text-blue-600 font-semibold text-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg z-50 mt-4"
            onClick={handleFinish}
            style={{ backgroundColor: "white" }}
          >
            <div className="flex items-center justify-center gap-2">
              {t("Завершить")}
            </div>
          </button>
        </div>
      );
    }

    // Если недостаточно баллов
    if (insufficientBalance) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          <div className="text-center">
            <div className="text-white text-2xl font-semibold mb-4">
              {t("Недостаточно баллов")}
            </div>
            <div className="text-white/80 text-lg">
              {t("На вашей карте недостаточно баллов для оплаты выбранной программы")}
            </div>
          </div>
          
          <div className="bg-white/20 p-6 rounded-2xl w-full">
            <div className="text-white/80 text-sm mb-2">{t("Ваш баланс")}</div>
            <div className="text-white font-bold text-3xl">
              {loyaltyCard?.balance} {t("баллов")}
            </div>
          </div>

          <div className="bg-white/20 p-6 rounded-2xl w-full">
            <div className="text-white/80 text-sm mb-2">{t("Требуется баллов")}</div>
            <div className="text-white font-bold text-3xl">
              {selectedProgram?.price} {t("баллов")}
            </div>
          </div>

          <button
            className="w-full px-8 py-4 rounded-3xl text-blue-600 font-semibold text-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg z-50 mt-4"
            onClick={handleFinish}
            style={{ backgroundColor: "white" }}
          >
            <div className="flex items-center justify-center gap-2">
              {t("Завершить")}
            </div>
          </button>
        </div>
      );
    }

    // Если карта есть и баланс достаточен - показываем кнопку Оплатить
    if (loyaltyCard && loyaltyCard.balance !== undefined) {
      return (
        <>
          <div className="bg-white/20 p-4 rounded-2xl">
            <div className="text-white/80 text-sm mb-2">{t("Ваш баланс")}</div>
            <div className="text-white font-bold text-3xl">
              {loyaltyCard.balance} {t("баллов")}
            </div>
          </div>

          <div className="bg-white/20 p-4 rounded-2xl">
            <div className="text-white/80 text-sm mb-2">{t("Спишется баллов")}</div>
            <div className="text-white font-bold text-3xl">
              {selectedProgram?.price} {t("баллов")}
            </div>
          </div>

          <button
            className="right-8 bottom-8 px-8 py-4 rounded-3xl text-blue-600 font-semibold text-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg z-50"
            onClick={createOrderAsync}
            style={{ backgroundColor: "white" }}
          >
            <div className="flex items-center justify-center gap-2">
              {t("Оплатить")}
            </div>
          </button>
        </>
      );
    }

    // Ожидание карты или поиск данных
    return (
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="text-white/90 text-sm font-medium">
            {cardReaderStatus === CardReaderStatus.SEARCHING_DATA 
              ? t("Поиск данных по карте...")
              : t("Ожидание карты лояльности...")
            }
          </div>
        </div>
      </div>
    );
  };

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
            title="Оплата картой лояльности"
            description="Приложите карту лояльности для оплаты"
            icon={CreditCard}
          />

          {/* Payment Interface - Full Height */}
          <div className="flex-1 flex">
            {/* Left Side - Instructions and Graphics */}
            {paymentSuccess ? (
              <SuccessPayment />
            ) : (
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
                    {cardNotFound 
                      ? t("Карта не найдена")
                      : insufficientBalance 
                      ? t("Недостаточно баллов") 
                      : cardReaderStatus === CardReaderStatus.SEARCHING_DATA
                      ? t("Поиск данных по карте...")
                      : t("Поднесите карту лояльности к терминалу")
                    }
                  </div>
                  <div className="text-gray-600 text-lg">
                    {cardNotFound
                      ? t("Проверьте карту и попробуйте снова")
                      : insufficientBalance
                      ? t("Пополните карту лояльности и попробуйте снова")
                      : cardReaderStatus === CardReaderStatus.SEARCHING_DATA
                      ? t("Ищем данные по вашей карте...")
                      : t("Дождитесь подтверждения оплаты")
                    }
                  </div>
                </div>
              </div>
            )}

            {/* Right Side - Payment Details */}
            <div className="w-96 bg-gradient-to-br from-blue-500 to-blue-600 text-white flex flex-col">
              <div className="p-8 h-full flex flex-col justify-start gap-6">
                {/* Loyalty Card Info - скрываем при ошибках */}
                {!cardNotFound && !insufficientBalance && (
                  <div className="flex flex-col items-center">
                    <div className="text-white/80 text-sm mb-5 font-medium">
                      {t("Карта лояльности")}
                    </div>
                    <div className="w-48 h-32 bg-white/20 rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <Icon data={CreditCard} size={48} className="text-white/60 mb-2" />
                        <div className="text-white/80 text-sm">Карта лояльности</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Program Info - скрываем при ошибках */}
                {!cardNotFound && !insufficientBalance && (
                  <div className="bg-white/10 p-4 rounded-2xl">
                    <div className="text-white/80 text-sm mb-2">{t("Программа")}</div>
                    <div className="text-white font-semibold text-lg">{t(`${selectedProgram?.name}`)}</div>
                  </div>
                )}

                {/* Payment Details */}
                <div className="flex flex-col justify-start gap-6">
                  {/* Сумма к оплате - показываем всегда кроме успешной оплаты и когда карта не найдена */}
                  {!paymentSuccess && !cardNotFound && (
                    <div className="bg-white/10 p-6 rounded-2xl">
                      <div className="text-white/80 text-sm mb-3">{t("К оплате")}</div>
                      <div className="text-white font-bold text-5xl">
                        {selectedProgram?.price} {t("р.")}
                      </div>
                    </div>
                  )}

                  {renderRightSideContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}