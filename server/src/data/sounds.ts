export interface SoundAsset {
    id: string;
    label: string;
    category: 'common' | 'niche' | 'premium';
    minLevel: number; // Required 'Atmosphere Hours' (converted to mins)
}

export const SOUND_CATALOG: SoundAsset[] = [
    // COMMON (Level 0)
    { id: 'hairdryer', label: 'Hair Dryer (Fön)', category: 'common', minLevel: 0 },
    { id: 'rain', label: 'Heavy Rain', category: 'common', minLevel: 0 },
    { id: 'fan', label: 'Vacuum Cleaner', category: 'common', minLevel: 0 },
    { id: 'washing_machine', label: 'Washing Machine', category: 'common', minLevel: 0 },

    // NICHE (Unlock at 5 Hours)
    { id: 'ship_engine', label: 'Ship Engine Rumble', category: 'niche', minLevel: 300 },
    { id: 'server_room', label: 'Server Room Hum', category: 'niche', minLevel: 300 },
    { id: 'ceiling_fan', label: 'Ceiling Fan Click', category: 'niche', minLevel: 300 },

    // PREMIUM (Unlock at 20 Hours or Pay)
    { id: 'underwater', label: 'Underwater Bubbles', category: 'premium', minLevel: 1200 },
    { id: 'fountain_pen', label: 'Fountain Pen Scratch', category: 'premium', minLevel: 1200 },
];
