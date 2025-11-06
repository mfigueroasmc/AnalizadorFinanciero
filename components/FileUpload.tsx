
import React, { useState, useCallback } from 'react';
import { Transaction } from '../types';
import { UploadIcon } from './Icons';

interface FileUploadProps {
    onDataParsed: (data: Transaction[]) => void;
    setError: (error: string | null) => void;
}

const parseCSV = (csvText: string): Transaction[] => {
    const lines = csvText.trim().replace(/\r\n/g, '\n').split('\n');
    if (lines.length < 2) {
        throw new Error('El archivo CSV está vacío o no tiene datos.');
    }

    const headerLine = lines[0].toLowerCase();
    const separator = headerLine.includes(';') ? ';' : ',';
    const header = headerLine.split(separator).map(h => h.trim().replace(/"/g, ''));
    
    const requiredCols = ['fecha', 'ingreso', 'gasto'];
    if (!requiredCols.every(col => header.includes(col))) {
         throw new Error('El archivo CSV debe contener al menos las columnas: Fecha, Ingreso, Gasto. Columnas encontradas: ' + header.join(', '));
    }

    const dateIndex = header.indexOf('fecha');
    const descIndex = header.indexOf('descripción') > -1 ? header.indexOf('descripción') : header.indexOf('descripcion');
    const incomeIndex = header.indexOf('ingreso');
    const expenseIndex = header.indexOf('gasto');
    const categoryIndex = header.indexOf('categoría') > -1 ? header.indexOf('categoría') : header.indexOf('categoria');

    const transactions: Transaction[] = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i].split(separator).map(v => v.trim().replace(/"/g, ''));
        
        const parseAmount = (value: string) => {
           if (!value) return 0;
           return parseFloat(value.replace(/[^0-9,.-]+/g,"").replace(',', '.')) || 0;
        }

        const income = parseAmount(values[incomeIndex]);
        const expense = parseAmount(values[expenseIndex]);
        
        if (income > 0 || expense > 0) {
            transactions.push({
                date: new Date(values[dateIndex]),
                description: descIndex !== -1 ? values[descIndex] : 'N/A',
                income,
                expense,
                category: expense > 0 && categoryIndex !== -1 ? (values[categoryIndex] || 'Sin Categoría') : 'Ingreso',
            });
        }
    }
    return transactions;
};

const FileUpload: React.FC<FileUploadProps> = ({ onDataParsed, setError }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = useCallback((file: File) => {
        setError(null);
        if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    const data = parseCSV(text);
                    if(data.length === 0) {
                        setError("No se encontraron transacciones válidas en el archivo.");
                        return;
                    }
                    onDataParsed(data);
                } catch (error) {
                    setError(error instanceof Error ? error.message : 'Error al procesar el archivo.');
                }
            };
            reader.onerror = () => {
                setError('No se pudo leer el archivo.');
            };
            reader.readAsText(file);
        } else {
            setError('Por favor, selecciona un archivo CSV válido.');
        }
    }, [onDataParsed, setError]);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-2">Sube tu hoja de cálculo</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Analiza tus finanzas de forma sencilla. Aceptamos archivos .csv.</p>

            <div 
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`border-4 border-dashed rounded-lg p-10 transition-colors duration-300 ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".csv"
                    onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <UploadIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Haz clic para subir un archivo</span>
                    <span className="text-gray-500 dark:text-gray-400">o arrástralo aquí</span>
                </label>
            </div>
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-left bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Formato esperado del CSV:</h4>
                <p>Tu archivo debe contener las siguientes columnas (el orden no importa):</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                    <li><code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">Fecha</code> (ej: 2023-12-25)</li>
                    <li><code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">Ingreso</code> (numérico)</li>
                    <li><code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">Gasto</code> (numérico)</li>
                    <li><code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">Categoría</code> (opcional, para gastos)</li>
                    <li><code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">Descripción</code> (opcional)</li>
                </ul>
            </div>
        </div>
    );
};

export default FileUpload;
