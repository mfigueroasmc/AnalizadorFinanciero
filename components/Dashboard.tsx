
import React from 'react';
import { AnalysisResult } from '../types';
import SummaryCard from './SummaryCard';
import { IncomeExpenseChart, ExpenseCategoryPieChart } from './Charts';
import { IncomeIcon, ExpenseIcon, BalanceIcon, InsightIcon } from './Icons';
import ReactMarkdown from 'react-markdown';

interface DashboardProps {
    analysis: AnalysisResult | null;
    insights: string | null;
    isLoading: boolean;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ analysis, insights, isLoading }) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
    };

    if (!analysis) {
        return (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
                 <h2 className="text-xl font-semibold mb-4">Procesando datos...</h2>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <SummaryCard title="Ingresos Totales" value={formatCurrency(analysis.totalIncome)} icon={<IncomeIcon />} />
                <SummaryCard title="Gastos Totales" value={formatCurrency(analysis.totalExpenses)} icon={<ExpenseIcon />} />
                <SummaryCard title="Balance Neto" value={formatCurrency(analysis.netBalance)} icon={<BalanceIcon />} isNetBalance={true} netBalance={analysis.netBalance} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold mb-4">Ingresos vs. Gastos</h3>
                    <IncomeExpenseChart data={analysis.incomeExpenseData} />
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
                     <h3 className="text-lg font-semibold mb-4">Distribución de Gastos</h3>
                    <ExpenseCategoryPieChart data={analysis.expenseCategoryData} />
                </div>
            </div>
            
            {/* AI Insights */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                    <InsightIcon className="w-8 h-8 text-blue-500 mr-3" />
                    <h3 className="text-xl font-bold">Análisis y Recomendaciones IA</h3>
                </div>
                {isLoading && !insights ? (
                    <div className="space-y-4">
                        <p className="text-center text-gray-500 dark:text-gray-400">Generando análisis personalizado...</p>
                        <LoadingSpinner />
                    </div>
                ) : insights ? (
                    <div className="prose prose-blue dark:prose-invert max-w-none prose-headings:font-semibold prose-h3:text-lg prose-li:my-1">
                        <ReactMarkdown>{insights}</ReactMarkdown>
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No se pudieron generar los insights.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
