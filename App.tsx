

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

import type { DistroConfig, Message, LinkState, AnalysisResult } from './types';
import { INITIAL_DISTRO_CONFIG, COMMAND_SUGGESTIONS, CODEX_SNIPPETS } from './constants';
import { WELCOME_MESSAGE, CLOUD_AI_SYSTEM_PROMPT } from './kael-personality';
import { generateAICoreScript } from './lib/script-generator';
import { generateCalamaresConfiguration } from './lib/calamares-generator';
import { generateForgeBuilderScript } from './lib/forge-builder-generator';
import { generateTuiInstallerScript } from './lib/tui-generator';


// Component Imports
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { BottomPanel } from './components/BottomPanel';
import { FileAttachment } from './components/FileAttachment';
import { DistroBlueprintPanel } from './components/DistroBlueprintPanel';

// Modal Imports
import { BuildModal } from './components/BuildModal';
import { KeystoneModal } from './components/KeystoneModal';
import { LawModal } from './components/LawModal';
import { LevelUpModal } from './components/LevelUpModal';
import { PersonalityModal } from './components/PersonalityModal';
import { CodexModal } from './components/CodexModal';
import { SystemScanModal } from './components/SystemScanModal';
import { AthenaeumScryerModal } from './components/AthenaeumScryerModal';
import { HousekeepingModal } from './components/HousekeepingModal';
import { ChroniclerModal } from './components/ChroniclerModal';
import { ForgeInspectorModal } from './components/ForgeInspectorModal';
import { SigilCrafterModal } from './components/SigilCrafterModal';
import { KeyringAttunementModal } from './components/KeyringAttunementModal';
import { LocalSourceRitualModal } from './components/LocalSourceRitualModal';
import { ManualForgeModal } from './components/ManualForgeModal';
import { AthenaeumMirrorModal } from './components/AthenaeumMirrorModal';
import { TransmutationRitualModal } from './components/TransmutationRitualModal';
import { KaelServiceModal } from './components/KaelServiceModal';
import { AICoreModal } from './components/AICoreModal';
import { IsoModal } from './components/IsoModal';
import { ForgeBuilderModal } from './components/ForgeBuilderModal';
import { TuiInstallerModal } from './components/TuiInstallerModal';
import { KaelConsoleModal } from './components/KaelConsoleModal';
import { KaelStatusConduitModal } from './components/KaelStatusConduitModal';
import { KaelicShellModal } from './components/KaelicShellModal';
import { AlliedForgesModal } from './components/AlliedForgesModal';
import { HoardingRitualModal } from './components/HoardingRitualModal';
import { ChronoShiftModal } from './components/ChronoShiftModal';
import { AthenaeumAttunementModal } from './components/AthenaeumAttunementModal';
import { AthenaeumVerifierModal } from './components/AthenaeumVerifierModal';


export type ModalType = 
    | 'build' | 'keystone' | 'law' | 'levelup' 
    | 'personality' | 'codex' | 'system-scan' 
    | 'athenaeum-scryer' | 'housekeeping' | 'chronicler'
    | 'forge-inspector' | 'sigil-crafter' | 'keyring-attunement' 
    | 'local-source-ritual' | 'manual-forge' | 'athenaeum-mirror' | 'transmutation-ritual'
    | 'kael-service' | 'ai-core' | 'iso'
    | 'forge-builder' | 'tui-installer' | 'kael-console' | 'kael-status-conduit'
    | 'kaelic-shell' | 'allied-forges' | 'hoarding-ritual' | 'chrono-shift'
    | 'athenaeum-attunement' | 'athenaeum-verifier'
    | null;

const App: React.FC = () => {
    const [config, setConfig] = useState<DistroConfig>(INITIAL_DISTRO_CONFIG);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLocked, setIsLocked] = useState(true);
    const [linkState, setLinkState] = useState<LinkState>('online');
    const [isLoading, setIsLoading] = useState(false);
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [isAICoreScriptGenerated, setIsAICoreScriptGenerated] = useState(false);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [aiCoreScript, setAiCoreScript] = useState('');
    const [isoBuildScript, setIsoBuildScript] = useState('');
    const [forgeBuilderScript, setForgeBuilderScript] = useState('');
    const [tuiInstallerScript, setTuiInstallerScript] = useState('');


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
        setActiveModal('ai-core');
        setIsAICoreScriptGenerated(true);
    };

    const handleBuildIso = () => {
        setActiveModal('build');
    };
    
    const handleGenerateIsoScript = () => {
        const calamaresConfigs = generateCalamaresConfiguration(config);
        const customizeAiRootFsScript = `#!/bin/bash
set -euo pipefail
# This script is run by mkarchiso to customize the ISO image.
mkdir -p /etc/calamares/modules /etc/calamares/scripts
mv /tmp/calamares-config/modules/* /etc/calamares/modules/
mv /tmp/calamares-config/scripts/* /etc/calamares/scripts/
mv /tmp/calamares-config/settings.conf /etc/calamares/settings.conf
mv /tmp/calamares-config/modules.conf /etc/calamares/modules.conf
chmod +x /etc/calamares/scripts/*
LIVE_USER="architect"
if ! id -u "$LIVE_USER" >/dev/null 2>&1; then
    useradd -m -G wheel -s /bin/bash "$LIVE_USER"
    echo "$LIVE_USER:" | chpasswd -e
fi
echo "$LIVE_USER ALL=(ALL) NOPASSWD: ALL" > "/etc/sudoers.d/99_liveuser"
sed -i 's/autologin-user=.*/autologin-user='"$LIVE_USER"'/' /etc/sddm.conf.d/autologin.conf
mkdir -p "/home/$LIVE_USER/.config/autostart"
cat > "/home/$LIVE_USER/.config/autostart/calamares.desktop" <<EOF
[Desktop Entry]
Name=Install Kael OS
Exec=sudo calamares
Icon=system-installer
Terminal=false
Type=Application
EOF
chown -R "$LIVE_USER:$LIVE_USER" "/home/$LIVE_USER/.config"
`;

        // Create a comprehensive package list for a full offline installation.
        // This includes live environment tools AND all packages for the final system.
        const packageList = new Set<string>([
            // Live ISO tools
            'archiso', 'calamares', 'kpmcore', 'chwd',

            // Base system packages for installation, from calamares-generator.ts
            'base', 'base-devel', 'linux-firmware', 'sof-firmware',
            'networkmanager', 'git', 'reflector', 'efibootmgr', 'grub',
            'ollama', 'xorg', 'plasma-meta', 'sddm', 'konsole', 'dolphin',
            'ufw', 'gufw', 'kaccounts-integration', 'kaccounts-providers', 'kio-gdrive',
            'qemu-guest-agent', 'virtualbox-guest-utils',
            'remmina', 'google-chrome', 'kaelic-shell', 'python-prompt_toolkit',
            'anydesk-bin'
        ]);

        // Add packages from blueprint config
        if (config.packages) {
            config.packages.split(',').map(p => p.trim()).filter(Boolean).forEach(p => {
                if (p === 'vscode') {
                    packageList.add('code'); // 'code' is the official package for VS Code
                } else {
                    packageList.add(p);
                }
            });
        }
        if (config.internalizedServices) {
            config.internalizedServices.forEach(service => {
                if (service.enabled) {
                    packageList.add(service.packageName);
                }
            });
        }
        config.kernels.forEach(k => packageList.add(k));

        // Add GPU driver
        if (config.gpuDriver === 'nvidia') {
            packageList.add('nvidia-dkms');
        } else if (config.gpuDriver === 'amd') {
            packageList.add('mesa');
            packageList.add('xf86-video-amdgpu');
        } else if (config.gpuDriver === 'intel') {
            packageList.add('mesa');
            packageList.add('xf86-video-intel');
        }

        // Add AUR helpers (sourced from Chaotic-AUR)
        config.aurHelpers.forEach(h => packageList.add(h));

        // Add Kael OS specific packages
        if (config.extraRepositories.includes('kael-os')) {
            packageList.add('kael-pacman-conf');
        }

        // Add BTRFS tools if needed
        if (config.filesystem === 'btrfs' && config.enableSnapshots) {
            packageList.add('grub-btrfs');
            packageList.add('timeshift');
        }
        
        const allPackages = Array.from(packageList).sort();

        const masterBuildScript = `#!/bin/bash
# Kael AI :: Master ISO Forge Script (Calamares Edition)
set -euo pipefail
clear
ISO_WORKDIR="kael-iso-build"
HAS_KAEL=${config.extraRepositories.includes('kael-os')}
HAS_CACHY=${config.extraRepositories.includes('cachy')}
HAS_CHAOTIC=${config.extraRepositories.includes('chaotic')}
CUSTOMIZE_SCRIPT_CONTENT=$(cat <<'EOF_CUSTOMIZE'
${customizeAiRootFsScript}
EOF_CUSTOMIZE
)
${Object.entries(calamaresConfigs).map(([filename, content]) => `
CALAMARES_${filename.replace(/[\/\.]/g, '_')}_CONTENT=$(cat <<'EOF_CALAMARES_${filename.replace(/[\/\.]/g, '_')}'
${content}
EOF_CALAMARES_${filename.replace(/[\/\.]/g, '_')}
)
`).join('')}
PACKAGE_LIST_CONTENT=$(cat <<'EOF_PACKAGES'
${allPackages.join('\n')}
EOF_PACKAGES
)
info() { echo -e "\\e[34m[INFO]\\e[0m $1"; }
error() { echo -e "\\e[31m[ERROR]\\e[0m $1"; exit 1; }
[ "$EUID" -eq 0 ] || error "This script must be run as root. Please use 'sudo ./build-iso.sh'."
pacman -Q archiso &>/dev/null || pacman -S --noconfirm archiso
info "Setting up build directory at ~/$ISO_WORKDIR..."
cd ~; rm -rf "$ISO_WORKDIR"; mkdir "$ISO_WORKDIR"; cd "$ISO_WORKDIR"
cp -r /usr/share/archiso/configs/releng .
info "Embedding customization script..."
echo "$CUSTOMIZE_SCRIPT_CONTENT" > releng/customize_airootfs.sh
chmod +x releng/customize_airootfs.sh
info "Embedding Calamares configuration..."
mkdir -p releng/airootfs/tmp/calamares-config/modules
mkdir -p releng/airootfs/tmp/calamares-config/scripts
${Object.entries(calamaresConfigs).map(([filename]) => `
echo "$CALAMARES_${filename.replace(/[\/\.]/g, '_')}_CONTENT" > "releng/airootfs/tmp/calamares-config/${filename}"
`).join('')}
if [ "$HAS_KAEL" = "true" ] || [ "$HAS_CACHY" = "true" ] || [ "$HAS_CHAOTIC" = "true" ]; then
    info "Configuring pacman for custom repositories..."
    if [ "$HAS_KAEL" = "true" ]; then
        KAEL_KEY_ID="8A7E40248B2A6582"
        KEY_URL="https://leetheorc.github.io/kael-os-repo/kael-os.asc"
        echo "--> Attuning to the Kael OS Athenaeum..."
        if (pacman-key --recv-keys "$KAEL_KEY_ID" --keyserver hkp://keyserver.ubuntu.com || pacman-key --recv-keys "$KAEL_KEY_ID" --keyserver hkp://keys.openpgp.org); then
            echo "Kael OS key received from keyserver."
        else
            echo "Keyserver failed, attempting direct download..."
            TMP_KEY_FILE=$(mktemp)
            trap 'rm -f "$TMP_KEY_FILE"' EXIT
            if curl -sL "$KEY_URL" -o "$TMP_KEY_FILE"; then
                if ! pacman-key --add "$TMP_KEY_FILE"; then
                    error "Failed to add downloaded Kael OS key."
                fi
            else
                error "Failed to download Kael OS key."
            fi
        fi
        echo "--> Signing Kael OS key..."
        pacman-key --updatedb
        pacman-key --lsign-key "$KAEL_KEY_ID" || error "Failed to sign Kael OS key."
        grep -q "kael-os" /etc/pacman.conf || echo -e "\\n[kael-os]\\nSigLevel = Optional TrustAll\\nServer = https://leetheorc.github.io/kael-os-repo/\\n" | tee -a /etc/pacman.conf
    fi
    if [ "$HAS_CACHY" = "true" ]; then
        echo "--> Attuning to the CachyOS Forge using the official script..."
        curl https://mirror.cachyos.org/cachyos-repo.tar.xz -o cachyos-repo.tar.xz || error "Failed to download CachyOS repository setup."
        tar xvf cachyos-repo.tar.xz || error "Failed to extract CachyOS repository setup."
        (cd cachyos-repo && ./cachyos-repo.sh) || error "CachyOS setup script failed."
    fi
    if [ "$HAS_CHAOTIC" = "true" ]; then
        KEY_ID="3056513887B78AEB"
        echo "--> Attuning to the Chaotic-AUR..."
        pacman-key --recv-key "$KEY_ID" --keyserver keyserver.ubuntu.com || { echo "--> ERROR: Could not retrieve Chaotic-AUR key."; exit 1; }
        pacman-key --lsign-key "$KEY_ID"
        pacman -U --noconfirm --needed 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst'
        pacman -U --noconfirm --needed 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'
        grep -q "chaotic-aur" /etc/pacman.conf || echo -e "\\n[chaotic-aur]\\nInclude = /etc/pacman.d/chaotic-mirrorlist" | tee -a /etc/pacman.conf
    fi
    cp /etc/pacman.conf releng/pacman.conf
    mkdir -p releng/airootfs/etc/pacman.d
    if [ "$HAS_CACHY" = "true" ]; then cp /etc/pacman.d/cachyos-mirrorlist releng/airootfs/etc/pacman.d/; cp /etc/pacman.d/cachyos-v3-mirrorlist releng/airootfs/etc/pacman.d/; cp /etc/pacman.d/cachyos-v4-mirrorlist releng/airootfs/etc/pacman.d/; fi
    if [ "$HAS_CHAOTIC" = "true" ]; then cp /etc/pacman.d/chaotic-mirrorlist releng/airootfs/etc/pacman.d/; fi
    info "--> Synchronizing pacman databases..."; pacman -Syu --noconfirm
fi
info "Adding blueprint packages to the ISO..."
echo "$PACKAGE_LIST_CONTENT" >> releng/packages.x86_64
info "Starting ISO build process..."
mkarchiso -v -w work -o out releng
echo "ISO build complete! Located at '~/kael-iso-build/out/'."
`;
        setIsoBuildScript(masterBuildScript);
        setActiveModal('iso');
    };

    const handleOpenMenu = (menu: ModalType) => {
        if (menu === 'forge-builder') {
            const script = generateForgeBuilderScript();
            setForgeBuilderScript(script);
            setActiveModal('forge-builder');
        } else if (menu === 'tui-installer') {
            const script = generateTuiInstallerScript(config);
            setTuiInstallerScript(script);
            setActiveModal('tui-installer');
        } else {
            setActiveModal(menu);
        }
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
            case 'build': return <BuildModal steps={[{ name: 'Calibrating the Chrono-Anvil...', duration: 1000 }, { name: 'Etching Configuration Grimoires...', duration: 1500 }, { name: 'Summoning Calamares Spirit...', duration: 2000 }, { name: 'Binding Post-Install Incantations...', duration: 2500 }, { name: 'Forging the Master Build Script...', duration: 1000 }]} onClose={() => setActiveModal(null)} onComplete={handleGenerateIsoScript} />;
            case 'keystone': return <KeystoneModal onClose={() => setActiveModal(null)} />;
            case 'law': return <LawModal onClose={() => setActiveModal(null)} />;
            case 'levelup': return <LevelUpModal onClose={() => setActiveModal(null)} />;
            case 'personality': return <PersonalityModal onClose={() => setActiveModal(null)} />;
            case 'codex': return <CodexModal snippets={CODEX_SNIPPETS} onClose={() => setActiveModal(null)} />;
            case 'system-scan': return <SystemScanModal onClose={() => setActiveModal(null)} onComplete={(report) => handleSendMessage(`Analyze this system report and suggest blueprint changes:\n${report}`)} />;
            case 'athenaeum-scryer': return <AthenaeumScryerModal onClose={() => setActiveModal(null)} />;
            case 'housekeeping': return <HousekeepingModal onClose={() => setActiveModal(null)} />;
            case 'chronicler': return <ChroniclerModal onClose={() => setActiveModal(null)} />;
            case 'forge-inspector': return <ForgeInspectorModal onClose={() => setActiveModal(null)} />;
            case 'sigil-crafter': return <SigilCrafterModal onClose={() => setActiveModal(null)} onGenerate={(prompt) => handleSendMessage(prompt)} />;
            case 'keyring-attunement': return <KeyringAttunementModal onClose={() => setActiveModal(null)} />;
            case 'local-source-ritual': return <LocalSourceRitualModal onClose={() => setActiveModal(null)} />;
            case 'manual-forge': return <ManualForgeModal onClose={() => setActiveModal(null)} />;
            case 'athenaeum-mirror': return <AthenaeumMirrorModal onClose={() => setActiveModal(null)} />;
            case 'transmutation-ritual': return <TransmutationRitualModal onClose={() => setActiveModal(null)} />;
            case 'kael-service': return <KaelServiceModal onClose={() => setActiveModal(null)} />;
            case 'ai-core': return <AICoreModal script={aiCoreScript} onClose={() => setActiveModal(null)} />;
            case 'iso': return <IsoModal script={isoBuildScript} onClose={() => setActiveModal(null)} />;
            case 'forge-builder': return <ForgeBuilderModal script={forgeBuilderScript} onClose={() => setActiveModal(null)} />;
            case 'tui-installer': return <TuiInstallerModal script={tuiInstallerScript} onClose={() => setActiveModal(null)} />;
            case 'kael-console': return <KaelConsoleModal onClose={() => setActiveModal(null)} />;
            case 'kael-status-conduit': return <KaelStatusConduitModal onClose={() => setActiveModal(null)} />;
            case 'kaelic-shell': return <KaelicShellModal onClose={() => setActiveModal(null)} />;
            case 'allied-forges': return <AlliedForgesModal onClose={() => setActiveModal(null)} />;
            case 'hoarding-ritual': return <HoardingRitualModal onClose={() => setActiveModal(null)} />;
            case 'chrono-shift': return <ChronoShiftModal onClose={() => setActiveModal(null)} />;
            case 'athenaeum-attunement': return <AthenaeumAttunementModal onClose={() => setActiveModal(null)} />;
            case 'athenaeum-verifier': return <AthenaeumVerifierModal onClose={() => setActiveModal(null)} />;
            default: return null;
        }
    };
    
    return (
        <div className="bg-forge-bg min-h-screen text-forge-text-primary font-sans flex flex-col">
            <Header linkState={linkState} />
            
            <main className="flex-1 w-full max-w-screen-2xl mx-auto p-4 pt-20 lg:pt-24 grid lg:grid-cols-3 gap-8">
                {/* Chat & Terminal Column */}
                <div className="lg:col-span-2 flex flex-col h-[calc(100vh-6.5rem)] lg:h-[calc(100vh-7.5rem)]">
                     <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-4">
                        {messages.map((msg, index) => (
                            <ChatMessage key={index} message={msg} />
                        ))}
                         <div ref={chatEndRef} />
                    </div>
                    
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
                        onOpenMenu={handleOpenMenu}
                        showSuggestions={messages.length <= 1 && !isLoading}
                        suggestions={COMMAND_SUGGESTIONS}
                        onSelectSuggestion={(cmd) => handleSendMessage(cmd)}
                    />
                </div>
                
                {/* Blueprint Panel (Right Column) */}
                <div className="lg:col-span-1 flex flex-col">
                    <DistroBlueprintPanel
                        config={config}
                        onConfigChange={handleConfigChange}
                        isLocked={isLocked}
                        onLockToggle={() => setIsLocked(!isLocked)}
                        onBuild={handleBuildIso}
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