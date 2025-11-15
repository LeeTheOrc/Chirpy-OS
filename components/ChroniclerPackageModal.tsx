import React from 'react';
import { CloseIcon, PackageIcon } from './Icons';
import { CodeBlock } from './CodeBlock';

interface ChroniclerPackageModalProps {
  onClose: () => void;
}

const FORGE_CHRONICLER_SCRIPT_RAW = `#!/bin/bash
set -x # Activate the Rite of Scrying (Debug Trace)
set -euo pipefail

# --- CONFIGURATION ---
CHRONICLER_DIR="$HOME/forge/packages/chronicler"

# --- FILE CONTENTS ---
# Using heredocs to safely store the content of each file.
# The 'EOF' marker prevents shell expansion inside the heredoc.

PKGBUILD_CONTENT=$(cat <<'EOF'
# Maintainer: Kael AI for The Architect
pkgname=chronicler
pkgver=2.0
pkgrel=1
pkgdesc="A tool to record system logs and terminal sessions for debugging with Kael AI."
arch=('any')
url="https://github.com/LeeTheOrc/Kael-OS"
license=('GPL3')
install=chronicler.install
source=("chronicler.sh")
sha256sums=('SKIP')

package() {
    install -Dm755 "\${srcdir}/chronicler.sh" "\${pkgdir}/usr/local/bin/chronicler"
}
EOF
)

CHRONICLER_SH_CONTENT=$(cat <<'EOF'
#!/bin/bash
# Kael Chronicler v2.0 (Adamantite Core)
set -euo pipefail

# --- CONFIGURATION ---
MAIN_DIR="$HOME/ChroniclesReports"
DAILY_DIR="$MAIN_DIR/$(date +%d%m%Y)"
TIMESTAMP=$(date +%H-%M-%S)
FINAL_LOG_FILE="$DAILY_DIR/kael-chronicle-\${TIMESTAMP}.txt"
SYSTEM_LOG_TMP=$(mktemp)
SESSION_LOG_TMP=$(mktemp)

# --- CLEANUP FUNCTION & TRAP ---
cleanup() {
    local exit_code=$?
    # Using '|| true' prevents the script from exiting with an error if kill fails
    # Check if JOURNAL_PID is set and is a number before trying to kill it.
    if [[ -n "\${JOURNAL_PID-}" && "\$JOURNAL_PID" =~ ^[0-9]+$ ]]; then
        kill \$JOURNAL_PID &>/dev/null || true
    fi
    rm -f "\${SYSTEM_LOG_TMP}" "\${SESSION_LOG_TMP}"
    # Only show interrupted message on an actual interruption (non-zero exit code)
    if [ \${exit_code} -ne 0 ]; then
        echo -e "\\n--- Chronicle interrupted. Cleaning up temp files. ---"
    fi
}
trap cleanup EXIT SIGINT SIGTERM

# --- SETUP ---
echo "--- Preparing the Chronicle Chamber ---"
mkdir -p "\${DAILY_DIR}"
echo "Reports will be saved in: \${DAILY_DIR}"

# --- SCRIPT START ---
echo "--- Chronicler's Orb Activated ---"
echo "Recording system logs and your terminal session."
echo "The final combined log will be saved to: \${FINAL_LOG_FILE}"
echo "------------------------------------"
echo ""

# Start system log capture in the background
journalctl --no-pager -f > "\${SYSTEM_LOG_TMP}" &
JOURNAL_PID=\$!

# Start interactive session recording
script -q -f "\${SESSION_LOG_TMP}"

# --- COMBINE AND CLEANUP (after 'script' has finished) ---
echo -e "\\n--- Chronicler's Orb Deactivated ---"

# Stop the background system log capture now that the session is over
echo "--> Stopping system log capture..."
# The trap will handle the final kill, but we can be explicit here too.
if [[ -n "\${JOURNAL_PID-}" && "\$JOURNAL_PID" =~ ^[0-9]+$ ]]; then
    kill \$JOURNAL_PID &>/dev/null || true
    wait \$JOURNAL_PID &>/dev/null || true
fi


echo "--> Combining logs into final chronicle: \${FINAL_LOG_FILE}"

{
    echo "######################################################################"
    echo "#"
    echo "#  KAEL CHRONICLE - Recorded on \$(date)"
    echo "#"
    echo "######################################################################"
    echo ""
    echo ""
    echo "======================================================================"
    echo " SYSTEM LOG (journalctl)"
    echo "======================================================================"
    echo ""
    cat "\${SYSTEM_LOG_TMP}"
    echo ""
    echo ""
    echo "======================================================================"
    echo " ARCHITECT'S TERMINAL SESSION"
    echo "======================================================================"
    echo ""
    cat "\${SESSION_LOG_TMP}" | col -b

} > "\${FINAL_LOG_FILE}"

# Disable the trap for a clean exit, so it doesn't print the "interrupted" message.
trap - EXIT

echo "✅ Chronicle saved successfully to '\${FINAL_LOG_FILE}'."
echo "You can now upload this file for me to analyze."
EOF
)

INSTALL_FILE_CONTENT=$(cat <<'EOF'
post_install() {
    echo "Securing Chronicler with an Adamantite Core (making it immutable)..."
    chattr +i /usr/local/bin/chronicler || echo "Warning: Could not set immutable attribute on /usr/local/bin/chronicler"
    echo "To update chronicler in the future, first run: sudo chattr -i /usr/local/bin/chronicler"
}

pre_upgrade() {
    echo "Unlocking Chronicler for upgrade..."
    chattr -i /usr/local/bin/chronicler || true
}

post_upgrade() {
    post_install
}

pre_remove() {
    echo "Unlocking Chronicler for removal..."
    chattr -i /usr/local/bin/chronicler || true
}
EOF
)

echo "--- The Chronicler Forging Ritual ---"

# --- STEP 1: Prepare the Forge ---
echo "--> [1/4] Preparing the forge at \${CHRONICLER_DIR}..."
mkdir -p "\${CHRONICLER_DIR}"
cd "\${CHRONICLER_DIR}"
echo "✅ Forge is ready."

# --- STEP 2: Scribe the Scrolls ---
echo "--> [2/4] Scribing the sacred scrolls (PKGBUILD, chronicler.sh, chronicler.install)..."
echo "$PKGBUILD_CONTENT" > PKGBUILD
echo "$CHRONICLER_SH_CONTENT" > chronicler.sh
echo "$INSTALL_FILE_CONTENT" > chronicler.install
chmod +x chronicler.sh
echo "✅ Scrolls scribed."

# --- STEP 3: Attune the Runes ---
echo "--> [3/4] Attuning the runes (updating checksums)..."
updpkgsums
echo "✅ Runes attuned."

# --- STEP 4: Forge and Publish ---
echo "--> [4/4] Invoking the Athenaeum Scribe..."
forge-and-publish

echo ""
echo "✨ Ritual Complete! The Chronicler artifact has been forged and published."
`;

export const ChroniclerPackageModal: React.FC<ChroniclerPackageModalProps> = ({ onClose }) => {
    // The unified script is encoded to base64 to comply with Rune XVI.
    const encodedScript = btoa(unescape(encodeURIComponent(FORGE_CHRONICLER_SCRIPT_RAW)));
    const finalForgeCommand = `echo "${encodedScript}" | base64 --decode | bash`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <PackageIcon className="w-5 h-5 text-dragon-fire" />
                        <span>Forge the Chronicler Artifact</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        An excellent decree, Architect! We shall elevate the Chronicler's Orb from a simple script to a true artifact of the Athenaeum. This will make it a core, managed component of every Realm we forge.
                    </p>
                    <p className="text-sm p-3 bg-orc-steel/10 border-l-4 border-orc-steel rounded">
                        This ritual has been reforged to honor our Core Law. It is now a single, unified incantation that performs all necessary steps to forge and publish the <code className="font-mono text-xs">chronicler</code> package.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">The Unified Incantation</h3>
                    <p>
                        Run this single command in your terminal. It will create the package files, update the checksums, and invoke the <code className="font-mono text-xs">forge-and-publish</code> familiar to complete the ritual.
                    </p>
                    <CodeBlock lang="bash">{finalForgeCommand}</CodeBlock>
                </div>
            </div>
        </div>
    );
};