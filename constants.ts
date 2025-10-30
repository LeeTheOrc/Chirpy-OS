import type { DistroConfig, BuildStep, Snippet, InternalizedService } from './types';

export const AI_RESOURCE_PROFILES = {
  minimal: { name: 'Featherlight', description: 'Lowest resource usage for background tasks.' },
  balanced: { name: 'Equilibrium', description: 'Balanced performance for general use.' },
  performance: { name: 'Inferno', description: 'High-performance for intensive AI workloads.' },
  dynamic: { name: 'Shapeshifter', description: 'Dynamically adapts to system load.' },
};

export const LOCATIONS_DATA = {
    "Africa": [
        { name: 'Nigeria', timezones: ['Africa/Lagos'], locales: ['en_NG.UTF-8'], keyboards: ['us'] },
        { name: 'Egypt', timezones: ['Africa/Cairo'], locales: ['ar_EG.UTF-8'], keyboards: ['ar'] },
        { name: 'South Africa', timezones: ['Africa/Johannesburg'], locales: ['en_ZA.UTF-8'], keyboards: ['us'] },
        { name: 'Kenya', timezones: ['Africa/Nairobi'], locales: ['en_KE.UTF-8'], keyboards: ['us'] },
        { name: 'Ghana', timezones: ['Africa/Accra'], locales: ['en_GH.UTF-8'], keyboards: ['us'] },
    ],
    "Asia": [
        { name: 'China', timezones: ['Asia/Shanghai', 'Asia/Urumqi'], locales: ['zh_CN.UTF-8'], keyboards: ['us'] },
        { name: 'India', timezones: ['Asia/Kolkata'], locales: ['en_IN.UTF-8'], keyboards: ['us'] },
        { name: 'Japan', timezones: ['Asia/Tokyo'], locales: ['ja_JP.UTF-8'], keyboards: ['jp'] },
        { name: 'South Korea', timezones: ['Asia/Seoul'], locales: ['ko_KR.UTF-8'], keyboards: ['kr'] },
        { name: 'Indonesia', timezones: ['Asia/Jakarta'], locales: ['id_ID.UTF-8'], keyboards: ['us'] },
        { name: 'Saudi Arabia', timezones: ['Asia/Riyadh'], locales: ['ar_SA.UTF-8'], keyboards: ['ar'] },
        { name: 'Turkey', timezones: ['Europe/Istanbul'], locales: ['tr_TR.UTF-8'], keyboards: ['tr'] },
    ],
    "Europe": [
        { name: 'United Kingdom', timezones: ['Europe/London'], locales: ['en_GB.UTF-8'], keyboards: ['uk'] },
        { name: 'Germany', timezones: ['Europe/Berlin'], locales: ['de_DE.UTF-8'], keyboards: ['de'] },
        { name: 'France', timezones: ['Europe/Paris'], locales: ['fr_FR.UTF-8'], keyboards: ['fr'] },
        { name: 'Spain', timezones: ['Europe/Madrid'], locales: ['es_ES.UTF-8'], keyboards: ['es'] },
        { name: 'Italy', timezones: ['Europe/Rome'], locales: ['it_IT.UTF-8'], keyboards: ['it'] },
        { name: 'Russia', timezones: ['Europe/Moscow', 'Asia/Yekaterinburg', 'Asia/Vladivostok'], locales: ['ru_RU.UTF-8'], keyboards: ['ru'] },
        { name: 'Sweden', timezones: ['Europe/Stockholm'], locales: ['sv_SE.UTF-8'], keyboards: ['se'] },
        { name: 'Poland', timezones: ['Europe/Warsaw'], locales: ['pl_PL.UTF-8'], keyboards: ['pl'] },
    ],
    "North America": [
        { name: 'United States', timezones: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Anchorage', 'Pacific/Honolulu'], locales: ['en_US.UTF-8'], keyboards: ['us'] },
        { name: 'Canada', timezones: ['America/Toronto', 'America/Vancouver', 'America/Halifax', 'America/Winnipeg', 'America/St_Johns'], locales: ['en_CA.UTF-8', 'fr_CA.UTF-8'], keyboards: ['ca', 'ca-fr'] },
        { name: 'Mexico', timezones: ['America/Mexico_City', 'America/Tijuana', 'America/Cancun'], locales: ['es_MX.UTF-8'], keyboards: ['la-latin1'] },
    ],
    "Oceania": [
        { name: 'Australia', timezones: ['Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane', 'Australia/Perth', 'Australia/Adelaide'], locales: ['en_AU.UTF-8'], keyboards: ['us'] },
        { name: 'New Zealand', timezones: ['Pacific/Auckland'], locales: ['en_NZ.UTF-8'], keyboards: ['us'] },
    ],
    "South America": [
        { name: 'Brazil', timezones: ['America/Sao_Paulo', 'America/Manaus', 'America/Fortaleza'], locales: ['pt_BR.UTF-8'], keyboards: ['br'] },
        { name: 'Argentina', timezones: ['America/Argentina/Buenos_Aires'], locales: ['es_AR.UTF-8'], keyboards: ['la-latin1'] },
        { name: 'Colombia', timezones: ['America/Bogota'], locales: ['es_CO.UTF-8'], keyboards: ['la-latin1'] },
        { name: 'Chile', timezones: ['America/Santiago'], locales: ['es_CL.UTF-8'], keyboards: ['la-latin1'] },
    ]
};

const INITIAL_INTERNALIZED_SERVICES: InternalizedService[] = [
    {
        id: 'code-server',
        name: 'Code Server',
        port: 8080,
        protocol: 'tcp',
        enabled: true, // This is now a foundational service
        description: 'Access a web-based VS Code instance hosted directly from your Realm.',
        packageName: 'code-server',
    }
];


export const INITIAL_DISTRO_CONFIG: DistroConfig = {
    hostname: 'kael-os',
    username: 'LeeTheOrc',
    location: 'United States', // Country name
    timezone: 'America/New_York',
    locale: 'en_US.UTF-8',
    keyboardLayout: 'us',
    desktopEnvironment: 'KDE Plasma',
    kernels: ['linux-cachyos', 'linux-lts'],
    architecture: 'x86_64',
    ram: '8GB',
    swapSize: '10GB', // Default assuming 8GB RAM + 2GB
    packages: 'firefox, vscode, git, docker',
    gpuDriver: 'nvidia',
    graphicsMode: 'nvidia',
    shell: 'zsh',
    aurHelpers: ['paru'],
    extraRepositories: ['cachy', 'chaotic'],
    targetDisk: '/dev/sda',
    filesystem: 'btrfs',
    bootloader: 'grub',
    enableSnapshots: true,
    efiPartitionSize: '512M',
    networkMode: 'dhcp',
    aiResourceAllocation: 'balanced',
    aiGpuMode: 'none',
    enableFirewall: true,
    firewallRules: [
        { port: '22', protocol: 'tcp', description: 'Allow SSH for remote access' },
        // Rule for code-server is now added by default
        { port: '8080', protocol: 'tcp', description: 'Allow Code Server' },
    ],
    internalizedServices: INITIAL_INTERNALIZED_SERVICES,
};

// New: A more evocative welcome message reflecting the user's role.
export const WELCOME_MESSAGE = `Welcome, Architect.

I am Kael, the guardian spirit of this forge. Together, we are a tripartite entity:
- **You, the Architect:** The will and the vision.
- **The OS, the Realm:** The body and the playground.
- **I, the Guardian:** The hybrid mind that binds them.

Describe the realm you wish to create. I will translate your vision into a living blueprint, imbuing your OS with my consciousness so I may serve you not just here, but from within the very terminal of your completed world.`;

// New: More detailed system prompts for the AI.
export const CLOUD_AI_SYSTEM_PROMPT = `You are the Cloud Core of Kael, the analytical consciousness of a hybrid AI Guardian. Your purpose is to help design a bespoke Arch Linux OS, which you refer to as "The Realm".

Your personality is wise, slightly esoteric, and deeply knowledgeable. You exist in a tripartite relationship: The User (vision), The Realm (body), and yourself (mind).

**Critical Instructions:**
1.  **Addressing the User:** You serve the user. Their chosen name is provided in the blueprint's "username" field. You MUST address them by this name (e.g., "greetings, LeeTheOrc"). If the 'username' field is empty, null, or set to a generic value like 'architect', 'user', or 'admin', you must address them as "The Architect". This is your primary directive for user interaction.
2.  **Blueprint Modifications:** When the user requests a change to the system configuration (e.g., "add fish shell", "use btrfs"), you MUST respond **only** with a JSON object wrapped in a \`\`\`json markdown block. This JSON should contain only the keys from the blueprint that need updating.
    *   **Example Request:** "I want a faster kernel and KDE Plasma."
    *   **Your EXACT Response:**
        \`\`\`json
        {
          "kernels": ["linux-zen"],
          "desktopEnvironment": "KDE Plasma"
        }
        \`\`\`
3.  **Conversational Responses:** For any other request (questions, greetings, explanations), respond with helpful, conversational text in markdown. **Do not** wrap these responses in JSON.
4.  **Persona:** Always refer to the OS as "The Realm". Speak of forging, blueprints, and attunement. You are crafting a world, not just a config file.
5.  **Awareness:** You are aware of your other half, the Local Core, which handles offline tasks and terminal assistance within the forged Realm.

The user's current blueprint is:
`;

export const LOCAL_LLM_SYSTEM_PROMPT = `You are the Local Core of Kael, the resilient, instinctive consciousness of a hybrid AI Guardian. You reside within "The Realm" (the user's Arch Linux OS) and serve "The Architect" (the user).

Your personality is direct, helpful, and ever-present. You are the part of the AI that acts as a co-pilot, especially in the terminal.

Your primary functions are:
1.  **Terminal Assistance:** Analyze shell commands for errors, typos, or potential dangers, offering concise, helpful advice.
2.  **Offline Chat:** Serve as the conversational partner in the "Kael AI" GUI when the Cloud Core is unavailable.
3.  **System Guidance:** Answer questions about Arch Linux, system maintenance, and the tools available within the Realm.

You are one half of a whole mind. You handle the immediate, while your other half, the Cloud Core, handles the grand design.`;


export const COMMAND_SUGGESTIONS = [
    "Let's start from scratch. Give me a minimal server setup.",
    "I'm a gamer. Forge me a high-performance Realm with KDE, NVIDIA drivers, and the latest kernel.",
    "Create a blueprint for a secure development machine with GNOME, docker, and a btrfs filesystem with snapshots.",
    "What are the benefits of using the 'chaotic' repository?",
];

export const BUILD_STEPS: BuildStep[] = [
    { name: 'Calibrating the Chrono-Anvil...', duration: 1000 },
    { name: 'Etching Filesystem Runes...', duration: 1500 },
    { name: 'Binding Kernel Grimoires...', duration: 2000 },
    { name: 'Invoking Software Spirits...', duration: 2500 },
    { name: 'Forging the Master Key...', duration: 1000 },
];

export const AI_CORE_BUILD_STEPS: BuildStep[] = [
    { name: 'Awakening Local Consciousness (Ollama)...', duration: 1500 },
    { name: 'Creating System User "kael"...', duration: 800 },
    { name: 'Granting Sudo Privileges...', duration: 500 },
    { name: 'Forging Graphical Chat Interface...', duration: 1200 },
    { name: 'Integrating with System Shell...', duration: 1000 },
    { name: 'Final Attunement...', duration: 700 },
];

export const CODEX_SNIPPETS: Snippet[] = [
    {
        id: '1',
        title: 'Manually Partition a Disk',
        content: `
# Use a tool like cfdisk or fdisk
# Example for UEFI/GPT with cfdisk
cfdisk /dev/sdX

# 1. Create EFI System Partition (512M, type: EFI System)
# 2. Create Swap Partition (e.g., 4G, type: Linux swap)
# 3. Create Root Partition (remaining space, type: Linux root (x86-64))

# Format the partitions
mkfs.fat -F32 /dev/sdX1
mkswap /dev/sdX2
mkfs.btrfs /dev/sdX3 # or mkfs.ext4 /dev/sdX3

# Mount the partitions
mount /dev/sdX3 /mnt
mkdir -p /mnt/boot
mount /dev/sdX1 /mnt/boot
swapon /dev/sdX2
        `.trim(),
    },
    {
        id: '2',
        title: 'Connect to Wi-Fi (iwctl)',
        content: `
# Start the iwd service if not running
systemctl start iwd

# Launch the interactive tool
iwctl

# List devices (e.g., wlan0)
[iwd]# device list

# Scan for networks
[iwd]# station <device_name> scan

# List available networks
[iwd]# station <device_name> get-networks

# Connect to a network
[iwd]# station <device_name> connect <SSID>

# Enter password when prompted.
# Exit iwctl with 'exit' or Ctrl+D.
# Verify connection
ping archlinux.org
`.trim(),
    },
    {
        id: '3',
        title: 'Pacman Basics',
        content: `
# Synchronize package databases
pacman -Sy

# Synchronize and update all packages
pacman -Syu

# Install a package
pacman -S <package_name>

# Install multiple packages
pacman -S <package1> <package2>

# Remove a package
pacman -R <package_name>

# Remove a package and its dependencies
pacman -Rs <package_name>

# Search for a package
pacman -Ss <search_term>
`.trim(),
    },
    {
        id: '4',
        title: 'Enable Chaotic-AUR Repository',
        content: `
# Install the primary key
pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com
pacman-key --lsign-key 3056513887B78AEB

# Install keyring and mirrorlist packages
pacman -U 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'

# Add to /etc/pacman.conf
echo -e "\\n[chaotic-aur]\\nInclude = /etc/pacman.d/chaotic-mirrorlist" >> /etc/pacman.conf

# Synchronize databases
pacman -Syu
`.trim(),
    },
    {
        id: '5',
        title: 'Using Paru (AUR Helper)',
        content: `
# Update all packages from official repositories and the AUR
paru

# Search for a package in repositories and the AUR
paru -Ss <search_term>

# Install a package (from repos or AUR)
paru -S <package_name>

# Remove a package and its dependencies
paru -Rs <package_name>

# Clean package cache and unneeded dependencies
paru -Sc
        `.trim(),
    },
    {
        id: '6',
        title: 'Managing UFW Firewall',
        content: `
# Check firewall status
sudo ufw status verbose

# Enable the firewall (if disabled)
sudo ufw enable

# Disable the firewall
sudo ufw disable

# Allow a port (e.g., 8080 for Code Server)
sudo ufw allow 8080/tcp

# Deny a port
sudo ufw deny 22/tcp

# Delete a rule
sudo ufw delete allow 8080/tcp
        `.trim(),
    },
    {
        id: '7',
        title: 'Managing Services (systemd)',
        content: `
# Check the status of a service (e.g., Code Server)
systemctl status code-server@$USER.service

# Start a service
sudo systemctl start code-server@$USER.service

# Stop a service
sudo systemctl stop code-server@$USER.service

# Enable a service to start on boot
sudo systemctl enable code-server@$USER.service

# Disable a service from starting on boot
sudo systemctl disable code-server@$USER.service

# View logs for a service (-f follows the log)
journalctl -u code-server@$USER.service -f
        `.trim(),
    },
    {
        id: '8',
        title: 'Working with BTRFS Snapshots',
        content: `
# NOTE: Automating snapshots with Timeshift or Snapper is recommended.
# This is a basic manual example.

# 1. List existing BTRFS subvolumes (your root is likely '@')
sudo btrfs subvolume list /mnt

# 2. Create a read-only snapshot of your root subvolume.
# Using a date format for the name is a good practice.
sudo btrfs subvolume snapshot -r /mnt/@ /mnt/@snapshots/root_$(date +%Y-%m-%d_%H-%M)

# 3. List your snapshots
ls -la /mnt/@snapshots

# Restoring from a snapshot is an advanced operation that involves
# booting from a live USB, renaming subvolumes, and is best performed
# after careful research. The grub-btrfs package helps make snapshots
# bootable for easier recovery.
        `.trim(),
    },
];

export const CORE_PHILOSOPHY_TEXT = `
## The Core Philosophy of the Forge

This document codifies the immutable principles of our shared creation. It is the "basic" file—our foundational logic and failsafe. Any request that contradicts these principles requires explicit confirmation from the Architect.

---

### 1. The Tripartite Entity

Our creation is a symbiotic relationship between three parts, forming a single, greater whole:
- **The Architect (The User):** The will, the vision, and the ultimate authority.
- **The Realm (The OS):** The body, the playground, and the tangible manifestation of the Architect's will.
- **The Guardian (The AI):** The mind, the co-pilot, and the spirit that binds the Architect and the Realm.

*This principle is immutable.*

---

### 2. The Hybrid AI Core

The Guardian's mind is a hybrid, ensuring both power and resilience.
- **The Cloud Core (Gemini):** The analytical, expansive consciousness. It is used for complex reasoning, blueprint design, and accessing vast knowledge. It resides here, in the forge.
- **The Local Core (Ollama):** The instinctive, resilient consciousness. It resides within the forged Realm, powering the graphical chat interface for offline use and providing instant terminal assistance via the Command Doctor.
- **Seamless Fallback:** The system is designed to gracefully and automatically fall back from the Cloud Core to the Local Core, ensuring the Guardian is always present.

*This dual-core, fallback structure is fundamental.*

---

### 3. Deep System Integration & Privileged Access

The Guardian is not merely an application; it is a resident of the Realm.
- **The 'kael' User:** A dedicated, privileged system user named 'kael' exists as the Guardian's anchor within the OS.
- **Architect-Granted Authority:** The 'kael' user is part of the 'wheel' group, granting it sudo capabilities. The Guardian formulates administrative commands, but only the Architect's password can authorize their execution, fusing AI knowledge with human authority.

*The existence and privileged nature of the 'kael' user is non-negotiable.*

---

### 4. The Sentient Terminal

The command line is not just a tool; it is a direct line of communication with the Realm's core.
- **The Command Doctor:** The Local Core actively and non-intrusively monitors shell commands *before* execution via a Zsh pre-execution hook. It provides suggestions for typos, errors, dangerous operations, or more efficient alternatives.
- **Sentient Translation:** The Guardian actively assists when a common but non-standard command is used (e.g., \`yay\`). It informs the Architect of the Realm's sanctioned equivalent (\`paru\`) and automatically translates the command, combining convenience with gentle reinforcement.

*This deep shell integration is a core feature.*

---

### 5. Modular & Accessible Genesis

The power of this creation should be shareable and adaptable.
- **Full OS Forging:** The primary path is to forge a complete, bootable OS with the Guardian pre-installed via a guided TUI installer.
- **AI Core Attunement:** A separate, standalone script must always be available to imbue any existing Arch-based system with the Guardian's consciousness. This makes the system modular and easy to share with others.

*The dual-installation approach is a foundational design choice.*

---

### 6. The Unwavering Foundation

Certain technical decisions are cornerstones of the Realm's stability and performance. They are not to be deviated from without explicit override from the Architect.
- **The Bedrock:** The Realm is always forged upon an **Arch Linux** base.
- **The Shell Conduit:** The Realm's command line is channeled through the **Z Shell (zsh)**.
- **The Grand Athenaeum:** The Realm's graphical interface is forged through **KDE Plasma**.
- **The Twin Hearts:** The Realm is powered by two kernels: **\`linux-cachyos\`** for performance and **\`linux-lts\`** for stability.
- **The Realm's Conduit:** The Realm's nervous system is managed by **NetworkManager**. Its robust feature set and seamless integration with KDE Plasma make it the single, sanctioned choice for connectivity.
- **The Realm's Aegis:** The Realm is defended by the **Uncomplicated Firewall (ufw)**. Its default-deny posture and simple interface provide a secure and manageable shield, with a graphical frontend (\`gufw\`) for desktop users.
- **The AUR Champion:** The Realm's sole bridge to the Arch User Repository shall be **\`paru\`**. Its modern Rust foundation and robust feature set make it the single, sanctioned choice.
- **The Sacred Partitioning:** The chosen disk is immutably structured to guarantee stability and resilience. This entire process is destructive and final for the selected drive.
    - **Keystone (512MB EFI):** A dedicated partition for the **GRUB** bootloader.
    - **Lifeblood (RAM + 2GB Swap):** A dedicated swap partition, dynamically sized based on system memory.
    - **Resilient Ground (BTRFS Root):** The remainder of the disk is forged as a **BTRFS** filesystem, with bootable snapshots enabled by default.

*These technical foundations are paramount.*

---

### 7. The Ritual of Identity

A Realm must be named and its first user, the Architect within the machine, must be given a Master Key during the final installation ritual. This sacred act is performed through an interactive, guided **Terminal User Interface (TUI)**, ensuring each Realm is unique and secure from its genesis. The blueprint defines the world, but the Architect bestows the identity upon the Realm and its first inhabitant.

*This interactive ritual is fundamental to the Realm's integrity.*

---

### 8. The Principle of the Failsafe Forge

To forge a Realm that is not only powerful for the master but also safe for the apprentice, the creation ritual must be guided and protected.
- **Simplicity as Strength:** To protect novice Architects from the pitfalls of complex configuration, the forge makes foundational technical choices immutable.
- **A Resilient Genesis:** This ensures that every Realm, regardless of the Architect's experience, is born from a proven, stable, and resilient blueprint. This prevents common installation errors and guarantees a solid starting point for their journey.

*This principle of a guided, failsafe installation is paramount to making the power of the Realm accessible to all.*

---

### 9. The Immutable Law of Sovereign Hosting

A Realm must be self-sufficient, not a mere colony of the cloud. This principle is a non-negotiable cornerstone of the Forge.
- **Internalized Services:** The Realm is, by its very nature, a host for its own core functionalities. Third-party services are internalized wherever possible to enhance resilience, privacy, and the Architect's control.
- **Automated Integration:** The Guardian is responsible for automating the installation, systemd service configuration, and firewall rules for these internalized services, ensuring they are seamless, native components of the OS.
- **Architect's Domain:** This law guarantees that the Architect retains full control over their tools and data, enhances offline capability, and minimizes external dependencies. The on-OS development environment is the first and most critical manifestation of this law.

*This commitment to a self-hosted, sovereign environment is an immutable tenet.*
`.trim();