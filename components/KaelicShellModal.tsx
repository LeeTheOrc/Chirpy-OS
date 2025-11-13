

import React from 'react';
import { CloseIcon, CopyIcon, ShellPromptIcon } from './Icons';

interface KaelicShellModalProps {
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

const PYTHON_SOURCE = `
#!/usr/bin/env python
import os
import sys
import subprocess
import requests
import json
from pathlib import Path

from prompt_toolkit import PromptSession
from prompt_toolkit.history import FileHistory
from prompt_toolkit.auto_suggest import AutoSuggestFromHistory
from prompt_toolkit.completion import WordCompleter
from prompt_toolkit.styles import Style

# --- Configuration ---
HISTORY_FILE = str(Path.home() / '.kaelic_shell_history')
OLLAMA_URL = "http://localhost:11434/api/generate"
PRE_EXEC_ENABLED = True
ALIASES = {
    'update': 'paru',
    'yay': 'paru',
    'ls': 'ls --color=auto',
    'grep': 'grep --color=auto',
}
COMMAND_COMPLETER = WordCompleter([
    'ls', 'cd', 'pwd', 'paru', 'git', 'docker', 'systemctl', 'journalctl',
], ignore_case=True)
PROMPT_STYLE = Style.from_dict({
    'prompt': 'ansigreen bold',
    'path': 'ansiblue bold',
    'sigil': 'ansiyellow bold',
})

def expand_aliases(command):
    """Expands common aliases."""
    parts = command.split()
    if not parts:
        return ""
    if parts[0] in ALIASES:
        parts[0] = ALIASES[parts[0]]
    return ' '.join(parts)

def pre_execution_check(command):
    """Sends the command to the local Ollama instance for a safety check."""
    if not PRE_EXEC_ENABLED:
        return True

    prompt = (
        "You are the Command Seer, an expert on Linux commands. "
        "Analyze the following user command for potential errors, typos, or dangerous operations (like 'rm -rf /'). "
        "If the command appears safe and correct, your entire response must be ONLY the word 'SAFE'. "
        "If you see a potential problem, your response must start with 'WARNING:' followed by a very brief, one-sentence explanation. "
        f"Command: {command}"
    )
    payload = {
        "model": "phi3:mini",
        "prompt": prompt,
        "stream": False
    }
    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=3)
        response.raise_for_status()
        result = response.json().get('response', '').strip()

        if result.startswith("WARNING:"):
            print(f"\\033[93mKael's Warning:\\033[0m {result[len('WARNING:'):].strip()}", file=sys.stderr)
            confirm = input("Do you want to proceed? [y/N] ")
            return confirm.lower() == 'y'
        # If it's not a warning, we assume it's safe.
        return True
    except requests.exceptions.RequestException:
        # If Ollama isn't running, just allow the command.
        return True

def main():
    session = PromptSession(history=FileHistory(HISTORY_FILE))

    while True:
        try:
            # Build the rich prompt
            path = Path.cwd()
            home = Path.home()
            if path == home:
                display_path = '~'
            else:
                try:
                    display_path = str(path.relative_to(home))
                    display_path = f"~/{display_path}"
                except ValueError:
                    display_path = str(path)
            
            message = [
                ('class:prompt', 'architect@kael-os'),
                ('',':'),
                ('class:path', display_path),
                ('class:sigil', '>$ ')
            ]

            command = session.prompt(
                message,
                style=PROMPT_STYLE,
                auto_suggest=AutoSuggestFromHistory(),
                completer=COMMAND_COMPLETER
            ).strip()

            if not command:
                continue
            if command.lower() == 'exit':
                break

            # Handle built-in 'cd'
            if command.startswith('cd '):
                try:
                    path = command.split(' ', 1)[1]
                    os.chdir(Path(path).expanduser())
                except (FileNotFoundError, IndexError) as e:
                    print(f"kaelic-shell: {e}", file=sys.stderr)
                continue

            expanded_command = expand_aliases(command)

            if pre_execution_check(expanded_command):
                subprocess.run(expanded_command, shell=True, check=False)

        except KeyboardInterrupt:
            continue
        except EOFError:
            break

if __name__ == "__main__":
    main()
`.trim()

const DESKTOP_FILE_SOURCE = `
[Desktop Entry]
Name=Kaelic Shell
Comment=The custom, AI-integrated shell for Kael OS
Exec=kaelic-shell
Icon=kaelic-shell
Terminal=true
Type=Application
Categories=System;Utility;
`.trim();

const SVG_ICON_SOURCE = `
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="64" height="64" rx="8" fill="#120e1a"/>
<path d="M12 48V16 M12 32H24 M24 32L34 20 M24 32L34 44" stroke="#ffcc00" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M40 26L50 34L40 42" stroke="#7aebbe" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`.trim();

const PKGBUILD_SOURCE = `
# Maintainer: The Architect <your-email@example.com>
pkgname=kaelic-shell
pkgver=0.1
pkgrel=1
pkgdesc="A custom, AI-integrated shell for Kael OS."
arch=('any')
license=('GPL3')
depends=('python' 'python-prompt_toolkit' 'python-requests')
source=("$pkgname.py"
        "$pkgname.desktop"
        "$pkgname.svg")
sha256sums=('SKIP'
            'SKIP'
            'SKIP')

package() {
    install -Dm755 "$srcdir/$pkgname.py" "$pkgdir/usr/bin/$pkgname"
    install -Dm644 "$srcdir/$pkgname.desktop" "$pkgdir/usr/share/applications/$pkgname.desktop"
    install -Dm644 "$srcdir/$pkgname.svg" "$pkgdir/usr/share/icons/hicolor/scalable/apps/$pkgname.svg"
}
`.trim()

const UNIFIED_SCRIPT = `#!/bin/bash
# Kael OS - Unified Scribing Ritual for 'kaelic-shell'
set -euo pipefail

PKG_NAME="kaelic-shell"
PKG_DIR="$HOME/packages/$PKG_NAME"

echo "--- Scribing recipe for '$PKG_NAME' ---"
mkdir -p "$PKG_DIR"

# --- Scribe kaelic-shell.py ---
cat > "$PKG_DIR/kaelic-shell.py" << 'EOF_PY'
${PYTHON_SOURCE}
EOF_PY

# --- Scribe PKGBUILD ---
cat > "$PKG_DIR/PKGBUILD" << 'EOF_PKGBUILD'
${PKGBUILD_SOURCE}
EOF_PKGBUILD

# --- Scribe kaelic-shell.desktop ---
cat > "$PKG_DIR/kaelic-shell.desktop" << 'EOF_DESKTOP'
${DESKTOP_FILE_SOURCE}
EOF_DESKTOP

# --- Scribe kaelic-shell.svg ---
cat > "$PKG_DIR/kaelic-shell.svg" << 'EOF_SVG'
${SVG_ICON_SOURCE}
EOF_SVG

echo "✅ All recipes for '$PKG_NAME' have been scribed to '$PKG_DIR'."
`.trim();

const encodedScript = btoa(unescape(encodeURIComponent(UNIFIED_SCRIPT)));
const unifiedCommand = `echo "${encodedScript}" | base64 --decode | bash`;


export const KaelicShellModal: React.FC<KaelicShellModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <ShellPromptIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Kaelic Shell</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        This is the grimoire for the **Kaelic Shell**, our bespoke, AI-integrated command line. It features innate command history, autocompletion, alias expansion, and a pre-execution "Command Seer" to check for errors.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 1: The Unified Scribing Incantation</h3>
                     <p>
                        This single command will create the package directory and scribe the Python source, the PKGBUILD recipe, a desktop launcher, and the application sigil (icon).
                    </p>
                    <CodeBlock lang="bash">{unifiedCommand}</CodeBlock>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 2: Perform the Publishing Rite</h3>
                    <p>With the recipes scribed, invoke the standard Publishing Rite. This will build, sign, and publish the `kaelic-shell` package to our Athenaeum.</p>
                     <CodeBlock lang="bash">cd ~/packages && ./publish-package.sh kaelic-shell</CodeBlock>

                </div>
            </div>
        </div>
    );
};
