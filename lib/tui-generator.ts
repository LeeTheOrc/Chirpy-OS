import type { DistroConfig } from '../types';
import { getAttunementScriptParts } from './script-generator';

export const generateTuiInstallerScript = (config: DistroConfig): string => {
    
    const parts = getAttunementScriptParts(config);
    
    // btoa is available in the web worker environment this runs in.
    const b64 = (str: string) => btoa(unescape(encodeURIComponent(str)));

    const b64_repo_setup = b64(parts.repo_setup);
    const b64_kael_repo = b64(parts.kael_repo);
    const b64_sync = b64(parts.sync);
    const b64_package_install = b64(parts.package_install);
    const b64_hardware = b64(parts.hardware);
    const b64_ai_core = b64(parts.ai_core);


    // This is the main TUI script that will be written to a file.
    const tuiScript = `#!/bin/bash
# Kael OS Attunement TUI - v3.3 (Comment Purge)
# A Terminal UI for applying a Kael OS blueprint to an existing Arch system.

# --- Colors and Styles ---
C_RESET='\\033[0m'
C_BOLD='\\033[1m'
C_DRAGON='\\033[38;5;220m'
C_ORC='\\033[38;5;47m'
C_PURPLE='\\033[38;5;171m'
C_SECONDARY='\\033[38;5;244m'
C_RED='\\033[38;5;196m'
C_BLUE='\\033[38;5;39m'

# --- Logging Helpers (Defined globally) ---
log_info() { echo -e "\${C_BLUE}--> \${C_RESET}$1"; }
log_warn() { echo -e "\${C_DRAGON}--> WARNING: \${C_RESET}$1"; }
log_error() { echo -e "\${C_RED}--> ERROR: \${C_RESET}$1"; }
log_success() { echo -e "\${C_ORC}--> SUCCESS: \${C_RESET}$1"; }

# --- UI Helper Functions ---
show_header() {
    clear
    echo -e "\${C_BOLD}\${C_DRAGON}"
    echo '██╗  ██╗ █████╗ ███████╗██╗      '
    echo '██║ ██╔╝██╔══██╗██╔════╝██║      '
    echo '█████╔╝ ███████║█████╗  ██║      '
    echo '██╔═██╗ ██╔══██║██╔══╝  ██║      '
    echo '██║  ██╗██║  ██║███████╗███████╗'
    echo '╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝'
    echo -e "\${C_RESET}"
    echo -e " \${C_BOLD}Kael OS Attunement Ritual\${C_RESET}"
    echo -e " \${C_SECONDARY}-------------------------------------------\${C_RESET}"
}

press_enter_to_continue() {
    echo ""
    echo -e " \${C_SECONDARY}Press [Enter] to return to the main menu...\${C_RESET}"
    read -r
}

run_ritual() {
    local ritual_name="$1"
    local ritual_func_name="$2"
    show_header
    echo -e "\${C_BOLD}\${C_ORC}Initiating Ritual: \${ritual_name}\${C_RESET}"
    echo ""
    read -p "Press [Enter] to begin or Ctrl+C to abort."
    echo ""
    
    # Execute the function passed by name
    "$ritual_func_name"

    echo ""
    echo -e "\${C_BOLD}\${C_ORC}Ritual Complete.\${C_RESET}"
    press_enter_to_continue
}

# --- RITUAL DEFINITIONS ---
# Each function decodes and executes its own logic from a Base64 block.
# This is extremely robust and avoids all shell quoting/escaping issues.
ritual_repo_setup() { eval "$(echo '${b64_repo_setup}' | base64 --decode)"; }
ritual_kael_repo() { eval "$(echo '${b64_kael_repo}' | base64 --decode)"; }
ritual_sync() { eval "$(echo '${b64_sync}' | base64 --decode)"; }
ritual_package_install() { eval "$(echo '${b64_package_install}' | base64 --decode)"; }
ritual_hardware() { eval "$(echo '${b64_hardware}' | base64 --decode)"; }
ritual_ai_core() { eval "$(echo '${b64_ai_core}' | base64 --decode)"; }

ritual_full_attunement() {
    ritual_repo_setup
    ritual_kael_repo
    ritual_sync
    ritual_package_install
    ritual_hardware
    ritual_ai_core
}

# --- Main Menu ---
main_menu() {
    while true; do
        show_header
        echo -e "\${C_BOLD}Select a ritual to perform:\${C_RESET}"
        echo ""
        echo -e " \${C_ORC}A)\${C_RESET} Run Full Attunement (All Steps)"
        echo ""
        echo -e " \${C_SECONDARY}--- Manual Steps --- \${C_RESET}"
        echo -e " \${C_BLUE}1)\${C_RESET} Attune to Allied Forges (CachyOS & Chaotic)"
        echo -e " \${C_BLUE}2)\${C_RESET} Attune to Kael OS Athenaeum"
        echo -e " \${C_BLUE}3)\${C_RESET} Synchronize & Upgrade System"
        echo -e " \${C_BLUE}4)\${C_RESET} Install Blueprint Packages"
        echo -e " \${C_BLUE}5)\${C_RESET} Attune Hardware Drivers (GPU)"
        echo -e " \${C_BLUE}6)\${C_RESET} Awaken Local AI Core"
        echo ""
        echo -e " \${C_RED}Q)\${C_RESET} Quit the Forge"
        echo ""
        echo -e -n "\${C_BOLD}Your choice: \${C_RESET}"
        read -r choice

        case $choice in
            [Aa]) run_ritual "Full System Attunement" "ritual_full_attunement" ;;
            1) run_ritual "Attune Allied Forges" "ritual_repo_setup" ;;
            2) run_ritual "Attune Kael OS Athenaeum" "ritual_kael_repo" ;;
            3) run_ritual "Synchronize & Upgrade" "ritual_sync" ;;
            4) run_ritual "Install Blueprint Packages" "ritual_package_install" ;;
            5) run_ritual "Attune Hardware Drivers" "ritual_hardware" ;;
            6) run_ritual "Awaken Local AI Core" "ritual_ai_core" ;;
            [Qq]) clear; echo -e "\${C_DRAGON}Farewell, Architect. The forge awaits your return.\\n\${C_RESET}" ; exit 0 ;;
            *) echo -e "\\n\${C_RED}Invalid choice. Please try again.\\n\${C_RESET}" ; sleep 1 ;;
        esac
    done
}

# --- Script Entry Point ---
# Need to run as root/sudo
if [ "$EUID" -ne 0 ]; then
    echo -e "\${C_RED}Please run this ritual with sudo.\${C_RESET}"
    exit 1
fi
main_menu
`;

    // This is the installer part that wraps the main TUI script.
    const installerScript = `#!/bin/bash
# Kael OS Attunement TUI Installer - v4.0 (Sudo Path Fix)
set -euo pipefail

# This script must be run as root to install to /usr/local/bin
if [ "$EUID" -ne 0 ]; then
  echo "Please run this installer with sudo."
  exit 1
fi

install_tui() {
    INSTALL_PATH="/usr/local/bin/kael-installer"

    echo "--- Installing Kael OS Attunement TUI ---"
    
    # Use a heredoc to robustly write the TUI script content.
    # The 'EOF' marker prevents variable expansion within the heredoc.
    cat > "$INSTALL_PATH" << 'EOF'
${tuiScript}
EOF

    chmod +x "$INSTALL_PATH"
    echo "--> TUI script has been installed to $INSTALL_PATH"
    
    echo ""
    echo -e "✅ Installation Complete!"
    echo "You can now run 'sudo kael-installer' from any terminal to start the attunement ritual."
}

install_tui
`;
    return installerScript;
};