

import type { DistroConfig } from '../types';

// This function generates the script for setting up the local AI models and the retry service.
const generateAiCoreSetupScript = (config: DistroConfig): string => {
    const primaryModel = config.localLLM;
    const secondaryModel = config.localLLM === 'phi3:mini' ? 'llama3:8b' : 'phi3:mini';

    const retryScript = `#!/bin/bash
# Kael AI Model Retry Script (The Soul-Warden)
set -e
log_info() { echo -e "\\e[34m--> \\e[0m$1"; }
log_warn() { echo -e "\\e[33m--> WARNING: \\e[0m$1"; }
DESIRED_MODELS=( "${primaryModel}" "${secondaryModel}" )
ALL_PRESENT=true
# Wait for ollama service to be ready
for i in {1..30}; do if sudo -u kael ollama list &>/dev/null; then break; fi; sleep 2; done
if ! sudo -u kael ollama list &>/dev/null; then log_warn "Soul-Warden: Ollama not running." && exit 1; fi
for model in "\${DESIRED_MODELS[@]}"; do
    if ! sudo -u kael ollama list | grep -q "^$model"; then
        ALL_PRESENT=false
        if ping -c 1 -W 5 models.ollama.ai &> /dev/null; then
             log_info "Soul-Warden: Pulling missing model: $model"
             sudo -u kael ollama pull "$model" || log_warn "Soul-Warden: Failed to pull $model."
        else
            log_warn "Soul-Warden: Network offline, skipping pull for $model."
        fi
    fi
done
if [ "$ALL_PRESENT" = true ]; then
    log_info "Soul-Warden: All models present. Disabling self."
    systemctl --user disable --now kael-model-retry.timer
fi
`;

    const serviceFile = `[Unit]
Description=Kael AI - Retry downloading missing LLM models (Soul-Warden)
After=network-online.target
[Service]
Type=oneshot
ExecStart=%h/.local/bin/kael-model-retry.sh
[Install]
WantedBy=default.target
`;

    const timerFile = `[Unit]
Description=Run Kael AI model downloader periodically (Soul-Warden)
[Timer]
OnBootSec=15min
OnUnitActiveSec=2h
RandomizedDelaySec=30min
[Install]
WantedBy=timers.target
`;

    return `
    log_info "Creating system user 'kael' for the AI Guardian..."
    if ! id -u "kael" >/dev/null 2>&1; then
        useradd -m -G wheel -s /bin/bash kael
        passwd -l kael
    else
        usermod -aG wheel kael
    fi

    log_info "Hiding 'kael' user from login screens..."
    if pacman -Qs sddm > /dev/null; then
        mkdir -p /etc/sddm.conf.d
        echo -e "[Users]\\nHideUsers=kael" > /etc/sddm.conf.d/kael-hide.conf
    fi

    log_info "Enabling Ollama service..."
    systemctl enable --now ollama

    log_info "Downloading local consciousness models. This may take some time."
    MODELS_TO_INSTALL=("${primaryModel}" "${secondaryModel}")
    FAILED_MODELS=()
    for model in "\${MODELS_TO_INSTALL[@]}"; do
        log_info "Attempting to download: \$model"
        if sudo -u kael ollama pull "\$model"; then
            log_success "Successfully downloaded '\$model'."
        else
            log_warn "Failed to download '\$model'. A background task will retry."
            FAILED_MODELS+=("\$model")
        fi
    done

    if [ \${#FAILED_MODELS[@]} -gt 0 ]; then
        log_info "Scheduling the Soul-Warden to find missing models..."
        RETRY_SCRIPT_PATH="/home/kael/.local/bin/kael-model-retry.sh"
        SERVICE_FILE_PATH="/home/kael/.config/systemd/user/kael-model-retry.service"
        TIMER_FILE_PATH="/home/kael/.config/systemd/user/kael-model-retry.timer"
        sudo -u kael mkdir -p "/home/kael/.local/bin" "/home/kael/.config/systemd/user"
        echo -e '${retryScript}' | sudo -u kael tee "\$RETRY_SCRIPT_PATH" > /dev/null
        sudo -u kael chmod +x "\$RETRY_SCRIPT_PATH"
        echo -e '${serviceFile}' | sudo -u kael tee "\$SERVICE_FILE_PATH" > /dev/null
        echo -e '${timerFile}' | sudo -u kael tee "\$TIMER_FILE_PATH" > /dev/null
        log_info "Enabling lingering for 'kael' to allow background services..."
        loginctl enable-linger kael

        log_info "Enabling the Soul-Warden's systemd timer for user 'kael'..."
        sudo -u kael XDG_RUNTIME_DIR="/run/user/\$(id -u kael)" systemctl --user daemon-reload
        sudo -u kael XDG_RUNTIME_DIR="/run/user/\$(id -u kael)" systemctl --user enable --now kael-model-retry.timer
    fi
`;
};

// Main function to generate the entire script
export const generateAICoreScript = (config: DistroConfig): string => {
    
    // Main script structure with helper functions
    const scriptHeader = `#!/bin/bash
# Kael AI System Attunement Script v5.2 (Adamantite Key)
set -euo pipefail

# --- Logging Helpers ---
log_info() { echo -e "\\e[34m--> \\e[0m$1"; }
log_warn() { echo -e "\\e[33m--> WARNING: \\e[0m$1"; }
log_error() { echo -e "\\e[31m--> ERROR: \\e[0m$1"; }
log_success() { echo -e "\\e[32m--> SUCCESS: \\e[0m$1"; }

# --- SCRIPT START ---
log_info "--- Kael AI System Attunement ---"

# --- PART 1: REPOSITORY SETUP ---
log_info "Configuring external repositories..."
add_repo_if_not_exists() {
    local repo_name="$1"
    local repo_conf="$2"
    if ! grep -q "^\\[$repo_name\\]" /etc/pacman.conf; then
        log_info "Adding '$repo_name' repository..."
        echo -e "$repo_conf" | tee -a /etc/pacman.conf > /dev/null
    else
        log_info "'$repo_name' repository already configured."
    fi
}
log_info "Initializing and populating the system keyring..."
pacman-key --init
pacman-key --populate archlinux

`;

    const cachyRepoScript = config.extraRepositories.includes('cachy') ? `
KEY_ID="F3B607488DB35A47"
log_info "Attuning to the CachyOS Forge..."
if ! (pacman-key --recv-keys "$KEY_ID" --keyserver hkp://keyserver.ubuntu.com || pacman-key --recv-keys "$KEY_ID" --keyserver hkp://keys.openpgp.org); then
    log_warn "Keyserver failed for CachyOS key, trying direct download..."
    curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x$KEY_ID" | pacman-key --add - && pacman-key --updatedb || { log_error "Could not retrieve CachyOS key."; exit 1; }
fi
pacman-key --lsign-key "$KEY_ID"
pacman -U --noconfirm --needed 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-keyring-20240331-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-mirrorlist-22-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v3-mirrorlist-22-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v4-mirrorlist-22-1-any.pkg.tar.zst'
add_repo_if_not_exists "cachyos-v3" "\\n[cachyos-v3]\\nInclude = /etc/pacman.d/cachyos-v3-mirrorlist"
add_repo_if_not_exists "cachyos-v4" "\\n[cachyos-v4]\\nInclude = /etc/pacman.d/cachyos-v4-mirrorlist"
add_repo_if_not_exists "cachyos" "\\n[cachyos]\\nInclude = /etc/pacman.d/cachyos-mirrorlist"
` : '';

    const chaoticRepoScript = config.extraRepositories.includes('chaotic') ? `
KEY_ID="3056513887B78AEB"
log_info "Attuning to the Chaotic-AUR..."
pacman-key --recv-key "$KEY_ID" --keyserver keyserver.ubuntu.com
pacman-key --lsign-key "$KEY_ID"
pacman -U --noconfirm --needed 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'
add_repo_if_not_exists "chaotic-aur" "\\n[chaotic-aur]\\nInclude = /etc/pacman.d/chaotic-mirrorlist"
` : '';

    const kaelRepoScript = config.extraRepositories.includes('kael-os') ? `
log_info "Attuning to the Kael OS Athenaeum..."
KAEL_KEY_ID="8A7E40248B2A6582"
KEY_URL="https://leetheorc.github.io/kael-os-repo/kael-os.asc"
KEY_FILE=$(mktemp)
trap 'rm -f "$KEY_FILE"' EXIT

log_info "--> Receiving the Master Key ($KAEL_KEY_ID)..."
if pacman-key --recv-keys "$KAEL_KEY_ID" --keyserver hkp://keyserver.ubuntu.com; then
    log_success "Key received successfully from keyserver."
else
    log_warn "Keyserver failed. Attempting direct download..."
    if curl -sLf "$KEY_URL" -o "$KEY_FILE"; then
        log_info "--> Key downloaded. Purging old entry and adding new key..."
        # Purge any potentially corrupt key first
        pacman-key --delete "$KAEL_KEY_ID" &>/dev/null || true
        # Add the downloaded key from the temporary file
        if pacman-key --add "$KEY_FILE"; then
            pacman-key --updatedb
            log_success "Key added successfully from direct download."
        else
            log_error "Failed to add downloaded key."
            exit 1
        fi
    else
        log_error "Could not download Kael OS key from $KEY_URL."
        exit 1
    fi
fi

log_info "--> Signing the Master Key to establish local trust..."
if pacman-key --lsign-key "$KAEL_KEY_ID"; then
    log_success "Master Key has been locally signed."
else
    log_error "Failed to sign the Master Key. The keyring may be in an inconsistent state."
    exit 1
fi
add_repo_if_not_exists "kael-os" "\\n[kael-os]\\nSigLevel = Optional TrustAll\\nServer = https://leetheorc.github.io/kael-os-repo/\\n"
` : '';

    const syncScript = `
log_info "Synchronizing package databases and upgrading system..."
pacman -Syyu --noconfirm

log_info "Verifying Athenaeum connection..."
if pacman -Sl kael-os | grep -q 'kael-os'; then
    log_success "Athenaeum is online and serving packages."
else
    log_warn "The Kael OS Athenaeum appears to be empty or unreachable."
    log_warn "Core Kael OS packages may fail to install."
    log_warn "Please ensure you have published the packages (kael-console, etc.) using the Keystone Rituals."
fi
`;

    const processedPackages = config.packages.replace(/vscode/g, 'code').replace(/,/g, ' ');
    const packageInstallScript = `
log_info "--- Installing All Required Packages ---"
PACKAGES_TO_INSTALL="git ufw networkmanager ollama remmina btrfs-progs grub-btrfs python-prompt_toolkit base-devel pacman-contrib curl chwd ${config.kernels.join(' ')} ${config.aurHelpers.join(' ')} ${processedPackages}"
log_info "Packages to install: \$PACKAGES_TO_INSTALL"
# Use --needed to avoid re-installing packages that are already up-to-date
if ! pacman -S --noconfirm --needed \$PACKAGES_TO_INSTALL; then
    log_error "Failed to install one or more packages."
    log_error "This may be because the Kael OS Athenaeum is empty or a package name is incorrect."
    log_error "Please run the Keystone Rituals to publish the custom packages and try this ritual again."
    # We don't exit 1, to allow the rest of the script to run if possible.
fi
`;
    
    const hardwareAttunementScript = `
log_info "--- Attuning Hardware Drivers ---"
log_info "Running the Ritual of Insight (chwd) to install hardware drivers..."
chwd -a --noconfirm
`;
    
    const aiCoreScript = generateAiCoreSetupScript(config);

    const completionScript = `
# --- COMPLETION ---
echo ""
log_success "--- ✅ System Attunement Complete ---"
log_info "Log out and log back in for all changes to take effect."
`;

    // Assemble the full script
    return [
        scriptHeader,
        cachyRepoScript,
        chaoticRepoScript,
        kaelRepoScript,
        syncScript,
        packageInstallScript,
        hardwareAttunementScript,
        aiCoreScript,
        completionScript
    ].join('');
};