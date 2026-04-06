/**
 * @fileoverview Game canvas renderer
 * Handles all canvas-based rendering of game entities
 */

import { useEffect, useRef } from 'react';
import { GameState } from '../types/game-types';

interface GameCanvasProps {
  gameState: GameState;
  width: number;
  height: number;
}

/**
 * Canvas component for rendering the game
 * Uses requestAnimationFrame for smooth 60fps rendering
 */
export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /**
     * Main render function
     */
    const render = () => {
      // Clear canvas
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, width, height);

      // Draw battlefield separator
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw powerups
      gameState.powerups.forEach((powerup) => {
        ctx.fillStyle = powerup.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = powerup.color;
        ctx.beginPath();
        ctx.arc(powerup.position.x, powerup.position.y, powerup.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw bosses
      gameState.bosses.forEach((boss) => {
        // Boss body
        ctx.fillStyle = boss.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = boss.color;
        ctx.beginPath();
        ctx.arc(boss.position.x, boss.position.y, boss.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Boss outline
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(boss.position.x, boss.position.y, boss.size, 0, Math.PI * 2);
        ctx.stroke();

        // Health bar
        const healthBarWidth = boss.size * 2;
        const healthBarHeight = 6;
        const healthPercent = boss.health / boss.maxHealth;

        ctx.fillStyle = '#333';
        ctx.fillRect(
          boss.position.x - healthBarWidth / 2,
          boss.position.y - boss.size - 15,
          healthBarWidth,
          healthBarHeight
        );

        ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
        ctx.fillRect(
          boss.position.x - healthBarWidth / 2,
          boss.position.y - boss.size - 15,
          healthBarWidth * healthPercent,
          healthBarHeight
        );

        // Boss name
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(boss.name, boss.position.x, boss.position.y - boss.size - 25);
      });

      // Draw projectiles
      gameState.projectiles.forEach((proj) => {
        ctx.fillStyle = proj.color;
        ctx.shadowBlur = proj.ownerId === gameState.player.id ? 10 : 5;
        ctx.shadowColor = proj.color;
        ctx.beginPath();
        ctx.arc(proj.position.x, proj.position.y, proj.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw player
      const player = gameState.player;
      const isInvulnerable = player.invulnerabilityTime > 0;
      
      if (!isInvulnerable || Math.floor(Date.now() / 100) % 2 === 0) {
        // Flash when invulnerable
        ctx.fillStyle = '#00ff00';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ff00';
        ctx.beginPath();
        ctx.arc(player.position.x, player.position.y, player.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Player indicator
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.position.x, player.position.y, player.size, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Wave transition message
      if (gameState.waveTransition) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Wave ${gameState.wave} Complete!`, width / 2, height / 2);
        ctx.font = '24px monospace';
        ctx.fillText('Next wave incoming...', width / 2, height / 2 + 50);
      }

      // Game over message
      if (gameState.isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 64px monospace';
        ctx.textAlign = 'center';
        
        if (gameState.player.health <= 0) {
          ctx.fillText('GAME OVER', width / 2, height / 2 - 50);
        } else {
          ctx.fillText('VICTORY!', width / 2, height / 2 - 50);
        }

        ctx.font = '24px monospace';
        ctx.fillText(`Wave: ${gameState.wave}`, width / 2, height / 2 + 20);
        ctx.fillText(`Score: ${gameState.score}`, width / 2, height / 2 + 60);
        ctx.font = '18px monospace';
        ctx.fillText('Press ESC to return to menu', width / 2, height / 2 + 100);
      }

      renderFrameId.current = requestAnimationFrame(render);
    };

    renderFrameId.current = requestAnimationFrame(render);

    return () => {
      if (renderFrameId.current) {
        cancelAnimationFrame(renderFrameId.current);
      }
    };
  }, [gameState, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border-2 border-gray-700 rounded-lg shadow-2xl"
    />
  );
};
