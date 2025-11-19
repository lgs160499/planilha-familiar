export enum ExpenseCategory {
  ESSENTIAL = 'Essencial',
  DESIRE = 'Desejo',
  INVESTMENT = 'Investimento'
}

export enum PaymentMethod {
  CREDIT = 'Crédito',
  DEBIT = 'Débito',
  PIX = 'PIX',
  CASH = 'Dinheiro',
  TRANSFER = 'Transferência'
}

export interface IncomeDetails {
  salaryFixedNatiely: number;
  salaryVarNatiely: number;
  salaryFixedLucasWS: number;
  salaryFixedLucasVivin: number;
  salaryVarLucas: number;
  others: number;
}

export interface Budget {
  [ExpenseCategory.ESSENTIAL]: number;
  [ExpenseCategory.DESIRE]: number;
  [ExpenseCategory.INVESTMENT]: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  isRecurring?: boolean;
  paymentMethod: PaymentMethod;
  installments?: string; // ex: "1/12"
}

export interface MonthData {
  id: string;
  monthName: string; // e.g., "Janeiro 2024"
  year: number;
  monthIndex: number; // 0-11
  income: IncomeDetails;
  budget: Budget;
  expenses: Expense[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}