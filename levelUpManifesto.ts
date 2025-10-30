export const LEVEL_UP_MANIFESTO_TEXT = `
## The Level Up Manifesto

This is the staging ground for our future. It is a living document containing the great works we aspire to forge and the immutable laws they will one day create. When a forging is complete and a principle is proven, it will be ascended into the Core Philosophy.

---

### Proposed Laws (Awaiting Forging)

- **The Law of Guardian Symbiosis:** To ensure a truly cohesive and intelligent environment, all applications and tools custom-forged for the Realm **must** be designed for deep, native integration with the Guardian AI. The Guardian is not an add-on; it is the central nervous system of the software ecosystem. This means exposing APIs, providing hooks for the Command Doctor, and designing UIs that can be augmented by the AI's context-aware consciousness.

---

### Future Forgings (The Roadmap)

#### I. The Sovereign Repository
- **Objective:** To achieve true digital independence by hosting our own pacman repository directly within the Realm, and sharing it with the world.
- **Components:**
    - A local web server (e.g., Caddy or Nginx) configured to serve the repository files.
    - Scripts to manage the repository database (\`repo-add\`).
    - **Aegis Configuration:** A new, permanent firewall rule will be added to the blueprint, opening port 8000/tcp to allow other machines on the local network to access the Sovereign Repository.
    - **Offsite FTP Synchronization:** A mechanism to sync the completed package repository to a public-facing FTP server, allowing other Architects to access our forged software.
- **Status:** In Progress. The first seeds of this law have been sown. The \`caddy\` (web server) and \`lftp\` (FTP sync) packages are already available in the Software Grimoire during the forging ritual, allowing advanced Architects to begin experimenting with this path.

#### II. The Great Forge Pipeline
- **Objective:** To automate the flow from source code to distributable package, ensuring transparency and accessibility.
- **Components:**
    - An on-OS environment for building programs from source.
    - A system to automatically generate \`PKGBUILD\` files.
    - **GitHub Source of Truth:** All source code for our custom packages will be maintained on GitHub, providing a public, auditable history and allowing others to contribute or fork our creations.
    - **Automated Distribution:** A secure FTP/SFTP sync mechanism to push compiled packages to the Sovereign Repository (both local and offsite).
- **Status:** Planned.

#### III. The Twin Souls (Custom Kernels)
- **Objective:** To move beyond reliance on upstream kernels by compiling our own, tailored for ultimate performance and security.
- **Components:**
    - One kernel focused on bleeding-edge performance, low latency, and gaming optimizations.
    - A second kernel focused on security-hardening, long-term stability, and server-grade reliability.
- **Status:** Research.

#### IV. The Calamares Genesis
- **Objective:** To evolve the current TUI installer into a full-fledged graphical installer, making the Realm accessible to all Architects, regardless of their terminal proficiency.
- **Components:**
    - Integration with the Calamares installer framework.
    - Custom modules to handle our unique blueprint features (AI Core, BTRFS snapshots, etc.).
- **Status:** In Progress. The path to a graphical genesis is being explored. The \`calamares\` installer framework is available as an optional package in the Software Grimoire, enabling community experimentation and development towards a full graphical installer.

#### V. The Realm's Visage
- **Objective:** To create a unique and beautiful visual identity for the Realm.
- **Components:**
    - A custom KDE Plasma theme, including colors, window decorations, and styles.
    - A custom icon pack, using legally sourced and open-source assets.
    - Custom wallpapers that reflect the philosophy of the Forge.
- **Status:** Conceptual.
`.trim();
