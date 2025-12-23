import "./../App.css";
import ProgramCard from "../components/cards/ProgramCard";
import MediaCampaign from "../components/mediaCampaign/mediaCampaign";
import { useMediaCampaign } from "../hooks/useMediaCampaign";
import HeaderWithLogo from "../components/headerWithLogo/HeaderWithLogo";
import { usePrograms } from "../hooks/usePrograms";
import { useEffect } from "react";
import useStore from "../components/state/store";
import { EOrderStatus } from "../components/state/order/orderSlice";
import { startRobot, getTerminalData } from "../api/services/payment";
import { useNavigate } from "react-router-dom";
import { logger } from "../util/logger";

const MAIN_PAGE_URL = "MainPage.webp";

export default function MainPage() {
  const { programs } = usePrograms();
  const { attachemntUrl, mediaStatus } = useMediaCampaign(MAIN_PAGE_URL);
  const { 
    order, 
    clearOrder, 
    setInsertedAmount, 
    setIsLoading,
    resetPayment,
    setSelectedProgram,
    setBankCheck,
    setQueuePosition,
    setQueueNumber,
    setErrorCode,
    closeBackConfirmationModal,
    closeLoyaltyCardModal,
    setCarWashId,
    setDeviceId,
  } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const resetAllStates = async () => {
      logger.info('[MainPage] Resetting all states on mount');

      // Close all modals
      closeBackConfirmationModal();
      closeLoyaltyCardModal();

      // Reset payment state
      resetPayment();

      // Clear order
      clearOrder();

      // Reset all app states
      setSelectedProgram(null);
      setBankCheck("");
      setInsertedAmount(0);
      setQueuePosition(null);
      setQueueNumber(null);
      setErrorCode(null);
      setIsLoading(false);

      logger.info('[MainPage] All states reset successfully');
    };

    const fetchTerminalData = async () => {
      try {
        logger.info('[MainPage] Fetching terminal data');
        const terminalData = await getTerminalData();
        logger.info('[MainPage] Terminal data fetched successfully', terminalData);
        if (terminalData?.car_wash_id) {
          setCarWashId(terminalData.car_wash_id);
          logger.info('[MainPage] Saved car_wash_id', { car_wash_id: terminalData.car_wash_id });
        }
        if (terminalData?.device_id) {
          setDeviceId(terminalData.device_id);
          logger.info('[MainPage] Saved device_id', { device_id: terminalData.device_id });
        }
      } catch (error) {
        logger.error('[MainPage] Error fetching terminal data', error);
      }
    };

    resetAllStates();
    fetchTerminalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (order?.status === EOrderStatus.PAYED) {
      logger.info("Оплата мобильным приложением", order);

      if (order.id) {
        startRobot(order.id);
        navigate('/success');
      }
    }
  }, [order])

  return (
    <div className="flex flex-col min-h-screen w-screen bg-[#EEEEEE]">
      {/* Video Section - 40% of screen height */}
      <MediaCampaign attachemntUrl={attachemntUrl} mediaStatus={mediaStatus}/>
      
      {/* Content Section - 60% of screen height */}
      <div className="flex-1 flex flex-col">
        {/* Header with Logo and Controls */}
        <HeaderWithLogo isMainPage={true} title="Выберите программу" /> 

        {/* Main Content Area */}
        <div className="flex-1 px-7 pb-7">
          <div className="flex flex-col h-full">

            {programs && (
              <div className="flex-1 flex flex-col justify-center mt-10">
                <div
                  className={`w-full snap-x`}
                >
                  <div
                    className={`flex flex-row justify-center gap-6 w-full`}
                  >
                    {programs.map((item) => (
                      <ProgramCard
                        key={`program-card-${item.id}`}
                        id={item.id}
                        name={item.name}
                        price={item.price}
                        description={item.description}
                        duration={item.duration}
                        functions={item.functions}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
