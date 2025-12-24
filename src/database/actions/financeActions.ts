// src/database/actions/financeActions.ts
import { database } from '../index';
import FinanceLog from '../models/FinanceLog';

export async function createFinanceLog(data: {
  transactionType: 'income' | 'expense';
  item: string;
  quantity: number;
  cost: number;
  currency?: string;
  typeCategory: string;
  location?: string;
  notes?: string;
}) {
  return await database.write(async () => {
    const financeLogsCollection = database.get<FinanceLog>('finance_logs');

    const newLog = await financeLogsCollection.create((log) => {
      log.transactionType = data.transactionType;
      log.item = data.item;
      log.quantity = data.quantity;
      log.cost = data.cost;
      log.totalCost = data.quantity * data.cost;
      log.currency = data.currency || 'PHP';
      log.typeCategory = data.typeCategory;
      log.location = data.location;
      log.notes = data.notes;
      log.transactionDate = new Date();
      log.isSynced = false;
    });

    return newLog;
  });
}