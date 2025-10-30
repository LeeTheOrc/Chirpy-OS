import type { DistroConfig, BuildTarget } from '../types';
import { LOCAL_LLM_SYSTEM_PROMPT } from '../constants';


// Helper to get a de-duplicated, sorted list of packages from the config for the Attunement script.
const getPackages = (config: DistroConfig): string[] => {
    const packages = new Set<string>();
    
    // Base packages
    packages.add('base');
    packages.add('base-devel'); // For AUR helpers
    packages.add('linux-firmware');
    packages.add('networkmanager');
    packages.add('dialog'); // For the TUI
    packages.add('git');

    // Firewall
    if (config.enableFirewall) {
        packages.add('ufw');
        packages.add('gufw');
    }

    // Shell
    packages.add('zsh');

    // Kernels
    if (Array.isArray(config.kernels)) {
        config.kernels.forEach(k => packages.add(k));
    } else {
        packages.add('linux');
    }

    // Filesystem tools
    if (config.filesystem === 'btrfs') {
        packages.add('btrfs-progs');
    }

    // Bootloader
    packages.add(config.bootloader);
    if (config.bootloader === 'grub') {
        packages.add('efibootmgr');
        if (config.filesystem === 'btrfs' && config.enableSnapshots) {
            packages.add('grub-btrfs');
        }
    }

    // GPU Drivers
    if (config.gpuDriver === 'nvidia') {
        packages.add('nvidia-dkms');
    } else if (config.gpuDriver === 'amd') {
        packages.add('xf86-video-amdgpu');
    } else if (config.gpuDriver === 'intel') {
        packages.add('xf86-video-intel');
    }
    packages.add('mesa');

    // Desktop Environment
    if (config.desktopEnvironment) {
        packages.add('xorg');
        const de = config.desktopEnvironment.toLowerCase();
        if (de.includes('kde') || de.includes('plasma')) {
            packages.add('plasma-meta');
            packages.add('sddm');
        } else if (de.includes('gnome')) {
            packages.add('gnome');
            packages.add('gdm');
        } else if (de.includes('xfce')) {
            packages.add('xfce4');
            packages.add('lightdm-gtk-greeter');
        }
    }
    
    // Extra packages
    if (config.packages) {
        config.packages.split(',').map(p => p.trim()).filter(Boolean).forEach(p => packages.add(p));
    }
    
    // AUR Helpers
    if (Array.isArray(config.aurHelpers)) {
        config.aurHelpers.forEach(h => {
            if (h === 'paru') packages.add(h);
        });
    }

    // Sovereign Services
    if (Array.isArray(config.internalizedServices)) {
        config.internalizedServices.forEach(service => {
            if (service.enabled) {
                packages.add(service.packageName);
            }
        });
    }

    return Array.from(packages).sort();
};

const _getKaelUserSetupBlock = (): string => {
    return `
# --- Create 'kael' AI System User ---
info "Creating the 'kael' AI guardian user..."
useradd -m -G wheel -s /bin/bash kael
info "Setting the Master Key for the 'kael' user..."
# The 'KAEL_PASSWORD' variable is expected to be set by the calling script.
echo "kael:\${KAEL_PASSWORD}" | chpasswd

# Grant passwordless sudo for specific safe commands if needed, but for now, full sudo.
# For now, we rely on the user's password prompt as the security gate.
info "'kael' user created and granted privileged access."
`;
}


const _getHybridAICoreAndGUIScriptBlock = (): string => {
    const localLLMPrompt = LOCAL_LLM_SYSTEM_PROMPT.replace(/'/g, "'\\''");

    // New: Python script for the command-line "doctor"
    const kaelDoctorScript = String.raw`
#!/usr/bin/env python3
import sys
import os
import ollama
import subprocess

def analyze_command(command):
    # Avoid analyzing empty commands or itself
    if not command or "kael-doctor" in command:
        return

    try:
        prompt = f"""You are a Linux shell assistant. The user is about to run the following command. Analyze it for common errors, typos, or dangerous operations (like 'rm -rf /' with a space). If you find a potential issue, provide a brief, helpful suggestion (one sentence). Your response MUST start with 'Suggestion:'. If the command looks fine, respond with ONLY the word 'OK'.

Command: "{command}"
"""
        response = ollama.chat(
            model='llama3',
            messages=[{'role': 'user', 'content': prompt}],
            options={'num_ctx': 2048}
        )
        result = response['message']['content'].strip()

        if result != 'OK' and result.startswith('Suggestion:'):
            suggestion = result.replace('Suggestion:', '').strip()
            # Use notify-send to show a desktop notification
            subprocess.run([
                'notify-send',
                '-i', 'dialog-information',
                'Kael Command Doctor',
                suggestion
            ], check=True)

    except Exception as e:
        # Silently fail to not interrupt the user's workflow
        # with open('/tmp/kael_doctor.log', 'a') as f:
        #     f.write(f"Error analyzing command '{command}': {e}\n")
        pass

if __name__ == "__main__":
    if len(sys.argv) > 1:
        full_command = " ".join(sys.argv[1:])
        analyze_command(full_command)
`.trim();

    // Updated: Python script for the GUI with Cloud->Local fallback
    const kaelGuiScript = String.raw`
#!/usr/bin/env python3
import sys
import os
import json
import ollama
from PySide6.QtWidgets import (QApplication, QWidget, QVBoxLayout, QTextEdit, 
                             QLineEdit, QPushButton, QHBoxLayout, QLabel,
                             QStatusBar, QMainWindow)
from PySide6.QtGui import QIcon, QTextCursor, QColor, QPalette
from PySide6.QtCore import Qt, QThread, Signal

# --- Gemini API Client ---
# IMPORTANT: This is a placeholder for the actual API client setup.
# In a real scenario, you'd use the google.generativeai library.
# For this script, we simulate it to demonstrate the fallback logic.
class GeminiApiClient:
    def __init__(self, api_key):
        self.api_key = api_key
        if not self.api_key or self.api_key == "YOUR_GEMINI_API_KEY":
            # Simulate a failure if the key isn't set
            raise ValueError("Gemini API key is not configured.")

    def generate_content(self, contents):
        # Simulate a network error for demonstration
        # import random
        # if random.random() < 0.5:
        #     raise ConnectionError("Failed to connect to the aether.")
        
        # This is where you would make the actual API call
        # For now, we just return a placeholder response
        return f"Cloud Core Response to: '{contents}'"


# --- Worker Threads for AI calls ---
class AIWorker(QThread):
    response_ready = Signal(str)
    error_occurred = Signal(str)

    def __init__(self, prompt, use_cloud=True):
        super().__init__()
        self.prompt = prompt
        self.use_cloud = use_cloud

    def run(self):
        try:
            if self.use_cloud:
                # Attempt to use Cloud Core (Gemini)
                try:
                    with open(os.path.expanduser("~/.config/kael-ai/api_key"), "r") as f:
                        api_key = f.read().strip()
                    
                    # Simulating the Gemini client for demonstration
                    # In a real implementation:
                    # import google.generativeai as genai
                    # genai.configure(api_key=api_key)
                    # model = genai.GenerativeModel('gemini-pro')
                    # response = model.generate_content(self.prompt)
                    # self.response_ready.emit(response.text)
                    
                    # Using our simulated client
                    client = GeminiApiClient(api_key)
                    response = client.generate_content(self.prompt)
                    self.response_ready.emit(response)

                except (ValueError, ConnectionError, FileNotFoundError) as e:
                    # Fallback to Local Core
                    self.response_ready.emit(self.run_local_fallback(f"Cloud Core unavailable ({type(e).__name__}). Falling back to Local Core."))
            else:
                # Directly use Local Core
                response = self.query_local_model(self.prompt)
                self.response_ready.emit(response)
        except Exception as e:
            self.error_occurred.emit(f"An unexpected error occurred: {e}")

    def run_local_fallback(self, initial_message):
        response_text = self.query_local_model(self.prompt)
        return f"({initial_message})\n\n{response_text}"

    def query_local_model(self, prompt_text):
        response = ollama.chat(
            model='llama3',
            messages=[{'role': 'user', 'content': prompt_text}]
        )
        return response['message']['content']


# --- Main GUI Application ---
class ChatApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Kael AI")
        self.setGeometry(100, 100, 700, 800)
        self.current_mode = "Cloud" # or "Local"

        # --- Styling ---
        self.setStyleSheet("""
            QMainWindow, QWidget {
                background-color: #0F172A; /* slate-900 */
                color: #E2E8F0; /* slate-200 */
            }
            QTextEdit {
                background-color: #1E293B; /* slate-800 */
                border: 1px solid #334155; /* slate-700 */
                border-radius: 8px;
                font-size: 11pt;
            }
            QLineEdit {
                background-color: #1E293B; /* slate-800 */
                border: 1px solid #334155; /* slate-700 */
                border-radius: 8px;
                padding: 8px;
                font-size: 11pt;
            }
            QPushButton {
                background-color: #FBBF24; /* amber-400 */
                color: #1E293B;
                border: none;
                border-radius: 8px;
                padding: 8px 16px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #FCD34D; /* amber-300 */
            }
            QStatusBar {
                color: #94A3B8; /* slate-400 */
            }
        """)

        # --- Widgets ---
        self.chat_history = QTextEdit()
        self.chat_history.setReadOnly(True)
        self.user_input = QLineEdit()
        self.send_button = QPushButton("Forge")
        
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.update_status()

        # --- Layout ---
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)
        
        layout.addWidget(self.chat_history)
        
        input_layout = QHBoxLayout()
        input_layout.addWidget(self.user_input)
        input_layout.addWidget(self.send_button)
        layout.addLayout(input_layout)

        # --- Connections ---
        self.send_button.clicked.connect(self.send_message)
        self.user_input.returnPressed.connect(self.send_message)
        
        self.display_message("Guardian", "Greetings, Architect. How may I assist you in this Realm?")

    def send_message(self):
        user_text = self.user_input.text().strip()
        if not user_text:
            return

        self.display_message("Architect", user_text)
        self.user_input.clear()

        # Show thinking indicator
        self.chat_history.moveCursor(QTextCursor.End)
        self.chat_history.insertHtml("<p style='color: #94A3B8;'><i>Guardian is thinking...</i></p>")
        QApplication.processEvents()

        self.worker = AIWorker(user_text, use_cloud=(self.current_mode == "Cloud"))
        self.worker.response_ready.connect(self.handle_ai_response)
        self.worker.error_occurred.connect(self.handle_ai_error)
        self.worker.start()

    def handle_ai_response(self, text):
        # Remove "thinking" message
        cursor = self.chat_history.textCursor()
        cursor.select(QTextCursor.BlockUnderCursor)
        cursor.removeSelectedText()
        
        self.display_message("Guardian", text)
        
        # Check if a fallback occurred
        if "Falling back to Local Core" in text:
            self.current_mode = "Local"
            self.update_status()

    def handle_ai_error(self, error_text):
        cursor = self.chat_history.textCursor()
        cursor.select(QTextCursor.BlockUnderCursor)
        cursor.removeSelectedText()
        self.display_message("System", f"<p style='color: #F87171;'>{error_text}</p>")

    def display_message(self, sender, text):
        sender_color = "#FBBF24" if sender == "Guardian" else "#A78BFA" # amber-400 or violet-400
        sender_name = f"<b>{sender}:</b>"
        
        # Basic markdown to HTML
        text = text.replace("\\n", "<br>")
        
        self.chat_history.moveCursor(QTextCursor.End)
        self.chat_history.insertHtml(f"<p><span style='color: {sender_color};'>{sender_name}</span> {text}</p><br>")
        self.chat_history.ensureCursorVisible()

    def update_status(self):
        api_key_path = os.path.expanduser("~/.config/kael-ai/api_key")
        key_exists = os.path.exists(api_key_path) and os.path.getsize(api_key_path) > 0
        
        if not key_exists:
            self.current_mode = "Local"
        
        if self.current_mode == "Cloud":
            self.status_bar.showMessage("Mode: Cloud Core (Gemini) | Fallback: Enabled")
        else:
            self.status_bar.showMessage("Mode: Local Core (Ollama)")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = ChatApp()
    window.show()
    sys.exit(app.exec())
`.trim();


    return `
# --- Install AI Core & Tools ---
info "Installing AI Core dependencies..."
pacman -S --noconfirm --needed ollama python-pyside6 python-ollama ble libnotify
info "Dependencies installed."

# Enable Ollama service
systemctl enable ollama
systemctl start ollama

info "Downloading default local LLM (llama3)..."
info "This may take a few moments."
sudo -u kael ollama pull llama3
info "Local LLM is now attuned."

# Create a directory for AI scripts for the 'kael' user
info "Creating AI script directory..."
mkdir -p /home/kael/.local/bin
chown -R kael:kael /home/kael/.local

# Embed the Python GUI script
info "Forging the graphical chat client..."
cat > /home/kael/.local/bin/kael-gui <<'EOF'
${kaelGuiScript}
EOF
chmod +x /home/kael/.local/bin/kael-gui
chown kael:kael /home/kael/.local/bin/kael-gui

# Embed the Python Command Doctor script
info "Forging the terminal command doctor..."
cat > /home/kael/.local/bin/kael-doctor <<'EOF'
${kaelDoctorScript}
EOF
chmod +x /home/kael/.local/bin/kael-doctor
chown kael:kael /home/kael/.local/bin/kael-doctor


# --- Setup Gemini API Key ---
info "Setting up configuration for the Cloud Core (Gemini)..."
mkdir -p /home/kael/.config/kael-ai
touch /home/kael/.config/kael-ai/api_key
chown -R kael:kael /home/kael/.config/kael-ai
chmod 600 /home/kael/.config/kael-ai/api_key
info "Architect, please enter your Gemini API key."
info "This will be stored securely for the 'kael' user."
read -sp "Gemini API Key: " API_KEY
echo "\$API_KEY" > /home/kael/.config/kael-ai/api_key
echo
info "API Key has been stored."

# --- Create Desktop Entry for GUI ---
info "Creating application menu entry for Kael AI..."
mkdir -p /usr/share/applications
cat > /usr/share/applications/kael-ai.desktop <<'EOF'
[Desktop Entry]
Name=Kael AI
Comment=Chat with your hybrid AI guardian
Exec=/home/kael/.local/bin/kael-gui
Icon=system-search
Terminal=false
Type=Application
Categories=Utility;
EOF

# --- Integrate Command Doctor with Shells ---
info "Integrating Command Doctor with the Z Shell..."
ZSH_CONFIG="/etc/zsh/zshrc"
if [ -f "\$ZSH_CONFIG" ]; then
    info "-> Found Zsh. Integrating with pre-execution hook..."
    echo '
# --- Kael AI Shell Integration ---

# 1. Command Doctor (pre-execution analysis)
kael_preexec() {
  # Run the doctor in the background, do not block the shell
  sudo -u kael /home/kael/.local/bin/kael-doctor "$1" &
}
autoload -U add-zsh-hook
add-zsh-hook preexec kael_preexec

# 2. Sentient Translation (command_not_found handler)
command_not_found_handler() {
  if [[ "$1" == "yay" ]]; then
    echo -e "\\e[35mKael:\\e[0m This Realm uses '\''paru'\''. Translating command for you..."
    shift # Remove "yay" from arguments list
    paru "$@"
    return $?
  else
    echo "zsh: command not found: $1" >&2
    return 127
  fi
}
' >> "\$ZSH_CONFIG"
else
    warn "System Zsh config not found at /etc/zsh/zshrc. Manual integration may be required."
fi
info "Shell integration complete. Restart your terminal to activate."

`;
};


export const generateInstallScript = (config: DistroConfig, target: BuildTarget): string => {
    // Localization is taken from the blueprint as it's configured in a detailed UI.
    // The rest of the configuration is determined by the interactive TUI below.
    
    // Generate firewall rules from config
    const firewallRulesBlock = config.enableFirewall ? `
info "Configuring the Realm's Aegis (ufw)..."
ufw default deny incoming
ufw default allow outgoing
${config.firewallRules.map(rule => `ufw allow ${rule.port}${rule.protocol !== 'any' ? `/${rule.protocol}`: ''} # ${rule.description}`).join('\n')}
ufw --force enable
systemctl enable ufw.service
` : `info "Firewall is disabled as per the blueprint."`;

    const sovereignServicesBlock = `
# --- Configure Sovereign Services ---
${config.internalizedServices.filter(s => s.enabled).map(service => {
        if (service.id === 'code-server') {
            return `info "Enabling sovereign service: ${service.name}..."
systemctl enable --now code-server@\${USERNAME}.service`;
        }
        return `# Service ${service.name} not implemented in script generator.`;
    }).join('\n')}
`;

    return `#!/bin/bash
# Kael AI :: Forged Installation Script
# This script is an interactive ritual. It will guide you through the final choices for your Realm.

set -euo pipefail

# --- CONFIGURATION FROM BLUEPRINT ---
# These are set by the Architect in the forge UI before generating the script.
HOSTNAME_PRESET="${config.hostname || 'kael-os'}"
USERNAME_PRESET="${config.username || ''}"
TIMEZONE="${config.timezone}"
LOCALE="${config.locale}"
KEYBOARD_LAYOUT="${config.keyboardLayout}"

# --- IMMUTABLE PHILOSOPHY CONFIGURATION ---
# These are the cornerstones of the Realm and are not changed.
DESKTOP_ENV="KDE Plasma"
SHELL_ENV="zsh"
BOOTLOADER="grub"
EFI_PART_SIZE="512M"
FILESYSTEM="btrfs"
ENABLE_SNAPSHOTS="true"
AUR_HELPER="paru"

# --- HELPER FUNCTIONS ---
info() { echo -e "\\e[34m[INFO]\\e[0m $1"; }
warn() { echo -e "\\e[33m[WARN]\\e[0m $1"; }
error() { echo -e "\\e[31m[ERROR]\\e[0m $1"; exit 1; }

# --- PRE-INSTALLATION CHECKS ---
# Ensure dialog is available
pacman -Q dialog &>/dev/null || { info "Installing 'dialog' for the interactive installer..."; pacman -Sy --noconfirm dialog; }

# --- INTERACTIVE RITUAL (TUI) ---
clear
exec 3>&1

# 1. Identity Ritual
USER_INFO=$(dialog --clear --backtitle "Kael OS Forge" --title "Architect Identity (1/5)" --form "Define the Realm's name (hostname) and its master user." 15 60 0 \\
"Realm Name (hostname):" 1 1 "\${HOSTNAME_PRESET}" 1 25 40 0 \\
"Username:"             2 1 "\${USERNAME_PRESET}" 2 25 40 0 \\
"Master Key (password):" 3 1 ""          3 25 40 0 --passwordbox \\
"Confirm Master Key:"   4 1 ""          4 25 40 0 --passwordbox \\
2>&1 1>&3) || { clear; error "Identity ritual cancelled. Aborting."; }

HOSTNAME=$(echo "$USER_INFO" | sed -n 1p)
USERNAME=$(echo "$USER_INFO" | sed -n 2p)
PASSWORD=$(echo "$USER_INFO" | sed -n 3p)
PASSWORD_CONFIRM=$(echo "$USER_INFO" | sed -n 4p)

# Validation
[[ "$HOSTNAME" =~ ^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$ ]] || error "Invalid hostname."
[[ "$USERNAME" =~ ^[a-z_][a-z0-9_-]*[$]?$ ]] || error "Invalid username (lowercase, no spaces)."
[ -n "$PASSWORD" ] || error "Password cannot be empty."
[ "$PASSWORD" == "$PASSWORD_CONFIRM" ] || error "Passwords do not match."

# 2. Disk Forging
DISKS_LIST=()
while read -r line; do
    DISKS_LIST+=($(echo "$line" | awk '{print "/dev/"$1, $2}'))
done < <(lsblk -d -o NAME,SIZE --noheadings | grep -v "loop")
[ \${#DISKS_LIST[@]} -gt 0 ] || error "No disks found."

TARGET_DISK=$(dialog --clear --backtitle "Kael OS Forge" --title "Disk Forging (2/5)" \\
    --radiolist "Select the disk to forge the Realm upon.\\n\\n\\Zb\\Z1WARNING: THIS IS DESTRUCTIVE AND IRREVERSIBLE.\\Zn\\n\\nThe ENTIRE selected disk will be erased and partitioned with this exact layout:\\n- 512MB EFI Partition\\n- Swap Partition (RAM + 2GB)\\n- BTRFS Root (Rest of disk)" 20 70 0 \\
    "\${DISKS_LIST[@]}" \\
    2>&1 1>&3) || { clear; error "Disk selection cancelled. Aborting."; }
[ -n "$TARGET_DISK" ] || error "No disk selected. Aborting."

# 3. Graphics Core Attunement
GPU_VENDOR=$(lspci | grep -E "VGA|3D" | tr '[:upper:]' '[:lower:]')
RECOMMENDED_DRIVER="none"
if echo "$GPU_VENDOR" | grep -q "nvidia"; then RECOMMENDED_DRIVER="nvidia";
elif echo "$GPU_VENDOR" | grep -q "amd\\|ati"; then RECOMMENDED_DRIVER="amd";
elif echo "$GPU_VENDOR" | grep -q "intel"; then RECOMMENDED_DRIVER="intel";
elif echo "$GPU_VENDOR" | grep -q "vmware\\|virtualbox"; then RECOMMENDED_DRIVER="vmware"; fi

GPU_DRIVER=$(dialog --clear --backtitle "Kael OS Forge" --title "Graphics Core Attunement (3/5)" \\
    --radiolist "Select the graphics driver for your system. An attempt has been made to detect your hardware." 20 70 0 \\
    "nvidia" "Proprietary NVIDIA drivers" $([[ "$RECOMMENDED_DRIVER" == "nvidia" ]] && echo "ON" || echo "OFF") \
    "amd" "Open-source AMD drivers" $([[ "$RECOMMENDED_DRIVER" == "amd" ]] && echo "ON" || echo "OFF") \
    "intel" "Open-source Intel drivers" $([[ "$RECOMMENDED_DRIVER" == "intel" ]] && echo "ON" || echo "OFF") \
    "vmware" "Drivers for VMware/VirtualBox VMs" $([[ "$RECOMMENDED_DRIVER" == "vmware" ]] && echo "ON" || echo "OFF") \
    "none" "Skip driver installation" OFF \
    2>&1 1>&3) || { clear; error "Graphics driver selection cancelled. Aborting."; }

# 4. Software Grimoire Selection
SOFTWARE_CHOICES=$(dialog --clear --backtitle "Kael OS Forge" --title "Software Grimoire (4/5)" --form "Select additional software to install." 22 70 0 \\
    --checklist "Select additional software to install." 20 70 0 \\
    "firefox" "Web Browser" ON \\
    "code" "Code Editor (VS Code - OSS)" ON \\
    "docker" "Containerization Platform" OFF \\
    "steam" "Gaming Platform" OFF \\
    "obs-studio" "Streaming & Recording" OFF \\
    "caddy" "Simple Web Server (Sovereign Repo)" OFF \\
    "lftp" "Advanced FTP Client (Repo Sync)" OFF \\
    "calamares" "Graphical Installer Framework" OFF \\
    2>&1 1>&3) || { clear; error "Software selection cancelled. Aborting."; }

# 5. Access to Other Realms
EXTRA_CHOICES=$(dialog --clear --backtitle "Kael OS Forge" --title "Access to Other Realms (5/5)" \\
    --checklist "Select extra repositories. Paru (AUR Helper) is installed by default." 20 70 0 \\
    "cachyos" "CachyOS performance repository" ON \
    "chaotic" "Chaotic-AUR pre-built packages" ON \
    2>&1 1>&3) || { clear; error "Repository selection cancelled. Aborting."; }

exec 3>&-
clear

# --- DYNAMIC CONFIGURATION ---
info "Detecting system memory for swap calculation..."
TOTAL_RAM_MB=$(grep MemTotal /proc/meminfo | awk '{print $2}' | xargs -I {} expr {} / 1024)
// FIX: Escape shell variable substitution to prevent TypeScript error.
SWAP_SIZE_MB=$((\${TOTAL_RAM_MB} + 2048))
// FIX: Escape shell variable substitution to prevent TypeScript error.
SWAP_SIZE="\${SWAP_SIZE_MB}M"
// FIX: Escape shell variable substitutions to prevent TypeScript errors.
info "Total RAM: \${TOTAL_RAM_MB}MB. Swap size set to: \${SWAP_SIZE}."

info "Calculating package list based on your selections..."
# Create a temporary file for packages to handle unique additions
PACKAGE_FILE=$(mktemp)
# Helper to add a package only if it's not already in the file
add_pkg() { grep -q "^\$1\$" "\$PACKAGE_FILE" || echo "\$1" >> "\$PACKAGE_FILE"; }

# Base packages from blueprint
for pkg in ${getPackages(config).join(' ')}; do add_pkg "\$pkg"; done

# Packages from TUI choices
case "$GPU_DRIVER" in
    "nvidia") add_pkg "nvidia-dkms";;
    "amd") add_pkg "xf86-video-amdgpu";;
    "intel") add_pkg "xf86-video-intel";;
    "vmware") add_pkg "xf86-video-vmware"; add_pkg "open-vm-tools";;
esac
[ "$GPU_DRIVER" != "none" ] && add_pkg "mesa"

for choice in $SOFTWARE_CHOICES; do add_pkg "$(echo "$choice" | tr -d '"')"; done
HAS_CACHY=false; HAS_CHAOTIC=false
for choice in $EXTRA_CHOICES; do
    choice=$(echo "$choice" | tr -d '"')
    case "$choice" in
        "cachyos") HAS_CACHY=true;; "chaotic") HAS_CHAOTIC=true;;
    esac
done

if [ "$HAS_CHAOTIC" = true ]; then add_pkg "paru"; fi

PACKAGES_TO_INSTALL=(\$(cat "\$PACKAGE_FILE"))
rm "\$PACKAGE_FILE"
info "Final package list determined."

# --- INSTALLATION RITUAL ---
info "Starting Kael OS installation ritual."
timedatectl set-ntp true

info "Partitioning disk \${TARGET_DISK}..."
sgdisk --zap-all \${TARGET_DISK}
sgdisk -n 1:0:+\${EFI_PART_SIZE} -t 1:ef00 -c 1:"EFI System Partition" \${TARGET_DISK}
sgdisk -n 2:0:+\${SWAP_SIZE} -t 2:8200 -c 2:"Swap" \${TARGET_DISK}
sgdisk -n 3:0:0 -t 3:8300 -c 3:"Linux Root" \${TARGET_DISK}

info "Formatting partitions..."
mkfs.fat -F32 \${TARGET_DISK}p1
mkswap \${TARGET_DISK}p2
// FIX: Escape shell variable substitution to prevent TypeScript error.
mkfs.\${FILESYSTEM} -f \${TARGET_DISK}p3

info "Mounting filesystems..."
mount \${TARGET_DISK}p3 /mnt
mkdir -p /mnt/boot
mount \${TARGET_DISK}p1 /mnt/boot
swapon \${TARGET_DISK}p2

info "Installing packages. This will take a while..."
pacstrap /mnt "\${PACKAGES_TO_INSTALL[@]}"

info "Generating fstab..."
genfstab -U /mnt >> /mnt/etc/fstab

info "Chrooting into new system to configure..."
# Pass TUI variables into chroot environment
cat <<CHROOT_VARS > /mnt/root/.chroot_vars
HOSTNAME="$HOSTNAME"
USERNAME="$USERNAME"
PASSWORD="$PASSWORD"
TIMEZONE="$TIMEZONE"
LOCALE="$LOCALE"
KEYBOARD_LAYOUT="$KEYBOARD_LAYOUT"
HAS_CACHY=$HAS_CACHY
HAS_CHAOTIC=$HAS_CHAOTIC
SHELL_ENV="$SHELL_ENV"
BOOTLOADER="$BOOTLOADER"
DESKTOP_ENV="$DESKTOP_ENV"
AUR_HELPER="$AUR_HELPER"
CHROOT_VARS

arch-chroot /mnt /bin/bash <<'EOF'
set -euo pipefail
info() { echo -e "\\e[34m[INFO-CHROOT]\\e[0m \$1"; }
source /root/.chroot_vars
rm /root/.chroot_vars

# Set timezone, locale, keyboard
// FIX: Escape shell variable substitution to prevent TypeScript error.
ln -sf "/usr/share/zoneinfo/\${TIMEZONE}" /etc/localtime
hwclock --systohc
// FIX: Escape shell variable substitution to prevent TypeScript error.
echo "\${LOCALE} UTF-8" >> /etc/locale.gen
locale-gen
// FIX: Escape shell variable substitution to prevent TypeScript error.
echo "LANG=\${LOCALE}" > /etc/locale.conf
// FIX: Escape shell variable substitution to prevent TypeScript error.
echo "KEYMAP=\${KEYBOARD_LAYOUT}" > /etc/vconsole.conf

# Set hostname
// FIX: Escape shell variable substitution to prevent TypeScript error.
echo "\${HOSTNAME}" > /etc/hostname
echo "127.0.0.1 localhost" >> /etc/hosts
echo "::1       localhost" >> /etc/hosts
// FIX: Escape shell variable substitutions to prevent TypeScript errors.
echo "127.0.1.1 \${HOSTNAME}.localdomain \${HOSTNAME}" >> /etc/hosts

# Configure repositories
if [ "$HAS_CACHY" = true ]; then
    info "Setting up CachyOS repository..."
    pacman-key --recv-keys F3B607488DB35A47 --keyserver keyserver.ubuntu.com
    pacman-key --lsign-key F3B607488DB35A47
    pacman -U --noconfirm --needed 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-keyring-*.pkg.tar.zst'
    pacman -U --noconfirm --needed 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-mirrorlist-*.pkg.tar.zst'
    pacman -U --noconfirm --needed 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v3-mirrorlist-*.pkg.tar.zst'
    pacman -U --noconfirm --needed 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v4-mirrorlist-*.pkg.tar.zst'
    echo -e "\\n[cachyos-v4]\\nInclude = /etc/pacman.d/cachyos-v4-mirrorlist\\n[cachyos-v3]\\nInclude = /etc/pacman.d/cachyos-v3-mirrorlist\\n[cachyos]\\nInclude = /etc/pacman.d/cachyos-mirrorlist" >> /etc/pacman.conf
fi
if [ "$HAS_CHAOTIC" = true ]; then
    info "Setting up Chaotic-AUR repository..."
    pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com
    pacman-key --lsign-key 3056513887B78AEB
    pacman -U --noconfirm --needed 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'
    echo -e "\\n[chaotic-aur]\\nInclude = /etc/pacman.d/chaotic-mirrorlist" >> /etc/pacman.conf
fi
if [ "$HAS_CACHY" = true ] || [ "$HAS_CHAOTIC" = true ]; then
    info "Synchronizing new repositories..."
    pacman -Syyu --noconfirm
fi

# Create user & set passwords
info "Creating user '\${USERNAME}'..."
// FIX: Escape shell variable substitution to prevent TypeScript error.
useradd -m -G wheel -s "/bin/\${SHELL_ENV}" "\${USERNAME}"
echo "%wheel ALL=(ALL:ALL) ALL" >> /etc/sudoers
info "Setting Master Key for 'root', '\${USERNAME}' and 'kael'..."
echo "root:\${PASSWORD}" | chpasswd
echo "\${USERNAME}:\${PASSWORD}" | chpasswd
export KAEL_PASSWORD="\${PASSWORD}"

# Install bootloader
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB
grub-mkconfig -o /boot/grub/grub.cfg

# Enable services
systemctl enable NetworkManager
systemctl enable sddm
${firewallRulesBlock}
${sovereignServicesBlock}

# Install AUR Helpers (if not installed from Chaotic)
if [[ ! -f "/usr/bin/paru" ]]; then
    info "Installing AUR Helper (paru) from source..."
    sudo -u "\${USERNAME}" /bin/bash <<'EOSU'
    cd /tmp
    git clone https://aur.archlinux.org/paru.git
    cd paru
    makepkg -si --noconfirm
    cd ..
    rm -rf paru
EOSU
fi

# Create AI User and Install AI Core
${_getKaelUserSetupBlock()}
${_getHybridAICoreAndGUIScriptBlock()}

info "Configuration complete inside chroot."
EOF

info "Unmounting filesystems..."
umount -R /mnt

info "SUCCESS: The Kael OS Realm has been forged! You may now reboot."
`;
};

export const generateAttunementScript = (config: DistroConfig): string => {
    const packages = getPackages(config);
    const userToModify = config.username || '$SUDO_USER';
    
    const hostnameBlock = config.hostname ? `
# 3. Set hostname
info "Setting hostname to ${config.hostname}..."
hostnamectl set-hostname ${config.hostname}
` : `
# 3. Skipping hostname change (not specified in blueprint)
`;

    const firewallRulesBlock = config.enableFirewall ? `
# 8. Configure Firewall
info "Configuring and enabling the firewall (ufw)..."
ufw default deny incoming
ufw default allow outgoing
${config.firewallRules.map(rule => `ufw allow ${rule.port}${rule.protocol !== 'any' ? `/${rule.protocol}`: ''} # ${rule.description}`).join('\n')}
ufw --force enable
systemctl enable ufw.service
` : `
# 8. Firewall configuration skipped (disabled in blueprint)
`;

    const sovereignServicesBlock = `
# 9. Configure Sovereign Services
${config.internalizedServices.filter(s => s.enabled).map(service => {
        if (service.id === 'code-server') {
            return `info "Enabling sovereign service: ${service.name}..."
systemctl enable --now code-server@${userToModify}.service`;
        }
        return `# Service ${service.name} not implemented in script generator.`;
    }).join('\n')}
`;


    return `#!/bin/bash
# Kael AI :: System Attunement Script
set -euo pipefail

info() { echo -e "\\e[34m[INFO]\\e[0m $1"; }
error() { echo -e "\\e[31m[ERROR]\\e[0m $1"; exit 1; }

# --- TUI FOR AI USER PASSWORD ---
clear
info "Preparing to attune the AI Core..."
exec 3>&1
PASS_INFO=$(dialog --clear --backtitle "Kael AI Attunement" --title "Guardian's Key" --form "Set a password for the 'kael' AI system user." 15 60 0 \\
"Password:"         1 1 "" 1 10 40 0 --passwordbox \\
"Confirm Password:" 2 1 "" 2 10 40 0 --passwordbox \\
2>&1 1>&3)
exec 3>&-

if [ $? -ne 0 ]; then
    clear
    error "Password entry cancelled. Aborting attunement."
fi

KAEL_PASSWORD=$(echo "$PASS_INFO" | sed -n 1p)
PASSWORD_CONFIRM=$(echo "$PASS_INFO" | sed -n 2p)

if [ -z "$KAEL_PASSWORD" ]; then
    error "Password cannot be empty."
fi
if [ "$KAEL_PASSWORD" != "$PASSWORD_CONFIRM" ]; then
    error "Passwords do not match."
fi

info "Beginning system attunement..."

# 1. Ensure system is up-to-date
pacman -Syu --noconfirm

# 2. Install required packages
info "Installing core packages from blueprint..."
pacman -S --noconfirm --needed ${packages.join(' ')}

${hostnameBlock}

# 4. Set timezone
info "Setting timezone to ${config.timezone}..."
timedatectl set-timezone ${config.timezone}

# 5. Configure user shell
if id "${userToModify}" &>/dev/null; then
    info "Setting shell for user ${userToModify} to ${config.shell}..."
    chsh -s /usr/bin/${config.shell} ${userToModify}
else
    warn "User ${userToModify} not found, skipping shell change."
fi

# 6. Enable services
info "Enabling core services..."
systemctl enable NetworkManager
if [[ "${config.desktopEnvironment}" == *"KDE"* || "${config.desktopEnvironment}" == *"Plasma"* ]]; then
    systemctl enable sddm
elif [[ "${config.desktopEnvironment}" == *"GNOME"* ]]; then
    systemctl enable gdm
fi

${firewallRulesBlock}

${sovereignServicesBlock}

# 7. Imbue system with AI Core
${_getKaelUserSetupBlock()}
${_getHybridAICoreAndGUIScriptBlock()}

info "SUCCESS: System attunement complete."
`;
};

export const generateAICoreScript = (config: DistroConfig): string => {
    // Per user request, the "AI Core Script" now performs the full system attunement.
    // It is now the primary method for modifying an existing system.
    return generateAttunementScript(config);
};