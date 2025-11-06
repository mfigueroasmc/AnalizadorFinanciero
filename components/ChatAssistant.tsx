import React, { useState, useEffect, useRef } from 'react';
import { getChatResponse } from '../services/geminiService';
import { AssistantIcon, CloseIcon, SendIcon } from './Icons';
import ReactMarkdown from 'react-markdown';

interface ChatAssistantProps {
    onClose: () => void;
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'model',
            text: '¡Hola! Soy FinancIA, tu asistente financiero. Puedes preguntarme sobre los datos que has subido. Por ejemplo: "¿Cuál fue mi gasto más grande?" o "¿En qué mes gasté más?"'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await getChatResponse(input);
            const modelMessage: Message = { role: 'model', text: responseText };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            const errorMessage: Message = { role: 'model', text: 'Lo siento, he encontrado un problema. Intenta preguntar de otra manera.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-[calc(100%-3rem)] sm:w-96 h-[70vh] sm:h-[60vh] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <AssistantIcon className="w-8 h-8 text-blue-500" />
                    <h3 className="font-bold text-lg">Asistente FinancIA</h3>
                </div>
                <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Cerrar chat">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <AssistantIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />}
                        <div className={`prose prose-sm dark:prose-invert max-w-[80%] rounded-2xl p-3 ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                           <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                        <AssistantIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-3 rounded-bl-none">
                           <div className="flex items-center space-x-1">
                                <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></span>
                           </div>
                        </div>
                    </div>
                 )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Pregúntale a FinancIA..."
                        className="w-full pl-4 pr-12 py-2 border rounded-full bg-gray-100 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || input.trim() === ''}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        aria-label="Enviar mensaje"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatAssistant;