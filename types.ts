
export interface Transaction {
    date: Date;
    description: string;
    income: number;
    expense: number;
    category: string;
}

export interface AnalysisResult {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    incomeExpenseData: { name: string; Ingresos: number; Gastos: number }[];
    expenseCategoryData: { name: string; value: number }[];
}
