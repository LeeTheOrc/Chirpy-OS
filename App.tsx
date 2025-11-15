import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

import type { Message } from './types';
import { WELCOME_MESSAGE, CLOUD_AI_SYSTEM_PROMPT } from './kael-personality';

// Component Imports
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { BottomPanel } from './components/BottomPanel';

// Modal Imports
import { LawModal } from './components/LawModal';
import { LevelUpModal } from './components/LevelUpModal';
import { PersonalityModal } from './components/PersonalityModal';
import { AthenaeumScribeModal } from './components/AthenaeumScribeModal';
import { AthenaeumMirrorModal } from './components/AthenaeumMirrorModal';
import { KeyringAttunementModal } from './components/KeyringAttunementModal';
import { ForgeSetupModal } from './components/ForgeSetupModal';
import { AthenaeumPathfindingModal } from './components/AthenaeumPathfindingModal';
import { ForgeDependenciesModal } from './components/ForgeDependenciesModal';
import { AthenaeumSanctificationModal } from './components/AthenaeumSanctificationModal';
import { ChroniclerPackageModal } from './components/ChroniclerPackageModal';
import { ChroniclerUsageModal } from './components/ChroniclerUsageModal';


export type ModalType = 'law' | 'levelup' | 'personality' | 'athenaeumScribe' | 'athenaeumMirror' | 'keyringAttunement' | 'forgeSetup' | 'athenaeumPathfinding' | 'forgeDependencies' | 'athenaeumSanctification' | 'forgeChroniclerPackage' | 'chroniclerUsage' | null;

const App: React.FC = () => {
    // --- State Management ---
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [linkState, setLinkState] = useState<'online' | 'offline'>('online');
    const [isLoading, setIsLoading] = useState(false);
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);

    const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});

    // --- Effects ---
    useEffect(() => {
        setMessages([{ role: 'model', text: WELCOME_MESSAGE, linkState }]);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    // --- Core Handler ---
    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim()) return;
        
        if (messageText.trim().toLowerCase() === 'clear chat please') {
            setMessages([{ role: 'model', text: "As you wish, Architect. The forge is clean.", linkState }]);
            setTimeout(() => {
                 setMessages([{ role: 'model', text: WELCOME_MESSAGE, linkState }]);
            }, 1500);
            setInput('');
            return;
        }


        const userMessage: Message = { role: 'user', text: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Add thinking indicator
        setMessages(prev => [...prev, { role: 'model', text: '...', linkState }]);
        
        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `${CLOUD_AI_SYSTEM_PROMPT}\n\nUser message: ${messageText}`,
            });
            
            const responseText = response.text;
            
            // Remove thinking indicator and add final response
            setMessages(prev => {
                const newMessages = prev.slice(0, -1);
                const modelMessage: Message = { role: 'model', text: responseText, linkState };
                return [...newMessages, modelMessage];
            });

        } catch (error) {
            console.error("Error communicating with AI:", error);
            // Remove thinking indicator and add error message
            setMessages(prev => {
                 const newMessages = prev.slice(0, -1);
                 const errorMessage: Message = {
                    role: 'model',
                    text: "My connection to the cloud animus seems to be severed. Please check the connection or try again later.",
                    linkState: 'offline'
                };
                return [...newMessages, errorMessage];
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- Modal Rendering ---
    const renderModal = () => {
        switch (activeModal) {
            case 'law': return <LawModal onClose={() => setActiveModal(null)} />;
            case 'levelup': return <LevelUpModal onClose={() => setActiveModal(null)} />;
            case 'personality': return <PersonalityModal onClose={() => setActiveModal(null)} />;
            case 'athenaeumScribe': return <AthenaeumScribeModal onClose={() => setActiveModal(null)} />;
            case 'athenaeumMirror': return <AthenaeumMirrorModal onClose={() => setActiveModal(null)} />;
            case 'keyringAttunement': return <KeyringAttunementModal onClose={() => setActiveModal(null)} />;
            case 'forgeSetup': return <ForgeSetupModal onClose={() => setActiveModal(null)} />;
            case 'athenaeumPathfinding': return <AthenaeumPathfindingModal onClose={() => setActiveModal(null)} />;
            case 'forgeDependencies': return <ForgeDependenciesModal onClose={() => setActiveModal(null)} />;
            case 'athenaeumSanctification': return <AthenaeumSanctificationModal onClose={() => setActiveModal(null)} />;
            case 'forgeChroniclerPackage': return <ChroniclerPackageModal onClose={() => setActiveModal(null)} />;
            case 'chroniclerUsage': return <ChroniclerUsageModal onClose={() => setActiveModal(null)} />;
            default: return null;
        }
    };
    
    return (
        <div className="bg-forge-bg min-h-screen text-forge-text-primary font-sans flex flex-col">
            <Header linkState={linkState} />
            
            <main className="flex-1 w-full max-w-4xl mx-auto p-4 pt-20 lg:pt-24 flex flex-col h-screen">
                 <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-4">
                    {messages.map((msg, index) => (
                        <ChatMessage key={index} message={msg} />
                    ))}
                     <div ref={chatEndRef} />
                </div>
                
                <BottomPanel
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onSendMessage={() => handleSendMessage(input)}
                    isLoading={isLoading}
                    onOpenMenu={(menu) => setActiveModal(menu)}
                />
            </main>
            {renderModal()}
        </div>
    );
};

export default App;