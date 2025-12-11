import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../components/state/store";
import { EOrderStatus } from "../components/state/order/orderSlice";
import BoxImage from "../assets/бокс.webp";
import CarImage from "../assets/car.webp";
import { logger } from "../util/logger";
import { startRobot } from "../api/services/payment";
import { navigateToWashing, navigateToMain } from "../utils/navigation";
import gazpromHeader from "../assets/gazprom-step-2-header.webp";

export default function SuccessPaymentPage() {
  const navigate = useNavigate();
  const { setIsLoading, order, queuePosition } = useStore();
  
  const [displayText, setDisplayText] = useState("Можете проезжать в бокс!");
  const robotStartedRef = useRef(false);

  useEffect(() => {
    if (order?.status === EOrderStatus.COMPLETED) {
      logger.info('[SuccessPaymentPage] Order completed, redirecting to main screen');
      navigateToMain(navigate);
      return;
    }

    if (order?.status === EOrderStatus.PROCESSING) {
      logger.info('[SuccessPaymentPage] Order is processing, will navigate to washing page after 12 seconds');
      
      const timer = setTimeout(() => {
        navigateToWashing(navigate);
      }, 12000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [order?.status, navigate]);

  useEffect(() => {
    if (order?.id && order?.status === EOrderStatus.PAYED && !robotStartedRef.current) {
      const orderId = order.id;
      const startRobotAsync = async () => {
        try {
          robotStartedRef.current = true;
          logger.info('[SuccessPaymentPage] Starting robot for order:', orderId);
          setIsLoading(true);
          
          await startRobot(orderId);
          
          logger.info('[SuccessPaymentPage] Robot start API call successful');
        } catch (error) {
          logger.error('[SuccessPaymentPage] Error starting robot', error);
          setIsLoading(false);
          robotStartedRef.current = false;
        }
      };

      startRobotAsync();
    }
  }, [order?.id, order?.status, setIsLoading]);

  useEffect(() => {
    if (order?.status === EOrderStatus.PROCESSING && robotStartedRef.current) {
      logger.info('[SuccessPaymentPage] Order status updated to PROCESSING via WebSocket');
      setIsLoading(false);
    }
  }, [order?.status, setIsLoading]);

  useEffect(() => {
    setIsLoading(false);
    setDisplayText("Можете проезжать в бокс!");
  }, [setIsLoading]);

  return (
    <div className="flex flex-col h-[1024px] w-[1280px] bg-gray-100 bg-[#0045FF] overflow-hidden">
       <div className="w-full flex-shrink-0 h-64">
        <img 
          src={gazpromHeader} 
          alt="Header" 
          className="w-full h-full object-cover"
          decoding="async"
        />
      </div>

      <div className="flex-1 flex flex-col items-start justify-center bg-[#0045FF] relative overflow-hidden" style={{ height: 'calc(1024px - 256px)' }}>
        <div className="flex flex-col items-center gap-6 z-10 p-6">
          <div className="bg-[#89BAFB4D] rounded-3xl px-12 py-8">
            <h1 className="text-white text-6xl font-bold flex items-center justify-center gap-3">
              {displayText}
              <span className="text-white text-5xl"></span>
            </h1>
          </div>
          
          {queuePosition === null || queuePosition === 0 ? <div className="bg-[#89BAFB4D] rounded-2xl px-8 py-4 flex items-center gap-3">
            <div className="w-4 h-4 bg-[#15FF00] rounded-full flex-shrink-0"></div>
            <p className="text-white text-2xl font-semibold">
              Оплата успешна!
            </p>
          </div> : null}
        </div>

        <div className="relative w-full h-[600px] flex items-end justify-end pr-0 overflow-hidden">
          <div className="absolute -bottom-45 left-0 z-20 car-drive-animation">
            <img
              src={CarImage}
              alt="Car"
              className="w-auto h-[800px] md:h-[800px] object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="relative z-99 w-full -bottom-30 flex items-end justify-end pr-0 overflow-hidden">

            <img
              src={BoxImage}
              alt="Car wash box"
              className="h-full max-h-[900px] object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
