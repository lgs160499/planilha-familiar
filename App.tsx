import React, { useState, useCallback } from 'react';
import { INITIAL_DATA } from './constants';
import { MonthData, Expense, IncomeDetails, ExpenseCategory } from './types';
import { Dashboard } from './components/Dashboard';
import { IncomeForm } from './components/IncomeForm';
import { ExpenseTable } from './components/ExpenseTable';
import { BudgetForm } from './components/BudgetForm';
import { analyzeFinances } from './services/geminiService';

const App: React.FC = () => {
  // In a real app, this would come from a database/localstorage
  const [data, setData] = useState<MonthData[]>(INITIAL_DATA);
  const [selectedMonthId, setSelectedMonthId] = useState<string>(INITIAL_DATA[0].id);
  
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentMonthIndex = data.findIndex(m => m.id === selectedMonthId);
  const currentMonth = data[currentMonthIndex];

  const handleIncomeChange = useCallback((field: keyof IncomeDetails, value: number) => {
    setData(prevData => {
      const newData = [...prevData];
      newData[currentMonthIndex] = {
        ...newData[currentMonthIndex],
        income: {
          ...newData[currentMonthIndex].income,
          [field]: value
        }
      };
      return newData;
    });
  }, [currentMonthIndex]);

  const handleBudgetChange = useCallback((category: ExpenseCategory, value: number) => {
    setData(prevData => {
      const newData = [...prevData];
      const currentBudget = newData[currentMonthIndex].budget;
      
      newData[currentMonthIndex] = {
        ...newData[currentMonthIndex],
        budget: {
          ...currentBudget,
          [category]: value
        }
      };
      return newData;
    });
  }, [currentMonthIndex]);

  const handleReplicateIncome = useCallback(() => {
    if (!confirm("Deseja replicar os valores de renda deste mês para TODOS os meses futuros?")) return;

    const incomeToCopy = { ...currentMonth.income };
    
    setData(prevData => {
      return prevData.map((month, index) => {
        // Only update future months (including current if needed, though current is source)
        if (index > currentMonthIndex) {
          return {
            ...month,
            income: { ...incomeToCopy }
          };
        }
        return month;
      });
    });
    
    alert("Rendas replicadas com sucesso!");
  }, [currentMonth, currentMonthIndex]);

  const handleAddExpense = useCallback((expenseData: Omit<Expense, 'id'> & { totalInstallments?: number }) => {
    // Generate a unique ID base
    const baseId = Date.now().toString();

    setData(prevData => {
      const newData = [...prevData];
      const { totalInstallments, amount, ...rest } = expenseData;

      // Lógica para Parcelamento
      if (totalInstallments && totalInstallments > 1) {
        const monthlyAmount = amount / totalInstallments;
        const originalDateParts = rest.date.split('-'); // YYYY-MM-DD
        const startYear = parseInt(originalDateParts[0]);
        const startMonth = parseInt(originalDateParts[1]) - 1; // 0-index
        const day = parseInt(originalDateParts[2]);

        for (let i = 0; i < totalInstallments; i++) {
          // Calcular data alvo para esta parcela
          const dateObj = new Date(startYear, startMonth + i, day);
          const targetYear = dateObj.getFullYear();
          const targetMonthIndex = dateObj.getMonth(); // 0-11
          
          // Encontrar o mês correspondente no array de dados
          const targetDataIndex = newData.findIndex(m => m.year === targetYear && m.monthIndex === targetMonthIndex);

          if (targetDataIndex !== -1) {
             // Formata a data para YYYY-MM-DD
             const m = String(targetMonthIndex + 1).padStart(2, '0');
             const d = String(dateObj.getDate()).padStart(2, '0');
             const expenseDate = `${targetYear}-${m}-${d}`;

             newData[targetDataIndex] = {
               ...newData[targetDataIndex],
               expenses: [
                 ...newData[targetDataIndex].expenses,
                 {
                   ...rest,
                   id: `${baseId}-${i}`,
                   amount: monthlyAmount,
                   installments: `${i + 1}/${totalInstallments}`,
                   date: expenseDate
                 }
               ]
             };
          }
        }
      } 
      // Lógica para Recorrência (Fixa)
      else if (expenseData.isRecurring) {
        for (let i = currentMonthIndex; i < newData.length; i++) {
          const month = newData[i];
          let expenseDate = rest.date;

          if (i > currentMonthIndex) {
             const originalDateParts = rest.date.split('-');
             const originalDay = parseInt(originalDateParts[2]);
             
             const targetYear = month.year;
             const targetMonthIndex = month.monthIndex; 
             
             const dateObj = new Date(targetYear, targetMonthIndex, originalDay);
             const y = dateObj.getFullYear();
             const m = String(dateObj.getMonth() + 1).padStart(2, '0');
             const d = String(dateObj.getDate()).padStart(2, '0');
             expenseDate = `${y}-${m}-${d}`;
          }

          newData[i] = {
            ...month,
            expenses: [
              ...month.expenses,
              {
                ...rest,
                amount: amount, // Na recorrente o valor é cheio todo mês
                date: expenseDate,
                id: `${baseId}-${i}-${Math.random().toString(36).substr(2, 5)}`
              }
            ]
          };
        }
      } 
      // Despesa Simples (apenas mês atual)
      else {
        newData[currentMonthIndex] = {
          ...newData[currentMonthIndex],
          expenses: [
            ...newData[currentMonthIndex].expenses,
            { ...rest, amount: amount, id: baseId }
          ]
        };
      }
      return newData;
    });
  }, [currentMonthIndex]);

  const handleDeleteExpense = useCallback((expenseId: string) => {
    setData(prevData => {
      const newData = [...prevData];
      newData[currentMonthIndex] = {
        ...newData[currentMonthIndex],
        expenses: newData[currentMonthIndex].expenses.filter(e => e.id !== expenseId)
      };
      return newData;
    });
  }, [currentMonthIndex]);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const result = await analyzeFinances(currentMonth);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-200" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <h1 className="text-xl font-bold tracking-tight">Família Financeira</h1>
          </div>
          <div className="text-sm font-medium text-indigo-200 bg-indigo-800 px-3 py-1 rounded-full">
            {currentMonth.monthName} {currentMonth.year}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dashboard Section */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            <button 
              onClick={handleAIAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analisando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Analisar com IA
                </>
              )}
            </button>
          </div>

          {/* AI Analysis Result */}
          {aiAnalysis && (
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-6 rounded-xl shadow-sm mb-8 animate-fade-in">
               <div className="flex items-center gap-2 mb-3 text-indigo-700">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                 </svg>
                 <h3 className="font-semibold text-lg">Insight Financeiro</h3>
               </div>
               <div className="prose prose-indigo text-gray-700 text-sm max-w-none" dangerouslySetInnerHTML={{__html: aiAnalysis}} />
            </div>
          )}

          <Dashboard 
            data={data} 
            selectedMonthId={selectedMonthId} 
            onMonthChange={setSelectedMonthId} 
          />
        </section>

        <div className="border-t border-gray-200 my-10"></div>

        {/* Budget & Entries Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestão Mensal</h2>
          
          <IncomeForm 
            income={currentMonth.income} 
            onChange={handleIncomeChange} 
            onReplicate={handleReplicateIncome}
          />

          <BudgetForm 
            budget={currentMonth.budget}
            onChange={handleBudgetChange}
          />

          <ExpenseTable 
            expenses={currentMonth.expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        </section>

      </main>
    </div>
  );
};

export default App;