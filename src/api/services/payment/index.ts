import { axiosInstance } from "../../axiosConfig";
import { ICreateOrderRequest, IGetMobileQr, IGetOrderByIdResponse, ILoyaltyCheckResponse, IUcnCheckResponse } from "../../types/payment";
import { logger } from "../../../util/logger";

enum PAYMENT {
  PAY = 'pay/',
  LOYALTY_CHECK = 'lty-check/',
  CANCELLATION = 'cancellation',
  ORDER_DETAIL = 'order-detail',
  UCN_CHECK = 'ucn-check',
  OPEN_READER = 'open-reader/',
  MOBILE_QR = 'mobile-qr',
  START = 'start',
}

export async function createOrder(
  body: ICreateOrderRequest,
  signal?: AbortSignal
): Promise<void> {
  logger.info('[API] ===== createOrder CALLED =====');
  logger.info('[API] Endpoint:', PAYMENT.PAY);
  logger.info('[API] Body:', body);
  logger.info('[API] Has abort signal:', !!signal);
  
  try {
    await axiosInstance.post(PAYMENT.PAY, body, { signal });
    logger.info('[API] ===== createOrder SUCCESS =====');
  } catch (error) {
    logger.error('[API] ===== createOrder ERROR =====');
    logger.error('[API] Error:', error);
    if (error instanceof Error) {
      logger.error('[API] Error name:', error.name);
      logger.error('[API] Error message:', error.message);
    }
    throw error;
  }
}

export async function getOrderById(
  order_id: string,
): Promise<IGetOrderByIdResponse> {
  const response = await axiosInstance.get<IGetOrderByIdResponse>(PAYMENT.ORDER_DETAIL + `/${order_id}/`);

  return response.data;
}

export async function cancelOrder(    
  order_id: string,
): Promise<void> {  
  
  await axiosInstance.post(PAYMENT.CANCELLATION + `/${order_id}/`);
  logger.info("отменили заказ",  order_id);
  
}

export async function loyaltyCheck(): Promise<ILoyaltyCheckResponse> {
  const response = await axiosInstance.get<ILoyaltyCheckResponse>(PAYMENT.LOYALTY_CHECK);

  return response.data;
}

export async function ucnCheck(): Promise<IUcnCheckResponse> {
  const response = await axiosInstance.get<IUcnCheckResponse>(PAYMENT.UCN_CHECK);

  return response.data;
}

export async function openLoyaltyCardReader(signal?: AbortSignal): Promise<IUcnCheckResponse> {  
  const response = await axiosInstance.post<IUcnCheckResponse>(PAYMENT.OPEN_READER, {}, { 
    signal 
  });
  return response.data;
}

export async function getMobileQr(): Promise<IGetMobileQr> {
  const response = await axiosInstance.get<IGetMobileQr>(PAYMENT.MOBILE_QR);

  return response.data;
}

export async function startRobot(order_id: string): Promise<{ message?: string }> {
  logger.info('[API] ===== startRobot CALLED =====');
  logger.info('[API] Endpoint:', PAYMENT.START + `/${order_id}/`);
  logger.info('[API] Order ID:', order_id);
  
  try {
    const response = await axiosInstance.post(PAYMENT.START + `/${order_id}/`);
    logger.info('[API] ===== startRobot SUCCESS =====');
    logger.info('[API] Response status:', response.status);
    logger.info('[API] Response data:', response.data);
    return response.data || {};
  } catch (error) {
    logger.error('[API] ===== startRobot ERROR =====');
    logger.error('[API] Error:', error);
    if (error instanceof Error) {
      logger.error('[API] Error name:', error.name);
      logger.error('[API] Error message:', error.message);
    }
    throw error;
  }
}