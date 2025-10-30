import React from 'react';
import type { DistroConfig, InternalizedService } from '../types';

interface SovereignServicesConfiguratorProps {
  config: DistroConfig;
  onConfigChange: (newConfig: DistroConfig) => void;
  isLocked: boolean;
}

const FOUNDATIONAL_SERVICES: Omit<InternalizedService, 'enabled'>[] = [
    {
        id: 'code-server',
        name: 'Code Server',
        port: 8080,
        protocol: 'tcp',
        description: 'A web-based VS Code instance hosted directly from your Realm.',
        packageName: 'code-server',
    },
];

export const SovereignServicesConfigurator: React.FC<SovereignServicesConfiguratorProps> = ({ config, onConfigChange, isLocked }) => {
    
    // In the future, this could handle toggling optional services.
    // For now, it's a display of the foundational services.

    return (
        <div className="space-y-3">
             <p className="text-forge-text-secondary text-xs">
                Per the immutable Law of Sovereign Hosting, the Realm contains its own core services to ensure self-sufficiency and provide a built-in development environment.
            </p>
            <div>
                <h6 className="font-semibold text-forge-text-secondary text-sm mb-2">Foundational Services:</h6>
                {FOUNDATIONAL_SERVICES.map(service => {
                    const isEnabled = config.internalizedServices.some(s => s.id === service.id && s.enabled);
                    return (
                        <div key={service.id} className="flex justify-between items-center bg-forge-panel/30 p-3 rounded-md border border-forge-border/50">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-forge-text-primary text-sm font-medium">{service.name}</span>
                                <span className="text-forge-text-secondary text-xs">{service.description}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-dragon-fire">
                                <div className="w-2 h-2 rounded-full bg-dragon-fire"></div>
                                Always Active
                            </div>
                        </div>
                    );
                })}
            </div>
             <div className="text-center pt-2">
                <p className="text-forge-text-secondary/50 text-xs italic">More sovereign services will be forgeable in the future.</p>
            </div>
        </div>
    );
};