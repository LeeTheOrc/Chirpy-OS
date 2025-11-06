import React, { useState } from 'react';
import { CloseIcon, CopyIcon, BeakerIcon } from './Icons';

interface TransmutationRitualModalProps {
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


export const TransmutationRitualModal: React.FC<TransmutationRitualModalProps> = ({ onClose }) => {

    const pkgbuildBefore = `source=("\${_realname}::git+...#tag=\${pkgver}")
sha256sums=('SKIP')
validpgpkeys=('...C54D5DA9')

prepare() {
	cd "\${_realname}"
	git submodule update --init
}
...`;

    const pkgbuildAfter = `source=("\${_realname}::git+...#tag=\${pkgver}"
        'branding.patch')
sha256sums=('SKIP'
            '...') # Run updpkgsums to generate this
validpgpkeys=('...C54D5DA9')

prepare() {
	cd "\${_realname}"
	git submodule update --init
 
    # Apply our custom patch
    patch -p1 < ../branding.patch
}
...`;


    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <BeakerIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Ritual of Transmutation</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, a Realm is not truly ours until it bears our sigil. This ritual teaches the art of transmutation—taking an existing artifact's recipe (<strong className="text-orc-steel">PKGBUILD</strong>) and infusing it with our own branding using a <strong className="text-magic-purple">.patch</strong> file.
                    </p>
                    <p>We will use our <code className="font-mono text-xs">khws</code> package as our subject.</p>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 1: Prepare the Subject</h3>
                    <p>First, we need the recipe and the raw source code. The <code className="font-mono text-xs">makepkg -o</code> command downloads and prepares the source without building it.</p>
                    <CodeBlock lang="bash">{`cd ~/packages/khws\nmakepkg -o --noextract`}</CodeBlock>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 2: Scry the Source</h3>
                    <p>Now, we find the exact line of code we wish to change. We can use <code className="font-mono text-xs">grep</code> to search the downloaded source for the text "CachyOS".</p>
                    <CodeBlock lang="bash">{`cd src/chwd\ngrep -r "CachyOS" .`}</CodeBlock>
                    <p className="text-xs italic">This might show a result like: <code className="font-mono text-xs">./src/main.rs:println!("CachyOS hardware detection tool");</code></p>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 3: Forge the Patch</h3>
                    <p>A patch file is a magical scroll that records the changes between two files. It's the cleanest way to modify source code during a build.</p>
                    <ul className="list-decimal list-inside text-sm pl-4 space-y-2">
                        <li><strong className="text-forge-text-primary">Duplicate the original file:</strong> <CodeBlock>{`cp src/main.rs src/main.rs.orig`}</CodeBlock></li>
                        <li><strong className="text-forge-text-primary">Modify the file.</strong> You can use a text editor, or for a simple find-and-replace, the <code className="font-mono text-xs">sed</code> command is perfect: <CodeBlock>{`sed -i 's/CachyOS/Kael OS/g' src/main.rs`}</CodeBlock></li>
                        <li><strong className="text-forge-text-primary">Create the patch</strong> by comparing the original and the modified file. We save it in the parent directory. <CodeBlock>{`diff -up src/main.rs.orig src/main.rs > ../../branding.patch`}</CodeBlock></li>
                    </ul>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 4: Reforge the Recipe</h3>
                    <p>Now, we must teach the PKGBUILD how to use our new patch file.</p>
                     <ul className="list-decimal list-inside text-sm pl-4 space-y-2">
                        <li>Add <code className="font-mono text-xs">'branding.patch'</code> to the <code className="font-mono text-xs">source=()</code> array in the PKGBUILD.</li>
                        <li>Run <code className="font-mono text-xs">updpkgsums</code> in the <code className="font-mono text-xs">~/packages/khws</code> directory to generate a new, secure checksum for our patch file.</li>
                        <li>Add the command <code className="font-mono text-xs">patch -p1 &lt; ../branding.patch</code> inside the <code className="font-mono text-xs">prepare()</code> function.</li>
                    </ul>
                     <p className="text-xs">The changes will look something like this:</p>
                    <CodeBlock lang="diff">{`- ${pkgbuildBefore}\n+ ${pkgbuildAfter}`}</CodeBlock>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 5: The Final Forging</h3>
                    <p>The recipe is complete! Now, simply use our standard publisher script. It will automatically apply the patch during the build process and publish your newly branded artifact.</p>
                    <CodeBlock lang="bash">{`cd ~/packages\n./publish-package.sh khws`}</CodeBlock>
                </div>
            </div>
        </div>
    );
};