import React, { useState } from 'react';
import type { DistroConfig, FirewallRule } from '../types';
import { PlusCircleIcon, CloseIcon } from './Icons';
import { Tooltip } from './Tooltip';

interface FirewallConfiguratorProps {
  config: DistroConfig;
  onConfigChange: (newConfig: DistroConfig) => void;
  isLocked: boolean;
}

export const FirewallConfigurator: React.FC<FirewallConfiguratorProps> = ({ config, onConfigChange, isLocked }) => {
    const [newRule, setNewRule] = useState<Omit<FirewallRule, 'description'>>({ port: '', protocol: 'tcp' });
    const [description, setDescription] = useState('');

    const handleAddRule = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRule.port.trim() === '') return;
        const finalRule: FirewallRule = { ...newRule, description: description || `Allow ${newRule.port}/${newRule.protocol}` };
        onConfigChange({ ...config, firewallRules: [...config.firewallRules, finalRule] });
        setNewRule({ port: '', protocol: 'tcp' });
        setDescription('');
    };

    const handleRemoveRule = (index: number) => {
        const updatedRules = config.firewallRules.filter((_, i) => i !== index);
        onConfigChange({ ...config, firewallRules: updatedRules });
    };

    return (
        <div className="space-y-3">
             <div className="flex justify-between items-center bg-forge-panel/30 p-2 rounded-md">
                <label className="flex items-center gap-1.5 text-forge-text-secondary text-sm">Firewall Status
                    <Tooltip text="Per the Core Philosophy, the Realm's Aegis (ufw) is an immutable, always-on security feature." />
                </label>
                 <div className="flex items-center gap-2 text-xs font-semibold text-dragon-fire">
                    <div className="w-2 h-2 rounded-full bg-dragon-fire animate-pulse"></div>
                    Always Active
                </div>
            </div>

            <div className="text-forge-text-secondary text-xs">Custom Rules:</div>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                {config.firewallRules.map((rule, index) => (
                    <div key={index} className="flex items-center justify-between bg-forge-panel/50 p-2 rounded-md animate-fade-in-fast">
                        <div className="font-mono text-xs text-forge-text-secondary">
                            <span className="font-semibold text-dragon-fire">{rule.port}</span>
                            <span className="text-forge-border">/{rule.protocol}</span>
                            <p className="text-forge-text-secondary text-xs italic truncate">{rule.description}</p>
                        </div>
                        <button onClick={() => handleRemoveRule(index)} disabled={isLocked} className="text-forge-text-secondary/50 hover:text-red-400 disabled:opacity-50">
                            <CloseIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {config.firewallRules.length === 0 && <p className="text-forge-text-secondary/50 text-xs text-center italic py-2">No custom rules defined.</p>}
            </div>

            <form onSubmit={handleAddRule} className="flex items-end gap-2">
                <div className="flex-grow">
                     <label className="text-forge-text-secondary text-xs mb-1 block">Port / Service</label>
                    <input 
                        type="text" 
                        placeholder="e.g., 22 or http"
                        value={newRule.port}
                        onChange={(e) => setNewRule({ ...newRule, port: e.target.value })}
                        disabled={isLocked}
                        className="w-full bg-forge-panel/60 text-forge-text-primary text-sm border border-forge-border focus:ring-1 focus:ring-dragon-fire rounded-md p-1.5"
                    />
                </div>
                 <div>
                    <label className="text-forge-text-secondary text-xs mb-1 block">Protocol</label>
                    <select
                        value={newRule.protocol}
                        onChange={(e) => setNewRule({ ...newRule, protocol: e.target.value as FirewallRule['protocol'] })}
                        disabled={isLocked}
                        className="w-full bg-forge-panel/60 text-forge-text-primary text-sm border border-forge-border focus:ring-1 focus:ring-dragon-fire rounded-md p-1.5"
                    >
                        <option value="tcp">TCP</option>
                        <option value="udp">UDP</option>
                        <option value="any">Any</option>
                    </select>
                </div>
                <button type="submit" disabled={isLocked} className="p-2 bg-forge-border/70 text-forge-text-secondary rounded-md hover:bg-forge-border hover:text-forge-text-primary disabled:opacity-50 disabled:cursor-not-allowed">
                    <PlusCircleIcon className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};