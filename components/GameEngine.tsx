
// ... (imports remain the same)
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Player, Obstacle, ObstacleType, Particle, LevelData, PlayerMode, UserData } from '../types';
import { 
  GRAVITY, SHIP_GRAVITY, JUMP_FORCE, SHIP_LIFT, SHIP_MAX_RISE, GROUND_HEIGHT, 
  PLAYER_SIZE, PARTICLE_COUNT, LEVELS, SHOP_ITEMS 
} from '../constants';
import { Play, RotateCcw, ChevronLeft, ChevronRight, Trophy, Rocket, ShoppingCart, Lock, Check, Circle, X } from 'lucide-react';

const GameEngine: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game State Refs
  const gameStateRef = useRef<GameState>(GameState.MENU);
  const frameIdRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const distanceRef = useRef<number>(0);
  const isHoldingRef = useRef<boolean>(false); 
  
  // User Persistence
  const [userData, setUserData] = useState<UserData>({
    orbs: 0,
    unlockedSkins: ['default'],
    equippedSkin: 'default'
  });

  // Load Data on Mount
  useEffect(() => {
    const saved = localStorage.getItem('neonDashData');
    if (saved) {
      try {
        setUserData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load save data");
      }
    }
  }, []);

  // Save Data helper
  const saveUserData = (newData: UserData) => {
    setUserData(newData);
    localStorage.setItem('neonDashData', JSON.stringify(newData));
  };
  
  // Entities Refs
  const currentLevelRef = useRef<LevelData>(LEVELS[0]);
  const playerRef = useRef<Player>({
    x: 100,
    y: 0,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    dy: 0,
    rotation: 0,
    isGrounded: false,
    color: LEVELS[0].colors.player,
    mode: PlayerMode.CUBE
  });
  
  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  // Generation Refs
  const patternStepRef = useRef<number>(0); // For multi-step obstacles (stairs)
  const patternTypeRef = useRef<'NONE' | 'STAIRS'>('NONE');

  // UI State
  const [uiState, setUiState] = useState<GameState>(GameState.MENU);
  const [showStore, setShowStore] = useState(false);
  const [selectedLevelIndex, setSelectedLevelIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [earnedOrbs, setEarnedOrbs] = useState(0);

  // Helper variables and functions for UI
  const currentLevelData = LEVELS[selectedLevelIndex];

  const prevLevel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLevelIndex((prev) => (prev - 1 + LEVELS.length) % LEVELS.length);
  };

  const nextLevel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLevelIndex((prev) => (prev + 1) % LEVELS.length);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-500 text-white';
      case 'NORMAL': return 'bg-blue-500 text-white';
      case 'HARD': return 'bg-yellow-600 text-white';
      case 'EXPERT': return 'bg-orange-600 text-white';
      case 'INSANE': return 'bg-red-600 text-white';
      case 'DEMON': return 'bg-purple-900 text-white';
      case 'LEGENDARY': return 'bg-pink-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Get current skin color
  const getCurrentSkinColor = useCallback(() => {
    const skin = SHOP_ITEMS.find(i => i.id === userData.equippedSkin);
    return skin ? skin.color : '#00f2ff';
  }, [userData.equippedSkin]);

  // Initialize Game
  const initGame = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const level = LEVELS[selectedLevelIndex];
    currentLevelRef.current = level;
    
    playerRef.current = {
      x: canvas.width * 0.2,
      y: canvas.height - GROUND_HEIGHT - PLAYER_SIZE,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      dy: 0,
      rotation: 0,
      isGrounded: true,
      color: getCurrentSkinColor(), // Use equipped skin
      mode: level.mode
    };
    
    // In Ship mode, start in middle of air
    if (level.mode === PlayerMode.SHIP) {
        playerRef.current.y = canvas.height / 2;
        playerRef.current.isGrounded = false;
    }
    
    obstaclesRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    distanceRef.current = 0;
    patternStepRef.current = 0;
    patternTypeRef.current = 'NONE';
    
    setScore(0);
    setProgress(0);
    setEarnedOrbs(0);
    
    gameStateRef.current = GameState.PLAYING;
    setUiState(GameState.PLAYING);
    setShowStore(false);
  }, [selectedLevelIndex, getCurrentSkinColor]);

  const endGame = (completed: boolean) => {
      const currentProg = Math.min(100, Math.floor((distanceRef.current / currentLevelRef.current.length) * 100));
      
      // Calculate reward: 1 Orb per 10% completion, Bonus 20 for completion
      let reward = Math.floor(currentProg / 10);
      if (completed) reward += 20;

      if (reward > 0) {
        setEarnedOrbs(reward);
        saveUserData({
            ...userData,
            orbs: userData.orbs + reward
        });
      } else {
          setEarnedOrbs(0);
      }

      if (completed) {
          gameStateRef.current = GameState.LEVEL_COMPLETE;
          setUiState(GameState.LEVEL_COMPLETE);
      } else {
          gameStateRef.current = GameState.GAME_OVER;
          setUiState(GameState.GAME_OVER);
      }
  };

  const spawnParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color: color,
        size: Math.random() * 4 + 2
      });
    }
  };

  const handleInputStart = useCallback((e?: Event) => {
    const target = e?.target as HTMLElement;
    // Prevent input if clicking buttons or if Store is open
    if (showStore || (target && (target.tagName === 'BUTTON' || target.closest('button')))) {
        return;
    }

    if (gameStateRef.current !== GameState.PLAYING) {
        return;
    }

    if (e && e.type === 'touchstart') {
      if (e.cancelable) e.preventDefault();
    }

    isHoldingRef.current = true;
    
    // Initial jump logic moved to main loop for auto-jump consistency
    // But we still trigger one immediately if grounded to ensure responsiveness
    const player = playerRef.current;
    if (player.mode === PlayerMode.CUBE && player.isGrounded) {
         player.dy = JUMP_FORCE;
         player.isGrounded = false;
         spawnParticles(player.x + player.width / 2, player.y + player.height, currentLevelRef.current.colors.ground);
    }

  }, [showStore]); 

  const handleInputEnd = useCallback(() => {
    isHoldingRef.current = false;
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        handleInputStart();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        handleInputEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleInputStart, handleInputEnd]);

  const handleBuyOrEquip = (itemId: string, price: number) => {
      if (userData.unlockedSkins.includes(itemId)) {
          // Equip
          saveUserData({
              ...userData,
              equippedSkin: itemId
          });
      } else {
          // Buy
          if (userData.orbs >= price) {
              saveUserData({
                  ...userData,
                  orbs: userData.orbs - price,
                  unlockedSkins: [...userData.unlockedSkins, itemId],
                  equippedSkin: itemId // Auto equip on buy
              });
          }
      }
  };

  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
        if (gameStateRef.current === GameState.MENU) {
           playerRef.current.y = canvas.height - GROUND_HEIGHT - PLAYER_SIZE;
           playerRef.current.color = getCurrentSkinColor();
        }
      }
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const loop = () => {
      const level = currentLevelRef.current;

      // 1. Clear & Background
      ctx.fillStyle = level.colors.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw Grid
      ctx.strokeStyle = level.colors.secondary;
      ctx.lineWidth = 1;
      const gridSize = 50;
      const offset = (distanceRef.current * 0.5) % gridSize;
      
      ctx.beginPath();
      for (let x = -offset; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      // 2. Logic
      if (gameStateRef.current === GameState.PLAYING) {
        const player = playerRef.current;
        
        // --- AUTO JUMP CHECK (Bunny Hop) ---
        if (player.mode === PlayerMode.CUBE && isHoldingRef.current && player.isGrounded) {
             player.dy = JUMP_FORCE;
             player.isGrounded = false;
             spawnParticles(player.x + player.width / 2, player.y + player.height, level.colors.ground);
        }

        // --- PHYSICS ---
        if (player.mode === PlayerMode.CUBE) {
            player.dy += GRAVITY;
            player.y += player.dy;
            if (!player.isGrounded) {
                player.rotation += 6;
            } else {
                const nearest90 = Math.round(player.rotation / 90) * 90;
                player.rotation += (nearest90 - player.rotation) * 0.2;
            }
        } else if (player.mode === PlayerMode.SHIP) {
            if (isHoldingRef.current) {
                player.dy += SHIP_LIFT;
                if (player.dy < SHIP_MAX_RISE) player.dy = SHIP_MAX_RISE; 
            } else {
                player.dy += SHIP_GRAVITY;
            }
            player.y += player.dy;
            const targetRot = Math.min(Math.max(player.dy * 4, -45), 45);
            player.rotation += (targetRot - player.rotation) * 0.1;
        }

        // --- COLLISION (Floor/Ceiling) ---
        const floorY = canvas.height - GROUND_HEIGHT - player.height;
        const ceilingY = 0;

        if (player.y >= floorY) {
          player.y = floorY;
          if (player.mode === PlayerMode.CUBE) {
            player.dy = 0;
            player.isGrounded = true;
          } else {
             player.dy = 0;
             player.isGrounded = true;
          }
        } else if (player.y <= ceilingY) {
            player.y = ceilingY;
            if (player.mode === PlayerMode.SHIP) {
                player.dy = 0; 
            }
        }

        // --- PROGRESS ---
        distanceRef.current += level.speed;
        const currentProg = Math.min(100, Math.floor((distanceRef.current / level.length) * 100));
        if (currentProg !== progress) setProgress(currentProg);

        if (distanceRef.current >= level.length) {
            endGame(true);
        }
        
        // --- OBSTACLES GENERATION ---
        const lastObstacle = obstaclesRef.current[obstaclesRef.current.length - 1];
        
        // == SHIP MODE GENERATION (Standard Pillars & Barriers) ==
        if (level.mode === PlayerMode.SHIP) {
            const minGap = 400; // More space for ship
            const maxGap = 700;
            
            if (!lastObstacle || (canvas.width - lastObstacle.x > Math.random() * (maxGap - minGap) + minGap)) {
                const type = Math.random();
                
                if (type > 0.6) {
                     // Dual Pillars (Gate)
                     const gapHeight = 180;
                     const gapY = Math.random() * (canvas.height - GROUND_HEIGHT - gapHeight - 100) + 50;
                     
                     // Top
                     obstaclesRef.current.push({
                         id: Date.now() + Math.random(),
                         x: canvas.width,
                         y: 0,
                         width: 60,
                         height: gapY,
                         type: ObstacleType.BLOCK,
                         passed: false
                     });
                     
                     // Bottom
                     obstaclesRef.current.push({
                         id: Date.now() + Math.random() + 1,
                         x: canvas.width,
                         y: gapY + gapHeight,
                         width: 60,
                         height: canvas.height - GROUND_HEIGHT - (gapY + gapHeight),
                         type: ObstacleType.BLOCK,
                         passed: false
                     });
                 } else if (type > 0.3) {
                     // Mid-air block
                     obstaclesRef.current.push({
                         id: Date.now() + Math.random(),
                         x: canvas.width,
                         y: Math.random() * (canvas.height - GROUND_HEIGHT - 150) + 50,
                         width: 80,
                         height: 80,
                         type: ObstacleType.BLOCK,
                         passed: false
                     });
                 } else {
                     // Simple Spike
                     obstaclesRef.current.push({
                        id: Date.now() + Math.random(),
                        x: canvas.width,
                        y: Math.random() > 0.5 ? canvas.height - GROUND_HEIGHT - 50 : 0, // Floor or Ceiling spike
                        width: 50,
                        height: 50,
                        type: ObstacleType.SPIKE,
                        passed: false
                     });
                 }
            }
        } 
        // == CUBE MODE GENERATION (Stairs & Spikes) ==
        else {
            const minGap = 200 + (level.speed * 10); 
            const maxGap = 500 + (level.speed * 20);

            if (patternTypeRef.current === 'STAIRS') {
                const stairGap = 50 + level.speed * 4; 
                if (canvas.width - lastObstacle.x > stairGap) {
                    patternStepRef.current++;
                    const stepHeight = 50;
                    
                    obstaclesRef.current.push({
                        id: Date.now() + Math.random(),
                        x: canvas.width,
                        y: canvas.height - GROUND_HEIGHT - (stepHeight * (patternStepRef.current + 1)),
                        width: 60,
                        height: stepHeight * (patternStepRef.current + 1),
                        type: ObstacleType.BLOCK,
                        passed: false
                    });

                    if (patternStepRef.current >= 2) {
                        patternTypeRef.current = 'NONE';
                    }
                }
            }
            else if (!lastObstacle || (canvas.width - lastObstacle.x > Math.random() * (maxGap - minGap) + minGap)) {
                const rand = Math.random();
                if (rand > 0.8) {
                    patternTypeRef.current = 'STAIRS';
                    patternStepRef.current = 0;
                    obstaclesRef.current.push({
                        id: Date.now() + Math.random(),
                        x: canvas.width,
                        y: canvas.height - GROUND_HEIGHT - 50,
                        width: 60,
                        height: 50,
                        type: ObstacleType.BLOCK,
                        passed: false
                    });
                } else {
                    if (rand > 0.5) {
                        obstaclesRef.current.push({
                            id: Date.now() + Math.random(),
                            x: canvas.width,
                            y: canvas.height - GROUND_HEIGHT - 50,
                            width: 50,
                            height: 50,
                            type: ObstacleType.BLOCK,
                            passed: false
                        });
                    } else {
                        obstaclesRef.current.push({
                            id: Date.now() + Math.random(),
                            x: canvas.width,
                            y: canvas.height - GROUND_HEIGHT - 40,
                            width: 40,
                            height: 40,
                            type: ObstacleType.SPIKE,
                            passed: false
                        });
                    }
                }
            }
        }

        // --- OBSTACLE UPDATE LOOP ---
        for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
          const obs = obstaclesRef.current[i];
          obs.x -= level.speed;

          if (obs.x + obs.width < 0) {
            obstaclesRef.current.splice(i, 1);
            continue;
          }
          
          // Collision Logic
          // Hitbox adjustments (slightly forgiving)
          const hitX = player.x + 8;
          const hitY = player.y + 8;
          const hitW = player.width - 16;
          const hitH = player.height - 16;

          if (
            hitX < obs.x + obs.width &&
            hitX + hitW > obs.x &&
            hitY < obs.y + obs.height &&
            hitY + hitH > obs.y
          ) {
            // Landing detection
            // We use previous Y position (approximate) to check if we were above the block
            const prevY = player.y - player.dy;
            const isFalling = player.dy >= 0;
            // More forgiving buffer (15px) for high speed impacts
            const wasAbove = (prevY + player.height) <= (obs.y + 15);
            
            if (obs.type === ObstacleType.BLOCK && isFalling && wasAbove) {
               player.y = obs.y - player.height;
               player.dy = 0;
               player.isGrounded = true;
               
               if (player.mode === PlayerMode.SHIP) {
                   player.dy = 0;
               }
            } else {
               // Hit side or bottom -> Death
               endGame(false);
               spawnParticles(player.x + player.width/2, player.y + player.height/2, '#fff');
            }
          }
          
          if (!obs.passed && obs.x + obs.width < player.x) {
            obs.passed = true;
            scoreRef.current += 1;
            setScore(scoreRef.current);
          }
        }
      }

      // 3. Render
      // ... (Rest of Render logic remains same)
      
      // Ground
      ctx.fillStyle = level.colors.ground;
      ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - GROUND_HEIGHT);
      ctx.lineTo(canvas.width, canvas.height - GROUND_HEIGHT);
      ctx.stroke();

      // Obstacles
      obstaclesRef.current.forEach(obs => {
        ctx.fillStyle = level.colors.obstacle;
        if (obs.type === ObstacleType.SPIKE) {
          ctx.beginPath();
          if (level.mode === PlayerMode.SHIP && obs.y === 0) {
             ctx.moveTo(obs.x, 0); 
             ctx.lineTo(obs.x + obs.width / 2, obs.height);
             ctx.lineTo(obs.x + obs.width, 0);
          } else {
             ctx.moveTo(obs.x, obs.y + obs.height); 
             ctx.lineTo(obs.x + obs.width / 2, obs.y); 
             ctx.lineTo(obs.x + obs.width, obs.y + obs.height); 
          }
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 10;
          ctx.shadowColor = level.colors.obstacle;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          // Block Rendering
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.beginPath();
          ctx.rect(obs.x, obs.y, obs.width, obs.height);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.1)';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height/2);
        }
      });

      // Player
      if (gameStateRef.current !== GameState.GAME_OVER) {
        const p = playerRef.current;
        ctx.save();
        ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
        ctx.rotate((p.rotation * Math.PI) / 180);
        
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;

        if (p.mode === PlayerMode.SHIP) {
            ctx.beginPath();
            ctx.moveTo(p.width/2, 0);
            ctx.lineTo(-p.width/2, -p.height/3);
            ctx.lineTo(-p.width/2, p.height/3);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(p.width/4, 0);
            ctx.lineTo(-p.width/4, -p.height/6);
            ctx.lineTo(-p.width/4, p.height/6);
            ctx.fill();
        } else {
            ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
            ctx.fillStyle = '#000';
            ctx.fillRect(-p.width / 4, -p.height / 4, p.width / 2, p.height / 2);
        }
        
        ctx.restore();
      }

      // Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life -= 0.03;
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      frameIdRef.current = requestAnimationFrame(loop);
    };

    frameIdRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(frameIdRef.current);
    };
  }, [initGame, uiState, getCurrentSkinColor]); // Added getCurrentSkinColor dep

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full bg-black overflow-hidden select-none cursor-pointer touch-none"
      onMouseDown={(e) => handleInputStart(e.nativeEvent)}
      onTouchStart={(e) => handleInputStart(e.nativeEvent)}
      onMouseUp={handleInputEnd}
      onTouchEnd={handleInputEnd}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-4 md:p-6 z-10">
        
        {/* Top HUD */}
        <div className="flex justify-between items-start w-full">
            {uiState !== GameState.MENU ? (
             <div className="flex flex-col">
               <div className="w-48 h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
               </div>
               <span className="text-white text-xs mt-1 font-bold">{progress}%</span>
             </div>
            ) : (
                // Orbs Counter in Menu
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-4 py-2 rounded-full border border-gray-700 pointer-events-auto">
                    <Circle className="text-cyan-400 fill-cyan-400/20 w-4 h-4" />
                    <span className="text-cyan-400 font-bold font-mono">{userData.orbs}</span>
                </div>
            )}
             
             <div className="flex flex-col items-end">
               <span className="text-gray-400 text-sm font-bold tracking-widest">{currentLevelData.name}</span>
             </div>
        </div>

        {/* Center Menus */}
        {uiState === GameState.MENU && !showStore && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-auto w-full max-w-md animate-fade-in">
             <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 italic leading-tight">
               NEON DASH
             </h1>
             <p className="text-sm text-cyan-400 font-bold tracking-widest mb-6 opacity-80">by Nhutcoder</p>
             
             {/* Level Selector Card */}
             <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 p-6 rounded-2xl shadow-2xl mx-4">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={prevLevel} className="p-2 hover:bg-gray-700 rounded-full transition text-white"><ChevronLeft size={32} /></button>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white uppercase">{currentLevelData.name}</h2>
                        <div className={`text-sm font-bold mt-1 px-3 py-0.5 rounded-full inline-block ${getDifficultyColor(currentLevelData.difficulty)}`}>
                            {currentLevelData.difficulty}
                        </div>
                    </div>
                    <button onClick={nextLevel} className="p-2 hover:bg-gray-700 rounded-full transition text-white"><ChevronRight size={32} /></button>
                </div>
                
                <div className="flex justify-center gap-4 text-xs text-gray-400 mb-6">
                    <div className="flex items-center gap-1">
                        <Rocket size={14} /> {currentLevelData.mode === PlayerMode.SHIP ? 'CHẾ ĐỘ BAY' : 'CHẾ ĐỘ NHẢY'}
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-white"></div> Tốc độ: {currentLevelData.speed}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowStore(true); }}
                      className="flex-shrink-0 w-16 h-16 bg-gray-800 hover:bg-gray-700 text-cyan-400 rounded-xl flex items-center justify-center border border-gray-600 transition"
                    >
                        <ShoppingCart />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); initGame(); }}
                      className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xl rounded-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Play className="fill-current" /> CHƠI
                    </button>
                </div>
             </div>
          </div>
        )}

        {/* Store Overlay */}
        {uiState === GameState.MENU && showStore && (
            <div className="absolute inset-0 bg-black/95 z-20 flex flex-col pointer-events-auto p-4 md:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-black text-white italic">CỬA HÀNG SKIN</h2>
                    <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full">
                            <Circle className="text-cyan-400 fill-cyan-400/20 w-5 h-5" />
                            <span className="text-cyan-400 font-bold text-xl">{userData.orbs}</span>
                        </div>
                        <button onClick={() => setShowStore(false)} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 text-white">
                            <X />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto pb-8">
                    {SHOP_ITEMS.map((item) => {
                        const isUnlocked = userData.unlockedSkins.includes(item.id);
                        const isEquipped = userData.equippedSkin === item.id;
                        const canAfford = userData.orbs >= item.price;

                        return (
                            <button
                                key={item.id}
                                onClick={(e) => { e.stopPropagation(); handleBuyOrEquip(item.id, item.price); }}
                                className={`relative group p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3
                                    ${isEquipped ? 'border-cyan-500 bg-cyan-500/10' : 
                                      isUnlocked ? 'border-gray-700 bg-gray-800 hover:border-gray-500' : 
                                      'border-gray-800 bg-gray-900 opacity-80 hover:opacity-100'}
                                `}
                            >
                                <div 
                                    className="w-16 h-16 rounded shadow-lg transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: item.color, boxShadow: `0 0 15px ${item.color}` }}
                                />
                                
                                <div className="text-center">
                                    <div className="font-bold text-sm text-white mb-1">{item.name}</div>
                                    {isUnlocked ? (
                                        <div className="text-xs text-green-400 font-bold flex items-center justify-center gap-1">
                                            {isEquipped ? <><Check size={12}/> ĐANG DÙNG</> : "ĐÃ SỞ HỮU"}
                                        </div>
                                    ) : (
                                        <div className={`text-xs font-bold flex items-center justify-center gap-1 ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {canAfford ? <ShoppingCart size={12}/> : <Lock size={12}/>} {item.price} ORBS
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        )}

        {(uiState === GameState.GAME_OVER) && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-auto z-10 bg-black/90 p-8 rounded-2xl border border-red-500/50 backdrop-blur-md shadow-2xl min-w-[300px]">
             <h2 className="text-5xl font-black text-red-500 mb-2">THẤT BẠI</h2>
             <div className="text-center mb-6">
                <div className="text-4xl font-bold text-white mb-1">{progress}%</div>
                <div className="text-xs text-gray-400 uppercase tracking-widest">Hoàn thành</div>
             </div>
             
             {earnedOrbs > 0 && (
                 <div className="mb-6 flex justify-center items-center gap-2 text-cyan-400 animate-bounce">
                     <Circle size={16} className="fill-cyan-400/20" />
                     <span className="font-bold">+{earnedOrbs} Orbs</span>
                 </div>
             )}
             
             <div className="flex gap-4">
                 <button 
                   onClick={(e) => { e.stopPropagation(); setUiState(GameState.MENU); }}
                   className="flex-1 py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition"
                 >
                   MENU
                 </button>
                 <button 
                   onClick={(e) => { e.stopPropagation(); initGame(); }}
                   className="flex-1 py-3 bg-white text-black font-black rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                 >
                   <RotateCcw size={18} /> CHƠI LẠI
                 </button>
             </div>
          </div>
        )}

        {(uiState === GameState.LEVEL_COMPLETE) && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-auto z-10 bg-black/90 p-8 rounded-2xl border border-yellow-500/50 backdrop-blur-md shadow-2xl min-w-[300px]">
             <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
             <h2 className="text-4xl font-black text-white mb-2">HOÀN THÀNH!</h2>
             <p className="text-gray-400 mb-6">Đã chinh phục {currentLevelData.name}</p>

             {earnedOrbs > 0 && (
                 <div className="mb-8 bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg flex justify-center items-center gap-2 text-yellow-400">
                     <Circle size={20} className="fill-yellow-400/20" />
                     <span className="font-bold text-lg">+{earnedOrbs} Orbs nhận được!</span>
                 </div>
             )}
             
             <button 
               onClick={(e) => { e.stopPropagation(); setUiState(GameState.MENU); }}
               className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-lg hover:brightness-110 transition"
             >
               TIẾP TỤC
             </button>
          </div>
        )}
      </div>
      
      {/* Instructions Overlay (fades out) */}
      {uiState === GameState.PLAYING && distanceRef.current < 800 && (
         <div className="absolute bottom-20 left-0 w-full text-center pointer-events-none animate-pulse px-4">
            <span className="text-white text-xl font-bold drop-shadow-lg bg-black/50 px-6 py-3 rounded-full border border-gray-600">
                {currentLevelRef.current.mode === PlayerMode.SHIP ? 'GIỮ CHUỘT/MÀN HÌNH ĐỂ BAY LÊN' : 'GIỮ SPACE/CHUỘT ĐỂ NHẢY LIÊN TỤC'}
            </span>
         </div>
      )}
    </div>
  );
};

export default GameEngine;
