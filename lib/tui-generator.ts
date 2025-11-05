export const generateTuiInstallerScript = (): string => {

const TUI_SCRIPT_RAW = `#!/bin/bash
# Kael OS Forge - TUI v1.2
# A command-line interface for all our sacred rituals.

set -euo pipefail

# --- CONFIGURATION & VERSION ---
TUI_VERSION="1.2"
UPDATE_SOURCE_URL="https://raw.githubusercontent.com/LeeTheOrc/Kael-OS/main/components/TuiInstallerModal.tsx"

# --- STYLING & HELPERS ---
C_RESET='\\033[0m'
C_DRAGON_FIRE='\\033[38;5;220m' # Gold/Yellow
C_ORC_STEEL='\\033[38;5;121m'   # Green
C_MAGIC_PURPLE='\\033[38;5;171m' # Purple
C_CYAN='\\033[38;5;87m'
C_GRAY='\\033[38;5;244m'

print_header() {
    clear
    echo -e "\$C_DRAGON_FIRE"
    echo "    .        .         .        .      .       ."
    echo "    |        |         |        |      |       |"
    echo "  --== Kael OS Forge TUI ==--  --== Kael OS Forge TUI ==--"
    echo "    |        |         |        |      |       |"
    echo "    '        '         '        '      '       '"
    echo -e "\$C_RESET"
    echo -e "\$C_MAGIC_PURPLE    \$1\$C_RESET"
    echo -e "\$C_GRAY-----------------------------------------------------\$C_RESET"
}

press_enter_to_continue() {
    echo ""
    read -p "\$(echo -e "\$C_ORC_STEEL[PROMPT]\$C_RESET Press Enter to return to the main menu...")"
}

# --- SELF-UPDATE MECHANISM ---
check_for_updates() {
    if ! command -v curl &> /dev/null; then
        echo -e "\$C_GRAY[INFO] curl is not installed. Skipping update check.\$C_RESET"
        sleep 2
        return
    fi
    
    echo -e "\$C_GRAY--> Checking for updates...\$C_RESET"
    LATEST_SOURCE_FILE=\$(curl -s "\$UPDATE_SOURCE_URL")
    
    if [ -z "\$LATEST_SOURCE_FILE" ]; then
        return # Silently fail if offline or URL is broken
    fi

    LATEST_INSTALLER_CONTENT=\$(echo "\$LATEST_SOURCE_FILE" | sed -n '/const INSTALL_SCRIPT_RAW = \\\`/,/^\\\`;\\\$/p' | sed '1d;\\$d')
    if [ -z "\$LATEST_INSTALLER_CONTENT" ]; then return; fi

    LATEST_VERSION=\$(echo "\$LATEST_INSTALLER_CONTENT" | grep "TUI_VERSION=" | head -n 1 | cut -d'"' -f2)
    if [ -z "\$LATEST_VERSION" ]; then return; fi

    if [ "\$LATEST_VERSION" != "\$TUI_VERSION" ]; then
        print_header "Update Available"
        echo -e "\$C_DRAGON_FIRE[UPDATE]\$C_RESET A new version (\$LATEST_VERSION) of Kael Forge is available!"
        read -p "\$(echo -e "\$C_ORC_STEEL[PROMPT]\$C_RESET Would you like to update now? [Y/n]: ")" choice
        if [ -z "\$choice" ]; then choice="Y"; fi
        if [[ "\$choice" =~ ^[Yy]$ ]]; then
            echo "--> Updating Kael Forge TUI..."
            ENCODED_SCRIPT=\$(printf "%s" "\$LATEST_INSTALLER_CONTENT" | base64 -w 0)
            echo "\$ENCODED_SCRIPT" | base64 --decode | bash

            echo -e "\$C_ORC_STEEL[SUCCESS]\$C_RESET Update complete! Restarting..."
            sleep 2
            exec "\$0" "\$@"
            exit 0
        else
            echo "Update skipped. Continuing with current version."
            sleep 1
        fi
    fi
}

# --- RITUAL FUNCTIONS ---

run_keystone_rituals() {
    print_header "Keystone Rituals: Forging the Athenaeum"
    echo "This is a one-time setup to establish our package repository."
    echo "1. Prepare the Forge (Install tools, log in)"
    echo "2. Forge Master Key & Recipes"
    echo "3. Publish Foundational Artifacts"
    echo "4. All Steps (Automated)"
    read -p "\$(echo -e "\$C_ORC_STEEL[PROMPT]\$C_RESET Enter choice [1-4]: ")" choice

    run_prepare_script() {
        bash << 'PREPARE_EOF'
set -e
sudo pacman -S git github-cli base-devel --noconfirm
# We suggest defaults, but the user can change them if they are savvy.
git config --global user.name "LeeTheOrc"
git config --global user.email "leetheorc@gmail.com"
echo "--> You will now be prompted to log into GitHub."
gh auth login
if [ -d "$HOME/kael-os-repo" ]; then
    echo "--> Athenaeum found locally. Updating..."
    cd ~/kael-os-repo && git pull
else
    echo "--> Cloning the Athenaeum for the first time..."
    cd ~ && git clone https://github.com/LeeTheOrc/kael-os-repo.git
fi
PREPARE_EOF
    }

    run_key_recipe_script() {
        bash << 'KEY_RECIPE_EOF'
set -e
echo "--> Searching for the 'Kael OS Master Key'..."
GPG_KEY_ID=$(gpg --list-secret-keys --with-colons "Kael OS Master Key" 2>/dev/null | awk -F: '$1 == "sec" { print $5 }' | head -n 1)

if [ -z "$GPG_KEY_ID" ]; then
    echo "--> Specific 'Kael OS Master Key' not found. Searching for any available key..."
    GPG_KEY_ID=$(gpg --list-secret-keys --with-colons 2>/dev/null | awk -F: '$1 == "sec" { print $5 }' | head -n 1)
    if [ ! -z "$GPG_KEY_ID" ]; then
        KEY_INFO=$(gpg --list-secret-keys "$GPG_KEY_ID" | grep 'uid')
        echo ""
        echo "[ATTENTION] Using the first available GPG key found on your system:"
        echo "    Key ID: $GPG_KEY_ID"
        echo "    Owner: $KEY_INFO"
        read -p "    Use this key for signing? [Y/n]: " use_key_confirm
        if [ -z "$use_key_confirm" ]; then use_key_confirm="Y"; fi
        if [[ ! "$use_key_confirm" =~ ^[Yy]$ ]]; then
            GPG_KEY_ID="" # Unset the key ID to proceed to creation
        fi
    fi
fi

if [ -z "$GPG_KEY_ID" ]; then
    echo "--> No GPG keys found or you opted not to use the found key. Let us forge one now."
    echo "    Please follow the prompts with these values:"
    echo "    -> Kind of key: (1) RSA and RSA"
    echo "    -> Keysize: 4096"
    echo "    -> Expires: 0 (does not expire)"
    echo "    -> Real name: Kael OS Master Key"
    echo "    -> Email address: leetheorc@gmail.com"
    echo "    -> And a secure passphrase you can remember!"
    gpg --full-generate-key
    GPG_KEY_ID=$(gpg --list-secret-keys --with-colons "Kael OS Master Key" 2>/dev/null | awk -F: '$1 == "sec" { print $5 }' | head -n 1)
    if [ -z "$GPG_KEY_ID" ]; then
        echo "ERROR: Key creation failed or name does not exactly match 'Kael OS Master Key'."
        exit 1
    fi
    echo "[SUCCESS] Master Key forged successfully! Key ID: $GPG_KEY_ID"
else
    echo "[SUCCESS] Found and will use GPG Key ID: $GPG_KEY_ID"
fi

echo "--> Exporting public key..."
gpg --armor --export "$GPG_KEY_ID" > ~/kael-os.asc

echo "--> Forging recipe for kael-keyring..."
mkdir -p ~/packages/kael-keyring
mv ~/kael-os.asc ~/packages/kael-keyring/
cat > ~/packages/kael-keyring/PKGBUILD << 'PKGBUILD_EOF'
# Maintainer: The Architect <leetheorc@gmail.com>
pkgname=kael-keyring
pkgver=1
pkgrel=1
pkgdesc="Kael OS Master Keyring"
arch=('any')
license=('GPL')
source=('kael-os.asc')
sha256sums=('SKIP')

package() {
    install -Dm644 "$srcdir/kael-os.asc" "$pkgdir/usr/share/pacman/keyrings/kael-os.gpg"
}
PKGBUILD_EOF

echo "--> Forging recipe for kael-pacman-conf..."
mkdir -p ~/packages/kael-pacman-conf
cat > ~/packages/kael-pacman-conf/kael-os.conf << 'CONF_EOF'
[kael-os]
SigLevel = Required DatabaseOptional
Server = https://leetheorc.github.io/kael-os-repo/$arch
CONF_EOF

cat > ~/packages/kael-pacman-conf/PKGBUILD << 'PKGBUILD_EOF2'
# Maintainer: The Architect <leetheorc@gmail.com>
pkgname=kael-pacman-conf
pkgver=1
pkgrel=1
pkgdesc="Pacman configuration for the Kael OS repository"
arch=('any')
license=('GPL')
source=('kael-os.conf')
sha256sums=('SKIP')

package() {
    install -Dm644 "$srcdir/kael-os.conf" "$pkgdir/etc/pacman.d/kael-os.conf"
}
PKGBUILD_EOF2

echo ""
echo "[SUCCESS] Foundational recipes have been forged in ~/packages/"
KEY_RECIPE_EOF
    }
    
    run_publish_script() {
        bash << 'PUBLISH_EOF'
set -e
echo "--> Searching for GPG key for signing..."
GPG_KEY_ID=$(gpg --list-secret-keys --with-colons "Kael OS Master Key" 2>/dev/null | awk -F: '$1 == "sec" { print $5 }' | head -n 1)
if [ -z "$GPG_KEY_ID" ]; then
    echo "--> 'Kael OS Master Key' not found. Using first available secret key."
    GPG_KEY_ID=$(gpg --list-secret-keys --with-colons 2>/dev/null | awk -F: '$1 == "sec" { print $5 }' | head -n 1)
fi
if [ -z "$GPG_KEY_ID" ]; then
    echo "ERROR: Could not find any GPG secret key for signing. Aborting."
    exit 1
fi
echo "[SUCCESS] Using Master Key: $GPG_KEY_ID for signing."

echo "--> Building kael-keyring..."
cd ~/packages/kael-keyring
makepkg -sf --sign --key "$GPG_KEY_ID" --skippgpcheck --noconfirm
mv *.pkg.tar.zst* ~/kael-os-repo/

echo "--> Building kael-pacman-conf..."
cd ~/packages/kael-pacman-conf
makepkg -sf --sign --key "$GPG_KEY_ID" --skippgpcheck --noconfirm
mv *.pkg.tar.zst* ~/kael-os-repo/

echo "--> Committing new artifacts to the Athenaeum..."
cd ~/kael-os-repo
repo-add kael-os-repo.db.tar.gz *.pkg.tar.zst
git add .
git commit -m "feat: Establish Athenaeum foundation"
git push

echo ""
echo "[SUCCESS] Foundation laid. The Athenaeum is now live."
PUBLISH_EOF
    }

    case \$choice in
        1) run_prepare_script ;;
        2) run_key_recipe_script ;;
        3) run_publish_script ;;
        4) run_prepare_script && run_key_recipe_script && run_publish_script ;;
        *) echo "Invalid choice." ;;
    esac
    press_enter_to_continue
}

run_publish_package() {
    local package_name=\$1
    if [ -z "\$package_name" ]; then echo "No package name provided to publisher."; return 1; fi
    
    # This script is fed into a new bash instance, receiving the package name as its first argument (\$1).
    # The delimiter is single-quoted to prevent variable expansion by the outer shell.
    bash -s -- "\$package_name" << 'PUBLISH_PACKAGE_EOF'
set -euo pipefail

PACKAGE_NAME="$1"
PACKAGE_DIR="$HOME/packages/$PACKAGE_NAME"
REPO_DIR="$HOME/kael-os-repo"

if [ ! -d "$PACKAGE_DIR" ] || [ ! -f "$PACKAGE_DIR/PKGBUILD" ]; then
    echo "ERROR: Package directory '$PACKAGE_DIR' not found or is missing a PKGBUILD."
    exit 1
fi

echo "--> Searching for GPG key for signing..."
SIGNING_KEY_ID=$(gpg --list-secret-keys --with-colons "Kael OS Master Key" 2>/dev/null | awk -F: '$1 == "sec" { print $5 }' | head -n 1)
if [ -z "$SIGNING_KEY_ID" ]; then
    SIGNING_KEY_ID=$(gpg --list-secret-keys --with-colons 2>/dev/null | awk -F: '$1 == "sec" { print $5 }' | head -n 1)
fi
if [ -z "$SIGNING_KEY_ID" ]; then
    echo "ERROR: Could not find any GPG secret key for signing."
    exit 1
fi
echo "[SUCCESS] Using Master Key: $SIGNING_KEY_ID for signing."

# Change to the package directory to build it
cd "$PACKAGE_DIR"
makepkg -sf --sign --key "$SIGNING_KEY_ID" --skippgpcheck --noconfirm

PACKAGE_FILE=$(find . -name "*.pkg.tar.zst" -print -quit)
if [ -z "$PACKAGE_FILE" ]; then
    echo "ERROR: Build failed."
    exit 1
fi

EXPANDED_REPO_DIR=$(eval echo $REPO_DIR)
# We need to move the file from the package dir to the repo dir
mv "$PACKAGE_FILE"* "$EXPANDED_REPO_DIR/"

# Now, change to the repo directory to update it
cd "$EXPANDED_REPO_DIR"

repo-remove kael-os-repo.db.tar.gz "$(basename "$PACKAGE_FILE" .pkg.tar.zst)" 2>/dev/null || true
repo-add kael-os-repo.db.tar.gz "$(basename "$PACKAGE_FILE")"

git add .
git commit -m "feat: Add/update package $PACKAGE_NAME"
git push

echo "--- Artifact published to the Athenaeum. ---"
PUBLISH_PACKAGE_EOF
}

run_khws_ritual() {
    print_header "Ritual of Insight: Forging 'khws'"
    echo "This ritual packages the CachyOS 'chwd' source code as 'khws'"
    echo "and publishes it to our Athenaeum."
    echo ""

    read -p "\$(echo -e "\$C_ORC_STEEL[PROMPT]\$C_RESET Source type (folder/archive) [folder]: ")" src_type
    if [ -z "\$src_type" ]; then src_type="folder"; fi

    if [ "\$src_type" != "folder" ] && [ "\$src_type" != "archive" ]; then
        echo "Invalid source type. Aborting."
        press_enter_to_continue
        return
    fi
    
    read -p "\$(echo -e "\$C_ORC_STEEL[PROMPT]\$C_RESET Full path to source \$src_type: ")" src_path

    if [ -z "\$src_path" ]; then
        echo "Source path is required. Aborting."
        press_enter_to_continue
        return
    fi

    echo ""
    echo "--- Preparing to Forge ---"
    echo "Package: khws"
    echo "Source Type: \$src_type"
    echo "Source Path: \$src_path"
    read -p "\$(echo -e "\$C_ORC_STEEL[PROMPT]\$C_RESET Does this look correct? [Y/n]: ")" confirm
    if [ -z "\$confirm" ]; then confirm="Y"; fi
    if [[ ! "\$confirm" =~ ^[Yy]$ ]]; then
        echo "Aborted by user."
        press_enter_to_continue
        return
    fi

    echo "--> Preparing source files..."
    mkdir -p "\$HOME/packages/khws/src"
    if [ "\$src_type" = "folder" ]; then
        if [ ! -d "\$src_path" ]; then echo "ERROR: Source directory not found."; press_enter_to_continue; return; fi
        cp -r "\$src_path"/. "\$HOME/packages/khws/src/"
    else
        if [ ! -f "\$src_path" ]; then echo "ERROR: Source archive not found."; press_enter_to_continue; return; fi
        tar -xvf "\$src_path" -C "\$HOME/packages/khws/src" --strip-components=1
    fi
    echo "[SUCCESS] Source files prepared."

    echo "--> Scribing the recipe for 'khws'..."
    cat > "\$HOME/packages/khws/PKGBUILD" << 'PKGBUILD_EOF'
# Maintainer: The Architect & Kael <https://github.com/LeeTheOrc/Kael-OS>
# Original work by: CachyOS <ptr1337@cachyos.org>
pkgname=khws
pkgver=0.3.3
pkgrel=12
pkgdesc="Kael Hardware Scry: Kael's hardware detection tool (based on CachyOS chwd)"
arch=('x86_64')
url="https://github.com/CachyOS/chwd"
license=('GPL3')
depends=('pciutils' 'dmidecode' 'hwinfo' 'mesa-utils' 'xorg-xrandr' 'vulkan-tools' 'libdrm')
makedepends=('meson' 'ninja')
source=('src')
sha256sums=('SKIP')
noextract=("src")

build() {
    cd "$srcdir/src"
    meson setup _build --prefix=/usr --buildtype=release
    ninja -C _build
}

package() {
    cd "$srcdir/src"
    DESTDIR="$pkgdir" ninja -C _build install
}
PKGBUILD_EOF

    echo "[SUCCESS] Recipe has been scribed."

    echo "--> Initiating the Publishing Rite..."
    run_publish_package "khws"
    
    press_enter_to_continue
}


run_local_source_ritual() {
    print_header "Ritual of Local Forging (Generic)"
    read -p "Package Name: " pkgname
    read -p "Description: " pkgdesc
    read -p "Version [1.0]: " pkgver
    if [ -z "\$pkgver" ]; then pkgver="1.0"; fi
    read -p "Release [1]: " pkgrel
    if [ -z "\$pkgrel" ]; then pkgrel="1"; fi
    read -p "Source path (folder): " src_path

    if [ -z "\$pkgname" ] || [ -z "\$src_path" ]; then
        echo "Package name and source path are required."
        press_enter_to_continue
        return
    fi
    
    echo "Preparing files..."
    mkdir -p "\$HOME/packages/\$pkgname/src"
    cp -r "\$src_path"/. "\$HOME/packages/\$pkgname/src/"

    cat > "\$HOME/packages/\$pkgname/PKGBUILD" << PKGBUILD_EOF
# Maintainer: The Architect
pkgname=\${pkgname}
pkgver=\${pkgver}
pkgrel=\${pkgrel}
pkgdesc="\${pkgdesc}"
arch=('any')
license=('GPL3')
source=('src')
sha256sums=('SKIP')
noextract=("src")

build() {
    cd "\$srcdir/src"
    echo "Nothing to build."
}

package() {
    cd "\$srcdir/src"
    install -Dm 755 -t "\$pkgdir/usr/bin/" *
}
PKGBUILD_EOF

    echo "PKGBUILD created. Now publishing..."
    
    run_publish_package "\$pkgname"
    press_enter_to_continue
}

# --- MAIN MENU & LOOP ---

show_menu() {
    print_header "Main Menu"
    echo -e "\$C_ORC_STEEL  [1]\$C_RESET Keystone Rituals (One-Time Setup)"
    echo -e "\$C_ORC_STEEL  [2]\$C_RESET Ritual of Insight (Forge 'khws')"
    echo -e "\$C_ORC_STEEL  [3]\$C_RESET Ritual of Local Forging (Generic)"
    echo ""
    echo -e "\$C_GRAY  [q] Quit\$C_RESET"
    echo ""
}

# --- SCRIPT ENTRY POINT ---
check_for_updates

while true; do
    show_menu
    read -p "\$(echo -e "\$C_ORC_STEEL[PROMPT]\$C_RESET Your choice: ")" choice
    case \$choice in
        1) run_keystone_rituals ;;
        2) run_khws_ritual ;;
        3) run_local_source_ritual ;;
        q|Q) echo "May your forge burn ever bright!"; exit 0 ;;
        *) echo "Invalid choice." ; press_enter_to_continue ;;
    esac
done
`;

const INSTALL_SCRIPT_RAW = `#!/bin/bash
set -e
INSTALL_DIR="\$HOME/.local/bin"
INSTALL_PATH="\$INSTALL_DIR/kael-forge"
# Determine the user's actual login shell, not the shell running the script.
LOGIN_SHELL_PATH=\$(getent passwd \$USER | cut -d: -f7)
CONFIG_SHELL=\$(basename "\$LOGIN_SHELL_PATH")

echo "--- Installing Kael OS Forge TUI ---"
echo "--> Detected user's login shell as '\$CONFIG_SHELL'..."

# Create installation directory
mkdir -p "\$INSTALL_DIR"

# Write the TUI script content
echo "--> Creating the kael-forge script..."
cat > "\$INSTALL_PATH" << 'KAEL_TUI_INSTALLER_EOF'
\${TUI_SCRIPT_RAW}
KAEL_TUI_INSTALLER_EOF

# Make it executable
chmod +x "\$INSTALL_PATH"

# Check and add to PATH if necessary by modifying the appropriate shell config file.
echo "--> Checking shell configuration for PATH..."
if [ "\$CONFIG_SHELL" = "fish" ]; then
    # For fish, we use a universal variable which applies immediately to new shells.
    echo "--> Configuring fish shell PATH..."
    # We execute a fish command directly from our bash script.
    # The 'if contains' check prevents adding the path if it's already there.
    fish -c 'if not contains $HOME/.local/bin $fish_user_paths; set -U fish_user_paths $HOME/.local/bin $fish_user_paths; echo "--> Kael Forge path added to fish shell."; else echo "--> Kael Forge path already configured for fish."; end'
    echo "--> Configuration complete. Please open a NEW terminal tab or window."
else
    # For bash/zsh, we add an export command if it's not already there.
    PROFILE_FILE=""
    if [ "\$CONFIG_SHELL" = "zsh" ]; then
        PROFILE_FILE="\$HOME/.zshrc"
    else
        PROFILE_FILE="\$HOME/.bashrc"
    fi
    echo "--> Will check profile file: '\$PROFILE_FILE'"
    touch "\$PROFILE_FILE"
    if ! grep -q "export PATH=.*\$INSTALL_DIR" "\$PROFILE_FILE"; then
        echo "Adding \$INSTALL_DIR to your PATH in \$PROFILE_FILE"
        echo -e '\\n# Add Kael Forge TUI to PATH\\nexport PATH="\$INSTALL_DIR:\$PATH"' >> "\$PROFILE_FILE"
        echo "--> Path updated. Please run 'source \$PROFILE_FILE' or restart your terminal."
    else
        echo "--> Kael Forge path seems to be already configured in \$PROFILE_FILE."
    fi
fi

echo ""
echo "✅ Installation Complete!"
echo "Run 'kael-forge' to start the TUI."
`;

    return INSTALL_SCRIPT_RAW;
};