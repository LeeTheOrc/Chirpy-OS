import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Message, LinkState, DistroConfig, BuildStep } from './types';
import { WELCOME_MESSAGE, INITIAL_SUGGESTIONS, DEFAULT_DISTRO_CONFIG, SYSTEM_INSTRUCTION, CODEX_SNIPPETS } from './constants';
import { generateInstallScript } from './lib/script-generator';

import { Logo } from './components/Logo';
import { ChatMessage } from './components/ChatMessage';
import { CommandSuggestions } from './components/CommandSuggestions';
import { SendIcon, AttachmentIcon } from './components/Icons';
import { FileAttachment } from './components/FileAttachment';
import { DistroBlueprintPanel } from './components/DistroBlueprintPanel';
import { SystemScanModal } from './components/SystemScanModal';
import { BuildModal } from './components/BuildModal';
import { CodexModal } from './components/CodexModal';

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
    const [isCodexModalOpen, setIsCodexModalOpen] = useState(false);
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

        if (isBlueprintLocked && !userMessage.toLowerCase().includes('build script')) {
            setMessages(prev => [...prev, 
                { role: 'user', text: userMessage },
                { role: 'model', text: "The blueprint is currently locked. To make further changes, please unlock it using the icon in the blueprint panel, then send your request again.", linkState }
            ]);
            setInput('');
            return;
        }

        setIsLoading(true);
        setInput('');
        
        const newUserMessage: Message = { role: 'user', text: userMessage };
        setMessages(prev => [...prev, newUserMessage]);
        
        setTimeout(() => setMessages(prev => [...prev, { role: 'model', text: '...', linkState }]), 50);

        if (userMessage.toLowerCase().includes('scan system')) {
            setIsScanModalOpen(true);
            setMessages(prev => prev.slice(0, -1));
            setIsLoading(false);
            return;
        }

        if (userMessage.toLowerCase().includes('build script') && distroConfig) {
            const script = generateInstallScript(distroConfig);
            setGeneratedScript(script);
            setIsBuildModalOpen(true);
            setMessages(prev => prev.slice(0, -1));
            setIsLoading(false);
            return;
        }
        
        try {
            const conversationHistory = messages.map(m => `${m.role}: ${m.text}`).join('\n');
            const fullPrompt = `${conversationHistory}\nuser: ${userMessage}${attachedFile ? `\n\nSystem Report Context:\n${attachedFile}` : ''}\n\nBased on this conversation and context, generate the JSON configuration.`;

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
            const config = JSON.parse(text) as DistroConfig;
            setDistroConfig(config);
            setIsBlueprintLocked(true); // Lock the blueprint after successful generation
            setAttachedFile(null);

            const modelResponse = `The Architect's Blueprint has been updated and locked in. The changes are reflected on the right. What is our next move? We can refine the details (unlock first), or type "build script" to forge the installer.`;
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
            {isBuildModalOpen && <BuildModal steps={BUILD_STEPS} script={generatedScript} onClose={() => setIsBuildModalOpen(false)} />}
            {isCodexModalOpen && <CodexModal snippets={CODEX_SNIPPETS} onClose={() => setIsCodexModalOpen(false)} />}
            
            <main className="flex-1 flex flex-col p-4 md:p-6 h-screen">
                <header className="mb-4 flex justify-between items-center">
                    <Logo linkState={linkState} onToggle={() => setLinkState(s => s === 'online' ? 'offline' : 'online')} />
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

            <aside className="w-full md:w-1/3 lg:w-2/5 xl:w-1/3 bg-slate-950/50 border-l border-slate-800 p-6 h-screen overflow-y-auto hidden md:block">
               <DistroBlueprintPanel 
                    config={distroConfig} 
                    onConfigChange={setDistroConfig} 
                    isLocked={isBlueprintLocked}
                    onLockToggle={() => setIsBlueprintLocked(prev => !prev)}
                />
            </aside>
        </div>
    );
};

export default App;