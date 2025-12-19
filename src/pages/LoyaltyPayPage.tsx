import { useEffect, useRef, useState } from "react";
import WifiBlue from "../assets/blue_wifi.svg";
import PromoCard from "../assets/promo_card.svg";
import { CreditCard } from "@gravity-ui/icons";
import MediaCampaign from "../components/mediaCampaign/mediaCampaign";
import { useMediaCampaign } from "../hooks/useMediaCampaign";
import useStore from "../components/state/store";
import HeaderWithLogo from "../components/headerWithLogo/HeaderWithLogo";
import PaymentTitleSection from "../components/paymentTitleSection/PaymentTitleSection";
import { createOrder, openLoyaltyCardReader, startRobot } from "../api/services/payment";
import { EOrderStatus, EPaymentMethod } from "../components/state/order/orderSlice";
import { useNavigate } from "react-router-dom";
import { IUcnCheckResponse } from "../api/types/payment";
import SuccessPayment from "../components/successPayment/SuccessPayment";
import { globalWebSocketManager } from "../util/websocketManager";
import { logger } from "../util/logger";

const LOYALTY_PAGE_URL = "LoyaltyPage.webp";
const DEPOSIT_TIME = 30000;

// Типы статусов кард-ридера
enum CardReaderStatus {
  WAITING_CARD = 1,
  SEARCHING_DATA = 2,
  READING_COMPLETE = 3
}

export default function LoyaltyPayPage() {
  const { attachemntUrl, mediaStatus } = useMediaCampaign(LOYALTY_PAGE_URL);
  const { selectedProgram, setIsLoading, order } = useStore();
  const navigate = useNavigate();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [loyaltyCard, setLoyaltyCard] = useState<IUcnCheckResponse | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [cardNotFound, setCardNotFound] = useState(false);
  const [cardReaderStatus, setCardReaderStatus] = useState<CardReaderStatus>(CardReaderStatus.WAITING_CARD);
  const [isCardDataReceived, setIsCardDataReceived] = useState(false); // Флаг для отслеживания получения данных с карты
  const orderCreatedRef = useRef(false);
  const loyalityEmptyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStartRobot = () => {
    logger.info("Запускаем робот");

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
    setIsLoading(false);
  };

  const cancelLoyaltyRequest = () => {
    if (abortControllerRef.current) {
      logger.debug("[LoyaltyPayPage] Отменяем запрос кард-ридера");
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // Создание заказа только при нажатии "Оплатить"
  const createOrderAsync = async () => {
    if (!selectedProgram || orderCreatedRef.current || !loyaltyCard?.ucn) {
      logger.warn(`[LoyaltyPayPage] Ошибка создания заказа`);
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
      logger.info(`[LoyaltyPayPage] Создали заказ с UCN`);
    } catch (err) {
      logger.error(`[LoyaltyPayPage] Ошибка создания заказа`, err);
      setIsLoading(false);
    }
  };

  // Обработчик веб-сокет событий кард-ридера
  const handleCardReaderEvent = (data: { type: string; code?: number }) => {
    if (data.type === 'card_reader' && data.code) {
      logger.debug(`[LoyaltyPayPage] Получен статус кард-ридера:`, data.code);
      setCardReaderStatus(data.code);

      switch (data.code) {
        case CardReaderStatus.WAITING_CARD:
          logger.debug("ВЕБСОКЕТ КОД 1: Ожидание карты");
          setIsLoading(false);
          break;
        case CardReaderStatus.SEARCHING_DATA:
          logger.debug("ВЕБСОКЕТ КОД 2: Поиск данных по карте");
          setIsLoading(true);
          break;
        case CardReaderStatus.READING_COMPLETE:
          logger.debug("ВЕБСОКЕТ КОД 3: Чтение карты завершено");
          setIsLoading(false);
          break;
      }
    }
  };

  // Обработка кнопки назад
  const handleBack = () => {
    logger.debug("[LoyaltyPayPage] Нажата кнопка назад");
    clearLoyaltyTimers();
    setIsLoading(false);
    cancelLoyaltyRequest();
    navigate(-1);
  };

  useEffect(() => {
    // Создаем AbortController для отмены запроса
    abortControllerRef.current = new AbortController();
    loyalityEmptyTimeoutRef.current = setTimeout(() => {
      if (!loyaltyCard && !cardNotFound && !insufficientBalance) {
        logger.debug(`[LoyaltyPayPage] Таймаут ожидания карты истек`);
        navigate("/");
      }
    }, DEPOSIT_TIME);

    // Подписываемся на события веб-сокета только для отображения статусов
    const removeCardReaderListener = globalWebSocketManager.addListener('card_reader', handleCardReaderEvent);

    logger.debug("[LoyaltyPayPage] Запрос openLoyaltyCardReader, ждем данные карты");
    // Передаем openLoyaltyCardReader и ждем ответ
    openLoyaltyCardReader(abortControllerRef.current.signal)
      .then(cardData => {
        logger.debug("[LoyaltyPayPage] Получили данные карты:", cardData);

        if (cardData && cardData.ucn) {
          setIsCardDataReceived(true); // Устанавливаем флаг, что данные получены

          // Проверяем случай, когда карта не найдена (ucn = -1)
          if (Number(cardData.ucn) === -1) {
            logger.info("[LoyaltyPayPage] Карта лояльности не найдена");
            setCardNotFound(true);
            setIsLoading(false);
            return;
          }

          // Если карта найдена и есть баланс
          if (cardData.balance !== undefined) {
            logger.info(`[LoyaltyPayPage] Карта найдена`);
            setLoyaltyCard(cardData);
            setIsLoading(false);

            // Проверяем достаточно ли баллов
            const programPrice = Number(selectedProgram?.price) || 0;
            const cardBalance = Number(cardData.balance) || 0;
            
            if (cardBalance < programPrice) {
              logger.warn(`[LoyaltyPayPage] Недостаточно баллов: ${cardBalance} < ${programPrice}`);
              setInsufficientBalance(true);
              return;
            }

            // Очищаем общий таймаут и запускаем таймаут ожидания оплаты
            clearLoyaltyTimers();
            loyalityEmptyTimeoutRef.current = setTimeout(() => {
              logger.debug(`[LoyaltyPayPage] Ожидание нажатия кнопки Оплатить истекло`);
              navigate("/");
            }, DEPOSIT_TIME);
          }
        }
      })
      .catch(error => {
        logger.error("[LoyaltyPayPage] Ошибка при получении данных карты:", error);
        setIsLoading(false);
      });

    return () => {
      logger.debug("[LoyaltyPayPage] Очистка таймеров и подписок");
      clearLoyaltyTimers();
      removeCardReaderListener();
      // Отменяем запрос только если данные ещё не получены
      if (!isCardDataReceived) {
        cancelLoyaltyRequest();
      }
    };
  }, []);

  useEffect(() => {
    if (order?.status === EOrderStatus.PAYED) {
      logger.info("[LoyaltyPayPage] Заказ оплачен");
      clearLoyaltyTimers();
      setIsLoading(false);
      setPaymentSuccess(true);
    }
  }, [order]);

  useEffect(() => {
    if (paymentSuccess) {
      handleStartRobot();
    }

  }, [paymentSuccess]);

  // Функция для рендеринга правой части в зависимости от состояния
  const renderRightSideContent = () => {

    // Если карта не найдена
    if (cardNotFound) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          <div className="text-center">
            <div className="text-white text-2xl font-semibold mb-4">
              Карта не найдена
            </div>
            <div className="text-white/80 text-lg">
              Пожалуйста, проверьте карту и попробуйте снова
            </div>
          </div>

          <button
            className="w-full px-8 py-4 rounded-3xl text-blue-600 font-semibold text-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg z-50 mt-4"
            onClick={handleFinish}
            style={{ backgroundColor: "white" }}
          >
            <div className="flex items-center justify-center gap-2">
              Завершить
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
              Недостаточно баллов
            </div>
            <div className="text-white/80 text-lg">
              На вашей карте недостаточно баллов для оплаты выбранной программы
            </div>
          </div>

          <div className="bg-white/20 p-6 rounded-2xl w-full">
            <div className="text-white/80 text-sm mb-2">Ваш баланс</div>
            <div className="text-white font-bold text-3xl">
              {loyaltyCard?.balance} баллов
            </div>
          </div>

          <div className="bg-white/20 p-6 rounded-2xl w-full">
            <div className="text-white/80 text-sm mb-2">Требуется баллов</div>
            <div className="text-white font-bold text-3xl">
              {selectedProgram?.price} баллов
            </div>
          </div>

          <button
            className="w-full px-8 py-4 rounded-3xl text-blue-600 font-semibold text-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg z-50 mt-4"
            onClick={handleFinish}
            style={{ backgroundColor: "white" }}
          >
            <div className="flex items-center justify-center gap-2">
              Завершить
            </div>
          </button>
        </div>
      );
    }
    // Если карта есть и баланс достаточен — показываем кнопку Оплатить
    if (loyaltyCard && loyaltyCard.balance !== undefined) {
      return (
        <>
          <div className="bg-white/20 p-4 rounded-2xl">
            <div className="text-white/80 text-sm mb-2">Ваш баланс</div>
            <div className="text-white font-bold text-3xl">
              {loyaltyCard.balance} баллов
            </div>
          </div>

          <div className="bg-white/20 p-4 rounded-2xl">
            <div className="text-white/80 text-sm mb-2">Спишется баллов</div>
            <div className="text-white font-bold text-3xl">
              {selectedProgram?.price} баллов
            </div>
          </div>

          <button
            className="right-8 bottom-8 px-8 py-4 rounded-3xl text-blue-600 font-semibold text-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg z-50"
            onClick={createOrderAsync}
            style={{ backgroundColor: "white" }}
          >
            <div className="flex items-center justify-center gap-2">
              Оплатить
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
              ? "Поиск данных по карте..."
              : "Ожидание карты лояльности..."
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
        <HeaderWithLogo backButtonClick={handleBack} isLoyalty={true} />

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
                      ? "Карта не найдена"
                      : insufficientBalance
                        ? "Недостаточно баллов"
                        : cardReaderStatus === CardReaderStatus.SEARCHING_DATA
                          ? "Поиск данных по карте..."
                          : "Поднесите карту лояльности к терминалу"
                    }
                  </div>
                  <div className="text-gray-600 text-lg">
                    {cardNotFound
                      ? "Проверьте карту и попробуйте снова"
                      : insufficientBalance
                        ? "Пополните карту лояльности и попробуйте снова"
                        : cardReaderStatus === CardReaderStatus.SEARCHING_DATA
                          ? "Ищем данные по вашей карте..."
                          : "Дождитесь подтверждения оплаты"
                    }
                  </div>
                </div>
              </div>
            )}

            {/* Right Side - Payment Details */}
            <div className="w-96 bg-gradient-to-br from-blue-500 to-blue-600 text-white flex flex-col">
              <div className="p-8 h-full flex flex-col justify-start gap-6">

                {/* Program Info - скрываем при ошибках */}
                {!cardNotFound && !insufficientBalance && (
                  <div className="bg-white/10 p-4 rounded-2xl">
                    <div className="text-white/80 text-sm mb-2">Программа</div>
                    <div className="text-white font-semibold text-lg">{selectedProgram?.name}</div>
                  </div>
                )}

                {/* Payment Details */}
                <div className="flex flex-col justify-start gap-6">
                  {/* Сумма к оплате - показываем всегда кроме успешной оплаты и когда карта не найдена */}
                  {!paymentSuccess && !cardNotFound && (
                    <div className="bg-white/10 p-6 rounded-2xl">
                      <div className="text-white/80 text-sm mb-3">К оплате</div>
                      <div className="text-white font-bold text-5xl">
                        {selectedProgram?.price} р.
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