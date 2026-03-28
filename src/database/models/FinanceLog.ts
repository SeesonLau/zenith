// src/database/models/FinanceLog.ts
import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, writer } from '@nozbe/watermelondb/decorators';

export default class FinanceLog extends Model {
  static table = 'finance_logs';

  @field('transaction_type') transactionType!: 'income' | 'expense';
  @field('location') location?: string;
  @field('item') item!: string;
  @field('quantity') quantity!: number;
  @field('cost') cost!: number;
  @field('total_cost') totalCost!: number;
  @field('currency') currency!: string;
  @field('type_category') typeCategory!: string;
  @date('transaction_date') transactionDate!: Date;
  @field('notes') notes?: string;
  @field('is_synced') isSynced!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  @field('device_id') deviceId?: string;
  // Getter for formatted total cost
  get formattedTotal(): string {
    return `${this.currency} ${this.totalCost.toFixed(2)}`;
  }

  @writer async updateQuantityAndCost(quantity: number, cost: number) {
    await this.update((log) => {
      log.quantity = quantity;
      log.cost = cost;
      log.totalCost = quantity * cost;
      log.isSynced = false;
    });
  }
}