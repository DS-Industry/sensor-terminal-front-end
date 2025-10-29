import { useEffect } from 'react';
import useStore from '../state/store';
import { globalWebSocketManager } from '../../util/websocketManager';
import { EOrderStatus } from '../state/order/orderSlice';
import { getOrderById } from '../../api/services/payment';

export function GlobalWebSocketManager() {
  const { order, setOrder, setBankCheck, setNavigationTarget, setErrorText } = useStore();

  const setCheck = async (id: string) => {
    const response = await getOrderById(id);

    console.log("Запрос заказа", id, response);

    if (response.qr_code) {
      console.log("получили qr: ", response.qr_code);

      setBankCheck(response.qr_code);
    }
  }

  useEffect(() => {
    console.log('Initializing global WebSocket manager...');

    const handleStatusUpdate = (data: any) => {
      if (data.type === 'status_update' && data.order_id) {
        console.log('🔄 Updating order status globally:', data.status);

        setOrder({
          ...order,
          id: data.order_id,
          status: data.status,
          transactionId: data.transaction_id,
        });

      }

      if (data.status === EOrderStatus.PAYED) {
        setCheck(data.order_id);
      }
    };

    const handleError = (data: any) => {
      if (data.type === 'error') {
        console.error('🔴 WebSocket error received:', data);

        switch (data.code) {
          case 1001:
            // Ошибка оплаты наличными
            setErrorText("Ошибка оплаты");
            console.log('Ошибка оплаты наличными');
            break;

          case 1002:
            // Ошибка оплаты по безналу
            setErrorText("Ошибка оплаты");
            console.log('Ошибка оплаты по безналу');
            break;

          case 1003:
            // Ошибка оплаты по лояльности
            setErrorText("Ошибка оплаты картой лояльности");
            console.log('Ошибка оплаты картой лояльности');
            break;

          case 1004:
            // Ошибка запуска оборудования
            setErrorText("Ошибка запуска оборудования");
            console.log('Ошибка запуска оборудования');
            break;

          default:
            console.log('Неизвестный код ошибки: ', data.code);
        }

        setNavigationTarget('/error');
      }
    };

    const removeStatusListener = globalWebSocketManager.addListener('status_update', handleStatusUpdate);
    const removeErrorListener = globalWebSocketManager.addListener('error', handleError);

    return () => {
      removeStatusListener();
      removeErrorListener();
    };
  }, []);

  return null;
}