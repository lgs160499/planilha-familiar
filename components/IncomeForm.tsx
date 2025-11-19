import React from 'react';
import { IncomeDetails } from '../types';

interface IncomeFormProps {
  income: IncomeDetails;
  onChange: (field: keyof IncomeDetails, value: number) => void;
}

export const IncomeForm: React.FC<IncomeFormProps> = ({ income, onChange }) => {
  
  const incomeValues = Object.values(income) as number[];
  const totalIncome = incomeValues.reduce((a: number, b: number) => a + b, 0);

  const handleChange = (field: keyof IncomeDetails, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange(field, isNaN(val) ? 0 : val);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="bg-emerald-600 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="text-white font-semibold text-lg">Detalhamento de Rendas (Entradas)</h3>
        
        <div className="flex items-center gap-4">
          <span className="text-emerald-100 font-mono text-xl font-bold bg-emerald-800/30 px-3 py-1 rounded-lg">
            R$ {totalIncome.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
          </span>
        </div>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Natiely */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">Natiely</h4>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Salário Fixo</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400 text-sm">R$</span>
              <input
                type="number"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                value={income.salaryFixedNatiely || ''}
                onChange={(e) => handleChange('salaryFixedNatiely', e)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Salário Variável</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400 text-sm">R$</span>
              <input
                type="number"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                value={income.salaryVarNatiely || ''}
                onChange={(e) => handleChange('salaryVarNatiely', e)}
              />
            </div>
          </div>
        </div>

        {/* Lucas */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">Lucas</h4>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Salário Fixo (WS)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400 text-sm">R$</span>
              <input
                type="number"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                value={income.salaryFixedLucasWS || ''}
                onChange={(e) => handleChange('salaryFixedLucasWS', e)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Salário Fixo (Vivin)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400 text-sm">R$</span>
              <input
                type="number"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                value={income.salaryFixedLucasVivin || ''}
                onChange={(e) => handleChange('salaryFixedLucasVivin', e)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Salário Variável</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400 text-sm">R$</span>
              <input
                type="number"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                value={income.salaryVarLucas || ''}
                onChange={(e) => handleChange('salaryVarLucas', e)}
              />
            </div>
          </div>
        </div>

        {/* Others */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">Outros</h4>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Outras Rendas</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400 text-sm">R$</span>
              <input
                type="number"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                value={income.others || ''}
                onChange={(e) => handleChange('others', e)}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};