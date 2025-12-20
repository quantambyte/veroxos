import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '../../entities/order-status.enum';

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.COMPLETED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.COMPLETED],
  [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.COMPLETED],
  [OrderStatus.READY]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
};

export function validateOrderStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
): void {
  if (currentStatus === newStatus) {
    return;
  }

  const allowedTransitions = validTransitions[currentStatus];

  if (!allowedTransitions.includes(newStatus)) {
    throw new BadRequestException(
      `Cannot transition order from ${currentStatus} to ${newStatus}. Valid transitions: ${allowedTransitions.join(', ') || 'none'}`,
    );
  }
}
