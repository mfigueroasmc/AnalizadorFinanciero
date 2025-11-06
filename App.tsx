import React, { useState, useMemo, useCallback } from 'react';
import { Transaction, AnalysisResult } from './types';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import { getFinancialInsights, startChat } from './services/geminiService';
import ChatAssistant from './components/ChatAssistant';
import { ChatIcon } from './components/Icons';

const App: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[] | null>(null);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [insights, setInsights] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

    const processTransactions = useCallback(async (data: Transaction[]) => {
        setIsLoading(true);
        setError(null);
        setTransactions(data);
        setInsights(null);

        try {
            // Basic Analysis
            let totalIncome = 0;
            let totalExpenses = 0;
            const expensesByCategory: { [key: string]: number } = {};
            const monthlyData: { [key: string]: { income: number; expenses: number } } = {};

            data.forEach(t => {
                totalIncome += t.income;
                totalExpenses += t.expense;

                if (t.expense > 0) {
                    expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.expense;
                }
                
                const month = t.date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
                if (!monthlyData[month]) {
                    monthlyData[month] = { income: 0, expenses: 0 };
                }
                monthlyData[month].income += t.income;
                monthlyData[month].expenses += t.expense;
            });
            
            const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
                const [monthA, yearA] = a.split(' ');
                const [monthB, yearB] = b.split(' ');
                const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
                return new Date(`${months.indexOf(monthA.replace('.',''))+1}/1/${yearA}`).getTime() - new Date(`${months.indexOf(monthB.replace('.',''))+1}/1/${yearB}`).getTime();
            });

            const incomeExpenseData = sortedMonths.map(month => ({
                name: month,
                Ingresos: monthlyData[month].income,
                Gastos: monthlyData[month].expenses
            }));
            
            const expenseCategoryData = Object.entries(expensesByCategory)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);

            const currentAnalysis: AnalysisResult = {
                totalIncome,
                totalExpenses,
                netBalance: totalIncome - totalExpenses,
                incomeExpenseData,
                expenseCategoryData,
            };

            setAnalysis(currentAnalysis);
            
            // Initialize chat with transaction data
            startChat(data);

            // AI Insights
            const aiInsights = await getFinancialInsights(data);
            setInsights(aiInsights);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleReset = () => {
        setTransactions(null);
        setAnalysis(null);
        setInsights(null);
        setError(null);
        setIsLoading(false);
        setIsChatOpen(false);
    };

    return (
        <div className="min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300">
            <header className="bg-white dark:bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
                        Analizador Financiero Visual
                    </h1>
                     {transactions && (
                        <button 
                            onClick={handleReset}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
                        >
                            Analizar Otro
                        </button>
                     )}
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {!transactions ? (
                    <FileUpload onDataParsed={processTransactions} setError={setError} />
                ) : (
                    <Dashboard 
                        analysis={analysis}
                        insights={insights}
                        isLoading={isLoading}
                    />
                )}
                {error && (
                    <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded-lg" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
            </main>

            {transactions && !isChatOpen && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-50"
                    aria-label="Abrir asistente virtual"
                >
                    <ChatIcon className="w-8 h-8" />
                </button>
            )}

            {transactions && isChatOpen && (
                <ChatAssistant
                    onClose={() => setIsChatOpen(false)}
                />
            )}
        </div>
    );
};

export default App;