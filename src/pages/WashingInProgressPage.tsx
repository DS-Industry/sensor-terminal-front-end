import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../components/state/store";
import CarImage from "../assets/car.webp";
import { logger } from "../util/logger";
import { globalWebSocketManager, type WebSocketMessage } from "../util/websocketManager";
import { EOrderStatus } from "../components/state/order/orderSlice";
import { navigateToMain } from "../utils/navigation";
import gazpromHeader from "../assets/gazprom-step-2-header.webp";

export default function WashingInProgressPage() {
  const navigate = useNavigate();
  const { setIsLoading } = useStore();

  const { order } = useStore();

  useEffect(() => {
    const handleStatusUpdate = (data: WebSocketMessage) => {
      if (data.type === 'status_update' && data.status === EOrderStatus.COMPLETED) {
        logger.info('[WashingInProgressPage] Received COMPLETED status update, navigating home', { orderId: data.order_id });
        logger.debug('[WashingInProgressPage] Status update data', data);
        navigateToMain(navigate);
      }
    };

    const removeListener = globalWebSocketManager.addListener('status_update', handleStatusUpdate);

    return () => {
      removeListener();
    };
  }, [navigate]);

  useEffect(() => {
    if (order?.status === EOrderStatus.COMPLETED) {
      logger.info('[WashingInProgressPage] Order status is COMPLETED in store, navigating home');
      navigateToMain(navigate);
    }
  }, [order?.status, navigate]);

  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);


  const handlePayInAdvance = () => {
    const { clearOrder, setIsLoading, setInsertedAmount, resetPayment, setSelectedProgram, setBankCheck, setQueuePosition, setQueueNumber } = useStore.getState();
    clearOrder();
    setIsLoading(false);
    setInsertedAmount(0);
    resetPayment();
    setSelectedProgram(null);
    setBankCheck(""); 
    setQueuePosition(null); 
    setQueueNumber(null); 
    navigate("/");
  };

  const shouldShowPayInAdvance = true

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
        <div className="flex flex-col items-center justify-center max-w-4xl px-8 text-center z-10">
            <div className="bg-[#89BAFB4D] rounded-2xl py-4 px-10 flex items-center gap-3 mb-6 mt-3 w-[727px] text-center justify-center">
                <h1 className="text-white text-6xl font-bold flex items-center justify-center text-center">
                    Идёт мойка...
                </h1>
            </div>

          {shouldShowPayInAdvance && (
            <>
              <p className="text-white text-2xl mb-8 max-w-2xl">
                Вы можете оплатить мойку заранее, пока моется другой автомобиль
              </p>

              <button
                onClick={handlePayInAdvance}
                className="px-16 py-4 text-[#0B68E1] bg-white font-semibold text-2xl transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg mb-8"
                style={{borderRadius: "30px"}}
                aria-label="Оплатить заранее"
              >
                Оплатить заранее
              </button>
            </>
          )}
        </div>

        <div className="relative w-full h-[400px] flex items-end justify-end pr-0 overflow-hidden">
          <div className="absolute -bottom-20 left-0 z-20 car-drive-animation-success">
            <img
              src={CarImage}
              alt="Car"
              className="w-auto h-[700px] md:h-[700px] object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  );
}



