import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { Message, DistroConfig, LinkState } from './types';
import { ChatMessage } from './components/ChatMessage';
import { CommandSuggestions } from './components/CommandSuggestions';
import { SendIcon, AttachmentIcon, ScanIcon } from './components/Icons';
import { FileAttachment } from './components/FileAttachment';
import { DistroBlueprintPanel } from './components/DistroBlueprintPanel';
import { MobileBlueprintDrawer } from './components/MobileBlueprintDrawer';
import { SystemScanModal } from './components/SystemScanModal';
import { IsoModal } from './components/IsoModal';
import { CodexModal } from './components/CodexModal';
import { AICoreModal } from './components/AICoreModal';
import { LawModal } from './components/LawModal';
import { PersonalityModal } from './components/PersonalityModal';
import { LevelUpModal } from './components/LevelUpModal';
import { ForgeBuilderModal } from './components/ForgeBuilderModal';
import { KeystoneModal } from './components/KeystoneModal'; // New Import
import { INITIAL_DISTRO_CONFIG, COMMAND_SUGGESTIONS, CODEX_SNIPPETS } from './constants';
import { WELCOME_MESSAGE, CLOUD_AI_SYSTEM_PROMPT } from './kael-personality';
import { generateAICoreScript } from './lib/script-generator';
import { TopDock } from './components/TopDock';
import { BottomPanel } from './components/BottomPanel';


// Initialize the Google Gemini AI Client (the "Cloud Core").
// The API key, which you might refer to as your "Studio Key" from Google AI Studio,
// is securely accessed from environment variables and is not related to the OS branding.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
    const [distroConfig, setDistroConfig] = useState<DistroConfig>(INITIAL_DISTRO_CONFIG);
    const [isBlueprintLocked, setIsBlueprintLocked] = useState(true);
    const [linkState, setLinkState] = useState<LinkState>('online');
    const [isLoading, setIsLoading] = useState(false);
    const [isBlueprintDrawerOpen, setIsBlueprintDrawerOpen] = useState(false);
    
    // Modal states
    const [isScanModalOpen, setScanModalOpen] = useState(false);
    const [isIsoModalOpen, setIsoModalOpen] = useState(false);
    const [isCodexModalOpen, setCodexModalOpen] = useState(false);
    const [isAICoreModalOpen, setAICoreModalOpen] = useState(false);
    const [isLawModalOpen, setLawModalOpen] = useState(false);
    const [isPersonalityModalOpen, setPersonalityModalOpen] = useState(false);
    const [isLevelUpModalOpen, setLevelUpModalOpen] = useState(false);
    const [isForgeBuilderModalOpen, setForgeBuilderModalOpen] = useState(false);
    const [isKeystoneModalOpen, setIsKeystoneModalOpen] = useState(false); // New State
    
    const [generatedScript, setGeneratedScript] = useState('');
    const [isAICoreScriptGenerated, setIsAICoreScriptGenerated] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        setMessages([{
            role: 'model',
            text: WELCOME_MESSAGE,
            linkState: linkState
        }]);
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setAttachedFile({ name: file.name, content });
            };
            reader.readAsText(file);
        }
    };

    const parseAIResponse = (responseText: string) => {
        try {
            const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
                const newConfig = JSON.parse(jsonMatch[1]);
                setDistroConfig(prev => ({...prev, ...newConfig}));
                setMessages(prev => [...prev, {
                    role: 'model',
                    text: "I have updated The Architect's Blueprint based on your request.",
                    linkState: 'online'
                }]);
            } else {
                 setMessages(prev => [...prev, { role: 'model', text: responseText, linkState: 'online' }]);
            }
        } catch (error) {
            console.error("Failed to parse AI response:", error);
            setMessages(prev => [...prev, { role: 'model', text: responseText, linkState: 'online' }]);
        }
    }

    const handleSendMessage = useCallback(async (text: string, attachedFileContent?: string) => {
        if (!text.trim() && !attachedFileContent) return;

        const userMessage: Message = { role: 'user', text };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        // Add a temporary "thinking" message from the model
        setMessages(prev => [...prev, { role: 'model', text: '...', linkState }]);

        if (linkState === 'offline') {
            setTimeout(() => {
                 setMessages(prev => prev.slice(0, -1)); // Remove "thinking" message
                 setMessages(prev => [...prev, {
                    role: 'model',
                    text: "My Cloud Core is offline. My Local Core is still active within a forged Realm, but my blueprint design capabilities here are limited. You can still modify the blueprint manually.",
                    linkState: 'offline'
                 }]);
                setIsLoading(false);
            }, 1000);
            return;
        }

        try {
            const systemInstruction = `${CLOUD_AI_SYSTEM_PROMPT}\n${JSON.stringify(distroConfig, null, 2)}`;

            let prompt = text;
            if (attachedFileContent) {
                prompt = `Using the following context file titled "${attachedFile?.name}", please answer the user's prompt.\n\nCONTEXT:\n---\n${attachedFileContent}\n---\n\nPROMPT:\n${text}`;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: { systemInstruction: systemInstruction }
            });
            
            setMessages(prev => prev.slice(0, -1)); // Remove "thinking" message
            parseAIResponse(response.text);

        } catch (error) {
            console.error("Error generating content:", error);
            setMessages(prev => prev.slice(0, -1)); // Remove "thinking" message
            setMessages(prev => [...prev, {
                role: 'model',
                text: "My connection to the aether has been disrupted. Please check your API key and network connection.",
                linkState: 'online'
            }]);
        } finally {
            setIsLoading(false);
            setAttachedFile(null);
            setInput('');
        }
    }, [linkState, distroConfig, attachedFile?.name]);


    const handleSuggestionSelect = (suggestion: string) => {
        setInput(suggestion);
        handleSendMessage(suggestion);
    }
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(input, attachedFile?.content);
    };
    
    const handleInitiateAICoreAttunement = () => {
        const script = generateAICoreScript(distroConfig);
        setGeneratedScript(script);
        if (script) {
            setIsAICoreScriptGenerated(true);
            setAICoreModalOpen(true);
        }
    };
    

    return (
        <div className="bg-forge-bg text-forge-text-primary min-h-screen flex flex-col font-sans animate-fade-in">
            <TopDock onBlueprintClick={() => setIsBlueprintDrawerOpen(true)} />

            <div className="flex flex-1 pt-20 pb-14 w-full h-full">
                <main className="flex-1 flex flex-col max-w-full">
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                       {messages.map((msg, index) => (
                           <ChatMessage key={index} message={msg} />
                       ))}
                       {messages.length <= 1 && !isLoading && (
                            <CommandSuggestions suggestions={COMMAND_SUGGESTIONS} onSelect={handleSuggestionSelect} />
                       )}
                       <div ref={chatEndRef} />
                    </div>

                    <div className="px-4 md:px-6 pb-4 bg-forge-bg">
                        {attachedFile && (
                            <FileAttachment fileName={attachedFile.name} onRemove={() => setAttachedFile(null)} />
                        )}
                        <form onSubmit={handleFormSubmit} className="relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleFormSubmit(e);
                                    }
                                }}
                                placeholder="Forge your request, Architect..."
                                className="w-full bg-forge-panel border border-forge-border rounded-lg pr-24 pl-12 py-3 resize-none focus:ring-2 focus:ring-dragon-fire focus:border-dragon-fire transition-colors"
                                rows={1}
                                disabled={isLoading}
                            />
                             <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-forge-text-secondary hover:text-forge-text-primary transition-colors"
                                    aria-label="Attach file"
                                >
                                    <AttachmentIcon className="w-5 h-5" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                 <button
                                    type="button"
                                    onClick={() => setScanModalOpen(true)}
                                    className="text-forge-text-secondary hover:text-forge-text-primary transition-colors"
                                    aria-label="Scan local hardware"
                                >
                                    <ScanIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-dragon-fire text-forge-bg rounded-full p-2 hover:shadow-glow-dragon-fire transition-shadow disabled:bg-slate-600 disabled:shadow-none"
                                disabled={isLoading || (!input.trim() && !attachedFile)}
                            >
                                <SendIcon className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </main>

                <aside className="hidden md:block w-96 lg:w-[450px] flex-shrink-0 border-l border-forge-border p-4 overflow-y-auto">
                    <DistroBlueprintPanel 
                        config={distroConfig} 
                        onConfigChange={setDistroConfig} 
                        isLocked={isBlueprintLocked} 
                        onLockToggle={() => setIsBlueprintLocked(prev => !prev)}
                        onBuild={() => setIsoModalOpen(true)}
                        onForgeKeystone={() => setIsKeystoneModalOpen(true)} // New Prop
                        onInitiateAICoreAttunement={handleInitiateAICoreAttunement}
                        isAICoreScriptGenerated={isAICoreScriptGenerated}
                    />
                </aside>
            </div>
            
            <BottomPanel 
                linkState={linkState}
                onToggleLinkState={() => setLinkState(s => s === 'online' ? 'offline' : 'online')}
                onCodexClick={() => setCodexModalOpen(true)}
                onLawClick={() => setLawModalOpen(true)}
                onPersonalityClick={() => setPersonalityModalOpen(true)}
                onManifestoClick={() => setLevelUpModalOpen(true)}
                onForgeBuilderClick={() => setForgeBuilderModalOpen(true)}
            />

            {isBlueprintDrawerOpen && (
                <MobileBlueprintDrawer 
                    config={distroConfig} 
                    onConfigChange={setDistroConfig} 
                    isLocked={isBlueprintLocked} 
                    onLockToggle={() => setIsBlueprintLocked(prev => !prev)}
                    onClose={() => setIsBlueprintDrawerOpen(false)}
                    onBuild={() => { setIsoModalOpen(true); setIsBlueprintDrawerOpen(false); }}
                    onForgeKeystone={() => { setIsKeystoneModalOpen(true); setIsBlueprintDrawerOpen(false); }} // New Prop
                    onInitiateAICoreAttunement={() => { handleInitiateAICoreAttunement(); setIsBlueprintDrawerOpen(false); }}
                    isAICoreScriptGenerated={isAICoreScriptGenerated}
                />
            )}

            {isScanModalOpen && (
                <SystemScanModal 
                    onClose={() => setScanModalOpen(false)} 
                    onComplete={(report) => handleSendMessage("Update the blueprint based on this hardware scan.", report)}
                />
            )}

            {isIsoModalOpen && (
                <IsoModal
                    onClose={() => setIsoModalOpen(false)}
                    config={distroConfig}
                />
            )}

             {isCodexModalOpen && (
                <CodexModal
                    onClose={() => setCodexModalOpen(false)}
                    snippets={CODEX_SNIPPETS}
                />
            )}

             {isAICoreModalOpen && (
                <AICoreModal
                    script={generatedScript}
                    onClose={() => setAICoreModalOpen(false)}
                />
            )}
            {isLawModalOpen && (
                <LawModal
                    onClose={() => setLawModalOpen(false)}
                />
            )}
             {isPersonalityModalOpen && (
                <PersonalityModal
                    onClose={() => setPersonalityModalOpen(false)}
                />
            )}
            {isLevelUpModalOpen && (
                <LevelUpModal
                    onClose={() => setLevelUpModalOpen(false)}
                />
            )}
            {isForgeBuilderModalOpen && (
                <ForgeBuilderModal
                    onClose={() => setForgeBuilderModalOpen(false)}
                />
            )}
            {isKeystoneModalOpen && (
                <KeystoneModal
                    onClose={() => setIsKeystoneModalOpen(false)}
                />
            )}
        </div>
    );
};

export default App;