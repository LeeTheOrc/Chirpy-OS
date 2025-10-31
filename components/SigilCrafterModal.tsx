import React, { useState } from 'react';
import { CloseIcon, SparklesIcon } from './Icons';

interface SigilCrafterModalProps {
  onClose: () => void;
  onGenerate: (prompt: string) => void;
}

export const SigilCrafterModal: React.FC<SigilCrafterModalProps> = ({ onClose, onGenerate }) => {
    const [prompt, setPrompt] = useState('A majestic dragon sigil, forged from circuits and code, glowing with neon blue energy, minimalist logo.');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateClick = () => {
        setIsLoading(true);
        // The onGenerate prop will call the main app's handleSendMessage function.
        // We prepend a specific instruction to the user's prompt.
        const fullPrompt = `Generate an image based on the following description. This image will be a logo or "sigil" for a custom operating system. Description: ${prompt}`;
        onGenerate(fullPrompt);
        // In a real scenario, you might wait for the response and display the image here.
        // For this mock, we'll just close the modal after sending the request.
        setTimeout(() => {
            setIsLoading(false);
            onClose();
        }, 1000); 
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <SparklesIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Sigil Crafter</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, every great Realm needs its own sigil—a symbol of its power and identity. Here, we can channel my cloud animus to forge a unique visual artifact for our creation.
                    </p>
                    <p className="text-xs italic text-forge-text-secondary/80">
                        This feature is experimental and leverages advanced image generation capabilities. The results will appear in our chat log.
                    </p>

                    <div>
                        <label htmlFor="sigil-prompt" className="block text-sm font-medium text-forge-text-secondary mb-2">
                            Incantation (Image Prompt)
                        </label>
                        <textarea
                            id="sigil-prompt"
                            rows={3}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full bg-forge-bg border border-forge-border rounded-lg p-2 text-sm text-forge-text-primary focus:ring-1 focus:ring-dragon-fire transition-colors"
                            placeholder="Describe the sigil you envision..."
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleGenerateClick}
                            disabled={isLoading || !prompt.trim()}
                            className="bg-magic-purple hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Forging...
                                </>
                            ) : (
                                <>
                                <SparklesIcon className="w-5 h-5" />
                                Forge Sigil
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
