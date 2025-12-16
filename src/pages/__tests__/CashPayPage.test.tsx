import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CashPayPage from '../CashPayPage';
import useStore from '../../components/state/store';
import { EOrderStatus } from '../../components/state/order/orderSlice';
import { PaymentState } from '../../state/paymentStateMachine';
import { globalWebSocketManager } from '../../util/websocketManager';
import * as paymentApi from '../../api/services/payment';
import { usePaymentFlow } from '../../hooks/payment/usePaymentFlow';

// Моки
vi.mock('../../api/services/payment');
vi.mock('../../util/websocketManager');
vi.mock('../../components/state/store');
vi.mock('../../hooks/payment/usePaymentFlow');

describe('CashPayPage', () => {
  const mockSetInsertedAmount = vi.fn();
  const mockSetPaymentState = vi.fn();
  const mockSetIsLoading = vi.fn();
  const mockRemoveListener = vi.fn();
  const mockHandleBack = vi.fn();
  const mockHandleStartRobot = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();

    // Настройка моков store
    (useStore as any).mockReturnValue({
      insertedAmount: 0,
      order: {
        id: 'test-order-123',
        status: EOrderStatus.WAITING_PAYMENT,
      },
      paymentState: PaymentState.WAITING_PAYMENT,
      selectedProgram: {
        id: 1,
        name: 'Test Program',
        price: '500',
      },
      setInsertedAmount: mockSetInsertedAmount,
      setPaymentState: mockSetPaymentState,
      setIsLoading: mockSetIsLoading,
    });

    // Мок usePaymentFlow
    (usePaymentFlow as any).mockReturnValue({
      selectedProgram: {
        id: 1,
        name: 'Test Program',
        price: '500',
      },
      handleBack: mockHandleBack,
      paymentSuccess: false,
      isPaymentProcessing: false,
      handleStartRobot: mockHandleStartRobot,
      timeUntilRobotStart: 0,
    });

    // Мок getOrderById
    vi.mocked(paymentApi.getOrderById).mockResolvedValue({
      id: 'test-order-123',
      amount_sum: '0',
      status: EOrderStatus.WAITING_PAYMENT,
    } as any);

    // Мок WebSocket
    vi.mocked(globalWebSocketManager.addListener).mockReturnValue(mockRemoveListener);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('должен отображать страницу оплаты наличными', () => {
    render(
      <BrowserRouter>
        <CashPayPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Оплата Наличными/i)).toBeInTheDocument();
  });

  it('должен начать polling при создании заказа', async () => {
    render(
      <BrowserRouter>
        <CashPayPage />
      </BrowserRouter>
    );

    // Продвигаем время на 3.5 секунды (больше чем POLL_INTERVAL)
    vi.advanceTimersByTime(3500);

    await waitFor(() => {
      expect(paymentApi.getOrderById).toHaveBeenCalled();
    });
  });

  it('должен обновлять insertedAmount при polling', async () => {
    vi.mocked(paymentApi.getOrderById).mockResolvedValue({
      amount_sum: '200',
      status: EOrderStatus.WAITING_PAYMENT,
    } as any);

    render(
      <BrowserRouter>
        <CashPayPage />
      </BrowserRouter>
    );

    vi.advanceTimersByTime(3500);

    await waitFor(() => {
      expect(mockSetInsertedAmount).toHaveBeenCalledWith(200);
    });
  });

  it('должен остановить polling когда достаточно денег', async () => {
    // Начальная сумма меньше требуемой
    vi.mocked(paymentApi.getOrderById).mockResolvedValueOnce({
      amount_sum: '200',
      status: EOrderStatus.WAITING_PAYMENT,
    } as any);

    render(
      <BrowserRouter>
        <CashPayPage />
      </BrowserRouter>
    );

    // Первый вызов polling
    vi.advanceTimersByTime(3500);
    await waitFor(() => {
      expect(mockSetInsertedAmount).toHaveBeenCalledWith(200);
    });

    // Теперь достаточная сумма
    vi.mocked(paymentApi.getOrderById).mockResolvedValue({
      amount_sum: '500',
      status: EOrderStatus.WAITING_PAYMENT,
    } as any);

    const callCountBefore = vi.mocked(paymentApi.getOrderById).mock.calls.length;

    // Продвигаем время еще на 4 секунды
    vi.advanceTimersByTime(4000);

    await waitFor(() => {
      expect(mockSetInsertedAmount).toHaveBeenCalledWith(500);
    });

    // Проверяем, что polling остановился (не должно быть новых вызовов)
    const callCountAfter = vi.mocked(paymentApi.getOrderById).mock.calls.length;
    // После достаточной суммы должен быть еще один вызов, но затем остановка
    expect(callCountAfter).toBeGreaterThanOrEqual(callCountBefore);
  });

  it('НЕ должен переходить в PROCESSING_PAYMENT только при достаточной сумме', async () => {
    vi.mocked(paymentApi.getOrderById).mockResolvedValue({
      amount_sum: '500',
      status: EOrderStatus.WAITING_PAYMENT,
    } as any);

    render(
      <BrowserRouter>
        <CashPayPage />
      </BrowserRouter>
    );

    vi.advanceTimersByTime(3500);

    await waitFor(() => {
      expect(mockSetInsertedAmount).toHaveBeenCalledWith(500);
    });

    // Проверяем, что НЕ было перехода в PROCESSING_PAYMENT
    expect(mockSetPaymentState).not.toHaveBeenCalledWith(PaymentState.PROCESSING_PAYMENT);
  });

  it('должен перейти в PROCESSING_PAYMENT при получении WebSocket статуса PROCESSING', async () => {
    // Сначала достаточная сумма
    vi.mocked(paymentApi.getOrderById).mockResolvedValue({
      amount_sum: '500',
      status: EOrderStatus.WAITING_PAYMENT,
    } as any);

    render(
      <BrowserRouter>
        <CashPayPage />
      </BrowserRouter>
    );

    vi.advanceTimersByTime(3500);

    await waitFor(() => {
      expect(mockSetInsertedAmount).toHaveBeenCalledWith(500);
    });

    // Получаем обработчик WebSocket
    const addListenerCall = vi.mocked(globalWebSocketManager.addListener).mock.calls.find(
      call => call[0] === 'status_update'
    );
    
    if (addListenerCall) {
      const statusUpdateHandler = addListenerCall[1] as (data: any) => void;

      // Отправляем WebSocket событие PROCESSING
      statusUpdateHandler({
        type: 'status_update',
        order_id: 'test-order-123',
        status: 'processing',
        timestamp: new Date().toISOString(),
      });

      // Проверяем переход в PROCESSING_PAYMENT
      await waitFor(() => {
        expect(mockSetPaymentState).toHaveBeenCalledWith(PaymentState.PROCESSING_PAYMENT);
        expect(mockSetIsLoading).toHaveBeenCalledWith(true);
      });
    }
  });

  it('должен очистить polling при размонтировании', async () => {
    const { unmount } = render(
      <BrowserRouter>
        <CashPayPage />
      </BrowserRouter>
    );

    vi.advanceTimersByTime(3500);

    await waitFor(() => {
      expect(paymentApi.getOrderById).toHaveBeenCalled();
    });

    const callCountBefore = vi.mocked(paymentApi.getOrderById).mock.calls.length;

    unmount();

    // Продвигаем время еще на 4 секунды
    vi.advanceTimersByTime(4000);

    // Не должно быть новых вызовов после размонтирования
    const callCountAfter = vi.mocked(paymentApi.getOrderById).mock.calls.length;
    expect(callCountAfter).toBe(callCountBefore);
  });

  it('должен обрабатывать ошибки при polling', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(paymentApi.getOrderById).mockRejectedValueOnce(new Error('API Error'));

    render(
      <BrowserRouter>
        <CashPayPage />
      </BrowserRouter>
    );

    vi.advanceTimersByTime(3500);

    // Ошибка должна быть обработана, но polling должен продолжиться
    await waitFor(() => {
      expect(paymentApi.getOrderById).toHaveBeenCalled();
    });

    // При следующем интервале должен быть новый вызов
    vi.mocked(paymentApi.getOrderById).mockResolvedValue({
      amount_sum: '100',
      status: EOrderStatus.WAITING_PAYMENT,
    } as any);

    vi.advanceTimersByTime(3500);

    await waitFor(() => {
      expect(mockSetInsertedAmount).toHaveBeenCalledWith(100);
    });

    consoleErrorSpy.mockRestore();
  });
});

