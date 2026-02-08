'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Brain, Cpu, Bot } from 'lucide-react';

type ConnectionStatus = 'checking' | 'connected' | 'error' | 'unknown';

interface LLMConnectionIndicatorProps {
    className?: string;
}

const ProviderIcon = ({ provider, status, className }: { provider: string, status: ConnectionStatus, className: string }) => {
    const iconProps = {
        className: `${className} transition-colors duration-300 ${status === 'checking' ? 'animate-pulse' : ''}`
    };

    switch (provider?.toLowerCase()) {
        case 'openai':
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...iconProps}>
                    <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
                </svg>
            );
        case 'gemini':
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...iconProps}>
                    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" />
                    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
                </svg>
            );
        case 'deepseek':
            return <Cpu {...iconProps} />;
        default:
            return <Sparkles {...iconProps} />;
    }
};

export function LLMConnectionIndicator({ className = '' }: LLMConnectionIndicatorProps) {
    const [status, setStatus] = useState<ConnectionStatus>('checking');
    const [provider, setProvider] = useState<string>('');

    useEffect(() => {
        checkConnection();
        const interval = setInterval(checkConnection, 30000);
        return () => clearInterval(interval);
    }, []);

    const checkConnection = async () => {
        try {
            const response = await fetch('/api/health/llm');
            const data = await response.json();
            setProvider(data.provider || '');
            setStatus(data.status === 'ok' ? 'connected' : 'error');
        } catch (error) {
            console.error('LLM connection check failed:', error);
            setStatus('error');
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'checking': return 'text-yellow-400';
            case 'connected': return 'text-green-400';
            case 'error': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getTooltipText = () => {
        const name = provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'LLM';
        if (status === 'connected') return `${name}: Connected`;
        if (status === 'checking') return `${name}: Connecting...`;
        if (status === 'error') return `${name}: Connection Error`;
        return name;
    };

    return (
        <div className={`flex items-center ${className}`} title={getTooltipText()}>
            <ProviderIcon
                provider={provider}
                status={status}
                className={`w-5 h-5 ${getStatusColor()}`}
            />
        </div>
    );
}
