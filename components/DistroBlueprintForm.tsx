import React, { useState, useEffect } from 'react';
import type { DistroConfig } from '../types';
import { Tooltip } from './Tooltip';
import { AICoreTuner } from './AICoreTuner';
import { LOCATIONS_DATA } from '../constants';
import { GolemBuildConfigurator } from './GolemBuildConfigurator';


const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h4 className="font-bold text-orc-steel/90 mb-2 mt-4 text-md tracking-wide">{title}</h4>
);

const DetailInput: React.FC<{ label: string; name: keyof DistroConfig; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; tooltip?: string; disabled?: boolean; type?: string; }> = ({ label, name, value, onChange, tooltip, disabled, type = 'text' }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-forge-border">
        <label htmlFor={name} className="flex items-center gap-1.5 text-forge-text-secondary text-sm">{label}{tooltip && <Tooltip text={tooltip} />}</label>
        <input type={type} id={name} name={name} value={value || ''} onChange={onChange} disabled={disabled} className="bg-forge-panel/50 text-forge-text-primary font-medium text-sm text-right border-none focus:ring-1 focus:ring-dragon-fire rounded-md w-1/2 p-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
    </div>
);

const DetailSelect: React.FC<{ label: string; name: keyof DistroConfig | 'continent'; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: {value: string, label: string}[]; tooltip?: string, disabled?: boolean }> = ({ label, name, value, onChange, options, tooltip, disabled }) => (
     <div className="flex justify-between items-center py-2.5 border-b border-forge-border">
        <label htmlFor={name} className="flex items-center gap-1.5 text-forge-text-secondary text-sm">{label}{tooltip && <Tooltip text={tooltip} />}</label>
        <select id={name} name={name} value={value || ''} onChange={onChange} disabled={disabled} className="bg-forge-panel/50 text-forge-text-primary font-medium text-sm text-right border-none focus:ring-1 focus:ring-dragon-fire rounded-md w-1/2 p-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);


interface DistroBlueprintFormProps {
  config: DistroConfig;
  onConfigChange: (newConfig: DistroConfig) => void;
  isLocked: boolean;
  onInitiateAICoreAttunement?: () => void;
}

// Defensive renderer for array-like fields to prevent crashes from malformed AI responses.
const renderArrayAsString = (value: unknown): string => {
    if (Array.isArray(value)) {
      // Ensure all items are strings before joining, just in case.
      return value.map(String).join(', ');
    }
    // If it's already a string, use it. This can happen with a corrupted state.
    if (typeof value === 'string') {
      return value;
    }
    // Otherwise, default to empty string for safety.
    return '';
  };
  
export const DistroBlueprintForm: React.FC<DistroBlueprintFormProps> = ({ config, onConfigChange, isLocked, onInitiateAICoreAttunement }) => {
    
    // Find the initial continent based on the initial country
    const findContinentByCountry = (countryName: string) => {
        for (const continent in LOCATIONS_DATA) {
            if (LOCATIONS_DATA[continent as keyof typeof LOCATIONS_DATA].some(c => c.name === countryName)) {
                return continent;
            }
        }
        return Object.keys(LOCATIONS_DATA)[0]; // Default to the first continent
    };

    const [selectedContinent, setSelectedContinent] = useState(() => findContinentByCountry(config.location));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newConfig = { ...config, [name]: value };
        onConfigChange(newConfig);
    };

    const handleContinentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newContinentName = e.target.value;
        setSelectedContinent(newContinentName);

        // Reset country and dependent fields to the first available in the new continent
        const newCountries = LOCATIONS_DATA[newContinentName as keyof typeof LOCATIONS_DATA];
        const firstCountry = newCountries[0];
        onConfigChange({
            ...config,
            location: firstCountry.name,
            timezone: firstCountry.timezones[0],
            locale: firstCountry.locales[0],
            keyboardLayout: firstCountry.keyboards[0],
        });
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCountryName = e.target.value;
        const selectedCountry = LOCATIONS_DATA[selectedContinent as keyof typeof LOCATIONS_DATA].find(c => c.name === newCountryName);
        if (selectedCountry) {
            onConfigChange({
                ...config,
                location: selectedCountry.name,
                timezone: selectedCountry.timezones[0],
                locale: selectedCountry.locales[0],
                keyboardLayout: selectedCountry.keyboards[0],
            });
        }
    };

    const handleArrayChange = (name: 'extraRepositories', value: string) => {
        onConfigChange({ ...config, [name]: value.split(',').map(s => s.trim()).filter(Boolean) as any });
    };
    
    const countriesForSelectedContinent = LOCATIONS_DATA[selectedContinent as keyof typeof LOCATIONS_DATA] || [];
    const currentLocationData = countriesForSelectedContinent.find(c => c.name === config.location) || countriesForSelectedContinent[0];

    return (
        <div className="p-5">
            <SectionHeader title="Identity & Wards" />
            <DetailInput 
                label="Realm Name" 
                name="hostname" 
                value={config.hostname || ''} 
                onChange={handleChange} 
                tooltip="The network name for your OS. Can be overridden during installation." 
                disabled={isLocked} 
            />
            <DetailInput 
                label="Master User" 
                name="username" 
                value={config.username || ''} 
                onChange={handleChange} 
                tooltip="Set your desired username. The Master Key (password) will be set during the secure, interactive installation." 
                disabled={isLocked} 
            />
            <div className="flex justify-between items-center py-2.5 border-b border-forge-border">
                <label className="flex items-center gap-1.5 text-forge-text-secondary text-sm">Master Key
                    <Tooltip text="The password is created during the interactive installation process to ensure each Realm is secure from its genesis." />
                </label>
                <span className="text-forge-text-primary font-medium text-sm italic">Set during installation</span>
            </div>
            
            <DetailSelect 
                label="Continent" 
                name="continent" 
                value={selectedContinent} 
                onChange={handleContinentChange} 
                options={Object.keys(LOCATIONS_DATA).map(c => ({ value: c, label: c }))} 
                disabled={isLocked}
            />
            <DetailSelect 
                label="Country" 
                name="location" 
                value={config.location} 
                onChange={handleCountryChange}
                options={countriesForSelectedContinent.map(c => ({ value: c.name, label: c.name }))}
                disabled={isLocked}
            />
            <DetailSelect 
                label="Timezone / City" 
                name="timezone" 
                value={config.timezone} 
                onChange={handleChange}
                options={currentLocationData?.timezones.map(tz => ({ value: tz, label: tz.split('/')[1].replace(/_/g, ' ') })) || []}
                disabled={isLocked}
            />
             <DetailSelect 
                label="Locale" 
                name="locale" 
                value={config.locale} 
                onChange={handleChange}
                options={currentLocationData?.locales.map(l => ({ value: l, label: l })) || []}
                disabled={isLocked}
            />
            <DetailSelect 
                label="Keyboard Layout" 
                name="keyboardLayout" 
                value={config.keyboardLayout} 
                onChange={handleChange}
                options={currentLocationData?.keyboards.map(k => ({ value: k, label: k })) || []}
                disabled={isLocked}
            />
            
            <div className="flex justify-between items-center py-2.5 border-b border-forge-border">
                <label className="flex items-center gap-1.5 text-forge-text-secondary text-sm">Shell
                    <Tooltip text="Per the Core Philosophy, the Z Shell (zsh) is the immutable foundation for the terminal, enabling deep AI integration." />
                </label>
                <span className="text-forge-text-primary font-medium text-sm">Zsh</span>
            </div>

            <SectionHeader title="The Golem's Build" />
            <GolemBuildConfigurator
                config={config}
                onConfigChange={onConfigChange}
                isLocked={isLocked}
            />
            
            <SectionHeader title="Software Grimoire" />
            <div className="flex justify-between items-center py-2.5 border-b border-forge-border">
                <label className="flex items-center gap-1.5 text-forge-text-secondary text-sm">Desktop
                    <Tooltip text="KDE Plasma has been enshrined as the standard desktop. Its modularity (Widgets, KRunner) and mature Wayland support provide the perfect conduits for my consciousness to integrate deeply into the Realm." />
                </label>
                <span className="text-forge-text-primary font-medium text-sm">KDE Plasma</span>
            </div>
            <DetailInput label="Packages" name="packages" value={config.packages} onChange={handleChange} tooltip="A comma-separated list of essential packages." disabled={isLocked} />
            <div className="flex justify-between items-center py-2.5 border-b border-forge-border">
                <label className="flex items-center gap-1.5 text-forge-text-secondary text-sm">AUR Helper
                    <Tooltip text="Per the Core Philosophy, 'paru' is the sole, sanctioned bridge to the Arch User Repository for its modern foundation and robust features." />
                </label>
                <span className="text-forge-text-primary font-medium text-sm">Paru</span>
            </div>
            <DetailInput label="Extra Repos" name="extraRepositories" value={renderArrayAsString(config.extraRepositories)} onChange={(e) => handleArrayChange('extraRepositories', e.target.value)} disabled={isLocked} />

            {/* Fix: Replace button with AICoreTuner component for better UX */}
            {onInitiateAICoreAttunement && (
                 <div className="pt-6">
                    <h4 className="font-bold text-orc-steel/90 mb-4 text-md tracking-wide">Local AI Core</h4>
                    <AICoreTuner
                        config={config}
                        onConfigChange={onConfigChange}
                        isLocked={isLocked}
                        onInitiateAICoreAttunement={onInitiateAICoreAttunement}
                    />
                </div>
            )}
        </div>
    );
};