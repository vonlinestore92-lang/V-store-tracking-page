import React from 'react';
import { Order, OrderStatus } from '../types';
import { STATUS_SEQUENCE, RETURN_STATUS_SEQUENCE } from '../constants';
import { Check, Clock, XCircle, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

interface OrderTimelineProps {
  order: Order;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const currentStatus = order.currentStatus;
  
  // Check if order is in return phase
  const isReturnPhase = RETURN_STATUS_SEQUENCE.includes(currentStatus as OrderStatus) || currentStatus === OrderStatus.RETURN_REJECTED;

  if (currentStatus === OrderStatus.CANCELLED) {
      return (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
              <div className="flex items-center">
                  <div className="flex-shrink-0"><XCircle className="h-5 w-5 text-red-500" /></div>
                  <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">Order is {currentStatus}</p>
                      <p className="text-xs text-red-600 mt-1">Last updated: {format(new Date(order.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
              </div>
          </div>
      );
  }

  // Decide which sequence to show
  const activeSequence = isReturnPhase ? RETURN_STATUS_SEQUENCE : STATUS_SEQUENCE;
  const currentStepIndex = activeSequence.indexOf(currentStatus as OrderStatus);

  return (
    <div className="py-6 mb-8">
      {isReturnPhase && (
        <div className="mb-4 flex items-center text-sm font-semibold text-blue-900 bg-blue-50 p-2 rounded-lg">
           <RotateCcw className="w-4 h-4 mr-2" />
           Return Process Initiated
        </div>
      )}

      <div className="relative">
        <div className="absolute top-0 left-5 h-full w-0.5 bg-gray-200 lg:hidden"></div>
        <div className="hidden lg:block absolute top-5 left-0 w-full h-0.5 bg-gray-200"></div>

        <div className="flex flex-col lg:flex-row justify-between lg:items-start space-y-8 lg:space-y-0 relative">
          {activeSequence.map((status, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const historyItem = order.history.find(h => h.status === status);
            const dateStr = historyItem ? format(new Date(historyItem.timestamp), 'MMM dd, HH:mm') : '';

            return (
              <div key={status} className="flex lg:flex-col items-center lg:flex-1 relative group">
                {index !== 0 && (
                   <div 
                    className={`hidden lg:block absolute top-5 right-[50%] w-full h-0.5 -translate-y-[50%] -z-10
                    ${index <= currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'}`}
                    style={{ right: '50%', width: '100%' }}
                   ></div>
                )}
                
                <div 
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 z-10 
                  ${isCompleted ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}
                  ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                >
                  {isCompleted ? <Check className="w-6 h-6 text-white" /> : <Clock className="w-5 h-5 text-gray-300" />}
                </div>

                <div className="ml-4 lg:ml-0 lg:mt-4 lg:text-center min-w-[120px]">
                  <p className={`text-sm font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>{status}</p>
                  {historyItem && <p className="text-xs text-gray-500 mt-1">{dateStr}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};