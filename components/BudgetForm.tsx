import React from 'react';
import { Budget, ExpenseCategory } from '../types';

interface BudgetFormProps {
  budget: Budget;
  onChange: (category: ExpenseCategory, value: number) => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ budget, onChange }) => {
  
  const handleChange = (category: ExpenseCategory, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange(category, isNaN(val) ? 0 : val);
  };

  const totalBudget = (Object.values(budget || {}) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
        <h3 className="text-white font-semibold text-lg">Definição de Orçamento Mensal</h3>
        <span className="text-indigo-100 font-mono text-sm bg-indigo-800/30 px-3 py-1 rounded-lg">
          Total Planejado: R$ {totalBudget.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
        </span>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Essential */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            Essencial (50%)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400 text-sm">R$</span>
            <input
              type="number"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              value={budget?.[ExpenseCategory.ESSENTIAL] || ''}
              onChange={(e) => handleChange(ExpenseCategory.ESSENTIAL, e)}
            />
          </div>
          <p className="text-[10px] text-gray-400">Moradia, alimentação, transporte, saúde.</p>
        </div>

        {/* Desire */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
            Desejo (30%)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400 text-sm">R$</span>
            <input
              type="number"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              value={budget?.[ExpenseCategory.DESIRE] || ''}
              onChange={(e) => handleChange(ExpenseCategory.DESIRE, e)}
            />
          </div>
          <p className="text-[10px] text-gray-400">Lazer, jantar fora, hobbies, compras.</p>
        </div>

        {/* Investment */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            Investimento (20%)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400 text-sm">R$</span>
            <input
              type="number"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              value={budget?.[ExpenseCategory.INVESTMENT] || ''}
              onChange={(e) => handleChange(ExpenseCategory.INVESTMENT, e)}
            />
          </div>
          <p className="text-[10px] text-gray-400">Reserva de emergência, aposentadoria, metas.</p>
        </div>

      </div>
    </div>
  );
};