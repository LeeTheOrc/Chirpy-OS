// This file generates a self-contained bash script that provides a
// terminal-based UI (TUI) for managing the Kael OS development workflow.

const generateKhwsRitualScript = (): string => {
    // This script forges the 'khws' recipe and publishes it to the Athenaeum.
    const RITUAL_SCRIPT_RAW = `#!/bin/bash
# Kael OS - Unified Ritual of Insight for 'khws'
# This script forges the 'khws' recipe and publishes it to the Athenaeum.
set -euo pipefail

# --- CONFIGURATION ---
# This is the original source name, which makepkg will use for the directory.
_realname=chwd
# This is the name of our final package.
pkgname=khws
pkgver=1.16.1
pkgrel=1

# --- SCRIPT START ---
echo "--- Beginning the Unified Ritual of Insight for '$pkgname' ---"
echo "This incantation will forge the recipe, build the package, and publish it."

# Step 1: Forge the recipe (PKGBUILD)
echo "--> Scribing the recipe for '$pkgname'..."
PACKAGE_DIR="$HOME/packages/$pkgname"
mkdir -p "$PACKAGE_DIR"

# Here we embed the complete, correct PKGBUILD into the script.
cat > "$PACKAGE_DIR/PKGBUILD" << PKGBUILD_EOF
# Maintainer: The Architect & Kael <https://github.com/LeeTheOrc/Kael-OS>
# Original work by: CachyOS <ptr1337@cachyos.org>

_realname=\${_realname}
pkgname=\${pkgname}
provides=('chwd')
conflicts=('chwd')
pkgver=\${pkgver}
pkgrel=\${pkgrel}
pkgdesc="Kael Hardware Scry: Kael's hardware detection tool (based on CachyOS chwd)"
arch=('x86_64')
url="https://github.com/CachyOS/\${_realname}"
license=('GPL3')
depends=('pciutils' 'dmidecode' 'hwinfo' 'mesa-utils' 'xorg-xrandr' 'vulkan-tools' 'libdrm' 'pacman-contrib')
makedepends=('rust' 'cargo' 'git' 'pkg-config')
source=("\${_realname}::git+\${url}.git#tag=\${pkgver}")
sha256sums=('SKIP')
validpgpkeys=('335C57728630635441673A33B62C3D10C54D5DA9') # ptr1337 (CachyOS developer key for source verification)

prepare() {
	cd "\${_realname}"
	git submodule update --init
}

build() {
  cd "\${_realname}"
  export RUSTFLAGS="-C target-cpu=native"
  # This is the exact, proven build sequence from the CachyOS forge.
  (cd scripts/chwd-kernel && cargo build --release --locked)
  cargo build --release --locked --all-features
}

package() {
    cd "\${_realname}"
    # Install the binaries under the 'khws' name for our OS
    install -Dm755 target/release/chwd "\\$pkgdir/usr/bin/khws"
    install -Dm755 "scripts/chwd-kernel/target/release/chwd-kernel" "\\$pkgdir/usr/bin/khws-kernel"
    # The license should be installed under the name of the provided package
    install -Dm644 -t "\\$pkgdir/usr/share/licenses/khws/" LICENSE
}
PKGBUILD_EOF

echo "[SUCCESS] Recipe for '$pkgname' has been scribed."

# Step 2: Invoke the Publisher
echo "--> Initiating the Publishing Rite..."
if [ -f "\$HOME/packages/publish-package.sh" ]; then
    cd \$HOME/packages
    ./publish-package.sh "\$pkgname"
else
    echo ""
    echo "ERROR: The 'publish-package.sh' script was not found in '~/packages'."
    echo "Please perform Step 2 of the Keystone Ritual to create it, then try again."
    exit 1
fi

echo ""
echo "--- Ritual Complete ---"
echo "The artifact '$pkgname' has been successfully forged and published to the Athenaeum."
`;
    // Return the Base64 encoded version for embedding in the TUI
    return btoa(unescape(encodeURIComponent(RITUAL_SCRIPT_RAW.trim())));
};


export const generateTuiInstallerScript = (): string => {

    const RITUAL_KHWS_B64 = generateKhwsRitualScript();

    // This is the main TUI script that will be written to a file.
    // It contains the menu logic and embeds other scripts as Base64 strings.
    const tuiScript = `#!/bin/bash
# Kael Forge TUI - v1.2
# A Terminal UI for managing the Kael OS development workflow.

# --- Colors and Styles ---
C_RESET='\\033[0m'
C_BOLD='\\033[1m'
C_DRAGON='\\033[38;5;220m' # Gold/Dragon Fire
C_ORC='\\033[38;5;47m'   # Green/Orc Steel
C_PURPLE='\\033[38;5;171m' # Purple/Magic
C_CYAN='\\033[38;5;51m'
C_SECONDARY='\\033[38;5;244m'
C_RED='\\033[38;5;196m'
C_BLUE='\\033[38;5;39m'

# --- Embedded Scripts (Base64) ---
# Each ritual script is stored here to keep the TUI self-contained.
RITUAL_KHWS_B64="${RITUAL_KHWS_B64}"

# --- Helper Functions ---
show_header() {
    clear
    # ASCII Art for "KAEL"
    echo -e "\\\${C_BOLD}\\\${C_DRAGON}"
    echo '██╗  ██╗ █████╗ ███████╗██╗      '
    echo '██║ ██╔╝██╔══██╗██╔════╝██║      '
    echo '█████╔╝ ███████║█████╗  ██║      '
    echo '██╔═██╗ ██╔══██║██╔══╝  ██║      '
    echo '██║  ██╗██║  ██║███████╗███████╗'
    echo '╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝'
    echo -e "\\\${C_RESET}"
    echo -e " \\\${C_BOLD}The Forge TUI - Your command-line partner\\\${C_RESET}"
    echo -e " \\\${C_SECONDARY}-------------------------------------------\\\${C_RESET}"
}

press_enter_to_continue() {
    echo ""
    echo -e " \\\${C_SECONDARY}Press [Enter] to return to the main menu...\\\${C_RESET}"
    read -r
}

# --- Ritual Functions ---

run_ritual() {
    local ritual_name="\$1"
    local ritual_b64="\$2"
    show_header
    echo -e "\\\${C_BOLD}\\\${C_ORC}Initiating Ritual: \${ritual_name}\\\${C_RESET}"
    echo ""
    echo "This will execute the full script for this ritual."
    echo -e "Please follow any on-screen prompts."
    echo ""
    read -p "Press [Enter] to begin or Ctrl+C to abort."
    echo ""
    # Decode and execute the embedded script
    echo "\$ritual_b64" | base64 --decode | bash
    echo ""
    echo -e "\\\${C_BOLD}\\\${C_ORC}Ritual Complete.\\\${C_RESET}"
    press_enter_to_continue
}

# --- Main Menu ---
main_menu() {
    while true; do
        show_header
        echo -e "\\\${C_BOLD}Select a ritual to perform:\\\${C_RESET}"
        echo ""
        echo -e " \\\${C_DRAGON}1)\\\${C_RESET} The True Ritual of Insight (\`khws\`) \\\${C_SECONDARY}(Forge, Build, and Publish)"
        echo ""
        echo -e " \\\${C_BLUE}2)\\\${C_RESET} Forge Athenaeum Keystone \\\${C_SECONDARY}(Setup package repository)"
        echo -e " \\\${C_BLUE}3)\\\${C_RESET} Athenaeum Scryer \\\${C_SECONDARY}(Study other repos)"
        echo ""
        echo -e " \\\${C_RED}Q)\\\${C_RESET} Quit the Forge"
        echo ""
        echo -e -n "\\\${C_BOLD}Your choice: \\\${C_RESET}"
        read -r choice

        case \$choice in
            1) run_ritual "The True Ritual of Insight (\`khws\`)" "\$RITUAL_KHWS_B64" ;;
            2) show_header; echo -e "\\\${C_BLUE}Please perform the multi-step Keystone Ritual using the web UI for now.\\\${C_RESET}"; press_enter_to_continue ;;
            3) show_header; echo -e "\\\${C_BLUE}Please use the commands from the web UI to use the Athenaeum Scryer.\\\${C_RESET}"; press_enter_to_continue ;;
            [Qq]) clear; echo -e "\\\${C_DRAGON}Farewell, Architect. The forge awaits your return.\\n\\\${C_RESET}" ; exit 0 ;;
            *) echo -e "\\n\\\${C_RED}Invalid choice. Please try again.\\n\\\${C_RESET}" ; sleep 1 ;;
        esac
    done
}

# --- Script Entry Point ---
main_menu
`;

    // This is the installer part that wraps the main TUI script.
    const installerScript = `#!/bin/bash
# Kael Forge TUI Installer - v1.2
# This script installs the Kael Forge TUI.

set -euo pipefail

# --- Installer Logic ---
install_tui() {
    INSTALL_DIR="\$HOME/.local/bin"
    INSTALL_PATH="\$INSTALL_DIR/kael-forge"
    LOGIN_SHELL_PATH=\$(getent passwd \$USER | cut -d: -f7)
    CONFIG_SHELL="\${LOGIN_SHELL_PATH##*/}"

    echo "--- Installing Kael Forge TUI ---"
    
    mkdir -p "\$INSTALL_DIR"
    
    # Write the main TUI script (which is embedded here) to the install path
    echo "--> Forging the TUI executable..."
    # The '-r' prevents backslash escapes from being interpreted by echo.
    # Using a temporary variable to hold the script content
    TUI_CONTENT='${tuiScript}'
    echo -E "\$TUI_CONTENT" > "\$INSTALL_PATH"

    chmod +x "\$INSTALL_PATH"
    echo "--> TUI script created at \$INSTALL_PATH"

    echo "--> Checking system PATH for \$INSTALL_DIR..."
    if [[ ":\$PATH:" != *":\$INSTALL_DIR:"* ]]; then
        echo "--> Directory not in PATH. Adding it to your shell profile."
        
        if [ "\$CONFIG_SHELL" = "fish" ]; then
            if ! fish -c "contains \\\$INSTALL_DIR \\\$fish_user_paths"; then
                fish -c "set -U fish_user_paths \\\$INSTALL_DIR \\\$fish_user_paths"
                echo "--> Added to fish_user_paths. Please open a NEW terminal."
            else
                echo "--> Already in fish_user_paths. No changes needed."
            fi
        elif [ "\$CONFIG_SHELL" = "zsh" ] || [ "\$CONFIG_SHELL" = "bash" ]; then
            PROFILE_FILE=""
            if [ "\$CONFIG_SHELL" = "zsh" ]; then
                PROFILE_FILE="\$HOME/.zshrc"
            else
                PROFILE_FILE="\$HOME/.bashrc"
            fi
            
            if ! grep -q "Kael Forge TUI" "\$PROFILE_FILE" 2>/dev/null; then
                echo -e '\\n# Add Kael Forge TUI to PATH\\nexport PATH="\$HOME/.local/bin:\$PATH"' >> "\$PROFILE_FILE"
                echo "--> Added to \$PROFILE_FILE. Please run 'source \$PROFILE_FILE' or open a NEW terminal."
            else
                 echo "--> Configuration already present in \$PROFILE_FILE. No changes needed."
            fi
        else
            echo "--> Unsupported shell: \$CONFIG_SHELL. Please add \$INSTALL_DIR to your PATH manually."
        fi
    else
        echo "--> Directory is already in your PATH. No changes needed."
    fi
    
    echo ""
    echo -e "✅ Installation Complete!"
    echo "Run 'kael-forge' in a new terminal to start."
}

install_tui
`;
    return installerScript;
};
