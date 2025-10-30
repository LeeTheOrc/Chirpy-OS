import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Message, LinkState, DistroConfig, BuildStep, BuildTarget } from './types';
import { WELCOME_MESSAGE, INITIAL_SUGGESTIONS, DEFAULT_DISTRO_CONFIG, SYSTEM_INSTRUCTION, CODEX_SNIPPETS } from './constants';
import { generateInstallScript } from './lib/script-generator';

import { Logo } from './components/Logo';
import { ChatMessage } from './components/ChatMessage';
import { CommandSuggestions } from './components/CommandSuggestions';
import { SendIcon, AttachmentIcon, BlueprintIcon } from './components/Icons';
import { FileAttachment } from './components/FileAttachment';
import { DistroBlueprintPanel } from './components/DistroBlueprintPanel';
import { SystemScanModal } from './components/SystemScanModal';
import { BuildModal } from './components/BuildModal';
import { CodexModal } from './components/CodexModal';
import { IsoModal } from './components/IsoModal';
import { MobileBlueprintDrawer } from './components/MobileBlueprintDrawer';
import { TargetSelectionModal } from './components/TargetSelectionModal';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: WELCOME_MESSAGE, linkState: 'online' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [linkState, setLinkState] = useState<LinkState>('online');
    const [attachedFile, setAttachedFile] = useState<string | null>(null);
    const [distroConfig, setDistroConfig] = useState<DistroConfig>(DEFAULT_DISTRO_CONFIG);
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);
    const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
    const [isCodexModalOpen, setIsCodexModalOpen] = useState(false);
    const [isIsoModalOpen, setIsIsoModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [generatedScript, setGeneratedScript] = useState('');
    const [isBlueprintLocked, setIsBlueprintLocked] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (prompt?: string) => {
        const userMessage = prompt || input;
        if (!userMessage.trim() && !attachedFile) return;
        
        const currentAttachment = attachedFile;

        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setInput('');
        setAttachedFile(null);

        const lowerCaseMessage = userMessage.toLowerCase();
        
        if (lowerCaseMessage.includes('scan system')) {
            setIsScanModalOpen(true);
            return;
        }

        if (isBlueprintLocked) {
            setMessages(prev => [...prev, 
                { role: 'model', text: "The blueprint is currently locked. To make further changes, please unlock it using the icon in the blueprint panel, then send your request again.", linkState }
            ]);
            return;
        }

        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'model', text: '...', linkState }]);

        try {
            const conversationHistory = messages.map(m => `${m.role}: ${m.text}`).join('\n');
            const fullPrompt = `${conversationHistory}\nuser: ${userMessage}${currentAttachment ? `\n\nSystem Report Context:\n${currentAttachment}` : ''}\n\nBased on this conversation and context, generate the JSON configuration.`;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    hostname: { type: Type.STRING },
                    username: { type: Type.STRING },
                    password: { type: Type.STRING, description: 'A secure, memorable password. Optional.' },
                    timezone: { type: Type.STRING },
                    locale: { type: Type.STRING },
                    desktopEnvironment: { type: Type.STRING },
                    kernels: { type: Type.ARRAY, items: { type: Type.STRING } },
                    architecture: { type: Type.STRING },
                    ram: { type: Type.STRING },
                    swapSize: { type: Type.STRING },
                    location: { type: Type.STRING },
                    keyboardLayout: { type: Type.STRING },
                    packages: { type: Type.STRING },
                    gpuDriver: { type: Type.STRING },
                    graphicsMode: { type: Type.STRING },
                    shell: { type: Type.STRING },
                    aurHelpers: { type: Type.ARRAY, items: { type: Type.STRING } },
                    extraRepositories: { type: Type.ARRAY, items: { type: Type.STRING } },
                    targetDisk: { type: Type.STRING },
                    filesystem: { type: Type.STRING },
                    bootloader: { type: Type.STRING },
                    enableSnapshots: { type: Type.BOOLEAN },
                    efiPartitionSize: { type: Type.STRING },
                    networkMode: { type: Type.STRING },
                    ipAddress: { type: Type.STRING, description: "Required if networkMode is 'static'" },
                    gateway: { type: Type.STRING, description: "Required if networkMode is 'static'" },
                    dnsServers: { type: Type.STRING, description: "Required if networkMode is 'static'" },
                    aiResourceAllocation: { type: Type.STRING },
                    aiGpuMode: { type: Type.STRING },
                },
            };
            
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    responseMimeType: 'application/json',
                    responseSchema,
                }
            });

            const text = result.text;
            const newConfig = JSON.parse(text);

            if (typeof newConfig !== 'object' || newConfig === null || Array.isArray(newConfig)) {
                throw new Error("AI did not return a valid configuration object.");
            }

            // Create a deeply sanitized configuration to prevent render-time crashes from malformed AI responses.
            const sanitizedConfig = { ...DEFAULT_DISTRO_CONFIG };
            for (const key of Object.keys(sanitizedConfig)) {
                const k = key as keyof DistroConfig;
                const defaultValue = DEFAULT_DISTRO_CONFIG[k];
                const incomingValue = (newConfig as any)[k];

                if (incomingValue === undefined) {
                    continue; // Keep the default if the AI didn't provide this key
                }
        
                if (Array.isArray(defaultValue)) {
                    (sanitizedConfig as any)[k] = Array.isArray(incomingValue) ? incomingValue.map(String) : defaultValue;
                } else if (typeof defaultValue === 'boolean') {
                    (sanitizedConfig as any)[k] = typeof incomingValue === 'boolean' ? incomingValue : defaultValue;
                } else if (typeof defaultValue === 'string') {
                    if (typeof incomingValue === 'object' && incomingValue !== null) {
                        (sanitizedConfig as any)[k] = defaultValue; // Reject objects
                    } else {
                        (sanitizedConfig as any)[k] = String(incomingValue ?? defaultValue); // Coerce null/number/bool
                    }
                }
            }

            // Handle optional fields separately
            sanitizedConfig.password = (newConfig.password && typeof newConfig.password !== 'object') ? String(newConfig.password) : undefined;
            sanitizedConfig.ipAddress = (newConfig.ipAddress && typeof newConfig.ipAddress !== 'object') ? String(newConfig.ipAddress) : undefined;
            sanitizedConfig.gateway = (newConfig.gateway && typeof newConfig.gateway !== 'object') ? String(newConfig.gateway) : undefined;
            sanitizedConfig.dnsServers = (newConfig.dnsServers && typeof newConfig.dnsServers !== 'object') ? String(newConfig.dnsServers) : undefined;

            setDistroConfig(sanitizedConfig);
            setIsBlueprintLocked(true);

            const modelResponse = `The Architect's Blueprint has been updated and locked in. The changes are reflected on the left. To forge the installer, use the gear icon in the blueprint panel.`;
            setMessages(prev => [...prev.slice(0, -1), { role: 'model', text: modelResponse, linkState }]);

        } catch (error) {
            console.error(error);
            const errorMessage = "Apologies, Architect. I've encountered an anomaly. The local AI core might be able to handle simpler requests, or we can try again.";
            setMessages(prev => [...prev.slice(0, -1), { role: 'model', text: errorMessage, linkState: 'offline' }]);
            setLinkState('offline');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleScanComplete = (report: string) => {
        setAttachedFile(report);
        setMessages(prev => [
            ...prev,
            { role: 'model', text: "Scrying complete. I've inscribed the hardware report as context for our next command. How shall we proceed with this knowledge?", linkState }
        ]);
    };

    const handleInitiateBuild = () => {
        setIsTargetModalOpen(true);
    };

    const handleTargetSelection = (target: BuildTarget) => {
        const script = generateInstallScript(distroConfig, target);
        setGeneratedScript(script);
        setIsTargetModalOpen(false);
        setIsBuildModalOpen(true);
    };

    const BUILD_STEPS: BuildStep[] = [
        { name: "Lighting the forge fires...", duration: 500 },
        { name: "Scribing the partitioning runes...", duration: 800 },
        { name: "Gathering package dependencies...", duration: 1200 },
        { name: "Imbuing the Power Core (Bootloader)...", duration: 700 },
        { name: "Etching post-install configurations...", duration: 1000 },
        { name: "Forging the ISO Artifact...", duration: 400 },
    ];

    return (
        <div className="bg-slate-900 text-white font-sans min-h-screen flex flex-col md:flex-row">
            {isScanModalOpen && <SystemScanModal onClose={() => setIsScanModalOpen(false)} onComplete={handleScanComplete} />}
            {isTargetModalOpen && <TargetSelectionModal onClose={() => setIsTargetModalOpen(false)} onSelectTarget={handleTargetSelection} />}
            {isBuildModalOpen && <BuildModal 
                steps={BUILD_STEPS} 
                script={generatedScript} 
                onClose={() => setIsBuildModalOpen(false)}
                onShowInstructions={() => {
                    setIsBuildModalOpen(false);
                    setIsIsoModalOpen(true);
                }}
            />}
            {isCodexModalOpen && <CodexModal snippets={CODEX_SNIPPETS} onClose={() => setIsCodexModalOpen(false)} />}
            {isIsoModalOpen && <IsoModal generatedScript={generatedScript} onClose={() => setIsIsoModalOpen(false)} config={distroConfig} />}
            {isDrawerOpen && <MobileBlueprintDrawer
                config={distroConfig}
                onConfigChange={setDistroConfig}
                isLocked={isBlueprintLocked}
                onLockToggle={() => setIsBlueprintLocked(prev => !prev)}
                onClose={() => setIsDrawerOpen(false)}
                onBuild={handleInitiateBuild}
            />}
            
            <aside className="w-full md:w-1/3 lg:w-2/5 xl:w-1/3 bg-slate-950/50 border-r border-slate-800 p-6 h-screen overflow-y-auto hidden md:block">
               <DistroBlueprintPanel 
                    config={distroConfig} 
                    onConfigChange={setDistroConfig} 
                    isLocked={isBlueprintLocked}
                    onLockToggle={() => setIsBlueprintLocked(prev => !prev)}
                    onBuild={handleInitiateBuild}
                />
            </aside>
            
            <main className="flex-1 flex flex-col p-4 md:p-6 h-screen">
                <header className="mb-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Logo linkState={linkState} onToggle={() => setLinkState(s => s === 'online' ? 'offline' : 'online')} />
                        <button 
                            className="text-slate-400 hover:text-white transition-colors md:hidden"
                            onClick={() => setIsDrawerOpen(true)}
                            aria-label="Open Blueprint"
                        >
                           <BlueprintIcon className="w-6 h-6"/>
                        </button>
                    </div>
                    <button 
                        className="text-slate-400 hover:text-white transition-colors text-sm font-semibold hidden md:block"
                        onClick={() => setIsCodexModalOpen(true)}
                    >
                        Codex
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto pr-4 space-y-6">
                    {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
                    <div ref={chatEndRef} />
                </div>

                <div className="mt-auto pt-4">
                     {messages.length <= 1 && <CommandSuggestions suggestions={INITIAL_SUGGESTIONS} onSelect={handleSend} />}
                     
                     {attachedFile && (
                        <FileAttachment fileName="scrying_report.md" onRemove={() => setAttachedFile(null)} />
                     )}

                    <div className="relative">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Architect, declare your vision for the realm..."
                            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-3 pr-24 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none transition-all"
                            rows={1}
                            disabled={isLoading}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                             <button className="text-slate-400 hover:text-white transition-colors" disabled={isLoading} onClick={() => setIsScanModalOpen(true)} aria-label="Scry System Hardware">
                                <AttachmentIcon className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => handleSend()}
                                disabled={isLoading || !input.trim()}
                                className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-md p-2 transition-colors"
                                aria-label="Send Command"
                            >
                                <SendIcon className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;