import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

import type { DistroConfig, Message, LinkState, AnalysisResult } from './types';
import { INITIAL_DISTRO_CONFIG, COMMAND_SUGGESTIONS } from './constants';
import { WELCOME_MESSAGE, CLOUD_AI_SYSTEM_PROMPT } from './kael-personality';
import { generateAICoreScript } from './lib/script-generator';

// Component Imports
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { CommandSuggestions } from './components/CommandSuggestions';
import { BottomPanel } from './components/BottomPanel';
import { FileAttachment } from './components/FileAttachment';
import { DistroBlueprintPanel } from './components/DistroBlueprintPanel';

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
import { ChroniclerModal } from './components/ChroniclerModal';
import { ForgeInspectorModal } from './components/ForgeInspectorModal';
import { SigilCrafterModal } from './components/SigilCrafterModal';
import { KeyringAttunementModal } from './components/KeyringAttunementModal';
import { LocalSourceRitualModal } from './components/LocalSourceRitualModal';
import { TuiInstallerModal } from './components/TuiInstallerModal';
import { ManualForgeModal } from './components/ManualForgeModal';
import { AthenaeumMirrorModal } from './components/AthenaeumMirrorModal';
import { TransmutationRitualModal } from './components/TransmutationRitualModal';
import { KhwsRitualModal } from './components/KhwsRitualModal';


type ModalType = 
    | 'build' | 'iso' | 'keystone' | 'ai-core' | 'law' | 'levelup' 
    | 'personality' | 'codex' | 'system-scan' | 'forge-builder'
    | 'athenaeum-scryer' | 'housekeeping' | 'chronicler'
    | 'forge-inspector' | 'sigil-crafter' | 'keyring-attunement' 
    | 'local-source-ritual' | 'tui-installer' | 'manual-forge' | 'athenaeum-mirror' | 'transmutation-ritual'
    | 'khws-ritual' | null;

const App: React.FC = () => {
    const [config, setConfig] = useState<DistroConfig>(INITIAL_DISTRO_CONFIG);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLocked, setIsLocked] = useState(true);
    const [linkState, setLinkState] = useState<LinkState>('online');
    const [isLoading, setIsLoading] = useState(false);
    const [activeModal, setActiveModal] = useState<ModalType>(null);
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
        if (isLocked) return;
        setConfig(newConfig);
        setIsAICoreScriptGenerated(false);
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
            }
        }

        try {
            const isMakepkgGpgFail = fileContent && fileContent.includes("makepkg") && fileContent.includes("FAILED (unknown public key B62C3D10C54D5DA9)");

            if (isMakepkgGpgFail) {
                setMessages(prev => prev.slice(0, -1)); // remove thinking
                
                const triedLsignKey = fileContent.includes("Locally signed 1 key.") || fileContent.includes("Signing the key to establish trust...");

                let analysis: AnalysisResult;

                if (triedLsignKey) {
                    analysis = {
                        diagnosis: "The Orb reveals a deep magic. Our ritual to attune the system's main keyring was successful, but `makepkg` consults your *personal* user keyring, which remains unattuned. This is a known quirk of the forge.",
                        solutionCommand: "makepkg -si --skippgpcheck",
                        nextStep: "Use this command within the 'chwd' directory. It instructs the forge to proceed, relying on the strong integrity checksums instead of the PGP signature for this step. The package will still be safely verified by the system keyring upon installation."
                    };
                } else {
                    const chwdFixScriptRaw = `#!/bin/bash
# Kael OS - CHWD Artisan Key Attunement (v2)
set -euo pipefail
echo "--- Attuning to CHWD Artisan's Signature (v2) ---"
pacman-key --init
pacman-key --recv-keys B62C3D10C54D5DA9
pacman-key --lsign-key B62C3D10C54D5DA9
echo "--- ✅ Attunement Complete ---"
`;
                    const encodedScript = btoa(unescape(encodeURIComponent(chwdFixScriptRaw)));
                    const fullCommand = `echo "${encodedScript}" | base64 --decode | sudo bash`;

                    analysis = {
                      diagnosis: "The forge's security wards do not recognize the signature of the CachyOS artisan for the 'chwd' package. We must perform a ritual to attune the system's main keyring to trust this signature.",
                      solutionCommand: fullCommand,
                      nextStep: "Run this full command in your terminal. It will perform the complete three-step ritual to initialize, receive, and sign the key. Then, retry the 'makepkg -si' command."
                    };
                }

                const modelMessage: Message = {
                    role: 'model',
                    text: "I have scried the new chronicle, Architect. The path forward has changed, but it is clear.",
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
                
                setMessages(prev => prev.slice(0, -1));

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
             setMessages(prev => prev.slice(0, -1));
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
                        setIsLocked(true);
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
            case 'build': return <BuildModal steps={[{ name: 'Calibrating the Chrono-Anvil...', duration: 1000 }, { name: 'Etching Configuration Grimoires...', duration: 1500 }, { name: 'Summoning Calamares Spirit...', duration: 2000 }, { name: 'Binding Post-Install Incantations...', duration: 2500 }, { name: 'Forging the Master Build Script...', duration: 1000 }]} onClose={() => setActiveModal(null)} onComplete={() => setActiveModal('iso')} />;
            case 'iso': return <IsoModal config={config} onClose={() => setActiveModal(null)} />;
            case 'keystone': return <KeystoneModal onClose={() => setActiveModal(null)} />;
            case 'ai-core': return <AICoreModal script={aiCoreScript} onClose={() => setActiveModal(null)} />;
            case 'law': return <LawModal onClose={() => setActiveModal(null)} />;
            case 'levelup': return <LevelUpModal onClose={() => setActiveModal(null)} />;
            case 'personality': return <PersonalityModal onClose={() => setActiveModal(null)} />;
            case 'codex': return <CodexModal snippets={[{id: "1", title: "Manually Partition a Disk", content: "..."}]} onClose={() => setActiveModal(null)} />;
            case 'system-scan': return <SystemScanModal onClose={() => setActiveModal(null)} onComplete={(report) => handleSendMessage(`Analyze this system report and suggest blueprint changes:\n${report}`)} />;
            case 'forge-builder': return <ForgeBuilderModal onClose={() => setActiveModal(null)} />;
            case 'athenaeum-scryer': return <AthenaeumScryerModal onClose={() => setActiveModal(null)} />;
            case 'housekeeping': return <HousekeepingModal onClose={() => setActiveModal(null)} />;
            case 'chronicler': return <ChroniclerModal onClose={() => setActiveModal(null)} />;
            case 'forge-inspector': return <ForgeInspectorModal onClose={() => setActiveModal(null)} />;
            case 'sigil-crafter': return <SigilCrafterModal onClose={() => setActiveModal(null)} onGenerate={(prompt) => handleSendMessage(prompt)} />;
            case 'keyring-attunement': return <KeyringAttunementModal onClose={() => setActiveModal(null)} />;
            case 'local-source-ritual': return <LocalSourceRitualModal onClose={() => setActiveModal(null)} />;
            case 'tui-installer': return <TuiInstallerModal onClose={() => setActiveModal(null)} />;
            case 'manual-forge': return <ManualForgeModal onClose={() => setActiveModal(null)} />;
            case 'athenaeum-mirror': return <AthenaeumMirrorModal onClose={() => setActiveModal(null)} />;
            case 'transmutation-ritual': return <TransmutationRitualModal onClose={() => setActiveModal(null)} />;
            case 'khws-ritual': return <KhwsRitualModal onClose={() => setActiveModal(null)} />;
            default: return null;
        }
    };
    
    return (
        <div className="bg-forge-bg min-h-screen text-forge-text-primary font-sans flex flex-col">
            <Header linkState={linkState} />
            
            <main className="flex-1 w-full max-w-screen-2xl mx-auto p-4 pt-20 lg:pt-24 grid lg:grid-cols-3 gap-8">
                {/* Chat Panel (Left Column) */}
                <div className="lg:col-span-2 flex flex-col h-[75vh] lg:h-[calc(100vh-7.5rem)]">
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
                
                {/* Blueprint Panel (Right Column) */}
                <div className="lg:col-span-1 flex flex-col">
                    <DistroBlueprintPanel
                        config={config}
                        onConfigChange={handleConfigChange}
                        isLocked={isLocked}
                        onLockToggle={() => setIsLocked(!isLocked)}
                        onBuild={() => setActiveModal('build')}
                        onForgeKeystone={() => setActiveModal('keystone')}
                        onInitiateAICoreAttunement={handleInitiateAICoreAttunement}
                        isAICoreScriptGenerated={isAICoreScriptGenerated}
                        onExportBlueprint={handleExportBlueprint}
                        onImportBlueprint={handleImportBlueprint}
                    />
                </div>

            </main>
            {renderModal()}
        </div>
    );
};

export default App;