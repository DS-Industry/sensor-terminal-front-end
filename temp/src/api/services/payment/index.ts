import { axiosInstance } from "../../axiosConfig";
import { ICreateOrderRequest, ICreateOrderResponse, IGetOrderByIdResponse } from "../../types/payment";
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
): Promise<ICreateOrderResponse> {  
  logger.debug('Creating order', body);
  const response = await axiosInstance.post<ICreateOrderResponse>(PAYMENT.PAY, body, {
    signal
  });
  return response.data;
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
  logger.info(`Cancelling order: ${order_id}`);
  await axiosInstance.post(PAYMENT.CANCELLATION + `/${order_id}/`);
}
export interface IStartRobotResponse {
  message?: string;
}

export async function startRobot(order_id: string): Promise<IStartRobotResponse> {  
  const response = await axiosInstance.post<IStartRobotResponse>(PAYMENT.START + `/${order_id}/`);
  return response.data;
}