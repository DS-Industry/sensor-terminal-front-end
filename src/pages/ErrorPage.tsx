import { useNavigate } from "react-router-dom";
import useStore from "../components/state/store";
import { useEffect, useRef, useCallback } from "react";
import gazpromHeader from "../assets/gazprom-step-2-header.webp";
import errorImage from "../assets/error.webp";
import { cancelOrder } from "../api/services/payment";
import { logger } from "../util/logger";
import { navigateToMain } from "../utils/navigation";

const IDLE_TIMEOUT = 5000;

export default function ErrorPage() {
  const navigate = useNavigate();
  const { 
    setIsLoading, 
    order, 
    clearOrder, 
    setSelectedProgram, 
    setBankCheck, 
    setInsertedAmount, 
    setQueuePosition, 
    setQueueNumber,
    resetPayment,
    setErrorCode
  } = useStore();
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFinish = useCallback(async () => {
    logger.info('[ErrorPage] Handling close - cleaning up everything');
    
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
    
    try {
      if (order?.id) {
        try {
          await cancelOrder(order.id);
          logger.info('[ErrorPage] Order cancelled on close', { orderId: order.id });
        } catch (error) {
          logger.error('[ErrorPage] Error cancelling order on close', error);
        }
      }

      resetPayment();
      
      clearOrder();
      
      setSelectedProgram(null);
      setBankCheck("");
      setInsertedAmount(0);
      setQueuePosition(null);
      setQueueNumber(null);
      setErrorCode(null);
      setIsLoading(false);
      
      logger.info('[ErrorPage] All state cleared, navigating to main page');
      
      navigateToMain(navigate);
    } catch (error) {
      logger.error('[ErrorPage] Error during cleanup', error);
      navigateToMain(navigate);
    }
  }, [
    navigate, 
    order, 
    clearOrder, 
    setSelectedProgram, 
    setBankCheck, 
    setInsertedAmount, 
    setQueuePosition, 
    setQueueNumber, 
    setIsLoading,
    resetPayment,
    setErrorCode
  ]);

  const clearIdleTimeout = () => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  }

  useEffect(() => {
    setIsLoading(false);

    if (!idleTimeoutRef.current) {
      idleTimeoutRef.current = setTimeout(handleFinish, IDLE_TIMEOUT);
    }

    return () => {
      clearIdleTimeout();
    };
  }, [handleFinish, setIsLoading]);

  return (
    <div className="flex flex-col h-[1024px] w-[1280px] bg-[#0045FF] overflow-hidden">
      <div className="w-full flex-shrink-0 h-64">
        <img 
          src={gazpromHeader} 
          alt="Header" 
          className="w-full h-full object-cover"
          decoding="async"
        />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0045FF] relative overflow-hidden" style={{ height: 'calc(1024px - 256px)' }}>
        <div className="flex flex-col items-center justify-center z-10 mb-8">
          <div className="bg-[#89BAFB4D] rounded-2xl px-12 py-8 mb-6">
            <h1 className="text-white text-6xl font-bold text-center">
              Ошибка запуска робота!
            </h1>
          </div>

          <p className="text-white text-2xl mb-8 text-center max-w-4xl px-8">
            Проверьте баланс карты или обратитесь к оператору
          </p>

          <button
            className="px-16 py-6 rounded-full text-[#0B68E1] bg-white font-semibold text-2xl transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg"
            onClick={handleFinish}
            aria-label="Закрыть"
            style={{ borderRadius: '50px' }}
          >
            Закрыть
          </button>

        </div>

        <div className="absolute bottom-0 right-0 z-20">
          <img
            src={errorImage}
            alt="Error"
            className="w-auto h-auto max-w-[300px] max-h-[300px] object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}

