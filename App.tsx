import React, { useState, useCallback, useEffect } from 'react';
import { MonthData, Expense, IncomeDetails, ExpenseCategory } from './types';
import { Dashboard } from './components/Dashboard';
import { IncomeForm } from './components/IncomeForm';
import { ExpenseTable } from './components/ExpenseTable';
import { BudgetForm } from './components/BudgetForm';
import { Login } from './components/Login';
import { analyzeFinances } from './services/geminiService';
import { auth, logoutUser, subscribeToFinanceData, saveFinanceData } from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  // Data começa vazia e é preenchida pelo Firestore
  const [data, setData] = useState<MonthData[]>([]);
  const [selectedMonthId, setSelectedMonthId] = useState<string>(""); // Set after load
  
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Monitora estado de autenticação
  useEffect(() => {
    if (!auth) {
        setLoadingAuth(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Monitora dados do Firestore quando usuário está logado
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToFinanceData(user.uid, (newData) => {
        // Garante que os dados estejam sempre ordenados cronologicamente
        const sortedData = [...newData].sort((a, b) => {
           const valA = a.year * 12 + a.monthIndex;
           const valB = b.year * 12 + b.monthIndex;
           return valA - valB;
        });

        setData(sortedData);
        // Se nenhum mês estiver selecionado (primeiro load), seleciona o primeiro disponível ou o atual
        if (!selectedMonthId && sortedData.length > 0) {
            // Tenta achar o mês atual baseado na data real, senão pega o primeiro
            const now = new Date();
            const currentMonthId = `${now.toLocaleString('default', { month: 'short' }).toLowerCase()}-${now.getFullYear()}`;
            const found = sortedData.find(m => m.id === currentMonthId);
            setSelectedMonthId(found ? found.id : sortedData[0].id);
        }
      });
      return () => unsubscribe();
    } else {
        setData([]);
    }
  }, [user, selectedMonthId]);

  // Função auxiliar para salvar no Firestore
  const updateData = useCallback((newData: MonthData[]) => {
      if (user) {
          saveFinanceData(user.uid, newData);
      }
  }, [user]);

  const currentMonthIndex = data.findIndex(m => m.id === selectedMonthId);
  const currentMonth = data[currentMonthIndex];

  const handleIncomeChange = useCallback((field: keyof IncomeDetails, value: number) => {
    if (!currentMonth) return;
    
    const newData = [...data];
    
    // 1. Atualiza o valor da renda
    const updatedIncome = {
      ...newData[currentMonthIndex].income,
      [field]: value
    };

    // 2. Calcula o novo total de renda
    const totalNewIncome = (Object.values(updatedIncome) as number[]).reduce((a, b) => a + b, 0);

    // 3. Recalcula automaticamente o orçamento sugerido (Default: 50/30/20)
    // Isso atende ao pedido de o orçamento padrão levar em conta a entrada total
    const updatedBudget = {
      [ExpenseCategory.ESSENTIAL]: totalNewIncome * 0.50,
      [ExpenseCategory.DESIRE]: totalNewIncome * 0.30,
      [ExpenseCategory.INVESTMENT]: totalNewIncome * 0.20
    };

    newData[currentMonthIndex] = {
      ...newData[currentMonthIndex],
      income: updatedIncome,
      budget: updatedBudget
    };
    
    updateData(newData);
  }, [data, currentMonthIndex, currentMonth, updateData]);

  const handleBudgetChange = useCallback((category: ExpenseCategory, value: number) => {
    if (!currentMonth) return;

    const newData = [...data];
    const currentBudget = newData[currentMonthIndex].budget;
    
    newData[currentMonthIndex] = {
      ...newData[currentMonthIndex],
      budget: {
        ...currentBudget,
        [category]: value
      }
    };
    updateData(newData);
  }, [data, currentMonthIndex, currentMonth, updateData]);

  const handleAddExpense = useCallback((expenseData: Omit<Expense, 'id'> & { totalInstallments?: number }) => {
    const baseId = Date.now().toString();
    const newData = [...data];
    const { totalInstallments, amount, ...rest } = expenseData;

    // Lógica para Parcelamento
    if (totalInstallments && totalInstallments > 1) {
      const monthlyAmount = amount / totalInstallments;
      const originalDateParts = rest.date.split('-'); // YYYY-MM-DD
      const startYear = parseInt(originalDateParts[0]);
      const startMonth = parseInt(originalDateParts[1]) - 1; // 0-index
      const day = parseInt(originalDateParts[2]);

      for (let i = 0; i < totalInstallments; i++) {
        const dateObj = new Date(startYear, startMonth + i, day);
        const targetYear = dateObj.getFullYear();
        const targetMonthIndex = dateObj.getMonth(); // 0-11
        
        const targetDataIndex = newData.findIndex(m => m.year === targetYear && m.monthIndex === targetMonthIndex);

        if (targetDataIndex !== -1) {
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
      // Usa a mesma lógica de comparação cronológica
      const sourceDateParts = rest.date.split('-');
      const startYear = parseInt(sourceDateParts[0]);
      const startMonth = parseInt(sourceDateParts[1]) - 1;
      const startMonthValue = startYear * 12 + startMonth;
      const originalDay = parseInt(sourceDateParts[2]);

      // Mapeia todos os meses
      for (let i = 0; i < newData.length; i++) {
        const month = newData[i];
        const currentMonthValue = month.year * 12 + month.monthIndex;

        // Adiciona a despesa se for o mês atual ou futuro
        if (currentMonthValue >= startMonthValue) {
             // Calcula a data correta para este mês
             const dateObj = new Date(month.year, month.monthIndex, originalDay);
             const y = dateObj.getFullYear();
             const m = String(dateObj.getMonth() + 1).padStart(2, '0');
             const d = String(dateObj.getDate()).padStart(2, '0');
             const expenseDate = `${y}-${m}-${d}`;

             newData[i] = {
               ...month,
               expenses: [
                 ...month.expenses,
                 {
                   ...rest,
                   amount: amount, 
                   date: expenseDate,
                   id: `${baseId}-${i}-${Math.random().toString(36).substr(2, 5)}`
                 }
               ]
             };
        }
      }
    } 
    // Despesa Simples
    else {
      // Encontra o mês correto baseado na DATA da despesa, não necessariamente o selecionado
      const dateParts = rest.date.split('-');
      const expYear = parseInt(dateParts[0]);
      const expMonthIndex = parseInt(dateParts[1]) - 1;
      
      const targetIndex = newData.findIndex(m => m.year === expYear && m.monthIndex === expMonthIndex);
      
      if (targetIndex !== -1) {
          newData[targetIndex] = {
            ...newData[targetIndex],
            expenses: [
              ...newData[targetIndex].expenses,
              { ...rest, amount: amount, id: baseId }
            ]
          };
      } else {
          alert("A data selecionada pertence a um mês que não está cadastrado no sistema.");
          return; 
      }
    }
    
    updateData(newData);
  }, [data, updateData]);

  const handleEditExpense = useCallback((updatedExpense: Expense) => {
    if (!currentMonth) return;

    const newData = [...data];
    const expenses = [...newData[currentMonthIndex].expenses];
    const expenseIndex = expenses.findIndex(e => e.id === updatedExpense.id);

    if (expenseIndex !== -1) {
      expenses[expenseIndex] = updatedExpense;
      newData[currentMonthIndex] = {
        ...newData[currentMonthIndex],
        expenses: expenses
      };
      updateData(newData);
    }
  }, [data, currentMonthIndex, currentMonth, updateData]);

  const handleDeleteExpense = useCallback((expenseId: string) => {
    if (!currentMonth) return;
    
    const newData = [...data];
    newData[currentMonthIndex] = {
      ...newData[currentMonthIndex],
      expenses: newData[currentMonthIndex].expenses.filter(e => e.id !== expenseId)
    };
    updateData(newData);
  }, [data, currentMonthIndex, currentMonth, updateData]);

  const handleAIAnalysis = async () => {
    if (!currentMonth) return;
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const result = await analyzeFinances(currentMonth);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleLogout = async () => {
      await logoutUser();
  };

  // Loading State
  if (loadingAuth) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
      );
  }

  // Login Screen
  if (!user) {
      return <Login onLoginSuccess={() => {}} />;
  }

  // App Content (Loading Data or Data Ready)
  if (data.length === 0) {
       return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600">Carregando dados da família...</p>
          </div>
      );
  }

  // Safe check if selectedMonthId became invalid or data changed structure
  if (!currentMonth) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p>Selecionando período...</p>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-200" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <div>
                <h1 className="text-xl font-bold tracking-tight">Família Financeira</h1>
                <p className="text-xs text-indigo-300 hidden sm:block">Conectado como {user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-indigo-200 bg-indigo-800 px-3 py-1 rounded-full hidden sm:block">
                {currentMonth.monthName} {currentMonth.year}
            </div>
            <button 
                onClick={handleLogout}
                className="text-sm bg-indigo-800 hover:bg-indigo-900 px-3 py-2 rounded text-white transition-colors"
            >
                Sair
            </button>
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
          />

          <BudgetForm 
            budget={currentMonth.budget}
            onChange={handleBudgetChange}
          />

          <ExpenseTable 
            expenses={currentMonth.expenses}
            onAddExpense={handleAddExpense}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        </section>

      </main>
    </div>
  );
};

export default App;