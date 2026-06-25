import "./../App.css";
import ProgramCard from "../components/cards/ProgramCard";
import MediaCampaign from "../components/mediaCampaign/mediaCampaign";
import { useMediaCampaign } from "../hooks/useMediaCampaign";
import HeaderWithLogo from "../components/headerWithLogo/HeaderWithLogo";
import { usePrograms } from "../hooks/usePrograms";
import { useEffect } from "react";
import useStore from "../components/state/store";
import { EOrderStatus, EPaymentMethod } from "../components/state/order/orderSlice";
import { PaymentState } from "../state/paymentStateMachine";
import { startRobot, getTerminalData } from "../api/services/payment";
import { useNavigate } from "react-router-dom";
import { logger } from "../util/logger";
import { PAYS } from "../pays-data";
import { logPaymentDiagnostic } from "../util/paymentDiagnostics";

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
      const { order: currentOrder, setPaymentState } = useStore.getState();
      const activePaidStatuses = [EOrderStatus.PAYED, EOrderStatus.PROCESSING];

      if (currentOrder && activePaidStatuses.includes(currentOrder.status)) {
        logger.info('[MainPage] Skipping reset - active paid/processing order', {
          orderId: currentOrder.id,
          status: currentOrder.status,
          paymentMethod: currentOrder.paymentMethod,
        });

        closeBackConfirmationModal();
        closeLoyaltyCardModal();

        if (currentOrder.paymentMethod === EPaymentMethod.MOBILE_PAYMENT) {
          logPaymentDiagnostic('info', 'mainpage_paid_recovery', 'H5', currentOrder.id, {
            recoveryAction: 'defer_to_mobile_effect',
            orderStatus: currentOrder.status,
            paymentMethod: currentOrder.paymentMethod,
          });
          return;
        }

        const programId = currentOrder.programId;
        const payRoute = PAYS.find((pay) => pay.type === currentOrder.paymentMethod);

        if (programId && payRoute) {
          const restoredPaymentSuccess = currentOrder.status === EOrderStatus.PAYED;
          if (restoredPaymentSuccess) {
            setPaymentState(PaymentState.PAYMENT_SUCCESS);
          }
          const targetPath = `/programs/${programId}/${payRoute.endPoint}`;
          logPaymentDiagnostic('info', 'mainpage_paid_recovery', 'H5', currentOrder.id, {
            recoveryAction: 'redirect_to_payment',
            targetPath,
            restoredPaymentSuccess,
            orderStatus: currentOrder.status,
            paymentMethod: currentOrder.paymentMethod,
          });
          navigate(targetPath);
        } else {
          logPaymentDiagnostic('info', 'mainpage_paid_recovery', 'H5', currentOrder.id, {
            recoveryAction: 'skipped_reset_no_route',
            orderStatus: currentOrder.status,
            paymentMethod: currentOrder.paymentMethod,
            programId,
            hasPayRoute: Boolean(payRoute),
          });
        }

        return;
      }

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
                <div className="w-full snap-x">
                  <div className="flex flex-row justify-center items-stretch gap-6 w-full">
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
