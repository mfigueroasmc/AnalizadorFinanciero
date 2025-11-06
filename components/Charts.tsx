
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Tooltip as PieTooltip } from 'recharts';

interface IncomeExpenseChartProps {
    data: { name: string; Ingresos: number; Gastos: number }[];
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ data }) => {
    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
                    <YAxis tick={{ fill: '#9ca3af' }} tickFormatter={(value) => new Intl.NumberFormat('es-ES', { notation: "compact", compactDisplay: "short" }).format(value as number)}/>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#374151',
                            border: 'none',
                            borderRadius: '0.5rem',
                        }}
                        formatter={(value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value as number)}
                    />
                    <Legend />
                    <Bar dataKey="Ingresos" fill="#34d399" name="Ingresos" radius={[4, 4, 0, 0]}/>
                    <Bar dataKey="Gastos" fill="#f87171" name="Gastos" radius={[4, 4, 0, 0]}/>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

interface ExpenseCategoryPieChartProps {
    data: { name: string; value: number }[];
}

const COLORS = ['#0ea5e9', '#14b8a6', '#f97316', '#eab308', '#8b5cf6', '#d946ef', '#ec4899'];

export const ExpenseCategoryPieChart: React.FC<ExpenseCategoryPieChartProps> = ({ data }) => {
     if (data.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">No hay datos de gastos para mostrar.</div>;
    }
    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <PieTooltip
                        contentStyle={{
                            backgroundColor: '#374151',
                            border: 'none',
                            borderRadius: '0.5rem',
                        }}
                         formatter={(value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value as number)}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
