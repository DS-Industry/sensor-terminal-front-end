import { useEffect, useState } from "react";
import useStore from "../components/state/store";
import CarImage from "../assets/car.webp";
import { navigateToPaymentSuccess } from "../utils/navigation";
import { useNavigate } from "react-router-dom";
import { logger } from "../util/logger";
import gazpromHeader from "../assets/gazprom-step-2-header.webp";
import { useQueueManagement } from "../hooks/payment/useQueueManagement";

export default function QueueWaitingPage() {
  const navigate = useNavigate();
  const { setIsLoading, queuePosition, order } = useStore();
  
  useQueueManagement({
    orderId: order?.id,
    navigate,
  });
  
  const [, setTimeRemaining] = useState(180);

  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);


  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);


  useEffect(() => {
    if (queuePosition === null || queuePosition === 0) {
      logger.info('[QueueWaitingPage] Queue position changed to 0 or null, redirecting to success page');
      navigateToPaymentSuccess(navigate);
    }
  }, [queuePosition, navigate]);


  return (
    <div className="flex flex-col h-screen w-screen bg-[#0045FF] overflow-hidden">
      <div className="w-full flex-shrink-0" style={{ height: '25%' }}>
        <img 
          src={gazpromHeader} 
          alt="Header" 
          className="w-full h-full object-cover"
          decoding="async"
        />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0045FF] relative overflow-hidden min-h-0">
        <div className="flex flex-col items-center justify-center max-w-4xl px-8 text-center z-10">
          <div className="flex items-center justify-center gap-3 mb-6 bg-[#89BAFB4D] rounded-2xl text-center justify-center py-3 px-4">
            <div className="w-4 h-4 bg-[#15FF00] rounded-full"></div>
            <p className="text-white text-3xl font-semibold">
              Оплата успешна!
            </p>
          </div>

          <h1 className="text-white text-5xl font-bold mb-6 p-3 bg-[#89BAFB4D] rounded-2xl w-full max-w-[727px] text-center justify-center">
            Ожидайте окончания мойки...
          </h1>

          <p className="text-white text-xl mb-8 max-w-2xl">
            После окончания мойки наступит Ваша очередь, Вы сможете проехать в бокс!
          </p>
        </div>

        <div className="relative w-full flex-1 flex items-end justify-end pr-0 overflow-hidden min-h-0">
          <div className="absolute -bottom-8 left-0 z-20 car-drive-animation-success">
            <img
              src={CarImage}
              alt="Car"
              className="w-auto h-full max-h-[600px] object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
