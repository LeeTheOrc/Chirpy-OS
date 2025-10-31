import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

import type { DistroConfig, Message, LinkState, AnalysisResult } from './types';
import { INITIAL_DISTRO_CONFIG, COMMAND_SUGGESTIONS, BUILD_STEPS, CODEX_SNIPPETS } from './constants';
import { WELCOME_MESSAGE, CLOUD_AI_SYSTEM_PROMPT } from './kael-personality';
import { generateAICoreScript } from './lib/script-generator';
import { generateCalamaresConfiguration } from './lib/calamares-generator';

// Component Imports
import { Logo } from './components/Logo';
import { TopDock } from './components/TopDock';
import { MobileBlueprintDrawer } from './components/MobileBlueprintDrawer';
import { ChatMessage } from './components/ChatMessage';
import { CommandSuggestions } from './components/CommandSuggestions';
import { BottomPanel } from './components/BottomPanel';
import { FileAttachment } from './components/FileAttachment';

// Modal Imports
import { BuildModal } from './components/BuildModal';
import { IsoModal } from './components/IsoModal';
import { KeystoneModal } from './components/KeystoneModal';
import { AICoreModal } from './components/AICoreModal';
import { LawModal } from './components/LawModal';
import { LevelUpModal } from './components/LevelUpModal';
import { PersonalityModal } from './components/PersonalityModal';
import { CodexModal } from './components/CodexModal';
import { SystemScanModal } from './components/SystemScanModal';
import { ForgeBuilderModal } from './components/ForgeBuilderModal';
import { AthenaeumScryerModal } from './components/AthenaeumScryerModal';
import { HousekeepingModal } from './components/HousekeepingModal';
import { ChwdRitualModal } from './components/ChwdRitualModal';
import { ChroniclerModal } from './components/ChroniclerModal';
import { ForgeInspectorModal } from './components/ForgeInspectorModal';
import { SigilCrafterModal } from './components/SigilCrafterModal';
import { KeyringRitualModal } from './components/KeyringRitualModal';


type ModalType = 
    | 'build' | 'iso' | 'keystone' | 'ai-core' | 'law' | 'levelup' 
    | 'personality' | 'codex' | 'system-scan' | 'forge-builder'
    | 'athenaeum-scryer' | 'housekeeping' | 'chwd-ritual' | 'chronicler'
    | 'forge-inspector' | 'sigil-crafter' | 'keyring-ritual' | null;


const App: React.FC = () => {
    const [config, setConfig] = useState<DistroConfig>(INITIAL_DISTRO_CONFIG);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLocked, setIsLocked] = useState(true);
    const [linkState, setLinkState] = useState<LinkState>('online');
    const [isLoading, setIsLoading] = useState(false);
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isAICoreScriptGenerated, setIsAICoreScriptGenerated] = useState(false);
    const [aiCoreScript, setAiCoreScript] = useState('');
    const [attachedFile, setAttachedFile] = useState<File | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);

    const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});

    useEffect(() => {
        setMessages([{ role: 'model', text: WELCOME_MESSAGE, linkState }]);
    }, [linkState]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleConfigChange = (newConfig: DistroConfig) => {
        if (!isLocked) {
            setConfig(newConfig);
            setIsAICoreScriptGenerated(false);
        }
    };
    
    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim() && !attachedFile) return;

        const userMessage: Message = { role: 'user', text: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Add thinking indicator
        setMessages(prev => [...prev, { role: 'model', text: '...', linkState }]);
        
        let fileContent: string | null = null;
        if (attachedFile) {
            try {
                fileContent = await attachedFile.text();
            } catch (e) {
                console.error("Error reading file:", e);
                // Handle error, maybe show a message to the user.
            }
        }

        try {
            const isKaelChronicle = fileContent && fileContent.includes("KAEL CHRONICLE") && fileContent.includes("FAILED (unknown public key B62C3D10C54D5DA9)");
            
            if (isKaelChronicle) {
                // Mocked AI response for the specific GPG error from the user's log
                setMessages(prev => prev.slice(0, -1)); // remove thinking
                const analysis: AnalysisResult = {
                  diagnosis: "The build failed because the forge's security wards do not recognize the signature of the CachyOS master artisan for the 'chwd' package. This is a GPG key verification failure.",
                  solutionCommand: "gpg --recv-key B62C3D10C54D5DA9 && pacman-key --lsign-key B62C3D10C54D5DA9",
                  nextStep: "Once the key is trusted, re-run the 'makepkg -si' command within the 'chwd' directory. The build should now proceed."
                };
                const modelMessage: Message = {
                    role: 'model',
                    text: "I have scried the chronicle, Architect. The Oracle's Pool has revealed the source of our struggle. The path forward is clear.",
                    linkState,
                    analysis: analysis
                };
                setMessages(prev => [...prev, modelMessage]);
            } else {
                 let fullPrompt = `${CLOUD_AI_SYSTEM_PROMPT} \n\n ${JSON.stringify(config, null, 2)} \n\n User message: ${messageText}`;
                 if (fileContent) {
                    fullPrompt += `\n\nAttached file content:\n${fileContent}`;
                 }
                 
                const response: GenerateContentResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: fullPrompt,
                });
                
                const responseText = response.text;
                
                setMessages(prev => prev.slice(0, -1)); // Remove thinking indicator

                const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
                if (jsonMatch && jsonMatch[1]) {
                    try {
                        const newConfigPart = JSON.parse(jsonMatch[1]);
                        setConfig(prev => ({ ...prev, ...newConfigPart }));
                        const confirmationMessage: Message = {
                            role: 'model',
                            text: `Understood, Architect. I've updated the blueprint with your changes.`,
                            linkState,
                        };
                        setMessages(prev => [...prev, confirmationMessage]);
                    } catch (e) {
                        console.error("Failed to parse JSON from AI response:", e);
                        const errorMessage: Message = {
                            role: 'model',
                            text: "I tried to update the blueprint but couldn't understand the configuration. Could you clarify?",
                            linkState,
                        };
                        setMessages(prev => [...prev, errorMessage]);
                    }
                } else {
                     const modelMessage: Message = { role: 'model', text: responseText, linkState };
                     setMessages(prev => [...prev, modelMessage]);
                }
            }
        } catch (error) {
            console.error("Error communicating with AI:", error);
             setMessages(prev => prev.slice(0, -1)); // remove thinking
            const errorMessage: Message = {
                role: 'model',
                text: "My connection to the cloud animus seems to be severed. Please check the connection or try again later.",
                linkState: 'offline'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setAttachedFile(null);
        }
    };
    
     const handleInitiateAICoreAttunement = () => {
        const script = generateAICoreScript(config);
        setAiCoreScript(script);
        setIsAICoreScriptGenerated(true);
        setActiveModal('ai-core');
    };
    
    const handleExportBlueprint = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(config, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "kael-os-blueprint.json";
        link.click();
    };

    const handleImportBlueprint = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const newConfig = JSON.parse(event.target?.result as string);
                        setConfig(newConfig);
                        setIsLocked(true); // Lock after importing a new blueprint
                    } catch (err) {
                        alert("Error: Could not parse the blueprint file.");
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };


    const renderModal = () => {
        switch (activeModal) {
            case 'build': return <BuildModal steps={BUILD_STEPS} onClose={() => setActiveModal(null)} onComplete={() => setActiveModal('iso')} />;
            case 'iso': return <IsoModal config={config} onClose={() => setActiveModal(null)} />;
            case 'keystone': return <KeystoneModal onClose={() => setActiveModal(null)} />;
            case 'ai-core': return <AICoreModal script={aiCoreScript} onClose={() => setActiveModal(null)} />;
            case 'law': return <LawModal onClose={() => setActiveModal(null)} />;
            case 'levelup': return <LevelUpModal onClose={() => setActiveModal(null)} />;
            case 'personality': return <PersonalityModal onClose={() => setActiveModal(null)} />;
            case 'codex': return <CodexModal snippets={CODEX_SNIPPETS} onClose={() => setActiveModal(null)} />;
            case 'system-scan': return <SystemScanModal onClose={() => setActiveModal(null)} onComplete={(report) => handleSendMessage(`Analyze this system report and suggest blueprint changes:\n${report}`)} />;
            case 'forge-builder': return <ForgeBuilderModal onClose={() => setActiveModal(null)} />;
            case 'athenaeum-scryer': return <AthenaeumScryerModal onClose={() => setActiveModal(null)} />;
            case 'housekeeping': return <HousekeepingModal onClose={() => setActiveModal(null)} />;
            case 'chwd-ritual': return <ChwdRitualModal onClose={() => setActiveModal(null)} />;
            case 'chronicler': return <ChroniclerModal onClose={() => setActiveModal(null)} />;
            case 'forge-inspector': return <ForgeInspectorModal onClose={() => setActiveModal(null)} />;
            case 'sigil-crafter': return <SigilCrafterModal onClose={() => setActiveModal(null)} onGenerate={(prompt) => handleSendMessage(prompt)} />;
            case 'keyring-ritual': return <KeyringRitualModal onClose={() => setActiveModal(null)} />;
            default: return null;
        }
    };
    
    return (
        <div className="bg-forge-bg min-h-screen text-forge-text-primary font-sans flex flex-col">
             <div className="fixed top-0 left-0 right-0 z-20 p-4 flex justify-between items-center md:hidden bg-forge-bg/80 backdrop-blur-sm">
                <Logo linkState={linkState} />
            </div>

            <TopDock onBlueprintClick={() => setIsDrawerOpen(true)} />

            <main className="flex-1 flex flex-col p-4 pt-20 md:pt-4 gap-4 max-w-screen-2xl mx-auto w-full">
                {/* Mobile Blueprint Drawer */}
                {isDrawerOpen && (
                    <MobileBlueprintDrawer
                        config={config}
                        onConfigChange={handleConfigChange}
                        isLocked={isLocked}
                        onLockToggle={() => setIsLocked(!isLocked)}
                        onClose={() => setIsDrawerOpen(false)}
                        onBuild={() => { setActiveModal('build'); setIsDrawerOpen(false); }}
                        onForgeKeystone={() => { setActiveModal('keystone'); setIsDrawerOpen(false); }}
                        onInitiateAICoreAttunement={() => { handleInitiateAICoreAttunement(); setIsDrawerOpen(false); }}
                        isAICoreScriptGenerated={isAICoreScriptGenerated}
                        onExportBlueprint={handleExportBlueprint}
                        onImportBlueprint={handleImportBlueprint}
                    />
                )}
                
                {/* Chat Panel */}
                <div className="flex-1 flex flex-col h-full">
                     <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-4">
                        {messages.map((msg, index) => (
                            <ChatMessage key={index} message={msg} />
                        ))}
                         <div ref={chatEndRef} />
                    </div>

                    {messages.length <= 1 && !isLoading && (
                        <CommandSuggestions 
                            suggestions={COMMAND_SUGGESTIONS} 
                            onSelect={(cmd) => handleSendMessage(cmd)} 
                        />
                    )}
                    
                    {attachedFile && (
                        <FileAttachment fileName={attachedFile.name} onRemove={() => setAttachedFile(null)} />
                    )}

                    <BottomPanel
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onSendMessage={() => handleSendMessage(input)}
                        isLoading={isLoading}
                        linkState={linkState}
                        onFileAttached={(file) => setAttachedFile(file)}
                        onOpenMenu={(menu) => setActiveModal(menu)}
                    />
                </div>
            </main>
            {renderModal()}
        </div>
    );
};

export default App;