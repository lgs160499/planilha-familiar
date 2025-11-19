import { MonthData, ExpenseCategory, IncomeDetails, Budget } from './types';

export const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const DEFAULT_INCOME: IncomeDetails = {
  salaryFixedNatiely: 3500,
  salaryVarNatiely: 0,
  salaryFixedLucasWS: 4000,
  salaryFixedLucasVivin: 2500,
  salaryVarLucas: 0,
  others: 0
};

// Função para calcular orçamento sugerido baseado na renda (50/30/20)
const calculateDefaultBudget = (income: IncomeDetails): Budget => {
  const totalIncome = Object.values(income).reduce((a, b) => a + b, 0);
  return {
    [ExpenseCategory.ESSENTIAL]: totalIncome * 0.50,  // 50%
    [ExpenseCategory.DESIRE]: totalIncome * 0.30,     // 30%
    [ExpenseCategory.INVESTMENT]: totalIncome * 0.20  // 20%
  };
};

// Dados antigos removidos conforme solicitado. A lista inicia vazia.
const EXISTING_DATA: MonthData[] = [];

// Função auxiliar para gerar o período solicitado (Nov/25 a Out/26)
const generateFuturePeriod = (): MonthData[] => {
  const months: MonthData[] = [];
  
  // Lista de (mesIndex, ano) para o período solicitado
  const periods = [
    { index: 10, year: 2025 }, // Novembro 2025
    { index: 11, year: 2025 }, // Dezembro 2025
    { index: 0, year: 2026 },  // Janeiro 2026
    { index: 1, year: 2026 },  // Fevereiro 2026
    { index: 2, year: 2026 },  // Março 2026
    { index: 3, year: 2026 },  // Abril 2026
    { index: 4, year: 2026 },  // Maio 2026
    { index: 5, year: 2026 },  // Junho 2026
    { index: 6, year: 2026 },  // Julho 2026
    { index: 7, year: 2026 },  // Agosto 2026
    { index: 8, year: 2026 },  // Setembro 2026
    { index: 9, year: 2026 },  // Outubro 2026
  ];

  const defaultBudget = calculateDefaultBudget(DEFAULT_INCOME);

  periods.forEach(({ index, year }) => {
    const monthName = MONTH_NAMES[index];
    // Cria ID único ex: nov-2025
    const id = `${monthName.toLowerCase().substring(0, 3)}-${year}`;
    
    months.push({
      id,
      monthName,
      year,
      monthIndex: index,
      income: { ...DEFAULT_INCOME },
      budget: { ...defaultBudget },
      expenses: []
    });
  });

  return months;
};

export const INITIAL_DATA: MonthData[] = [
  ...EXISTING_DATA,
  ...generateFuturePeriod()
];