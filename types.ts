
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE'
}

export enum PlayerMode {
  CUBE = 'CUBE',
  SHIP = 'SHIP'
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  dy: number; // Vertical velocity
  rotation: number;
  isGrounded: boolean;
  color: string;
  mode: PlayerMode;
}

export enum ObstacleType {
  SPIKE = 'SPIKE',
  BLOCK = 'BLOCK',
  FLOOR_SPIKE = 'FLOOR_SPIKE'
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  passed: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface LevelData {
  id: number;
  name: string;
  difficulty: string;
  speed: number;
  mode: PlayerMode; // Primary mode for this level
  colors: {
    background: string;
    ground: string;
    player: string; // Default fallback color
    obstacle: string;
    secondary: string;
  };
  length: number; // Distance required to win
}

export interface StoreItem {
  id: string;
  name: string;
  color: string;
  price: number;
}

export interface UserData {
  orbs: number;
  unlockedSkins: string[]; // Array of Item IDs
  equippedSkin: string; // Current Item ID
}
