
import { LevelData, PlayerMode, StoreItem } from './types';

// Physics
export const GRAVITY = 0.6;
export const SHIP_GRAVITY = 0.4;
export const JUMP_FORCE = -11.5;
export const SHIP_LIFT = -0.5; // Constant force when holding in ship mode
export const SHIP_MAX_RISE = -8;
export const GROUND_HEIGHT = 100;

export const PLAYER_SIZE = 40;

// Shop Configuration
export const SHOP_ITEMS: StoreItem[] = [
  { id: 'default', name: 'Neon Blue', color: '#00f2ff', price: 0 },
  { id: 'crimson', name: 'Crimson', color: '#ff0055', price: 50 },
  { id: 'lime', name: 'Toxic Lime', color: '#33ff00', price: 100 },
  { id: 'blaze', name: 'Blaze', color: '#ff6600', price: 120 },
  { id: 'glacier', name: 'Glacier', color: '#aeeeee', price: 130 },
  { id: 'plasma', name: 'Plasma', color: '#aa00ff', price: 150 },
  { id: 'violet', name: 'Electric Violet', color: '#8f00ff', price: 175 },
  { id: 'white', name: 'Pure White', color: '#ffffff', price: 200 },
  { id: 'matrix', name: 'Matrix Green', color: '#00ff44', price: 250 },
  { id: 'shadow', name: 'Shadow', color: '#333333', price: 300 },
  { id: 'sunset', name: 'Sunset', color: '#ff4500', price: 350 },
  { id: 'inferno', name: 'Inferno', color: '#ff2200', price: 400 },
  { id: 'gold', name: 'Golden', color: '#ffd700', price: 500 },
  { id: 'diamond', name: 'Diamond', color: '#b9f2ff', price: 600 },
  { id: 'obsidian', name: 'Obsidian', color: '#1a1a1a', price: 800 },
  { id: 'void', name: 'Void', color: '#000000', price: 1000 },
];

// Levels Configuration
export const LEVELS: LevelData[] = [
  {
    id: 1,
    name: "NEON BREEZE",
    difficulty: "EASY",
    speed: 6.5,
    mode: PlayerMode.CUBE,
    length: 5000,
    colors: {
      background: '#0f0f16',
      ground: '#00f2ff',
      player: '#00f2ff',
      obstacle: '#ff0055',
      secondary: '#1f1f2e'
    }
  },
  {
    id: 2,
    name: "GLACIAL DRIFT",
    difficulty: "NORMAL",
    speed: 7.0,
    mode: PlayerMode.CUBE,
    length: 6000,
    colors: {
      background: '#0a1a2a',
      ground: '#aaddff',
      player: '#ffffff',
      obstacle: '#0055ff',
      secondary: '#1a3a5a'
    }
  },
  {
    id: 3,
    name: "TOXIC SEWERS",
    difficulty: "NORMAL",
    speed: 7.5,
    mode: PlayerMode.CUBE,
    length: 6500,
    colors: {
      background: '#051a05',
      ground: '#33ff00',
      player: '#ccff00',
      obstacle: '#006600',
      secondary: '#0f2e0f'
    }
  },
  {
    id: 4,
    name: "CRIMSON VELOCITY",
    difficulty: "HARD",
    speed: 8.5,
    mode: PlayerMode.CUBE,
    length: 8000,
    colors: {
      background: '#1a0505',
      ground: '#ff0000',
      player: '#ffcc00',
      obstacle: '#ffffff',
      secondary: '#2e0f0f'
    }
  },
  {
    id: 5,
    name: "SOLAR FLARE",
    difficulty: "HARD",
    speed: 9.0,
    mode: PlayerMode.SHIP,
    length: 7000,
    colors: {
      background: '#2a1a00',
      ground: '#ffaa00',
      player: '#ffff00',
      obstacle: '#ff4400',
      secondary: '#4a2a00'
    }
  },
  {
    id: 6,
    name: "VOID FLIGHT",
    difficulty: "EXPERT",
    speed: 7.5,
    mode: PlayerMode.SHIP,
    length: 6000,
    colors: {
      background: '#05001a',
      ground: '#aa00ff',
      player: '#00ffcc',
      obstacle: '#ff00aa',
      secondary: '#1a002e'
    }
  },
  {
    id: 7,
    name: "MIDNIGHT CITY",
    difficulty: "EXPERT",
    speed: 9.5,
    mode: PlayerMode.CUBE,
    length: 9000,
    colors: {
      background: '#000033',
      ground: '#ff00ff',
      player: '#00ffff',
      obstacle: '#ffff00',
      secondary: '#000066'
    }
  },
  {
    id: 8,
    name: "CYBER PUNK",
    difficulty: "INSANE",
    speed: 10.0,
    mode: PlayerMode.SHIP,
    length: 8500,
    colors: {
      background: '#110022',
      ground: '#00ffea',
      player: '#ff00aa',
      obstacle: '#ccff00',
      secondary: '#220044'
    }
  },
  {
    id: 9,
    name: "GOLDEN AGE",
    difficulty: "INSANE",
    speed: 10.5,
    mode: PlayerMode.CUBE,
    length: 10000,
    colors: {
      background: '#1a1500',
      ground: '#ffcc00',
      player: '#ffffff',
      obstacle: '#000000',
      secondary: '#332a00'
    }
  },
  {
    id: 10,
    name: "ABYSSAL ZONE",
    difficulty: "DEMON",
    speed: 11.0,
    mode: PlayerMode.SHIP,
    length: 12000,
    colors: {
      background: '#000000',
      ground: '#333333',
      player: '#ff0000',
      obstacle: '#660000',
      secondary: '#111111'
    }
  },
  {
    id: 11,
    name: "COTTON CANDY",
    difficulty: "EASY",
    speed: 6.0,
    mode: PlayerMode.CUBE,
    length: 4500,
    colors: {
      background: '#2a2030',
      ground: '#ffaad4',
      player: '#aaddff',
      obstacle: '#ffffff',
      secondary: '#403050'
    }
  },
  {
    id: 12,
    name: "INFERNO",
    difficulty: "DEMON",
    speed: 12.0,
    mode: PlayerMode.SHIP,
    length: 15000,
    colors: {
      background: '#330000',
      ground: '#ffaa00',
      player: '#ffffff',
      obstacle: '#ff0000',
      secondary: '#660000'
    }
  },
  {
    id: 13,
    name: "ZENITH",
    difficulty: "LEGENDARY",
    speed: 13.0,
    mode: PlayerMode.CUBE,
    length: 20000,
    colors: {
      background: '#eeeeee',
      ground: '#000000',
      player: '#000000',
      obstacle: '#ff0000',
      secondary: '#cccccc'
    }
  },
  // --- 10 NEW LEVELS BELOW ---
  {
    id: 14,
    name: "ELECTRO SHOCK",
    difficulty: "HARD",
    speed: 8.8,
    mode: PlayerMode.CUBE,
    length: 8500,
    colors: {
      background: '#000022',
      ground: '#0000ff',
      player: '#00ffff',
      obstacle: '#ffff00',
      secondary: '#000044'
    }
  },
  {
    id: 15,
    name: "ZERO GRAVITY",
    difficulty: "NORMAL",
    speed: 7.2,
    mode: PlayerMode.SHIP,
    length: 6800,
    colors: {
      background: '#1a1a2e',
      ground: '#e94560',
      player: '#16213e',
      obstacle: '#0f3460',
      secondary: '#533483'
    }
  },
  {
    id: 16,
    name: "CYBER CHASE",
    difficulty: "HARD",
    speed: 9.2,
    mode: PlayerMode.CUBE,
    length: 9500,
    colors: {
      background: '#020202',
      ground: '#00ff00',
      player: '#ff00ff',
      obstacle: '#00ff00',
      secondary: '#050505'
    }
  },
  {
    id: 17,
    name: "DREAMSCAPE",
    difficulty: "EASY",
    speed: 6.2,
    mode: PlayerMode.SHIP,
    length: 4800,
    colors: {
      background: '#2b2d42',
      ground: '#8d99ae',
      player: '#edf2f4',
      obstacle: '#ef233c',
      secondary: '#d90429'
    }
  },
  {
    id: 18,
    name: "MAGMA BOUND",
    difficulty: "EXPERT",
    speed: 9.8,
    mode: PlayerMode.CUBE,
    length: 10500,
    colors: {
      background: '#3d0c02',
      ground: '#ff6b35',
      player: '#f7c59f',
      obstacle: '#efefd0',
      secondary: '#004e89'
    }
  },
  {
    id: 19,
    name: "STAR DUST",
    difficulty: "NORMAL",
    speed: 7.8,
    mode: PlayerMode.CUBE,
    length: 7500,
    colors: {
      background: '#0b132b',
      ground: '#6fffe9',
      player: '#5bc0be',
      obstacle: '#3a506b',
      secondary: '#1c2541'
    }
  },
  {
    id: 20,
    name: "DIMENSION",
    difficulty: "EXPERT",
    speed: 10.2,
    mode: PlayerMode.SHIP,
    length: 11000,
    colors: {
      background: '#240046',
      ground: '#7b2cbf',
      player: '#c77dff',
      obstacle: '#e0aaff',
      secondary: '#3c096c'
    }
  },
  {
    id: 21,
    name: "GLITCH",
    difficulty: "INSANE",
    speed: 11.5,
    mode: PlayerMode.CUBE,
    length: 13000,
    colors: {
      background: '#000000',
      ground: '#00ff00',
      player: '#ffffff',
      obstacle: '#ff0000',
      secondary: '#333333'
    }
  },
  {
    id: 22,
    name: "ETERNITY",
    difficulty: "DEMON",
    speed: 12.5,
    mode: PlayerMode.SHIP,
    length: 16000,
    colors: {
      background: '#10002b',
      ground: '#e0aaff',
      player: '#9d4edd',
      obstacle: '#c77dff',
      secondary: '#240046'
    }
  },
  {
    id: 23,
    name: "FINAL DESTINATION",
    difficulty: "LEGENDARY",
    speed: 15.0,
    mode: PlayerMode.CUBE,
    length: 25000,
    colors: {
      background: '#000000',
      ground: '#ffffff',
      player: '#000000',
      obstacle: '#ff0000',
      secondary: '#666666'
    }
  }
];

export const PARTICLE_COUNT = 15;
