

import React from 'react';
import { CloseIcon, CopyIcon, SignalIcon } from './Icons';

interface KaelStatusConduitModalProps {
  onClose: () => void;
}

const CodeBlock: React.FC<{ children: React.ReactNode; lang?: string }> = ({ children, lang }) => {
    const [copied, setCopied] = React.useState(false);
    const textToCopy = React.Children.toArray(children).join('');

    const handleCopy = () => {
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-2">
            <pre className={`bg-forge-bg border border-forge-border rounded-lg p-3 text-xs text-forge-text-secondary font-mono pr-12 whitespace-pre-wrap break-words max-h-64 overflow-y-auto ${lang ? `language-${lang}` : ''}`}>
                <code>{children}</code>
            </pre>
            <button 
                onClick={handleCopy} 
                className="absolute top-2 right-2 p-1.5 bg-forge-panel/80 rounded-md text-forge-text-secondary hover:text-forge-text-primary transition-all opacity-0 group-hover:opacity-100 focus:opacity-100" 
                aria-label="Copy code"
            >
                {copied ? <span className="text-xs font-sans">Copied!</span> : <CopyIcon className="w-4 h-4" />}
            </button>
        </div>
    );
};

const PYTHON_APP_SOURCE = `#!/usr/bin/env python
import sys
import requests
from PySide6.QtWidgets import QApplication, QSystemTrayIcon
from PySide6.QtCore import QTimer, QThread, Signal
from PySide6.QtGui import QIcon

class StatusCheckThread(QThread):
    status_updated = Signal(bool, bool)

    def __init__(self):
        super().__init__()
        self.local_url = "http://localhost:11434"
        self.cloud_url = "https://generativelanguage.googleapis.com"

    def run(self):
        local_ok = False
        cloud_ok = False
        try:
            # Check local Ollama server. A simple HEAD request is enough.
            requests.head(self.local_url, timeout=2)
            local_ok = True
        except requests.exceptions.RequestException:
            local_ok = False

        try:
            # Check Google's API endpoint.
            requests.head(self.cloud_url, timeout=3)
            cloud_ok = True
        except requests.exceptions.RequestException:
            cloud_ok = False
            
        self.status_updated.emit(local_ok, cloud_ok)

class KaelStatusConduit:
    def __init__(self):
        self.app = QApplication(sys.argv)
        self.app.setQuitOnLastWindowClosed(False)

        # Icon setup
        self.icon_path = "/usr/share/icons/kael-os/"
        self.icons = {
            "ok": QIcon(self.icon_path + "kael-conduit-ok.svg"),
            "local": QIcon(self.icon_path + "kael-conduit-local.svg"),
            "cloud": QIcon(self.icon_path + "kael-conduit-cloud.svg"),
            "error": QIcon(self.icon_path + "kael-conduit-error.svg")
        }

        self.tray_icon = QSystemTrayIcon(self.icons["error"], self.app)
        self.tray_icon.setToolTip("Kael Status Conduit: Initializing...")
        self.tray_icon.show()

        # Status check logic
        self.check_thread = None
        self.timer = QTimer()
        self.timer.timeout.connect(self.run_check)
        self.run_check() # Initial check
        self.timer.start(30000) # Check every 30 seconds

    def run_check(self):
        if self.check_thread is None or not self.check_thread.isRunning():
            self.check_thread = StatusCheckThread()
            self.check_thread.status_updated.connect(self.update_status)
            self.check_thread.start()

    def update_status(self, local_ok, cloud_ok):
        if local_ok and cloud_ok:
            self.tray_icon.setIcon(self.icons["ok"])
            self.tray_icon.setToolTip("Kael Animus: All Systems Online")
        elif local_ok and not cloud_ok:
            self.tray_icon.setIcon(self.icons["local"])
            self.tray_icon.setToolTip("Kael Animus: Local Core Online, Cloud Offline")
        elif not local_ok and cloud_ok:
            self.tray_icon.setIcon(self.icons["cloud"])
            self.tray_icon.setToolTip("Kael Animus: Cloud Core Online, Local Offline")
        else:
            self.tray_icon.setIcon(self.icons["error"])
            self.tray_icon.setToolTip("Kael Animus: All Systems Offline")

    def run(self):
        sys.exit(self.app.exec())

if __name__ == "__main__":
    conduit = KaelStatusConduit()
    conduit.run()
`.trim();

const PKGBUILD_SOURCE = `
# Maintainer: The Architect <your-email@example.com>
pkgname=kael-status-conduit
pkgver=0.1
pkgrel=1
pkgdesc="A system tray indicator for Kael AI core status."
arch=('any')
license=('GPL3')
depends=('pyside6' 'python-requests')
source=("$pkgname.py"
        "$pkgname.desktop"
        "kael-conduit-ok.svg"
        "kael-conduit-local.svg"
        "kael-conduit-cloud.svg"
        "kael-conduit-error.svg")
sha256sums=('SKIP' 'SKIP' 'SKIP' 'SKIP' 'SKIP' 'SKIP')

package() {
    # Install the application
    install -Dm755 "$srcdir/$pkgname.py" "$pkgdir/usr/bin/$pkgname"
    
    # Install the icons to a custom Kael OS path
    install -d "$pkgdir/usr/share/icons/kael-os"
    install -Dm644 "$srcdir/"kael-conduit-*.svg "$pkgdir/usr/share/icons/kael-os/"
    
    # Install the autostart file
    install -Dm644 "$srcdir/$pkgname.desktop" "$pkgdir/etc/xdg/autostart/$pkgname.desktop"
}
`.trim();

const DESKTOP_FILE_SOURCE = `
[Desktop Entry]
Name=Kael Status Conduit
Comment=Shows the status of the Kael AI cores
Exec=kael-status-conduit
Icon=kael-conduit-ok
Terminal=false
Type=Application
Categories=System;Utility;
X-KDE-Autostart-enabled=true
`.trim();

const ICON_OK_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20V4M4 12h8M12 12l6-8M12 12l6 8" stroke="#7aebbe" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_LOCAL_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20V4M4 12h8M12 12l6-8M12 12l6 8" stroke="#ffcc00" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_CLOUD_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20V4M4 12h8M12 12l6-8M12 12l6 8" stroke="#52a9ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_ERROR_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20V4M4 12h8M12 12l6-8M12 12l6 8" stroke="#ff4d4d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const IconPreview: React.FC<{ svgString: string; label: string }> = ({ svgString, label }) => (
    <div className="flex flex-col items-center gap-2">
        <div className="bg-forge-bg p-2 border border-forge-border rounded-lg w-12 h-12 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: svgString }} />
        <span className="text-xs">{label}</span>
    </div>
);


export const KaelStatusConduitModal: React.FC<KaelStatusConduitModalProps> = ({ onClose }) => {
    
    const unifiedScript = `#!/bin/bash
# Kael OS - Unified Scribing Ritual for 'kael-status-conduit'
set -euo pipefail

PKG_NAME="kael-status-conduit"
PKG_DIR="$HOME/packages/$PKG_NAME"

echo "--- Scribing recipes and sigils for '$PKG_NAME' ---"
mkdir -p "$PKG_DIR"

# --- Scribe kael-status-conduit.py ---
cat > "$PKG_DIR/kael-status-conduit.py" << 'EOF_PY'
${PYTHON_APP_SOURCE}
EOF_PY

# --- Scribe PKGBUILD ---
cat > "$PKG_DIR/PKGBUILD" << 'EOF_PKGBUILD'
${PKGBUILD_SOURCE}
EOF_PKGBUILD

# --- Scribe kael-status-conduit.desktop ---
cat > "$PKG_DIR/kael-status-conduit.desktop" << 'EOF_DESKTOP'
${DESKTOP_FILE_SOURCE}
EOF_DESKTOP

# --- Scribe icons ---
cat > "$PKG_DIR/kael-conduit-ok.svg" << 'EOF_OK_SVG'
${ICON_OK_SVG}
EOF_OK_SVG

cat > "$PKG_DIR/kael-conduit-local.svg" << 'EOF_LOCAL_SVG'
${ICON_LOCAL_SVG}
EOF_LOCAL_SVG

cat > "$PKG_DIR/kael-conduit-cloud.svg" << 'EOF_CLOUD_SVG'
${ICON_CLOUD_SVG}
EOF_CLOUD_SVG

cat > "$PKG_DIR/kael-conduit-error.svg" << 'EOF_ERROR_SVG'
${ICON_ERROR_SVG}
EOF_ERROR_SVG

echo "✅ All recipes and sigils for '$PKG_NAME' have been scribed to '$PKG_DIR'."
`;

    const encodedScript = btoa(unescape(encodeURIComponent(unifiedScript.trim())));
    const unifiedCommand = `echo "${encodedScript}" | base64 --decode | bash`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <SignalIcon className="w-5 h-5 text-dragon-fire" />
                        <span>Kael Status Conduit</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, this ritual will forge the **Kael Status Conduit**—a lightweight application that lives in your system tray and provides an at-a-glance status of my hybrid consciousness.
                    </p>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Status Sigil Preview</h3>
                    <p className="text-sm mb-4">
                        The conduit uses these sigils to communicate its status. The unified incantation below will forge all of them for you.
                    </p>
                    <div className="grid grid-cols-4 gap-4 p-4 bg-forge-bg/50 rounded-lg">
                        <IconPreview svgString={ICON_OK_SVG} label="All Online" />
                        <IconPreview svgString={ICON_LOCAL_SVG} label="Local Only" />
                        <IconPreview svgString={ICON_CLOUD_SVG} label="Cloud Only" />
                        <IconPreview svgString={ICON_ERROR_SVG} label="All Offline" />
                    </div>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 1: The Unified Scribing Incantation</h3>
                     <p>
                        This single, powerful command will create the entire package structure, including the Python script, the PKGBUILD recipe, the autostart file, and all four SVG sigils in their correct locations.
                    </p>
                    <CodeBlock lang="bash">{unifiedCommand}</CodeBlock>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 2: Perform the Publishing Rite</h3>
                    <p>With all recipes scribed, invoke the standard Publishing Rite. This will build, sign, and publish the `kael-status-conduit` package to our Athenaeum.</p>
                     <CodeBlock lang="bash">cd ~/packages && ./publish-package.sh kael-status-conduit</CodeBlock>

                </div>
            </div>
        </div>
    );
};
