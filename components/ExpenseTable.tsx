import React, { useState } from 'react';
import { Expense, ExpenseCategory, PaymentMethod } from '../types';

interface ExpenseTableProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'> & { totalInstallments?: number }) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, onAddExpense, onDeleteExpense }) => {
  // Helper para pegar data de hoje no formato YYYY-MM-DD (Input Date)
  const getToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCat, setNewCat] = useState<ExpenseCategory>(ExpenseCategory.ESSENTIAL);
  const [newDate, setNewDate] = useState(getToday());
  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>(PaymentMethod.DEBIT);
  const [totalInstallments, setTotalInstallments] = useState('');
  
  const [isRecurring, setIsRecurring] = useState(false);
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'ALL'>('ALL');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newAmount || !newDate) return;

    const installmentsCount = parseInt(totalInstallments);

    onAddExpense({
      description: newDesc,
      amount: parseFloat(newAmount),
      category: newCat,
      date: newDate,
      isRecurring,
      paymentMethod: newPaymentMethod,
      totalInstallments: isNaN(installmentsCount) ? undefined : installmentsCount
    });

    setNewDesc('');
    setNewAmount('');
    setNewDate(getToday());
    setTotalInstallments('');
    setIsRecurring(false);
  };

  const categoryColor = (cat: ExpenseCategory) => {
    switch(cat) {
      case ExpenseCategory.ESSENTIAL: return 'bg-amber-100 text-amber-800';
      case ExpenseCategory.DESIRE: return 'bg-red-100 text-red-800';
      case ExpenseCategory.INVESTMENT: return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const paymentMethodBadge = (method: PaymentMethod) => {
    switch(method) {
        case PaymentMethod.CREDIT: return 'text-purple-700 bg-purple-50 border-purple-100';
        case PaymentMethod.PIX: return 'text-teal-700 bg-teal-50 border-teal-100';
        case PaymentMethod.CASH: return 'text-green-700 bg-green-50 border-green-100';
        default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  const filteredExpenses = filterCategory === 'ALL' 
    ? expenses 
    : expenses.filter(e => e.category === filterCategory);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-rose-600 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-white font-semibold text-lg">Saídas (Despesas)</h3>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
           <select
             value={filterCategory}
             onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | 'ALL')}
             className="bg-rose-700 text-white text-sm border border-rose-500 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-white/50 outline-none w-full sm:w-auto cursor-pointer hover:bg-rose-600 transition-colors"
           >
             <option value="ALL">Todas as Categorias</option>
             {Object.values(ExpenseCategory).map(cat => (
               <option key={cat} value={cat}>{cat}</option>
             ))}
           </select>
        </div>
      </div>

      {/* Add Expense Form */}
      <form onSubmit={handleAdd} className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
            <input
              type="text"
              placeholder="Ex: Supermercado"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 outline-none bg-white"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Valor Total</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 outline-none bg-white"
              value={newAmount}
              onChange={e => setNewAmount(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {totalInstallments && parseInt(totalInstallments) > 1 ? "Data 1ª Parc." : "Data"}
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 outline-none bg-white cursor-pointer"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              onClick={(e) => {
                // Tenta abrir o seletor nativo ao clicar em qualquer lugar do input
                try {
                  if ('showPicker' in HTMLInputElement.prototype) {
                    e.currentTarget.showPicker();
                  }
                } catch (error) {
                  // Fallback silencioso se o navegador não suportar ou bloquear
                }
              }}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Categoria</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 outline-none bg-white"
              value={newCat}
              onChange={e => setNewCat(e.target.value as ExpenseCategory)}
            >
              {Object.values(ExpenseCategory).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
             <label className="block text-xs font-medium text-gray-500 mb-1">Pagamento</label>
             <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 outline-none bg-white"
              value={newPaymentMethod}
              onChange={e => setNewPaymentMethod(e.target.value as PaymentMethod)}
            >
              {Object.values(PaymentMethod).map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
             <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-md font-medium transition-colors flex justify-center items-center shadow-sm"
            >
              +
            </button>
          </div>
        </div>
        
        <div className="mt-3 flex flex-wrap items-center gap-6">
           <div className="flex items-center gap-2">
             <label className="text-xs text-gray-600 font-medium">Qtd Parcelas:</label>
             <input 
               type="number" 
               min="1"
               placeholder="1"
               className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-rose-500 outline-none bg-white"
               value={totalInstallments}
               onChange={e => setTotalInstallments(e.target.value)}
             />
           </div>

           <div className="flex items-center gap-2">
              <input 
                  id="recurring"
                  type="checkbox" 
                  className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded bg-white"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  disabled={!!totalInstallments && parseInt(totalInstallments) > 1}
              />
              <label htmlFor="recurring" className={`text-xs font-medium flex items-center gap-1 select-none cursor-pointer ${!!totalInstallments && parseInt(totalInstallments) > 1 ? 'text-gray-300' : 'text-gray-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Fixa (Recorrente)
              </label>
           </div>
        </div>
      </form>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Pagamento</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  {filterCategory === 'ALL' 
                    ? "Nenhuma despesa lançada neste mês." 
                    : `Nenhuma despesa encontrada na categoria "${filterCategory}".`}
                </td>
              </tr>
            ) : (
              filteredExpenses.map((expense) => (
                <tr key={expense.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-600 text-xs whitespace-nowrap">
                    {new Date(expense.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      {expense.description}
                      {expense.isRecurring && (
                        <span className="text-indigo-500 bg-indigo-50 p-1 rounded" title="Despesa Recorrente">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                           </svg>
                        </span>
                      )}
                      {expense.installments && (
                         <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full border border-gray-200">
                           {expense.installments}
                         </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-medium whitespace-nowrap ${paymentMethodBadge(expense.paymentMethod)}`}>
                      {expense.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-rose-600">
                    R$ {expense.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => onDeleteExpense(expense.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};