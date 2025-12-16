import { useState } from 'react';
import useStore from '../state/store';
import { globalWebSocketManager, WebSocketMessage } from '../../util/websocketManager';
import { EOrderStatus } from '../state/order/orderSlice';
import { logger } from '../../util/logger';

export default function CashPaymentDevPanel() {
  const { order, insertedAmount, selectedProgram, paymentState, setInsertedAmount } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  const handleAddCash = (amount: number) => {
    const newAmount = insertedAmount + amount;
    setInsertedAmount(newAmount);
    logger.info(`[DEV] Simulated cash insertion: +${amount} руб. Total: ${newAmount} руб.`);
  };

  const handleSimulateWebSocket = (status: EOrderStatus) => {
    if (!order?.id) {
      logger.warn('[DEV] Cannot simulate WebSocket event: no order ID');
      return;
    }

    const message: WebSocketMessage = {
      type: 'status_update',
      order_id: order.id,
      status: status,
      timestamp: new Date().toISOString(),
    };

    globalWebSocketManager.simulateEvent(message);
    logger.info(`[DEV] Simulated WebSocket event: ${status}`);
  };

  const handleReset = () => {
    setInsertedAmount(0);
    logger.info('[DEV] Reset inserted amount to 0');
  };

  const remainingAmount = selectedProgram
    ? Math.max(0, Number(selectedProgram.price) - insertedAmount)
    : 0;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg font-semibold text-sm"
        >
          🧪 DEV Panel
        </button>
      ) : (
        <div className="bg-white border-2 border-purple-500 rounded-lg shadow-2xl p-4 w-80 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-purple-600">🧪 Cash Payment Dev Panel</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Current State */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs font-semibold text-gray-600 mb-2">Current State:</div>
            <div className="space-y-1 text-xs">
              <div>
                <span className="font-medium">Order ID:</span>{' '}
                <span className="text-gray-600">{order?.id || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium">Payment State:</span>{' '}
                <span className="text-gray-600">{paymentState}</span>
              </div>
              <div>
                <span className="font-medium">Program Price:</span>{' '}
                <span className="text-gray-600">{selectedProgram?.price || 0} руб.</span>
              </div>
              <div>
                <span className="font-medium">Inserted:</span>{' '}
                <span className="text-green-600 font-bold">{insertedAmount} руб.</span>
              </div>
              <div>
                <span className="font-medium">Remaining:</span>{' '}
                <span className="text-orange-600 font-bold">{remainingAmount} руб.</span>
              </div>
            </div>
          </div>

          {/* Simulate Cash Insertion */}
          <div className="mb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              💵 Simulate Cash Insertion:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleAddCash(50)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
              >
                +50 ₽
              </button>
              <button
                onClick={() => handleAddCash(100)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
              >
                +100 ₽
              </button>
              <button
                onClick={() => handleAddCash(200)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
              >
                +200 ₽
              </button>
            </div>
            <button
              onClick={handleReset}
              className="mt-2 w-full bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
            >
              Reset Amount
            </button>
          </div>

          {/* Simulate WebSocket Events */}
          <div className="mb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              📡 Simulate WebSocket Events:
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleSimulateWebSocket(EOrderStatus.PROCESSING)}
                disabled={!order?.id}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
              >
                Send PROCESSING
              </button>
              <button
                onClick={() => handleSimulateWebSocket(EOrderStatus.PAYED)}
                disabled={!order?.id}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
              >
                Send PAYED
              </button>
              <button
                onClick={() => handleSimulateWebSocket(EOrderStatus.WAITING_PAYMENT)}
                disabled={!order?.id}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
              >
                Send WAITING_PAYMENT
              </button>
            </div>
          </div>

          {/* Quick Test Scenarios */}
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2">
              🎯 Quick Test Scenarios:
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  handleReset();
                  if (selectedProgram) {
                    const price = Number(selectedProgram.price);
                    // Add enough money to trigger polling stop
                    setInsertedAmount(price);
                    logger.info(`[DEV] Quick test: Set amount to ${price} руб.`);
                  }
                }}
                disabled={!selectedProgram}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
              >
                Set Full Amount
              </button>
              <button
                onClick={() => {
                  handleReset();
                  if (selectedProgram) {
                    const price = Number(selectedProgram.price);
                    // Add partial amount
                    setInsertedAmount(Math.floor(price / 2));
                    logger.info(`[DEV] Quick test: Set partial amount to ${Math.floor(price / 2)} руб.`);
                  }
                }}
                disabled={!selectedProgram}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
              >
                Set Half Amount
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 p-2 bg-blue-50 rounded text-xs text-gray-600">
            <div className="font-semibold mb-1">ℹ️ Usage:</div>
            <ol className="list-decimal list-inside space-y-1">
              <li>Add cash using buttons above</li>
              <li>When amount ≥ price, polling stops</li>
              <li>Send PROCESSING to show loading</li>
              <li>Send PAYED to complete payment</li>
            </ol>
          </div>

          {/* Warning about Polling */}
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            <div className="font-semibold mb-1">⚠️ Note:</div>
            <div>
              Polling runs every 3 seconds and may overwrite insertedAmount if API returns different value.
              For full polling test, mock getOrderById API response or use real backend.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

