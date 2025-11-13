
import React, { useState } from 'react';
import { CloseIcon, CopyIcon, PackageIcon } from './Icons';

interface LocalSourceRitualModalProps {
  onClose: () => void;
}

const CodeBlock: React.FC<{ children: React.ReactNode; lang?: string }> = ({ children, lang }) => {
    const [copied, setCopied] = useState(false);
    const textToCopy = React.Children.toArray(children).join('');

    const handleCopy = () => {
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-2">
            <pre className={`bg-forge-bg border border-forge-border rounded-lg p-3 text-xs text-forge-text-secondary font-mono pr-12 whitespace-pre-wrap break-words max-h-48 overflow-y-auto ${lang ? `language-${lang}` : ''}`}>
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

const InputField: React.FC<{label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string}> = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-forge-text-secondary mb-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-forge-bg border border-forge-border rounded-lg p-2 text-sm text-forge-text-primary focus:ring-1 focus:ring-dragon-fire transition-colors"
        />
    </div>
);

const TextAreaField: React.FC<{label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; helpText?: string}> = ({ label, value, onChange, placeholder, helpText }) => (
    <div>
        <label className="block text-sm font-medium text-forge-text-secondary mb-1">{label}</label>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={4}
            className="w-full bg-forge-bg border border-forge-border rounded-lg p-2 text-sm font-mono text-forge-text-primary focus:ring-1 focus:ring-dragon-fire transition-colors"
        />
        {helpText && <p className="text-xs text-forge-text-secondary/80 mt-1">{helpText}</p>}
    </div>
);

const RadioGroup: React.FC<{label: string, name: string, options: {value: string, label: string}[], selected: string, onChange: (value: string) => void}> = ({label, name, options, selected, onChange}) => (
    <div>
        <label className="block text-sm font-medium text-forge-text-secondary mb-2">{label}</label>
        <div className="flex gap-4">
            {options.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 text-sm text-forge-text-primary cursor-pointer">
                    <input
                        type="radio"
                        name={name}
                        value={opt.value}
                        checked={selected === opt.value}
                        onChange={() => onChange(opt.value)}
                        className="form-radio bg-forge-bg border-forge-border text-dragon-fire focus:ring-dragon-fire"
                    />
                    {opt.label}
                </label>
            ))}
        </div>
    </div>
);


export const LocalSourceRitualModal: React.FC<LocalSourceRitualModalProps> = ({ onClose }) => {
    const [generated, setGenerated] = useState(false);
    const [sourceType, setSourceType] = useState<'folder' | 'archive'>('folder');
    const [pkgName, setPkgName] = useState('');
    const [sourcePath, setSourcePath] = useState('');
    const [pkgData, setPkgData] = useState({
        pkgdesc: '',
        pkgver: '1.0',
        pkgrel: '1',
        arch: 'any',
        license: 'GPL3',
        buildCmds: '# No build commands needed by default\necho "Nothing to build."',
        packageCmds: '# Example: copy an executable to /usr/bin/\ninstall -Dm 755 -t "$pkgdir/usr/bin/" your-executable-file',
    });
    const [error, setError] = useState('');

    const getPkgbuildContent = () => {
        return `# Maintainer: The Architect <your-email@example.com>
pkgname=${pkgName || 'my-local-package'}
pkgver=${pkgData.pkgver || '1.0'}
pkgrel=${pkgData.pkgrel || '1'}
pkgdesc="${pkgData.pkgdesc || 'A package forged from local sources.'}"
arch=('${pkgData.arch}')
license=('${pkgData.license || 'GPL3'}')
source=('src')
sha256sums=('SKIP')
noextract=("src")

build() {
    cd "$srcdir/src"
    ${pkgData.buildCmds}
}

package() {
    cd "$srcdir/src"
    ${pkgData.packageCmds}
}
`;
    };

    const generateScribeScript = () => {
        const scribeScriptRaw = `#!/bin/bash
set -euo pipefail

PKG_NAME="${pkgName}"
SOURCE_PATH="${sourcePath}"
SOURCE_TYPE="${sourceType}"
PKG_DIR="\$HOME/packages/\$PKG_NAME"

echo "--- Scribing the recipe for '\$PKG_NAME' from local source ---"

# --- Validation ---
if [ "\$SOURCE_TYPE" == "folder" ] && [ ! -d "\$SOURCE_PATH" ]; then
    echo "ERROR: Source folder '\$SOURCE_PATH' not found." >&2; exit 1;
fi
if [ "\$SOURCE_TYPE" == "archive" ] && [ ! -f "\$SOURCE_PATH" ]; then
    echo "ERROR: Source archive '\$SOURCE_PATH' not found." >&2; exit 1;
fi

# --- File Operations ---
echo "--> Preparing package directory at '\$PKG_DIR'..."
mkdir -p "\$PKG_DIR/src"

echo "--> Copying/Extracting source materials..."
if [ "\$SOURCE_TYPE" == "folder" ]; then
    cp -r "\$SOURCE_PATH/." "\$PKG_DIR/src/"
else
    # Assumes a single top-level directory in the archive, which is common.
    tar -xvf "\$SOURCE_PATH" -C "\$PKG_DIR/src" --strip-components=1
fi

# --- Scribe PKGBUILD ---
echo "--> Scribing the PKGBUILD recipe..."
cat > "\$PKG_DIR/PKGBUILD" << 'PKGBUILD_EOF'
${getPkgbuildContent()}
PKGBUILD_EOF

echo ""
echo "✅ Recipe for '\$PKG_NAME' has been successfully scribed."
echo "You may now inspect the files in '\$PKG_DIR' before publishing."
`;
        const encoded = btoa(unescape(encodeURIComponent(scribeScriptRaw.trim())));
        return `echo "${encoded}" | base64 --decode | bash`;
    };

    const generatePublishScript = () => {
        return `cd ~/packages && ./publish-package.sh ${pkgName}`;
    };

    const handleGenerate = () => {
        if (!pkgName.trim() || !sourcePath.trim() || !pkgData.pkgdesc.trim()) {
            setError('Please fill out the Package Name, Source Path, and Description before generating scripts.');
            return;
        }
        setError('');
        setGenerated(true);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-forge-text-primary font-display tracking-wider flex items-center gap-3">
                        <PackageIcon className="w-5 h-5 text-dragon-fire" />
                        The Ritual of Local Forging
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="overflow-y-auto pr-2 flex-grow space-y-4">
                    {generated ? (
                        <div className="space-y-4 animate-fade-in">
                             <p>The ritual is prepared! Perform these two incantations in order.</p>
                             <div>
                                <h3 className="font-semibold text-lg text-orc-steel">Step 1: The Scribe's Incantation</h3>
                                <p className="text-sm mb-2">This command prepares the forge: it creates the package directory, copies your source code, and scribes the `PKGBUILD` recipe.</p>
                                <CodeBlock lang="bash">{generateScribeScript()}</CodeBlock>
                             </div>
                             <div>
                                <h3 className="font-semibold text-lg text-orc-steel">Step 2: The Publishing Rite</h3>
                                <p className="text-sm mb-2">Once the recipe is scribed, this command invokes our standard publisher to build, sign, and upload your artifact to the Athenaeum.</p>
                                <CodeBlock lang="bash">{generatePublishScript()}</CodeBlock>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            <p>Greetings, Architect. Let's forge an artifact from local source code. Fill out this grimoire, and I will generate the necessary incantations.</p>
                            
                            <h4 className="font-semibold text-md text-forge-text-primary pt-2">Source Materials</h4>
                            <InputField label="Package Name" value={pkgName} onChange={(e) => setPkgName(e.target.value)} placeholder="e.g., my-cool-script" />
                            <InputField label="Full Path to Source Code" value={sourcePath} onChange={(e) => setSourcePath(e.target.value)} placeholder={`/home/architect/downloads/${sourceType === 'folder' ? 'my-project' : 'my-project.tar.gz'}`} />
                            <RadioGroup
                                label="Source Type"
                                name="sourceType"
                                options={[{value: 'folder', label: 'Folder'}, {value: 'archive', label: '.zip or .tar.gz'}]}
                                selected={sourceType}
                                onChange={(val) => setSourceType(val as 'folder' | 'archive')}
                            />
                            
                            <h4 className="font-semibold text-md text-forge-text-primary pt-2">Recipe Details (PKGBUILD)</h4>
                            <InputField label="Description" value={pkgData.pkgdesc} onChange={(e) => setPkgData({...pkgData, pkgdesc: e.target.value})} placeholder="A short description of the package." />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Version" value={pkgData.pkgver} onChange={(e) => setPkgData({...pkgData, pkgver: e.target.value})} />
                                <InputField label="Release" value={pkgData.pkgrel} onChange={(e) => setPkgData({...pkgData, pkgrel: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="License" value={pkgData.license} onChange={(e) => setPkgData({...pkgData, license: e.target.value})} />
                                <RadioGroup
                                    label="Architecture"
                                    name="arch"
                                    options={[{value: 'any', label: 'Any (scripts)'}, {value: 'x86_64', label: 'x86_64 (compiled)'}]}
                                    selected={pkgData.arch}
                                    onChange={(val) => setPkgData({...pkgData, arch: val})}
                                />
                            </div>
                            <TextAreaField label="Build Commands" value={pkgData.buildCmds} onChange={(e) => setPkgData({...pkgData, buildCmds: e.target.value})} helpText="Commands to compile the code. Leave as is if not needed." />
                            <TextAreaField label="Package Commands" value={pkgData.packageCmds} onChange={(e) => setPkgData({...pkgData, packageCmds: e.target.value})} helpText="Commands to copy the built files into the final package." />
                        </div>
                    )}
                </div>
                
                <div className="pt-4 mt-4 border-t border-forge-border flex-shrink-0">
                    {error && <p className="text-red-400 text-xs mb-2 text-center">{error}</p>}
                    <div className="flex justify-end items-center">
                        {generated ? (
                            <button 
                                onClick={() => setGenerated(false)}
                                className="px-4 py-2 bg-forge-border text-forge-text-secondary rounded-md hover:bg-forge-panel transition-colors"
                            >
                                Back to Form
                            </button>
                        ) : (
                            <button
                                onClick={handleGenerate}
                                className="px-6 py-2 bg-dragon-fire text-black font-bold rounded-md hover:bg-yellow-400 transition-colors"
                            >
                                Generate Ritual Scripts
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
