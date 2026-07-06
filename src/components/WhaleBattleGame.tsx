import { useEffect, useRef, useState } from 'react';
import { Droplets, RotateCcw, Trophy, Waves, Zap } from 'lucide-react';

type Whale = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  health: number;
  maxHealth: number;
  facing: 1 | -1;
  slapCooldown: number;
  waterCooldown: number;
  hitFlash: number;
  tailSwing: number;
  stun: number;
  spin: number;
};

type Projectile = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  owner: 'player' | 'enemy';
  life: number;
  radius: number;
};

type Splash = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  radius: number;
};

type GameStatus = 'playing' | 'playerWon' | 'enemyWon';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

function drawWaterBackground(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#05233f');
  gradient.addColorStop(0.45, '#075985');
  gradient.addColorStop(1, '#0f172a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.34;
  for (let row = 0; row < 7; row++) {
    ctx.beginPath();
    const y = 38 + row * 48 + Math.sin(time / 650 + row) * 8;
    ctx.moveTo(0, y);
    for (let x = 0; x <= width + 20; x += 28) {
      ctx.lineTo(x, y + Math.sin(x / 50 + time / 700 + row) * 10);
    }
    ctx.strokeStyle = row % 2 === 0 ? '#67e8f9' : '#99f6e4';
    ctx.lineWidth = 1.3;
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.16;
  for (let i = 0; i < 28; i++) {
    const x = (i * 83 + (time / 25) % width) % width;
    const y = (i * 47 + Math.sin(time / 900 + i) * 18) % height;
    ctx.beginPath();
    ctx.arc(x, y, 2 + (i % 4), 0, Math.PI * 2);
    ctx.fillStyle = '#cffafe';
    ctx.fill();
  }
  ctx.restore();
}

function drawWhale(ctx: CanvasRenderingContext2D, whale: Whale, color: string, accent: string, time: number, isEnemy = false) {
  const { x, y, size, facing } = whale;
  const bob = Math.sin(time / 250 + x / 90) * 2.5;
  const tilt = clamp(whale.vy / 18, -0.24, 0.24) + whale.spin;

  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(facing, 1);
  ctx.rotate(tilt);

  if (whale.hitFlash > 0) {
    ctx.shadowColor = '#fca5a5';
    ctx.shadowBlur = 28;
  } else {
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
  }

  const bodyGradient = ctx.createRadialGradient(-size * 0.2, -size * 0.4, size * 0.1, 0, 0, size * 1.15);
  bodyGradient.addColorStop(0, '#ecfeff');
  bodyGradient.addColorStop(0.18, accent);
  bodyGradient.addColorStop(1, color);

  ctx.fillStyle = whale.hitFlash > 0 ? '#fecaca' : bodyGradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.22, size * 0.58, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly highlight
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#ecfeff';
  ctx.beginPath();
  ctx.ellipse(size * 0.22, size * 0.22, size * 0.58, size * 0.20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Tail stem and flukes. During tail slap, the tail swings with a large arc.
  const swingProgress = clamp(whale.tailSwing / 22, 0, 1);
  const slapWave = swingProgress > 0 ? Math.sin((1 - swingProgress) * Math.PI) : 0;
  const slapDir = isEnemy ? -1 : 1;
  const tailAngle = Math.sin(time / 130) * 0.08 + slapWave * slapDir * 0.95;
  const tailBaseX = -size * 1.05;
  const tailBaseY = size * 0.02;

  ctx.save();
  ctx.translate(tailBaseX, tailBaseY);
  ctx.rotate(tailAngle);
  ctx.translate(-tailBaseX, -tailBaseY);

  ctx.fillStyle = whale.hitFlash > 0 ? '#fecaca' : color;
  ctx.beginPath();
  ctx.moveTo(-size * 1.05, -size * 0.05);
  ctx.quadraticCurveTo(-size * 1.42, -size * 0.18, -size * 1.72, -size * 0.45);
  ctx.quadraticCurveTo(-size * 1.42, size * 0.02, -size * 1.08, size * 0.12);
  ctx.closePath();
  ctx.fill();

  const flap = Math.sin(time / 130) * size * 0.08 + slapWave * size * 0.34;
  ctx.beginPath();
  ctx.moveTo(-size * 1.55, -size * 0.22);
  ctx.quadraticCurveTo(-size * 2.18, -size * 0.96 + flap, -size * 1.82, -size * 0.05);
  ctx.quadraticCurveTo(-size * 2.22, size * 0.72 - flap, -size * 1.45, size * 0.22);
  ctx.quadraticCurveTo(-size * 1.58, 0, -size * 1.55, -size * 0.22);
  ctx.fill();

  if (slapWave > 0.45) {
    ctx.save();
    ctx.globalAlpha = 0.42 * slapWave;
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = Math.max(3, size * 0.07);
    ctx.beginPath();
    ctx.arc(-size * 1.85, 0, size * (0.55 + slapWave * 0.35), -1.0, 1.0);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();

  // Fin
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, size * 0.36);
  ctx.quadraticCurveTo(-size * 0.42, size * 0.86, size * 0.18, size * 0.56);
  ctx.quadraticCurveTo(size * 0.05, size * 0.38, -size * 0.2, size * 0.36);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.arc(size * 0.72, -size * 0.12, size * 0.075, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(size * 0.74, -size * 0.15, size * 0.026, 0, Math.PI * 2);
  ctx.fill();

  // Smile / angry mouth
  ctx.strokeStyle = '#083344';
  ctx.lineWidth = Math.max(2, size * 0.035);
  ctx.beginPath();
  if (isEnemy) {
    ctx.moveTo(size * 0.7, size * 0.18);
    ctx.quadraticCurveTo(size * 0.9, size * 0.08, size * 1.03, size * 0.20);
  } else {
    ctx.moveTo(size * 0.66, size * 0.18);
    ctx.quadraticCurveTo(size * 0.84, size * 0.32, size * 1.02, size * 0.18);
  }
  ctx.stroke();

  ctx.restore();
}


function drawWhaleSprite(
  ctx: CanvasRenderingContext2D,
  whale: Whale,
  image: HTMLImageElement | null,
  time: number,
  isEnemy = false,
) {
  if (!image || !image.complete || image.naturalWidth === 0) {
    drawWhale(ctx, whale, isEnemy ? '#7c3aed' : '#0891b2', isEnemy ? '#f0abfc' : '#67e8f9', time, isEnemy);
    return;
  }

  const { x, y, size, facing } = whale;
  const swimPulse = Math.sin(time / 260 + x / 80);
  const bodyBob = swimPulse * 3.2;
  const bodyStretch = 1 + Math.sin(time / 330 + y / 70) * 0.025;
  const tilt = clamp(whale.vy / 18, -0.24, 0.24) + whale.spin + Math.sin(time / 410) * 0.025;
  const swingProgress = clamp(whale.tailSwing / 24, 0, 1);
  const slapWave = swingProgress > 0 ? Math.sin((1 - swingProgress) * Math.PI) : 0;

  const drawW = size * 4.7;
  const drawH = size * 2.28;
  const sourceW = image.naturalWidth;
  const sourceH = image.naturalHeight;
  const slices = 36;

  ctx.save();
  ctx.translate(x, y + bodyBob);
  // Uploaded whale faces left. This transform makes the head face the target direction.
  ctx.scale(-facing * bodyStretch, 1);
  ctx.rotate(tilt);

  ctx.shadowColor = whale.hitFlash > 0 ? '#fecaca' : isEnemy ? '#c084fc' : '#22d3ee';
  ctx.shadowBlur = whale.hitFlash > 0 ? 30 : 18;
  ctx.globalAlpha = whale.hitFlash > 0 ? 0.86 : 1;
  ctx.filter = isEnemy ? 'hue-rotate(65deg) saturate(1.25) contrast(1.04)' : 'saturate(1.08) contrast(1.04)';

  for (let i = 0; i < slices; i++) {
    const t = i / (slices - 1);
    const sx = Math.floor(t * sourceW);
    const sw = Math.ceil(sourceW / slices) + 1;
    const dx = -drawW / 2 + t * drawW;
    const dw = drawW / slices + 1.6;

    // Source tail is on the right side of the uploaded image. Because the canvas is flipped
    // for facing, this still creates a convincing flexible tail/tail-slap motion.
    const tailInfluence = Math.pow(clamp((t - 0.58) / 0.42, 0, 1), 1.8);
    const bellyInfluence = Math.sin(t * Math.PI);
    const swimOffset = Math.sin(time / 135 + t * 5.8) * size * 0.055 * bellyInfluence;
    const tailKick = Math.sin(time / 105 + t * 9.5) * size * 0.14 * tailInfluence;
    const slapOffset = slapWave * size * (isEnemy ? -0.74 : 0.84) * tailInfluence;
    const slapSnap = slapWave * size * 0.12 * tailInfluence;
    const dy = -drawH / 2 + swimOffset + tailKick + slapOffset;

    ctx.drawImage(image, sx, 0, sw, sourceH, dx + slapSnap, dy, dw, drawH);
  }

  ctx.filter = 'none';
  ctx.globalAlpha = 1;

  if (slapWave > 0.1) {
    const tailX = drawW / 2 - size * 0.22;
    const tailY = slapWave * size * (isEnemy ? -0.35 : 0.35);
    ctx.save();
    ctx.globalAlpha = 0.34 + slapWave * 0.38;
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = Math.max(3, size * 0.07);
    ctx.beginPath();
    ctx.arc(tailX, tailY, size * (0.62 + slapWave * 0.52), -1.2, 1.2);
    ctx.stroke();
    ctx.restore();
  }

  // Water speed lines around the moving body to make swimming feel alive.
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = '#cffafe';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 4; i++) {
    const lineY = -size * 0.48 + i * size * 0.28 + Math.sin(time / 180 + i) * 2;
    ctx.beginPath();
    ctx.moveTo(-drawW * 0.35, lineY);
    ctx.quadraticCurveTo(-drawW * 0.05, lineY + swimPulse * 5, drawW * 0.28, lineY + Math.cos(time / 210 + i) * 5);
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore();
}

function drawProjectile(ctx: CanvasRenderingContext2D, projectile: Projectile) {
  const gradient = ctx.createRadialGradient(
    projectile.x - projectile.radius * 0.35,
    projectile.y - projectile.radius * 0.35,
    1,
    projectile.x,
    projectile.y,
    projectile.radius * 1.8,
  );
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.28, projectile.owner === 'player' ? '#67e8f9' : '#f0abfc');
  gradient.addColorStop(1, projectile.owner === 'player' ? '#0891b2' : '#a21caf');
  ctx.save();
  ctx.shadowColor = projectile.owner === 'player' ? '#22d3ee' : '#e879f9';
  ctx.shadowBlur = 18;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function createInitialGame(width: number, height: number) {
  return {
    player: {
      x: width * 0.25,
      y: height * 0.56,
      vx: 0,
      vy: 0,
      size: 38,
      health: 100,
      maxHealth: 100,
      facing: 1 as 1 | -1,
      slapCooldown: 0,
      waterCooldown: 0,
      hitFlash: 0,
      tailSwing: 0,
      stun: 0,
      spin: 0,
    },
    enemy: {
      x: width * 0.72,
      y: height * 0.46,
      vx: 0,
      vy: 0,
      size: 40,
      health: 130,
      maxHealth: 130,
      facing: -1 as 1 | -1,
      slapCooldown: 0,
      waterCooldown: 80,
      hitFlash: 0,
      tailSwing: 0,
      stun: 0,
      spin: 0,
    },
    projectiles: [] as Projectile[],
    splashes: [] as Splash[],
    status: 'playing' as GameStatus,
  };
}

export function WhaleBattleGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const whaleImageRef = useRef<HTMLImageElement | null>(null);
  const gameRef = useRef(createInitialGame(760, 360));
  const pointerRef = useRef({ x: 190, y: 180, active: false });
  const [status, setStatus] = useState<GameStatus>('playing');
  const [health, setHealth] = useState({ player: 100, enemy: 130, enemyMax: 130 });
  const [hint, setHint] = useState('Move mouse/finger to swim. Click/tap to shoot water. Press Space for tail slap.');

  useEffect(() => {
    const img = new Image();
    img.src = '/assets/whale-sprite.png';
    img.onload = () => {
      whaleImageRef.current = img;
    };
    whaleImageRef.current = img;
  }, []);

  const resetGame = () => {
    const canvas = canvasRef.current;
    const width = canvas?.clientWidth || 760;
    const height = canvas?.clientHeight || 360;
    gameRef.current = createInitialGame(width, height);
    pointerRef.current = { x: width * 0.25, y: height * 0.56, active: false };
    setStatus('playing');
    setHealth({ player: 100, enemy: 130, enemyMax: 130 });
    setHint('Move mouse/finger to swim. Click/tap to shoot water. Press Space for tail slap.');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const fireWater = (owner: 'player' | 'enemy') => {
      const game = gameRef.current;
      const whale = owner === 'player' ? game.player : game.enemy;
      const target = owner === 'player' ? game.enemy : game.player;
      if (whale.waterCooldown > 0 || game.status !== 'playing') return;
      const angle = Math.atan2(target.y - whale.y, target.x - whale.x);
      const speed = owner === 'player' ? 9.5 : 7.4;
      game.projectiles.push({
        x: whale.x + Math.cos(angle) * whale.size * 0.95,
        y: whale.y + Math.sin(angle) * whale.size * 0.45,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        owner,
        life: owner === 'player' ? 58 : 80,
        radius: owner === 'player' ? 9 : 8,
      });
      whale.waterCooldown = owner === 'player' ? 18 : 68;
      setHint(owner === 'player' ? 'Water blast launched! Use Space when close for tail slap.' : 'Enemy whale fired water! Dodge it.');
    };

    const tailSlap = () => {
      const game = gameRef.current;
      if (game.status !== 'playing' || game.player.slapCooldown > 0) return;
      const d = distance(game.player, game.enemy);
      game.player.slapCooldown = 58;
      game.player.tailSwing = 24;
      for (let i = 0; i < 34; i++) {
        const burst = 2 + Math.random() * 9;
        game.splashes.push({
          x: game.player.x - game.player.facing * game.player.size * 1.6,
          y: game.player.y + (Math.random() - 0.5) * 54,
          vx: -game.player.facing * burst + (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 8,
          life: 30 + Math.random() * 14,
          radius: 2 + Math.random() * 7,
        });
      }
      if (d < game.player.size * 3.05) {
        const knockDirection = game.enemy.x >= game.player.x ? 1 : -1;
        game.enemy.health = clamp(game.enemy.health - 20, 0, game.enemy.maxHealth);
        game.enemy.hitFlash = 18;
        game.enemy.stun = 28;
        game.enemy.spin = -knockDirection * 0.65;
        game.enemy.vx = knockDirection * 23;
        game.enemy.vy = -9 - Math.random() * 5;
        setHint('Power tail slap! Enemy whale flies across the water. Finish it with water blasts.');
      } else {
        setHint('Tail slap missed. Get very close first — this fight is tougher now.');
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = {
        x: clamp(event.clientX - rect.left, 40, rect.width - 40),
        y: clamp(event.clientY - rect.top, 50, rect.height - 40),
        active: true,
      };
    };
    const handlePointerDown = (event: PointerEvent) => {
      handlePointerMove(event);
      fireWater('player');
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        tailSlap();
      }
      if (event.key.toLowerCase() === 'r') resetGame();
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let lastTime = performance.now();
    const loop = (time: number) => {
      const delta = Math.min(2, (time - lastTime) / 16.67);
      lastTime = time;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const game = gameRef.current;

      if (game.status === 'playing') {
        const pointer = pointerRef.current;
        const playerTargetX = pointer.active ? pointer.x : game.player.x;
        const playerTargetY = pointer.active ? pointer.y : game.player.y;
        game.player.vx += (playerTargetX - game.player.x) * 0.018 * delta;
        game.player.vy += (playerTargetY - game.player.y) * 0.018 * delta;
        game.player.vx *= 0.86;
        game.player.vy *= 0.86;
        game.player.x += game.player.vx * delta;
        game.player.y += game.player.vy * delta;
        game.player.x = clamp(game.player.x, game.player.size * 1.8, width - game.player.size * 1.8);
        game.player.y = clamp(game.player.y, game.player.size * 1.3, height - game.player.size * 1.3);
        game.player.facing = game.enemy.x >= game.player.x ? 1 : -1;

        const preferredDistance = 185 + Math.sin(time / 900) * 44;
        const angleToPlayer = Math.atan2(game.player.y - game.enemy.y, game.player.x - game.enemy.x);
        const enemyTargetX = game.player.x - Math.cos(angleToPlayer) * preferredDistance;
        const enemyTargetY = game.player.y - Math.sin(angleToPlayer) * preferredDistance + Math.sin(time / 380) * 52;
        if (game.enemy.stun <= 0) {
          game.enemy.vx += (enemyTargetX - game.enemy.x) * 0.016 * delta;
          game.enemy.vy += (enemyTargetY - game.enemy.y) * 0.016 * delta;
          game.enemy.vx *= 0.90;
          game.enemy.vy *= 0.90;
        } else {
          game.enemy.vx *= 0.965;
          game.enemy.vy *= 0.965;
          game.enemy.vy += 0.24 * delta;
        }
        game.enemy.x += game.enemy.vx * delta;
        game.enemy.y += game.enemy.vy * delta;
        const enemyMinX = game.enemy.size * 1.8;
        const enemyMaxX = width - game.enemy.size * 1.8;
        const enemyMinY = game.enemy.size * 1.4;
        const enemyMaxY = height - game.enemy.size * 1.3;
        if (game.enemy.x < enemyMinX || game.enemy.x > enemyMaxX) {
          game.enemy.x = clamp(game.enemy.x, enemyMinX, enemyMaxX);
          game.enemy.vx *= -0.72;
          game.enemy.spin *= -0.55;
        }
        if (game.enemy.y < enemyMinY || game.enemy.y > enemyMaxY) {
          game.enemy.y = clamp(game.enemy.y, enemyMinY, enemyMaxY);
          game.enemy.vy *= -0.62;
        }
        game.enemy.facing = game.player.x >= game.enemy.x ? 1 : -1;

        if (game.enemy.waterCooldown <= 0 && distance(game.enemy, game.player) < 430 && game.enemy.stun <= 0) {
          fireWater('enemy');
        }
        if (game.enemy.slapCooldown <= 0 && distance(game.enemy, game.player) < game.enemy.size * 2.45 && game.enemy.stun <= 0) {
          game.enemy.tailSwing = 22;
          game.player.health = clamp(game.player.health - 15, 0, game.player.maxHealth);
          game.player.hitFlash = 14;
          game.player.stun = 10;
          game.player.vx += game.enemy.facing * 10;
          game.player.vy -= 3;
          game.enemy.slapCooldown = 54;
          setHint('Enemy tail slapped you hard! Dodge, then counter-slap when very close.');
        }

        game.player.waterCooldown = Math.max(0, game.player.waterCooldown - delta);
        game.enemy.waterCooldown = Math.max(0, game.enemy.waterCooldown - delta);
        game.player.slapCooldown = Math.max(0, game.player.slapCooldown - delta);
        game.enemy.slapCooldown = Math.max(0, game.enemy.slapCooldown - delta);
        game.player.tailSwing = Math.max(0, game.player.tailSwing - delta);
        game.enemy.tailSwing = Math.max(0, game.enemy.tailSwing - delta);
        game.player.stun = Math.max(0, game.player.stun - delta);
        game.enemy.stun = Math.max(0, game.enemy.stun - delta);
        game.player.spin *= 0.88;
        game.enemy.spin *= 0.90;
        game.player.hitFlash = Math.max(0, game.player.hitFlash - delta);
        game.enemy.hitFlash = Math.max(0, game.enemy.hitFlash - delta);

        game.projectiles = game.projectiles.filter((projectile) => {
          projectile.x += projectile.vx * delta;
          projectile.y += projectile.vy * delta;
          projectile.life -= delta;
          const target = projectile.owner === 'player' ? game.enemy : game.player;
          if (distance(projectile, target) < target.size * 0.72) {
            target.health = clamp(target.health - (projectile.owner === 'player' ? 7 : 9), 0, target.maxHealth);
            target.hitFlash = 10;
            target.vx += projectile.vx * 0.42;
            target.vy += projectile.vy * 0.32;
            for (let i = 0; i < 9; i++) {
              game.splashes.push({
                x: projectile.x,
                y: projectile.y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 18,
                radius: 2 + Math.random() * 5,
              });
            }
            return false;
          }
          return projectile.life > 0 && projectile.x > -50 && projectile.x < width + 50 && projectile.y > -50 && projectile.y < height + 50;
        });

        game.splashes = game.splashes.filter((splash) => {
          splash.x += splash.vx * delta;
          splash.y += splash.vy * delta;
          splash.vy += 0.03 * delta;
          splash.life -= delta;
          return splash.life > 0;
        });

        if (game.enemy.health <= 0) {
          game.status = 'playerWon';
          setStatus('playerWon');
          setHint('You won! Your whale controlled the ocean.');
        } else if (game.player.health <= 0) {
          game.status = 'enemyWon';
          setStatus('enemyWon');
          setHint('Enemy whale won this round. Press Restart and fight again.');
        }
        setHealth({ player: Math.round(game.player.health), enemy: Math.round(game.enemy.health), enemyMax: game.enemy.maxHealth });
      }

      drawWaterBackground(ctx, width, height, time);
      game.projectiles.forEach((projectile) => drawProjectile(ctx, projectile));
      game.splashes.forEach((splash) => {
        ctx.save();
        ctx.globalAlpha = clamp(splash.life / 18, 0, 1);
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.arc(splash.x, splash.y, splash.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      drawWhaleSprite(ctx, game.player, whaleImageRef.current, time, false);
      drawWhaleSprite(ctx, game.enemy, whaleImageRef.current, time, true);

      if (game.status !== 'playing') {
        ctx.save();
        ctx.fillStyle = 'rgba(2, 6, 23, 0.58)';
        ctx.fillRect(0, 0, width, height);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f8fafc';
        ctx.font = '800 28px system-ui, sans-serif';
        ctx.fillText(game.status === 'playerWon' ? 'Player Whale Wins!' : 'Enemy Whale Wins!', width / 2, height / 2 - 10);
        ctx.fillStyle = '#a5f3fc';
        ctx.font = '500 15px system-ui, sans-serif';
        ctx.fillText('Press Restart to play again', width / 2, height / 2 + 22);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const playerPercent = clamp(health.player, 0, 100);
  const enemyPercent = clamp((health.enemy / health.enemyMax) * 100, 0, 100);

  return (
    <div className="mb-16 overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-950/80 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
      <div className="border-b border-cyan-400/10 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-fuchsia-500/10 p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
              <Waves size={14} /> Interactive skill arena
            </div>
            <h3 className="text-2xl font-bold text-gray-100 lg:text-3xl">Real Whale Water Battle</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
              Move with your mouse or finger, tap/click to fire water, and press Space for a heavy tail slap. The uploaded whale sprite now swims with body waves, tail motion, and knockback physics.
            </p>
          </div>
          <button
            onClick={resetGame}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
          >
            <RotateCcw size={18} /> Restart Fight
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_260px] lg:p-6">
        <div className="relative overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/80">
          <canvas
            ref={canvasRef}
            className="block h-[300px] w-full cursor-crosshair touch-none sm:h-[360px] lg:h-[420px]"
            aria-label="Interactive whale battle game"
          />
          <div className="pointer-events-none absolute left-4 top-4 right-4 flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="rounded-full border border-cyan-300/20 bg-slate-950/55 px-3 py-1.5 text-cyan-100 backdrop-blur">
              You: Water + Tail Slap
            </div>
            <div className="rounded-full border border-fuchsia-300/20 bg-slate-950/55 px-3 py-1.5 text-fuchsia-100 backdrop-blur">
              Enemy AI Whale
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-cyan-200">Player Whale</span>
              <span className="text-cyan-300">{playerPercent}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-300 transition-all" style={{ width: `${playerPercent}%` }} />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-fuchsia-200">Enemy Whale</span>
              <span className="text-fuchsia-300">{health.enemy}/{health.enemyMax}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-violet-400 transition-all" style={{ width: `${enemyPercent}%` }} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-700/70 bg-slate-950/55 p-4 text-sm leading-relaxed text-gray-300">
            {status === 'playerWon' && <Trophy className="mb-2 text-amber-300" size={24} />}
            {status === 'enemyWon' && <Zap className="mb-2 text-fuchsia-300" size={24} />}
            {hint}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
            <div className="rounded-xl bg-slate-950/50 p-3">
              <Droplets className="mb-2 text-cyan-300" size={18} />
              Click/tap = water attack
            </div>
            <div className="rounded-xl bg-slate-950/50 p-3">
              <Waves className="mb-2 text-teal-300" size={18} />
              Space = power tail slap
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
