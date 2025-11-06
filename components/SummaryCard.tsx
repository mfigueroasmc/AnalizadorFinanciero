
import React from 'react';

interface SummaryCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    isNetBalance?: boolean;
    netBalance?: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, isNetBalance = false, netBalance = 0 }) => {
    const valueColor = isNetBalance 
        ? netBalance >= 0 ? 'text-green-500' : 'text-red-500' 
        : 'text-gray-800 dark:text-gray-200';

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center space-x-4 transform hover:scale-105 transition-transform duration-300">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
            </div>
        </div>
    );
};

export default SummaryCard;
