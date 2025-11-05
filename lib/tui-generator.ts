// This file generates a self-contained bash script that provides a
// terminal-based UI (TUI) for managing the Kael OS development workflow.

const generateKhwsRitualScript = (): string => {
    // This is the exact PKGBUILD content, with shell variables escaped
    // so they are treated as literals within the JS template string.
    const PKGBUILD_CONTENT = `
# Maintainer: The Architect & Kael <https://github.com/LeeTheOrc/Kael-OS>
# Original work by: CachyOS <ptr1337@cachyos.org>

_realname=chwd
pkgname=khws
pkgver=1.16.1
pkgrel=1
pkgdesc="Kael Hardware Scry: Kael's hardware detection tool (based on CachyOS chwd)"
arch=('x86_64')
url="https://github.com/CachyOS/\${_realname}"
license=('GPL3')
depends=('pciutils' 'dmidecode' 'hwinfo' 'mesa-utils' 'xorg-xrandr' 'vulkan-tools' 'libdrm')
makedepends=('rust' 'cargo' 'git')
source=("\${_realname}::git+\${url}.git#tag=\${pkgver}")
sha256sums=('SKIP')

prepare() {
	cd "\${_realname}"
	git submodule update --init
}

build() {
    cd "\${_realname}"
    cargo build --release --locked --all-features
}

package() {
    cd "\${_realname}"
    install -Dm755 target/release/chwd "$pkgdir/usr/bin/khws"
    install -Dm755 target/release/chwd-kernel "$pkgdir/usr/bin/khws-kernel"
    install -Dm644 -t "$pkgdir/usr/share/licenses/\$pkgname/" LICENSE
}
`.trim();

    // The script that will be executed. It's the same logic as the modal.
    const RITUAL_SCRIPT_RAW = `#!/bin/bash
# Kael OS - Unified Ritual of Insight for 'khws'
set -euo pipefail

echo "--- Beginning the Ritual of Insight ---"
echo "This incantation will forge the 'khws' recipe and publish it to the Athenaeum."

# Ensure the packages directory exists.
mkdir -p ~/packages

# Step 1: Check for and forge the Unified Publisher Script if missing
if [ ! -f "$HOME/packages/publish-package.sh" ]; then
    echo "--> 'publish-package.sh' not found. Forging it now..."
    # The script content is embedded here via Base64 to ensure integrity.
    PUBLISHER_SCRIPT_B64='IyEvYmluL2Jhc2gKIyBLYWVsIE9TIC0gQXRoZW5hZXVtIFB1Ymxpc2hlciBTY3JpcHQgKHY1IC0gd2l0aCBwcmUtZmxpZ2h0IGNoZWNrcykKIyBGb3JnZXMgYSBwYWNrYWdlLCBzaWducyBpdCwgYW5kIHB1Ymxpc2hlcyBpdC4KCnNldCAtZXVvIHBpcGVmYWlsCgojIC0tLSBQUkUtRkxJR0hUIENIRUNLUyAtLS0KaWYgISBjb21tYW5kIC12IGdpdCAmPiAvZGV2L251bGw7IHRoZW4KICAgIGVjaG8gIkVSUk9SOiAnZ2l0JyBpcyBub3QgaW5zdGFsbGVkLiBQbGVhc2UgcnVuIFN0ZXAgMSBvZiB0aGUgS2V5c3RvbmUgUml0dWFsLiIgPiYyCiAgICBleGl0IDEKZmkKaWYgISBjb21tYW5kIC12IGdoICY+IC9kZXYvbnVsbDsgdGhlbgogICAgZWNobyAiRVJST1I6IEdpdEh1YiBDTEkgJ2doJyBpcyBub3QgaW5zdGFsbGVkLiBQbGVhc2UgcnVuIFN0ZXAgMSBvZiB0aGUgS2V5c3RvbmUgUml0dWFsLiIgPiYyCiAgICBleGl0IDEKZmkKaWYgISBnaCBhdXRoIHN0YXR1cyAmPiAvZGV2L251bGw7IHRoZW4KICAgIGVjaG8gIkVSUk9SOiBZb3UgYXJlIG5vdCBhdXRoZW50aWNhdGVkIHdpdGggR2l0SHViLiBQbGVhc2UgcnVuICdnaCBhdXRoIGxvZ2luJyBvciBTdGVwIDEgb2YgdGhlIEtleXN0b25lIFJpdHVhbC4iID4mMgogICAgZXhpdCAxCmZpCmlmICEgY29tbWFuZCAtdiByZXBvLWFkZCAmPiAvZGV2L251bGw7IHRoZW4KICAgIGVjaG8gIkVSUk9SOiAncmVwby1hZGQnIGlzIG5vdCBpbnN0YWxsZWQuIEl0IGlzIHBhcnQgb2YgJ3BhY21hbi1jb250cmliJy4gUGxlYXNlIHJ1biAnc3VkbyBwYWNtYW4gLVMgcGFjbWFuLWNvbnRyaWInLiIgPiYyCiAgICBleGl0IDEKZmkKCiMgLS0tIENPTkZJR1VSQVRJT04gLS0tClJFUE9fRElSPSJ+L2thZWwtb3MtcmVwbyIKUEFDS0FHRV9OQU1FPSQxCiMgLS0tIFNDUklQVCBTVEFSVCAtLS0KZWNobyAiLS0tIFByZXBhcmluZyB0aGUgRm9yZ2UgZm9yIHBhY2thZ2U6ICRQQUNLQUdFX05BTUUgLS0tIgoKIyAtLS0gVkFMSURBVElPTiAtLS0KaWYgWyAteiAiJFBBY2thZ2VOYW1lIiBdOyB0aGVuCiAgICBlY2hvICJFUlJPUjogWW91IG11c3Qgc3BlY2lmeSBhIHBhY2thZ2UgZGlyZWN0b3J5IHRvIGJ1aWxkLiIKICAgIGVjaG8gIlVzYWdlOiAuL3B1Ymxpc2gtcGFja2FnZS5zaCA8cGFja2FnZV9uYW1lPiIKICAgIGV4aXQgMQpmaQppZiBbICEgLWQgIiRQQUNLQUdFX05BTUUiIF0gfHwgWyAhIC1mICIkUEFDS0FHRV9OQU1FL1BLR0JVSUxEIiBdOyB0aGVuCiAgICBlY2hvICJFUlJPUjogRGlyZWN0b3J5ICckUEFDS0FHRV9OQU1FJyBkb2VzIG5vdCBleGlzdCBvciBkb2VzIG5vdCBjb250YWluIGEgUEtHQlVJTEQuIgogICAgZXhpdCAxCmZpCgojIC0tLSBBVVRPLVNJR05JTkcgTE9HSUMgLS0tCmVjaG8gIi0tPiBTZWFyY2hpbmcgZm9yIEdQRyBrZXkgZm9yIHNpZ25pbmcuLi4iCiMgRmlyc3QsIHRyeSB0byBmaW5kIHRoZSBzcGVjaWZpYyAnS2FlbCBPUyBNYXN0ZXIgS2V5Jy4KU0lHTklOR19LRVlfSUQ9JChncGcgLS1saXN0LXNlY3JldC1rZXlzIC0td2l0aC1jb2xvbnMgIkthZWwgT1MgTWFzdGVyIEtleSIgMj4vZGV2L251bGwgfCBhd2sgLUY6ICckMSA9PSAic2VjIiB7IHByaW50ICQ1IH0nIHwgaGVhZCAtbiAxKQoKIyBJZiBub3QgZm9undwgZmFsbCBidWNrIHRvIHRoZSBmaXJzdCBhdmFpbGFibGUgc2VjcmV0IGtleS4KaWYgWyAteiAiJFNJR05JTkdfS0VZX0lEIiBdOyB0aGVuCiAgICBlY2hvICItLT4gJ0thZWwgT1MgTWFzdGVyIEtleScgbm90IGZvdW5kLiBVc2luZyBmaXJzdCBhdmFpbGFibGUgc2VjcmV0IGtleS4iCiAgICBTSUdOSU5HX0tFWV9JRD0kKGdwZyAtLWxpc3Qtc2VjcmV0LWtleXMgLS13aXRoLWNvbG9ucyAyPi9kZXYvbnVsbCB8IGF3ayAtRjogJyQxID09ICJzZWMiIHsgcHJpbnQgJDUgfScgfCBoZWFkIC1uIDEpCmZpCgojIElmIHN0aWxsIG5vIGtleSwgdGhlbiB3ZSBjYW5ub3QgcHJvY2VlZC4KaWYgWyAteiAiJFNJR05JTkdfS0VZX0lEIiBdOyB0aGVuCiAgICBlY2hvICJFUlJPUjogQ291bGQgbm90IGZpbmQgYW55IEdQRyBzZWNyZXQga2V5IGZvciBzaWduaW5nLiBBYm9ydGluZy4iCiAgICBlY2hvICJQbGVhc2UgZW5zdXJlIHlvdSBoYXZlIGEgR1BHIGtleSBieSBydW5uaW5nIFN0ZXAgMiBvZiB0aGUgS2V5c3RvbmUgUml0dWFsLiIKICAgIGV4aXQgMQpmaQoKZWNobyAiW1NVQ0NFU1NdIFVzaW5nIE1hc3RlciBLZXk6ICRTSUdOSU5HX0tFWV9JRCBmb3Igc2lnbmluZy4iCgojIC0tLSBGT1JHSU5HIC0tLQplY2hvICItLT4gRW50ZXJpbmcgdGhlIGZvcmdlIGZvciBwYWNrYWdlOiAkUEFDS0FHRV9OQU1FLi4uIgpkZWNsYXJlIC1hIG1ha2Vwa2dfYXJncyAoXQptYWtlcGtnX2FyZ3MrPSgtc2YpCm1ha2Vwa2dfYXJncysoLS1zaWduKQptYWtlcGtnX2FyZ3MrPSgtLWtleikKbWFrZXBrZ19hcmdzKz0oIlNESUdOSU5HX0tFWV9JRCIpCm1ha2Vwa2dfYXJncysoLS1za2lwcGdwY2hlY2spCm1ha2Vwa2dfYXJncysoLS1ub25jb25maXJtKQoKY2QgIiRQQUNLQUdFX05BTUUiCgplY2hvICItLT4gRm9yZ2luZyBhbmQgc2lnbmluZyB0aGUgcGFja2FnZSAobWFrZXBrZykuLi4iCm1ha2Vwa2cg"\${mYWtlcGtnX2FyZ3N[@]}"CgpQQUNLQUdFX0ZJTEU9JChmaW5kIC4gLW5hbWUgIioucGtnLnRhci56c3QiIC1wcmludCAtcXVpdCkKaWYgWyAteiAiJFBBY2thZ2VGaWxlIiBdOyB0aGVuCiAgICBlY2hvICJFUlJPUjogQnVpbGQgZmFpbGVkLiBObyBwYWNrYWdlIGZpbGUgd2FzIGNyZWF0ZWQuIgogICAgZXhpdCAxCmZpCgojIC0tLSBQVUJMSVNISU5HIC0tLQpFWFBBTkRFRF9SRVBPX0RJUj0kKGV2YWwgZWNobyAkUkVQT19ESVIpCmVjaG8gIi0tPiBNb3ZpbmcgZm9yZ2VkIGFydGlmYWN0IHRvIHRoZSBBdGhlbmFldW06ICRFWFBBTkRFRF9SRVBPX0RJUiIKbXYgIiRQQUNLQUdFX0ZJTEUiKiAiJEVYUEFOREVEX1JFUE9fRElSIiAvICMgTW92ZSBib3RoIHRoZSBwYWNrYWdlIGFuZCBpdHMgLnNpZyBmaWxlCgpjZCAiJEVYUEFOREVEX1JFUE9fRElSIgplY2hvICItLT4gVXBkYXRpbmcgdGhlIEF0aGVuYWV1bSdzIGdyaW1vaXJlIChkYXRhYmFzZSkuLi4iCiMgUmVtb3ZlIG9sZCBwYWNrYWdlIGVudHJ5IGZpcnN0IHRvIHByZXZlbnQgZHVwbGljYXRlcy5yZXBvLXJlbW92ZSBrYWVsLW9zLXJlcG8uZGIudGFyLmd6ICIkKGJhc2VuYW1lICIkUEFDS0FHRV9GSUxFIiAucGtnLnRhci56c3QpIiAyPi9kZXYvbnVsbCB8fCB0cnVlCnJlcG8tYWRkIGthZWwtb3MtcmVwby5kYi50YXIuZ3ogIiQoYmFzZW5hbWUgIiRQQUNLQUdFX0ZJTEUiKSIKCiMgVXBkYXRlIHRoZSBwYWNrYWdlIHNvdXJjZXMgcmVwb3NpdG9yeSBpZiBpdCBleGlzdHMKaWYgWyAtZCAiLi4vJFBBY2thZ2VOYW1lLy5naXQiIF07IHRoZW4KICAgIGVjaG8gIi0tPiBVcGRhdGluZyBzb3VyY2UgcmVwb3NpdG9yeSBmb3IgJFBBY2thZ2VOYW1lLi4uIgogICAgY2QgIi4uLyRQQUNLQUdFX05BTUUiCiAgICBnaXQgcHVsbCBvcmlnaW4gbWFzdGVyCmZpCmVjaG8gIi0tLSBDb21taXR0aW5nIHRoZSBuZXcgYXJ0aWZhY3QgdG8gdGhlIEF0aGVuYWV1bSdzIGhpc3RvcnkuLi4iCmdpdCBhZGQgLgogICAgZ2l0IGNvbW1pdCAtbSAiZmVhdDogQWRkL3VwZGF0ZSBwYWNrYWdlICRQQUNLQUdFX05BTUUiCiAgICBnaXQgcHVzaAoKZWNobyAiLS0tIFRoZSBhcnRpZmFjdCBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgcHVibGlzaGVkIHRvIHRoZSBBdGhlbmFldW0uIC0tLSI='
    echo "$PUBLISHER_SCRIPT_B64" | base64 --decode > "$HOME/packages/publish-package.sh"
    chmod +x "$HOME/packages/publish-package.sh"
    echo "[SUCCESS] 'publish-package.sh' has been forged."
fi

# Step 2: Scribe the recipe for 'khws'
echo "--> Scribing the recipe for 'khws'..."
mkdir -p ~/packages/khws
cat > ~/packages/khws/PKGBUILD << 'PKGBUILD_EOF'
${PKGBUILD_CONTENT}
PKGBUILD_EOF
echo "[SUCCESS] Recipe has been scribed."

# Step 3: Initiate the Publishing Rite
echo "--> Initiating the Publishing Rite..."
cd ~/packages
./publish-package.sh khws

echo "--- The Ritual of Insight is Complete ---"
`;
    
    // Return the Base64 encoded version for embedding in the TUI
    return btoa(unescape(encodeURIComponent(RITUAL_SCRIPT_RAW)));
};


export const generateTuiInstallerScript = (): string => {

    const RITUAL_KHWS_B64 = generateKhwsRitualScript();

    // This is the main TUI script that will be written to a file.
    // It contains the menu logic and embeds other scripts as Base64 strings.
    const tuiScript = `#!/bin/bash
# Kael Forge TUI - v1.1
# A Terminal UI for managing the Kael OS development environment.

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
        echo -e " \\\${C_DRAGON}1)\\\${C_RESET} Ritual of Insight (\`khws\`) \\\${C_SECONDARY}(Forge & publish the hardware detection tool)"
        echo ""
        echo -e " \\\${C_BLUE}2)\\\${C_RESET} Forge Athenaeum Keystone \\\${C_SECONDARY}(Setup package repository)"
        echo -e " \\\${C_BLUE}3)\\\${C_RESET} Athenaeum Scryer \\\${C_SECONDARY}(Study other repos)"
        echo ""
        echo -e " \\\${C_RED}Q)\\\${C_RESET} Quit the Forge"
        echo ""
        echo -e -n "\\\${C_BOLD}Your choice: \\\${C_RESET}"
        read -r choice

        case \$choice in
            1) run_ritual "Ritual of Insight (\`khws\`)" "\$RITUAL_KHWS_B64" ;;
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
# Kael Forge TUI Installer - v1.1
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
    echo -r '${tuiScript}' > "\$INSTALL_PATH"

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
