import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { MonthData, ExpenseCategory, Expense } from '../types';

interface DashboardProps {
  data: MonthData[];
  selectedMonthId: string;
  onMonthChange: (id: string) => void;
}

const COLORS = {
  [ExpenseCategory.ESSENTIAL]: '#F59E0B', // Amber 500
  [ExpenseCategory.DESIRE]: '#EF4444',    // Red 500
  [ExpenseCategory.INVESTMENT]: '#10B981' // Emerald 500
};

export const Dashboard: React.FC<DashboardProps> = ({ data, selectedMonthId, onMonthChange }) => {
  
  const currentMonth = data.find(m => m.id === selectedMonthId) || data[0];

  // Process Pie Chart Data (Expenses by Category for selected month)
  const pieData = useMemo(() => {
    const categoryTotals = currentMonth.expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    const values = Object.values(categoryTotals) as number[];
    const total = values.reduce((a: number, b: number) => a + b, 0);

    return Object.entries(categoryTotals).map(([name, value]) => {
      const val = value as number;
      return {
        name,
        value: val,
        percentage: total > 0 ? ((val / total) * 100).toFixed(1) : '0'
      };
    });
  }, [currentMonth]);

  // Process Bar Chart Data (Total Income vs Total Expense per month)
  const barData = useMemo(() => {
    return data.map(month => {
      const incomeValues = Object.values(month.income) as number[];
      const totalIncome = incomeValues.reduce((a: number, b: number) => a + b, 0);
      const totalExpense = month.expenses.reduce((a: number, b: Expense) => a + b.amount, 0);
      return {
        name: month.monthName.substring(0, 3),
        Entradas: totalIncome,
        Saidas: totalExpense,
        Saldo: totalIncome - totalExpense
      };
    });
  }, [data]);

  const incomeValues = Object.values(currentMonth.income) as number[];
  const totalMonthIncome = incomeValues.reduce((a: number, b: number) => a + b, 0);
  const totalMonthExpense = currentMonth.expenses.reduce((a: number, b: Expense) => a + b.amount, 0);
  const balance = totalMonthIncome - totalMonthExpense;

  // Calculate Budget Progress
  const budgetProgress = useMemo(() => {
    const totals = currentMonth.expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    return Object.values(ExpenseCategory).map(cat => {
      const spent = totals[cat] || 0;
      const budget = currentMonth.budget ? currentMonth.budget[cat] : 0;
      const percentage = budget > 0 ? (spent / budget) * 100 : 0;
      return {
        category: cat,
        spent,
        budget,
        percentage
      };
    });
  }, [currentMonth]);

  return (
    <div className="space-y-6 mb-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 shadow-sm">
          <p className="text-sm text-emerald-600 font-medium uppercase">Total Entradas ({currentMonth.monthName})</p>
          <p className="text-3xl font-bold text-emerald-800 mt-2">
            R$ {totalMonthIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-rose-50 p-6 rounded-xl border border-rose-100 shadow-sm">
          <p className="text-sm text-rose-600 font-medium uppercase">Total Saídas ({currentMonth.monthName})</p>
          <p className="text-3xl font-bold text-rose-800 mt-2">
            R$ {totalMonthExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className={`p-6 rounded-xl border shadow-sm ${balance >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
          <p className={`text-sm font-medium uppercase ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>Saldo Mensal</p>
          <p className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Budget Progress Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Acompanhamento de Orçamento</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {budgetProgress.map((item) => (
            <div key={item.category} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">{item.category}</span>
                <span className="text-gray-500">
                  {item.spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / {item.budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-500 ${item.percentage > 100 ? 'bg-red-500' : ''}`}
                  style={{ 
                    width: `${Math.min(item.percentage, 100)}%`,
                    backgroundColor: item.percentage > 100 ? undefined : COLORS[item.category]
                  }}
                ></div>
              </div>
              <div className="text-xs text-right font-medium">
                <span className={item.percentage > 100 ? 'text-red-600' : 'text-gray-600'}>
                  {item.percentage.toFixed(1)}% utilizado
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Distribuição de Gastos</h3>
            <select 
              value={selectedMonthId} 
              onChange={(e) => onMonthChange(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
            >
              {data.map(m => (
                <option key={m.id} value={m.id}>{m.monthName} {m.year}</option>
              ))}
            </select>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as ExpenseCategory]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend with Percentages */}
          <div className="flex justify-center gap-4 mt-2 text-sm">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[entry.name as ExpenseCategory] }}></span>
                <span className="font-medium">{entry.name}:</span>
                <span className="text-gray-600">{entry.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Histórico Mensal (Entradas vs Saídas)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
                <Bar dataKey="Entradas" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Saidas" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};