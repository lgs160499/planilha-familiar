import React, { useState } from 'react';
import { Expense, ExpenseCategory, PaymentMethod, Responsible } from '../types';

interface ExpenseTableProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'> & { totalInstallments?: number }) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, onAddExpense, onEditExpense, onDeleteExpense }) => {
  // Helper para pegar data de hoje no formato YYYY-MM-DD (Input Date)
  const getToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // State for Adding new Expense
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCat, setNewCat] = useState<ExpenseCategory>(ExpenseCategory.ESSENTIAL);
  const [newDate, setNewDate] = useState(getToday());
  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>(PaymentMethod.DEBIT);
  const [newResponsible, setNewResponsible] = useState<Responsible>(Responsible.BOTH);
  const [totalInstallments, setTotalInstallments] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  
  // State for Filtering
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'ALL'>('ALL');

  // State for Editing existing Expense
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Expense>>({});

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
      responsible: newResponsible,
      totalInstallments: isNaN(installmentsCount) ? undefined : installmentsCount
    });

    setNewDesc('');
    setNewAmount('');
    setNewDate(getToday());
    setTotalInstallments('');
    setIsRecurring(false);
    setNewResponsible(Responsible.BOTH);
  };

  const startEditing = (expense: Expense) => {
    setEditingId(expense.id);
    setEditFormData({ ...expense });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const saveEditing = () => {
    if (editingId && editFormData.description && editFormData.amount && editFormData.date) {
       onEditExpense(editFormData as Expense);
       setEditingId(null);
       setEditFormData({});
    }
  };

  const handleEditChange = (field: keyof Expense, value: any) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
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
  };

  const responsibleBadge = (resp: Responsible) => {
      switch(resp) {
          case Responsible.LUCAS: return 'bg-blue-100 text-blue-800 border-blue-200';
          case Responsible.NATIELY: return 'bg-pink-100 text-pink-800 border-pink-200';
          case Responsible.BOTH: return 'bg-gray-100 text-gray-600 border-gray-200';
          default: return 'bg-gray-100 text-gray-600';
      }
  };

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
                try {
                  if ('showPicker' in HTMLInputElement.prototype) {
                    e.currentTarget.showPicker();
                  }
                } catch (error) {}
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
          
          {/* Linha dividida para Pagamento e Responsável em telas menores se necessário, ou ajustando grid */}
          <div className="md:col-span-2 grid grid-cols-2 gap-2">
             <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Pagto</label>
                <select
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 outline-none bg-white text-sm"
                  value={newPaymentMethod}
                  onChange={e => setNewPaymentMethod(e.target.value as PaymentMethod)}
                >
                  {Object.values(PaymentMethod).map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
             </div>
             <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Resp.</label>
                <select
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 outline-none bg-white text-sm"
                  value={newResponsible}
                  onChange={e => setNewResponsible(e.target.value as Responsible)}
                >
                  {Object.values(Responsible).map(resp => (
                    <option key={resp} value={resp}>{resp}</option>
                  ))}
                </select>
             </div>
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
              <th className="px-4 py-3">Pagto / Resp.</th>
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
              filteredExpenses.map((expense) => {
                const isEditing = editingId === expense.id;

                if (isEditing) {
                  return (
                    <tr key={expense.id} className="bg-indigo-50 border-b border-indigo-100">
                       <td className="px-4 py-3">
                         <input 
                           type="date" 
                           className="w-full border rounded px-2 py-1 text-xs"
                           value={editFormData.date || ''}
                           onChange={(e) => handleEditChange('date', e.target.value)}
                         />
                       </td>
                       <td className="px-4 py-3">
                         <input 
                           type="text" 
                           className="w-full border rounded px-2 py-1 text-xs"
                           value={editFormData.description || ''}
                           onChange={(e) => handleEditChange('description', e.target.value)}
                         />
                       </td>
                       <td className="px-4 py-3">
                         <select
                           className="w-full border rounded px-2 py-1 text-xs mb-1"
                           value={editFormData.category}
                           onChange={(e) => handleEditChange('category', e.target.value as ExpenseCategory)}
                         >
                           {Object.values(ExpenseCategory).map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                           ))}
                         </select>
                       </td>
                       <td className="px-4 py-3">
                         <div className="flex flex-col gap-1">
                            <select
                              className="w-full border rounded px-2 py-1 text-xs"
                              value={editFormData.paymentMethod}
                              onChange={(e) => handleEditChange('paymentMethod', e.target.value as PaymentMethod)}
                            >
                              {Object.values(PaymentMethod).map(method => (
                                  <option key={method} value={method}>{method}</option>
                              ))}
                            </select>
                            <select
                              className="w-full border rounded px-2 py-1 text-xs"
                              value={editFormData.responsible || Responsible.BOTH}
                              onChange={(e) => handleEditChange('responsible', e.target.value as Responsible)}
                            >
                              {Object.values(Responsible).map(resp => (
                                  <option key={resp} value={resp}>{resp}</option>
                              ))}
                            </select>
                         </div>
                       </td>
                       <td className="px-4 py-3">
                         <input 
                           type="number" 
                           step="0.01"
                           className="w-full border rounded px-2 py-1 text-xs text-right"
                           value={editFormData.amount || ''}
                           onChange={(e) => handleEditChange('amount', parseFloat(e.target.value))}
                         />
                       </td>
                       <td className="px-4 py-3 text-center whitespace-nowrap">
                         <button onClick={saveEditing} className="text-green-600 hover:text-green-800 mx-1" title="Salvar">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                         </button>
                         <button onClick={cancelEditing} className="text-red-600 hover:text-red-800 mx-1" title="Cancelar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                         </button>
                       </td>
                    </tr>
                  );
                }

                return (
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
                        <div className="flex flex-col items-start gap-1">
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-medium whitespace-nowrap ${paymentMethodBadge(expense.paymentMethod)}`}>
                                {expense.paymentMethod}
                            </span>
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase whitespace-nowrap ${responsibleBadge(expense.responsible || Responsible.BOTH)}`}>
                                {expense.responsible || Responsible.BOTH}
                            </span>
                        </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-rose-600">
                      R$ {expense.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button 
                        onClick={() => startEditing(expense)}
                        className="text-gray-400 hover:text-blue-600 transition-colors mx-1"
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => onDeleteExpense(expense.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors mx-1"
                        title="Excluir"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};