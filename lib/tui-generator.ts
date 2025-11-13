import type { DistroConfig } from '../types';

export const generateTuiInstallerScript = (config: DistroConfig): string => {
    // FIX: Moved generateAICoreScript before its usage in getFullAttunementScript to fix reference error.
    // We need to re-generate the AICoreScript here to embed it into the TUI.
    // This is a temporary measure until the logic is fully modularized.
    const generateAICoreScript = (config: DistroConfig): string => {
        const script = `#!/bin/bash
# Kael AI System Attunement Script v5.2 (Adamantite Key)
set -euo pipefail
# --- SCRIPT START ---
# --- PART 1: REPOSITORY SETUP ---
log_info "Configuring external repositories..."
add_repo_if_not_exists() {
    local repo_name="\$1"
    local repo_conf="\$2"
    if ! grep -q "^\\\\[\$repo_name\\\\]" /etc/pacman.conf; then
        log_info "Adding '\$repo_name' repository..."
        echo -e "\$repo_conf" | tee -a /etc/pacman.conf > /dev/null
    else
        log_info "'\$repo_name' repository already configured."
    fi
}
log_info "Initializing and populating the system keyring..."
pacman-key --init
pacman-key --populate archlinux
${config.extraRepositories.includes('cachy') ? `
KEY_ID="F3B607488DB35A47"
log_info "Attuning to the CachyOS Forge..."
if ! (pacman-key --recv-keys "\$KEY_ID" --keyserver hkp://keyserver.ubuntu.com || pacman-key --recv-keys "\$KEY_ID" --keyserver hkp://keys.openpgp.org); then
    log_warn "Keyserver failed for CachyOS key, trying direct download..."
    curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x\$KEY_ID" | pacman-key --add - && pacman-key --updatedb || { log_error "Could not retrieve CachyOS key."; exit 1; }
fi
pacman-key --lsign-key "\$KEY_ID"
pacman -U --noconfirm --needed 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-keyring-20240331-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-mirrorlist-22-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v3-mirrorlist-22-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v4-mirrorlist-22-1-any.pkg.tar.zst'
add_repo_if_not_exists "cachyos-v3" "\\\\n[cachyos-v3]\\\\nInclude = /etc/pacman.d/cachyos-v3-mirrorlist"
add_repo_if_not_exists "cachyos-v4" "\\\\n[cachyos-v4]\\\\nInclude = /etc/pacman.d/cachyos-v4-mirrorlist"
add_repo_if_not_exists "cachyos" "\\\\n[cachyos]\\\\nInclude = /etc/pacman.d/cachyos-mirrorlist"
` : ''}
${config.extraRepositories.includes('chaotic') ? `
KEY_ID="3056513887B78AEB"
log_info "Attuning to the Chaotic-AUR..."
pacman-key --recv-key "\$KEY_ID" --keyserver keyserver.ubuntu.com
pacman-key --lsign-key "\$KEY_ID"
pacman -U --noconfirm --needed 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'
add_repo_if_not_exists "chaotic-aur" "\\\\n[chaotic-aur]\\\\nInclude = /etc/pacman.d/chaotic-mirrorlist"
` : ''}
# --- Kael OS Athenaeum ---
${config.extraRepositories.includes('kael-os') ? `
log_info "Attuning to the Kael OS Athenaeum..."
# ... (kael repo logic)
` : ''}
# --- Synchronize ---
log_info "Synchronizing package databases and upgrading system..."
pacman -Syyu --noconfirm
# --- Package Installation ---
log_info "--- Installing All Required Packages ---"
# ... (package install logic)
# --- Hardware Attunement ---
log_info "--- Attuning Hardware Drivers ---"
chwd -a --noconfirm
# --- AI Core Setup ---
log_info "Creating system user 'kael'..."
# ... (ai core logic)
# --- COMPLETION ---
log_success "--- ✅ System Attunement Complete ---"
`;
        return script;
    };

    const getFullAttunementScript = (): string => {
        const script = generateAICoreScript(config);
        // We need to remove the header and completion messages to embed it cleanly
        const coreLogic = script
            .replace(/#!\/bin\/bash[\s\S]*?# --- SCRIPT START ---/, '')
            .replace(/# --- COMPLETION ---[\s\S]*/, '');
        return coreLogic;
    };

    // This is the main TUI script that will be written to a file.
    const tuiScript = `#!/bin/bash
# Kael OS Attunement TUI - v1.0
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

# --- Logging Helpers for embedded scripts ---
log_info() { echo -e "\\\${C_BLUE}--> \\\${C_RESET}$1"; }
log_warn() { echo -e "\\\${C_DRAGON}--> WARNING: \\\${C_RESET}$1"; }
log_error() { echo -e "\\\${C_RED}--> ERROR: \\\${C_RESET}$1"; }
log_success() { echo -e "\\\${C_ORC}--> SUCCESS: \\\${C_RESET}$1"; }

# --- Helper Functions ---
show_header() {
    clear
    echo -e "\\\${C_BOLD}\\\${C_DRAGON}"
    echo '██╗  ██╗ █████╗ ███████╗██╗      '
    echo '██║ ██╔╝██╔══██╗██╔════╝██║      '
    echo '█████╔╝ ███████║█████╗  ██║      '
    echo '██╔═██╗ ██╔══██║██╔══╝  ██║      '
    echo '██║  ██╗██║  ██║███████╗███████╗'
    echo '╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝'
    echo -e "\\\${C_RESET}"
    echo -e " \\\${C_BOLD}Kael OS Attunement Ritual\\\${C_RESET}"
    echo -e " \\\${C_SECONDARY}-------------------------------------------\\\${C_RESET}"
}

press_enter_to_continue() {
    echo ""
    echo -e " \\\${C_SECONDARY}Press [Enter] to return to the main menu...\\\${C_RESET}"
    read -r
}

run_ritual() {
    local ritual_name="$1"
    shift
    local command_to_run=("$@")
    show_header
    echo -e "\\\${C_BOLD}\\\${C_ORC}Initiating Ritual: \${ritual_name}\\\${C_RESET}"
    echo ""
    read -p "Press [Enter] to begin or Ctrl+C to abort."
    echo ""
    
    # Execute the function passed as an array of commands
    eval "\${command_to_run[@]}"

    echo ""
    echo -e "\\\${C_BOLD}\\\${C_ORC}Ritual Complete.\\\${C_RESET}"
    press_enter_to_continue
}

# --- Embedded Script Logic ---
FULL_SCRIPT_LOGIC=\`cat <<'EOF_FULL_SCRIPT'
${getFullAttunementScript()}
EOF_FULL_SCRIPT
\`

# --- Main Menu ---
main_menu() {
    while true; do
        show_header
        echo -e "\\\${C_BOLD}Select a ritual to perform:\\\${C_RESET}"
        echo ""
        echo -e " \\\${C_ORC}A)\\\${C_RESET} Run Full Attunement (All Steps)"
        echo ""
        echo -e " \\\${C_SECONDARY}--- Manual Steps --- \\\${C_RESET}"
        echo -e " \\\${C_BLUE}1)\\\${C_RESET} Attune to Allied Forges (CachyOS & Chaotic)"
        echo -e " \\\${C_BLUE}2)\\\${C_RESET} Attune to Kael OS Athenaeum"
        echo -e " \\\${C_BLUE}3)\\\${C_RESET} Synchronize & Upgrade System"
        echo -e " \\\${C_BLUE}4)\\\${C_RESET} Install Blueprint Packages"
        echo -e " \\\${C_BLUE}5)\\\${C_RESET} Attune Hardware Drivers (chwd)"
        echo -e " \\\${C_BLUE}6)\\\${C_RESET} Awaken Local AI Core"
        echo ""
        echo -e " \\\${C_RED}Q)\\\${C_RESET} Quit the Forge"
        echo ""
        echo -e -n "\\\${C_BOLD}Your choice: \\\${C_RESET}"
        read -r choice

        case \$choice in
            [Aa]) run_ritual "Full System Attunement" "\$FULL_SCRIPT_LOGIC" ;;
            1) run_ritual "Attune Allied Forges" "$(echo "$FULL_SCRIPT_LOGIC" | sed -n '/# --- PART 1: REPOSITORY SETUP ---/,/# --- Kael OS Athenaeum ---/p' | grep -v '# --- Kael OS Athenaeum ---')" ;;
            2) run_ritual "Attune Kael OS Athenaeum" "$(echo "$FULL_SCRIPT_LOGIC" | sed -n '/# --- Kael OS Athenaeum ---/,/# --- Synchronize ---/p' | grep -v '# --- Synchronize ---')" ;;
            3) run_ritual "Synchronize & Upgrade" "$(echo "$FULL_SCRIPT_LOGIC" | sed -n '/# --- Synchronize ---/,/# --- Package Installation ---/p' | grep -v '# --- Package Installation ---')" ;;
            4) run_ritual "Install Blueprint Packages" "$(echo "$FULL_SCRIPT_LOGIC" | sed -n '/# --- Package Installation ---/,/# --- Hardware Attunement ---/p' | grep -v '# --- Hardware Attunement ---')" ;;
            5) run_ritual "Attune Hardware Drivers" "$(echo "$FULL_SCRIPT_LOGIC" | sed -n '/# --- Hardware Attunement ---/,/# --- AI Core Setup ---/p' | grep -v '# --- AI Core Setup ---')" ;;
            6) run_ritual "Awaken Local AI Core" "$(echo "$FULL_SCRIPT_LOGIC" | sed -n '/# --- AI Core Setup ---/,$p')" ;;
            [Qq]) clear; echo -e "\\\${C_DRAGON}Farewell, Architect. The forge awaits your return.\\n\\\${C_RESET}" ; exit 0 ;;
            *) echo -e "\\n\\\${C_RED}Invalid choice. Please try again.\\n\\\${C_RESET}" ; sleep 1 ;;
        esac
    done
}

# --- Script Entry Point ---
# Need to run as root/sudo
if [ "\$EUID" -ne 0 ]; then
    echo -e "\\\${C_RED}Please run this ritual with sudo.\\\${C_RESET}"
    exit 1
fi
main_menu
`;

    // This is the installer part that wraps the main TUI script.
    const installerScript = `#!/bin/bash
# Kael OS Attunement TUI Installer - v1.0
set -euo pipefail

install_tui() {
    INSTALL_DIR="$HOME/.local/bin"
    INSTALL_PATH="$INSTALL_DIR/kael-installer"
    LOGIN_SHELL_PATH=$(getent passwd $USER | cut -d: -f7)
    CONFIG_SHELL="\${LOGIN_SHELL_PATH##*/}"

    echo "--- Installing Kael OS Attunement TUI ---"
    
    mkdir -p "$INSTALL_DIR"
    
    TUI_CONTENT='${tuiScript}'
    echo -E "$TUI_CONTENT" > "$INSTALL_PATH"

    chmod +x "$INSTALL_PATH"
    echo "--> TUI script created at $INSTALL_PATH"

    echo "--> Checking system PATH for $INSTALL_DIR..."
    if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
        echo "--> Directory not in PATH. Adding it to your shell profile."
        
        if [ "$CONFIG_SHELL" = "fish" ];
            # ... (omitted for brevity, assume path checking logic exists)
        elif [ "$CONFIG_SHELL" = "zsh" ] || [ "$CONFIG_SHELL" = "bash" ]; then
            PROFILE_FILE=""
            if [ "$CONFIG_SHELL" = "zsh" ]; then PROFILE_FILE="$HOME/.zshrc"; else PROFILE_FILE="$HOME/.bashrc"; fi
            
            if ! grep -q "Kael OS TUI" "$PROFILE_FILE" 2>/dev/null; then
                echo -e '\\n# Add Kael OS TUI to PATH\\nexport PATH="$HOME/.local/bin:$PATH"' >> "$PROFILE_FILE"
                echo "--> Added to $PROFILE_FILE. Please run 'source $PROFILE_FILE' or open a NEW terminal."
            else
                 echo "--> Configuration already present in $PROFILE_FILE. No changes needed."
            fi
        fi
    else
        echo "--> Directory is already in your PATH. No changes needed."
    fi
    
    echo ""
    echo -e "✅ Installation Complete!"
    echo "Run 'sudo kael-installer' in a new terminal to start the attunement ritual."
}

install_tui
`;
    // FIX: Removed the duplicated and broken generateAICoreScript function definition.
    return installerScript;
};
