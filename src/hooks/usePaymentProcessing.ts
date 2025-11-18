import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../components/state/store';
import { cancelOrder, createOrder, getOrderById, startRobot } from '../api/services/payment';
import { EOrderStatus, EPaymentMethod } from '../components/state/order/orderSlice';

const DEPOSIT_TIME = 60000;
const PAYMENT_INTERVAL = 1000;
const START_ROBOT_INTERVAL = 20000;

export const usePaymentProcessing = (paymentMethod: EPaymentMethod) => {
  const navigate = useNavigate();
  const {
    order,
    selectedProgram,
    isLoyalty,
    closeLoyaltyCardModal,
    setIsLoading,
    isLoyaltyCardModalOpen,
    setInsertedAmount
  } = useStore();

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [timeUntilRobotStart, setTimeUntilRobotStart] = useState(0);

  const orderCreatedRef = useRef(false);
  const depositTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loyalityEmptyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkOrderAmountSumIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkLoyaltyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownStartedRef = useRef(false); 

  // Очистка таймеров лояльности
  const clearLoyaltyTimers = () => {
    if (checkLoyaltyIntervalRef.current) {
      clearInterval(checkLoyaltyIntervalRef.current);
      checkLoyaltyIntervalRef.current = null;
    }
    if (loyalityEmptyTimeoutRef.current) {
      clearTimeout(loyalityEmptyTimeoutRef.current);
      loyalityEmptyTimeoutRef.current = null;
    }
  };

  // Очистка таймеров оплаты
  const clearPaymentTimers = () => {
    if (depositTimeoutRef.current) {
      clearTimeout(depositTimeoutRef.current);
      depositTimeoutRef.current = null;
    }
    if (checkOrderAmountSumIntervalRef.current) {
      clearInterval(checkOrderAmountSumIntervalRef.current);
      checkOrderAmountSumIntervalRef.current = null;
    }
  };

  // Очистка всех таймеров
  const clearAllTimers = () => {
    clearLoyaltyTimers();
    clearPaymentTimers();
    clearCountdown(); // Добавлена очистка отсчета
  };

  // Очистка отсчета
  const clearCountdown = () => {
    countdownStartedRef.current = false; // Сбрасываем флаг
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

  // Создание заказа
  const createOrderAsync = async (ucn?: string) => {
    if (!selectedProgram || orderCreatedRef.current) {
      console.log(`[${paymentMethod}Page] Ошибка создания заказа`);
      return;
    }

    orderCreatedRef.current = true;

    try {
      setIsLoading(true);
      await createOrder({
        program_id: selectedProgram.id,
        payment_type: paymentMethod,
        ucn: ucn,
      });
      console.log(`[${paymentMethod}Page] Создали заказ ${ucn ? 'с UCN' : 'БЕЗ UCN'}`);
    } catch (err) {
      console.error(`[${paymentMethod}Page] Ошибка создания заказа`, err);
    }
  };
  
  // ЗАКОММЕНТИРОВАНА ЛОГИКА ЛОЯЛЬНОСТИ
  // // Проверка лояльности
  // const checkLoyaltyAsync = async () => {
  //   try {
  //     const ucnResponse = await ucnCheck();
  //     const ucnCode = ucnResponse.ucn;
  //     if (ucnCode) {
  //       console.log(`[${paymentMethod}Page] Получили ucn код:`, ucnCode);
  //       clearLoyaltyTimers();
  //       closeLoyaltyCardModal();
  //       if (Number(ucnCode) !== -1) {
  //         console.log("создание заказа из Number(ucnCode) !== -1");
  //         await createOrderAsync(ucnCode);
  //       } else {
  //         console.log("создание заказа из } else {");
  //         await createOrderAsync();
  //       }
  //     }
  //   } catch (e) {
  //     console.log(`[${paymentMethod}Page] Ошибка ucnCheck`, e);
  //   }
  // };
  
  // Проверка платежа
  const checkPaymentAsync = async () => {
    try {
      if (order?.id) {
        console.log(`[${paymentMethod}Page] Сделали запрос getOrderById, ждем ответ... `);

        const orderDetails = await getOrderById(order.id);

        console.log(`[${paymentMethod}Page] Получили ответ getOrderById`);

        if (orderDetails.amount_sum) {
          const amountSum = Number(orderDetails.amount_sum);
          console.log(`[${paymentMethod}Page] Внесено:`, amountSum);

          if (amountSum > 0) {
            if (depositTimeoutRef.current) {
              clearTimeout(depositTimeoutRef.current);
              depositTimeoutRef.current = null;
            }
          }

          // Для наличных обновляем сумму в UI
          if (paymentMethod === EPaymentMethod.CASH) {
            setInsertedAmount(amountSum);
          }

          if (amountSum >= Number(selectedProgram?.price)) {
            console.log(`[${paymentMethod}Page] Получена вся сумма`);
            clearAllTimers();
            setPaymentSuccess(true);
            // setIsLoading(true);
          }
        }
      }
    } catch (e) {
      console.log(`[${paymentMethod}Page] Ошибка getOrderById`, e);
    }
  };
  
  // ЗАКОММЕНТИРОВАНА ЛОГИКА ОТКАЗА ОТ ЛОЯЛЬНОСТИ
  // // Обработка отказа от лояльности
  // const handleSkipLoyalty = async () => {
  //   console.log(`[${paymentMethod}Page] Отказ от карты лояльности`);
  //   clearLoyaltyTimers();
  //   closeLoyaltyCardModal();
  //   console.log("создание заказа из handleSkipLoyalty");
  //   await createOrderAsync();
  // };
  
  // Обработка кнопки назад
  const handleBack = () => {
    clearAllTimers();
    closeLoyaltyCardModal();
    setIsLoading(false);
    setPaymentSuccess(false);
    clearCountdown();
    console.log("[usePaymentProcessing] Делам отмену заказа c id: ", order?.id);
    
    if (order?.id) {
      cancelOrder(order.id);
    }

    navigate(-1);
  };

  const handleStartRobot = () => {
    console.log("Запускаем робот");

    if (order?.id) {
      startRobot(order.id);
      clearCountdown();
      navigate('/success');
    }
  }

  // Запуск отсчета до автоматического старта робота
  const startCountdown = () => {
    if (countdownStartedRef.current) {
      console.log(`[${paymentMethod}Page] Отсчет уже запущен, пропускаем`);
      return;
    }

    console.log(`[${paymentMethod}Page] Запускаем отсчет автоматического старта`);
    countdownStartedRef.current = true;
    
    const initialTime = START_ROBOT_INTERVAL / 1000;
    setTimeUntilRobotStart(initialTime);

    // Запускаем таймер для автоматического старта
    idleTimeout.current = setTimeout(() => {
      console.log(`[${paymentMethod}Page] Автоматический запуск робота по таймеру`);
      handleStartRobot();
    }, START_ROBOT_INTERVAL);

    // Запускаем интервал для обновления отсчета каждую секунду
    countdownInterval.current = setInterval(() => {
      setTimeUntilRobotStart(prev => {
        if (prev <= 1) {
          console.log(`[${paymentMethod}Page] Отсчет завершен`);
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
  
  // Эффект для лояльности - ЗАКОММЕНТИРОВАН
  useEffect(() => {
    // ЗАКОММЕНТИРОВАНА ВСЯ ЛОГИКА ЛОЯЛЬНОСТИ
    // if (isLoyalty) {
    //   console.log(`[${paymentMethod}Page] Сценарий с лояльностью`);
    //   openLoyaltyCardModal();
    //   openLoyaltyCardReader();
    //   checkLoyaltyIntervalRef.current = setInterval(checkLoyaltyAsync, LOYALTY_INTERVAL);
    //   loyalityEmptyTimeoutRef.current = setTimeout(() => {
    //     console.log(`[${paymentMethod}Page] Таймаут лояльности истек`);
    //     clearLoyaltyTimers();
    //     closeLoyaltyCardModal();
    //     console.log("создание заказа из isLoyalty");
    //     createOrderAsync();
    //   }, DEPOSIT_TIME);
    // } else {
    //   console.log("создание заказа из else isLoyalty");
    //   createOrderAsync();
    // }
    
    // ТЕПЕРЬ ВСЕГДА СОЗДАЕМ ЗАКАЗ СРАЗУ
    console.log("создание заказа - лояльность отключена");
    createOrderAsync();
    
    return () => {
      clearAllTimers();
    };
  }, [isLoyalty]); // Оставляем зависимость, но логика внутри упрощена
  
  // Эффект для отслеживания статуса заказа
  useEffect(() => {
    if (order?.status === EOrderStatus.WAITING_PAYMENT) {
      setIsLoading(false);

      depositTimeoutRef.current = setTimeout(async () => {
        try {
          if (order.id) {
            console.log(`[${paymentMethod}Page] Отмена заказа по таймауту`);
            await cancelOrder(order.id);
            navigate("/");
          }
        } catch (e) {
          console.log(`[${paymentMethod}Page] Ошибка отмены заказа`, e);
        }
      }, DEPOSIT_TIME);

      checkOrderAmountSumIntervalRef.current = setInterval(checkPaymentAsync, PAYMENT_INTERVAL);
    }

    return () => {
      clearPaymentTimers();
    };
  }, [order]);

  // Отдельный эффект для обработки успешного статуса PAYED
  useEffect(() => {
    if (order?.status === EOrderStatus.PAYED && !paymentSuccess) {
      console.log(`[${paymentMethod}Page] Статус заказа изменился на PAYED`);
      clearAllTimers();
      setPaymentSuccess(true);
    }
  }, [order?.status]);

  // Эффект для запуска отсчета при успешной оплате
  useEffect(() => {
    console.log(`[${paymentMethod}Page] paymentSuccess: ${paymentSuccess}, countdownStarted: ${countdownStartedRef.current}`);
    
    if (paymentSuccess && !countdownStartedRef.current) {
      console.log(`[${paymentMethod}Page] Успешная оплата, запускаем отсчет`);
      startCountdown();
    }

    return () => {
      // Не очищаем отсчет здесь, чтобы он не прерывался при перерисовках
    };
  }, [paymentSuccess]);

  return {
    // handleSkipLoyalty, // Убрано из возвращаемых значений
    handleBack,
    isLoyaltyCardModalOpen,
    selectedProgram,
    order,
    paymentSuccess,
    handleStartRobot,
    timeUntilRobotStart
  };
};