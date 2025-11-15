
import React from 'react';
import { CloseIcon, LinkIcon } from '../core/Icons';
import { CodeBlock } from '../core/CodeBlock';

interface WebDiskAttunementModalProps {
  onClose: () => void;
}

const WEBDISK_ATTUNEMENT_SCRIPT_RAW = `#!/bin/bash
set -euo pipefail

echo "--- WebDisk Attunement Ritual ---"
echo "This ritual will configure your system for easy, persistent access to the WebDisk."
echo ""

# --- [1/6] Prerequisite Check ---
echo "--> [1/6] Verifying davfs2 installation..."
if ! command -v mount.davfs &> /dev/null; then
    echo "❌ ERROR: 'davfs2' is not installed. Please run the 'Install Forge Dependencies' ritual first." >&2
    exit 1
fi
echo "✅ 'davfs2' is installed."
echo ""

# --- [2/6] User and Group Setup ---
# Correctly determine the user, even under sudo
THE_USER="\${SUDO_USER:-\$USER}"
USER_HOME=$(getent passwd "\$THE_USER" | cut -d: -f6)
echo "--> [2/6] Configuring user '\$THE_USER' for davfs2..."
if ! getent group davfs2 &>/dev/null; then
    echo "    -> 'davfs2' group does not exist. This is unusual. Skipping group addition."
else
    if id -nG "\$THE_USER" | grep -qw "davfs2"; then
        echo "    -> User is already in the 'davfs2' group."
    else
        echo "    -> Adding user to the 'davfs2' group..."
        sudo gpasswd -a "\$THE_USER" davfs2
        echo "    ⚠️ NOTE: You may need to log out and log back in for this group change to take full effect."
    fi
fi
echo "✅ User configuration complete."
echo ""

# --- [3/6] Mount Point Creation ---
MOUNT_POINT="\$USER_HOME/WebDisk"
echo "--> [3/6] Ensuring mount point exists at \$MOUNT_POINT..."
mkdir -p "\$MOUNT_POINT"
# Ensure the user owns the mount point, just in case.
sudo chown "\$THE_USER:\$THE_USER" "\$MOUNT_POINT"
echo "✅ Mount point is ready."
echo ""

# --- [4/6] Credential Configuration ---
WEBDAV_URL="https://leroyonline.co.za:2078"
WEBDAV_USER="leroy@leroyonline.co.za"
WEBDAV_PASS='LeRoy0923!'
SECRETS_FILE="\$USER_HOME/.davfs2/secrets"

echo "--> [4/6] Storing credentials securely in \${SECRETS_FILE}..."
mkdir -p "\$(dirname "\$SECRETS_FILE")"
# This command needs to run as the user to correctly handle home directory permissions
sudo -u "\$THE_USER" bash -c "touch \\"\$SECRETS_FILE\\"; chmod 600 \\"\$SECRETS_FILE\\""

# The secret entry format is: <mount_point_or_url> <user> <password>
SECRET_ENTRY="\$WEBDAV_URL \\"\$WEBDAV_USER\\" \\"\$WEBDAV_PASS\\""

# Remove any old entry for this URL before adding the new one
# Use a temporary file to avoid issues with in-place editing
TEMP_SECRETS=\$(mktemp)
grep -vF "\$WEBDAV_URL" "\$SECRETS_FILE" > "\$TEMP_SECRETS" || true
echo "\$SECRET_ENTRY" >> "\$TEMP_SECRETS"
# Move back and set correct ownership
sudo -u "\$THE_USER" bash -c "mv \\"\$TEMP_SECRETS\\" \\"\$SECRETS_FILE\\""

echo "✅ Credentials securely stored."
echo ""

# --- [5/6] fstab Configuration ---
FSTAB_FILE="/etc/fstab"
FSTAB_BACKUP="/etc/fstab.kael-webdisk.bak"
USER_ID=\$(id -u "\$THE_USER")
GROUP_ID=\$(id -g "\$THE_USER")

FSTAB_ENTRY="\$WEBDAV_URL \$MOUNT_POINT davfs user,auto,uid=\$USER_ID,gid=\$GROUP_ID,_netdev 0 0"

echo "--> [5/6] Configuring /etc/fstab for convenient mounting..."
if [ ! -f "\$FSTAB_BACKUP" ]; then
    sudo cp "\$FSTAB_FILE" "\$FSTAB_BACKUP"
    echo "    -> Created backup: \$FSTAB_BACKUP"
fi

# Remove any old entry for this mount point before adding the new one
if grep -q " \$MOUNT_POINT davfs " "\$FSTAB_FILE"; then
    echo "    -> Found existing entry in fstab. Replacing it."
    sudo sed -i.bak -e "s|^.* \$MOUNT_POINT davfs .*||g" "\$FSTAB_FILE"
fi
# Clean up any blank lines that might have been left by sed
sudo sed -i '/^$/d' "\$FSTAB_FILE"

# Add the new entry
echo "\$FSTAB_ENTRY" | sudo tee -a "\$FSTAB_FILE" > /dev/null

echo "✅ /etc/fstab configured."

# --- [6/6] Mount and Verify ---
echo ""
echo "--> [6/6] Mounting the WebDisk to establish a persistent connection..."
if mountpoint -q "\$MOUNT_POINT"; then
    echo "✅ WebDisk is already mounted at \$MOUNT_POINT."
else
    # Run as the user, since the fstab entry is for the user.
    if ! sudo -u "\$THE_USER" mount "\$MOUNT_POINT"; then
        echo "❌ Mount failed. Please verify your credentials in ~/.davfs2/secrets and your network connection." >&2
        echo "   You can also try running 'mount \$MOUNT_POINT' manually for more detailed error messages." >&2
        exit 1
    fi
    echo "✅ Mount successful."
fi

echo "--> Current contents of WebDisk:"
sudo -u "\$THE_USER" ls -la "\$MOUNT_POINT"
echo ""

echo "✨ Ritual Complete! Your system is now attuned to the WebDisk."
echo "The WebDisk is now mounted at \$MOUNT_POINT and will automatically mount on boot."
echo ""
echo "You can manually unmount it with: umount \$MOUNT_POINT"
`;


export const WebDiskAttunementModal: React.FC<WebDiskAttunementModalProps> = ({ onClose }) => {
  const encodedScript = btoa(unescape(encodeURIComponent(WEBDISK_ATTUNEMENT_SCRIPT_RAW)));
  const finalCommand = `echo "${encodedScript}" | base64 --decode | bash`;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
        <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                 <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                    <LinkIcon className="w-5 h-5 text-dragon-fire" />
                    <span>Attune WebDisk Client</span>
                </h2>
                <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                <p>
                    Architect, this ritual will permanently attune your local machine to our WebDisk Athenaeum. It configures <code className="font-mono text-xs">davfs2</code>, sets up credentials, and modifies <code className="font-mono text-xs">/etc/fstab</code> to automatically mount the WebDisk on boot. After the ritual, the WebDisk will be mounted and ready for use.
                </p>
                <p className="text-sm p-3 bg-orc-steel/10 border-l-4 border-orc-steel rounded">
                   The incantation will perform six sacred acts:
                   <ol className="list-decimal list-inside pl-2 mt-2 space-y-1">
                        <li><strong className="text-orc-steel">Verify Familiars:</strong> Ensures <code className="font-mono text-xs">davfs2</code> is installed.</li>
                        <li><strong className="text-orc-steel">Grant Authority:</strong> Adds your user to the <code className="font-mono text-xs">davfs2</code> group for mount permissions.</li>
                        <li><strong className="text-orc-steel">Create Sanctum:</strong> Creates the <code className="font-mono text-xs">~/WebDisk</code> mount point.</li>
                        <li><strong className="text-orc-steel">Scribe Secrets:</strong> Securely stores your WebDisk credentials in <code className="font-mono text-xs">~/.davfs2/secrets</code>.</li>
                        <li><strong className="text-orc-steel">Etch the Rune:</strong> Adds a permanent entry to <code className="font-mono text-xs">/etc/fstab</code> for automatic mounting on boot.</li>
                        <li><strong className="text-orc-steel">Bind the Connection:</strong> Mounts the WebDisk immediately, leaving it persistently connected.</li>
                   </ol>
                </p>
                 <p className="text-sm">
                    This setup is for your convenience for manual access. The other automated rituals (like Scribe and Concordance) will continue to function independently without this setup.
                </p>
                <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">The Attunement Incantation</h3>
                <p>
                    Run this single command to configure your system for easy WebDisk access.
                </p>
                 <CodeBlock lang="bash">{finalCommand}</CodeBlock>
            </div>
        </div>
    </div>
  );
};
