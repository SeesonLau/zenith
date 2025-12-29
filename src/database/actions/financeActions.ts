// src/database/actions/financeActions.ts (COMPLETE FIX)
import { database } from '../index';
import FinanceLog from '../models/FinanceLog';
import { getDeviceId } from '@/src/lib/supabase';
import type { CreateFinanceLogInput } from '@/src/types/database.types';

export async function createFinanceLog(input: CreateFinanceLogInput) {
  const deviceId = await getDeviceId();
  
  return await database.write(async () => {
    const financeLogsCollection = database.get<FinanceLog>('finance_logs');

    return await financeLogsCollection.create((log) => {
      log.transactionType = input.transactionType;
      log.item = input.item;
      log.quantity = input.quantity;
      log.cost = input.cost;
      log.totalCost = input.quantity * input.cost;
      log.currency = input.currency || 'PHP';
      log.typeCategory = input.typeCategory;
      log.location = input.location;
      log.notes = input.notes;
      log.transactionDate = new Date();
      log.isSynced = false;
      log.deviceId = deviceId;
    });
  });
}

export async function updateFinanceLog(logId: string, input: Partial<CreateFinanceLogInput>) {
  return await database.write(async () => {
    const financeLogsCollection = database.get<FinanceLog>('finance_logs');
    const log = await financeLogsCollection.find(logId);

    await log.update((record) => {
      if (input.transactionType !== undefined) record.transactionType = input.transactionType;
      if (input.item !== undefined) record.item = input.item;
      if (input.quantity !== undefined) record.quantity = input.quantity;
      if (input.cost !== undefined) record.cost = input.cost;
      if (input.quantity !== undefined || input.cost !== undefined) {
        record.totalCost = (input.quantity ?? record.quantity) * (input.cost ?? record.cost);
      }
      if (input.currency !== undefined) record.currency = input.currency;
      if (input.typeCategory !== undefined) record.typeCategory = input.typeCategory;
      if (input.location !== undefined) record.location = input.location;
      if (input.notes !== undefined) record.notes = input.notes;
      record.isSynced = false;
    });

    return log;
  });
}

export async function deleteFinanceLog(logId: string) {
  return await database.write(async () => {
    const financeLogsCollection = database.get<FinanceLog>('finance_logs');
    const log = await financeLogsCollection.find(logId);
    await log.markAsDeleted();
  });
}