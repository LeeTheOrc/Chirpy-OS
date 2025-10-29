import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse, Type, Chat } from "@google/genai";
import { DistroBlueprintPanel } from './components/DistroBlueprintPanel';
import { ChatMessage } from './components/ChatMessage';
import { CommandSuggestions } from './components/CommandSuggestions';
import { Logo } from './components/Logo';
import { SystemScanModal } from './components/SystemScanModal';
import { BuildModal } from './components/BuildModal';
import { FileAttachment } from './components/FileAttachment';
import { AttachmentIcon, SendIcon, CloseIcon, InformationCircleIcon } from './components/Icons';
import { INITIAL_MESSAGES, COMMAND_SUGGESTIONS, INITIAL_DISTRO_CONFIG, SYSTEM_INSTRUCTION } from './constants';
import { Message, DistroConfig, LinkState } from './types';

// In a Vite/Create-React-App environment, env vars are prefixed.
// This is a common way to handle them. For this exercise, we'll assume process.env is available.
const API_KEY = process.env.REACT_APP_API_KEY || process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({apiKey: API_KEY!});

// --- About Modal Component ---
interface AboutModalProps {
  onClose: () => void;
}

const FeatureItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h4 className="font-semibold text-yellow-400">{title}</h4>
    <p className="text-sm text-slate-400 mt-1">{children}</p>
  </div>
);

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
    >
        <div 
            className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-full max-w-2xl text-slate-200 flex flex-col max-h-[90vh] animate-slide-in-up"
            onClick={(e) => e.stopPropagation()}
        >
            <header className="flex items-center justify-between p-4 border-b border-slate-800">
                <Logo linkState="online" />
                <button onClick={onClose} className="text-slate-400 hover:text-white">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </header>

            <div className="p-6 space-y-6 overflow-y-auto">
                <p className="text-slate-300">
                    Chirpy OS is a conceptual project designed to reimagine the Linux installation experience. It combines a powerful AI assistant with a high-performance Arch Linux base to help you forge a personalized operating system tailored to your exact needs—from gaming to development.
                </p>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-2">Core Features</h3>
                    <FeatureItem title="AI-Powered Blueprints">
                        Describe your ideal OS in plain English. Chirpy AI, powered by the Google Gemini API, intelligently translates your requests into a detailed configuration blueprint, handling everything from package selection to network settings.
                    </FeatureItem>
                     <FeatureItem title="Performance First">
                        Built on an Arch Linux foundation with performance-tuned CachyOS kernels and access to the Chaotic-AUR, Chirpy OS is optimized for speed and responsiveness. Hardware detection automatically selects the best kernel for your CPU architecture.
                    </FeatureItem>
                     <FeatureItem title="System Resilience">
                        With BTRFS as the default filesystem, Chirpy OS enables bootable snapshots out-of-the-box. Easily roll your system back to a previous state from the boot menu if an update causes issues.
                    </FeatureItem>
                    <FeatureItem title="Gamer Ready">
                        Automatic detection and configuration for NVIDIA, AMD, and hybrid graphics systems (via `optimus-manager`) ensure you're ready for action. The interactive installer lets you pre-load Steam, Lutris, and other gaming essentials.
                    </FeatureItem>
                    <FeatureItem title="Interactive TUI Installer">
                        The generated `install.sh` script isn't a black box. It's a user-friendly, interactive TUI (Text-based User Interface) that guides you through the final setup steps, like disk selection and user creation, right in your terminal.
                    </FeatureItem>
                </div>
                 <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-2">Technology</h3>
                    <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                        <li><span className="font-semibold text-slate-300">Frontend:</span> React, TypeScript, Tailwind CSS</li>
                         <li><span className="font-semibold text-slate-300">AI Model:</span> Google Gemini API (gemini-2.5-pro)</li>
                         <li><span className="font-semibold text-slate-300">Base OS:</span> Arch Linux + CachyOS + Chaotic-AUR</li>
                    </ul>
                </div>
                <div>
                     <p className="text-xs text-slate-500 text-center border-t border-slate-800 pt-4">
                        Disclaimer: This is a prototype application. The "Forge" process is a simulation, and the generated install script should be reviewed carefully before use on a real machine.
                    </p>
                </div>
            </div>

            <footer className="p-4 border-t border-slate-800 flex justify-end">
                <button 
                    onClick={onClose}
                    className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Close
                </button>
            </footer>
        </div>
    </div>
  );
};


function App() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [userInput, setUserInput] = useState('');
  const [distroConfig, setDistroConfig] = useState<DistroConfig>(INITIAL_DISTRO_CONFIG);
  const [isLoading, setIsLoading] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{name: string, content: string} | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [linkState, setLinkState] = useState<LinkState>('online');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  const initializeChat = () => {
    const newChat = ai.chats.create({
        model: 'gemini-2.5-pro',
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    configUpdate: {
                        type: Type.OBJECT,
                        description: "The configuration fields to update."
                    },
                    response: {
                        type: Type.STRING,
                        description: "The natural language response to the user."
                    }
                }
            }
        },
    });
    setChat(newChat);
  };

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    // Automatically update swap size based on RAM.
    const ram = distroConfig.ram;
    if (ram && ram !== 'N/A') {
      const convertToGB = (sizeStr: string): number | null => {
        const match = sizeStr.toLowerCase().match(/([\d.]+)\s*(\w*)/);
        if (!match) return null;
    
        const value = parseFloat(match[1]);
        const unit = match[2];
    
        if (unit.startsWith('g')) { // Handles gb, gib, g
            return unit.includes('i') ? value * 1.073741824 : value;
        }
        if (unit.startsWith('m')) { // Handles mb, mib, m
            const MIB_TO_GB = 1 / 953.674; 
            const MB_TO_GB = 1 / 1000;
            return unit.includes('i') ? value * MIB_TO_GB : value * MB_TO_GB;
        }
        return null;
      };

      const ramInGb = convertToGB(ram);
      if (ramInGb !== null) {
        const swapInGb = Math.ceil(ramInGb + 2);
        const newSwapSize = `${swapInGb}GB`;
        
        setDistroConfig(prevConfig => {
          if (prevConfig.swapSize !== newSwapSize) {
            return { ...prevConfig, swapSize: newSwapSize };
          }
          return prevConfig;
        });
      }
    }
  }, [distroConfig.ram]);

  const createPromptForModel = (input: string, config: DistroConfig, fileContent: string | null, currentLinkState: LinkState): string => {
    let prompt = `AI Link State: ${currentLinkState.toUpperCase()}
Current Configuration:
${JSON.stringify(config, null, 2)}

User Request: "${input}"
`;
    if (fileContent) {
        prompt += `\nAttached Context (e.g., hardware report):\n${fileContent}`;
    }
    return prompt;
  }

  const handleSend = async (command?: string) => {
    const textToSend = command || userInput;
    if (!textToSend.trim() && !attachedFile) return;
    if (!chat) {
        console.error("Chat not initialized");
        return;
    }

    const newUserMessage: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setAttachedFile(null);
    setIsLoading(true);
    
    setMessages(prev => [...prev, { role: 'model', text: '...', linkState: linkState }]);

    try {
        const prompt = createPromptForModel(textToSend, distroConfig, attachedFile?.content ?? null, linkState);

        const response: GenerateContentResponse = await chat.sendMessage({
            message: prompt,
        });
        
        const responseText = response.text;
        const parsedResponse = JSON.parse(responseText);

        const { configUpdate, response: modelText } = parsedResponse;

        if (configUpdate) {
            setDistroConfig(prev => ({ ...prev, ...configUpdate }));
        }

        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: 'model', text: modelText || "I've updated the blueprint based on your request.", linkState };
            return newMessages;
        });

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        const errorMessage = "Sorry, I encountered an error. I might be having trouble connecting to my core services. Please check the console for details and try again.";
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: 'model', text: errorMessage, linkState };
            return newMessages;
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFile({ name: file.name, content: event.target?.result as string });
      };
      reader.readAsText(file);
    }
  };

  const handleSystemScanSubmit = (report: string) => {
    let modelResponseText = "";
    
    setDistroConfig(prevConfig => {
        const microarchMatch = report.match(/CPU_MICROARCH:\s*(.*)/);
        const ramMatch = report.match(/RAM:\s*(.*)/);
        const gpuReportMatch = report.match(/--- GPU Info ---\n([\s\S]*?)\n--- End GPU Info ---/);
        
        let newConfig = { ...prevConfig };

        let primaryKernel = 'linux-cachyos';
        if (microarchMatch && microarchMatch[1]) {
            const microarch = microarchMatch[1].trim();
            if (microarch === 'x86-64-v3' || microarch === 'x86-64-v4') {
                primaryKernel = `linux-cachyos-${microarch}`;
            }
        }
        newConfig.kernels = [primaryKernel, newConfig.kernels[1] || 'linux-lts'];

        const gpuInfo = gpuReportMatch ? gpuReportMatch[1] : '';
        const hasNvidia = /nvidia/i.test(gpuInfo);
        const hasIntel = /intel/i.test(gpuInfo);
        const hasAmdGpu = /amd|ati/i.test(gpuInfo);

        if (hasNvidia && (hasIntel || hasAmdGpu)) {
            newConfig.graphicsMode = 'hybrid';
            newConfig.gpuDriver = 'nvidia-dkms';
            modelResponseText = `I've detected a dual GPU system and configured the blueprint for hybrid graphics. This will install \`optimus-manager\` to let you switch between the power-saving integrated GPU and the high-performance NVIDIA GPU. The primary kernel is also tuned to \`${primaryKernel}\` for your CPU.`;
        } else if (hasNvidia) {
            newConfig.graphicsMode = 'nvidia';
            newConfig.gpuDriver = 'nvidia-dkms';
            modelResponseText = `I see you have an NVIDIA GPU. I've selected the proprietary drivers and set the kernel to \`${primaryKernel}\` for optimal performance.`;
        } else if (hasIntel || hasAmdGpu) {
            newConfig.graphicsMode = 'integrated';
            newConfig.gpuDriver = 'mesa';
            modelResponseText = `I've configured the blueprint for your integrated graphics using Mesa drivers and optimized the kernel as \`${primaryKernel}\`.`;
        }

        newConfig.ram = ramMatch && ramMatch[1] ? ramMatch[1].trim() : 'N/A';
        
        return newConfig;
    });

    setShowScanModal(false);
    
    const userMessage: Message = { role: 'user', text: "Here is my hardware report. Please configure the blueprint for optimal performance on this system." };
    const modelMessage: Message = { role: 'model', text: modelResponseText || "I've analyzed the hardware report and updated the blueprint.", linkState: 'online' };
    
    setMessages(prev => [...prev, userMessage, modelMessage]);
  };
  
  const handleNewBlueprint = () => {
    setDistroConfig(INITIAL_DISTRO_CONFIG);
    setMessages([
        ...INITIAL_MESSAGES,
        { role: 'model', text: "Alright, I've cleared the slate. We're starting fresh with a new blueprint. What's our new mission?", linkState: 'online' }
    ]);
    initializeChat(); // Re-initialize chat for a fresh context
  };

  const toggleLinkState = () => {
    const newLinkState = linkState === 'online' ? 'offline' : 'online';
    setLinkState(newLinkState);
    const stateText = newLinkState === 'online' 
      ? "My connection to the cloud has been restored. I now have access to my full creative and analytical capabilities."
      : "I've switched to my local, on-device core. My responses will be more direct, and my capabilities are limited to essential tasks.";
    
    setMessages(prev => [...prev, { role: 'model', text: stateText, linkState: newLinkState }]);
  };


  return (
    <main className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      {showScanModal && <SystemScanModal onClose={() => setShowScanModal(false)} onSubmit={handleSystemScanSubmit} />}
      {showBuildModal && <BuildModal config={distroConfig} onClose={() => setShowBuildModal(false)} />}
      {showAboutModal && <AboutModal onClose={() => setShowAboutModal(false)} />}
      
      <DistroBlueprintPanel 
        config={distroConfig}
        onPackagesChange={(packages) => setDistroConfig(p => ({ ...p, packages }))}
        onNewBlueprint={handleNewBlueprint}
        onOpenScanModal={() => setShowScanModal(true)}
        onOpenBuildModal={() => setShowBuildModal(true)}
      />

      <div className="flex flex-col flex-1 h-screen">
        <header className="flex items-center justify-between p-4 border-b border-slate-800/50 flex-shrink-0">
          <Logo linkState={linkState} onToggle={toggleLinkState} />
          <button 
            onClick={() => setShowAboutModal(true)} 
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
            title="About Chirpy OS"
          >
            <InformationCircleIcon className="w-5 h-5" />
            <span>About</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
             <div ref={chatEndRef} />
        </div>

        <div className="p-4 w-full max-w-4xl mx-auto flex-shrink-0">
          {messages.length <= 1 && <CommandSuggestions suggestions={COMMAND_SUGGESTIONS} onSelect={handleSend} />}
          
          <div className="relative mt-4">
             {attachedFile && (
                <FileAttachment 
                    fileName={attachedFile.name} 
                    onRemove={() => setAttachedFile(null)} 
                />
            )}
            <div className="flex items-end gap-2 bg-slate-800/80 border border-slate-700 rounded-lg p-2.5 transition-all focus-within:ring-2 focus-within:ring-yellow-500">
                <label htmlFor="file-upload" className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
                    <AttachmentIcon className="w-6 h-6" />
                    <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".txt,.log,.sh" />
                </label>
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Describe your ideal OS, or attach a hardware report..."
                    className="flex-1 bg-transparent resize-none focus:outline-none placeholder:text-slate-500 max-h-48"
                    disabled={isLoading}
                />
                <button 
                    onClick={() => handleSend()} 
                    disabled={isLoading || (!userInput.trim() && !attachedFile)}
                    className="p-2 bg-yellow-500 rounded-lg text-slate-900 hover:bg-yellow-400 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    <SendIcon className="w-6 h-6" />
                </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
