import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../components/state/store";
import CarImage from "../assets/car.webp";
import { logger } from "../util/logger";
import { globalWebSocketManager, type WebSocketMessage } from "../util/websocketManager";
import { EOrderStatus } from "../components/state/order/orderSlice";
import { navigateToMain } from "../utils/navigation";
import MediaCampaign from "../components/mediaCampaign/mediaCampaign";
import { useMediaCampaign } from "../hooks/useMediaCampaign";

const WASHING_PAGE_URL = "WashingPage.webp";

export default function WashingInProgressPage() {
  const navigate = useNavigate();
  const { setIsLoading } = useStore();
  const { order } = useStore();
  const { attachemntUrl, mediaStatus } = useMediaCampaign(WASHING_PAGE_URL);

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

  return (
    <div className="flex flex-col h-[1920px] w-screen bg-[#0045FF] overflow-hidden">
      
          <MediaCampaign attachemntUrl={attachemntUrl} mediaStatus={mediaStatus} />
      

      <div className="flex-1 flex flex-col items-center justify-center bg-[#0045FF] relative overflow-hidden min-h-0">
        <div className="flex flex-col items-center justify-center max-w-4xl px-8 text-center z-10">
          <div className="bg-[#89BAFB4D] rounded-2xl py-4 px-10 flex items-center gap-3 mb-6 mt-3 w-[727px] text-center justify-center">
            <h1 className="text-white text-6xl font-bold flex items-center justify-center text-center">
              Идёт мойка...
            </h1>
          </div>
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
