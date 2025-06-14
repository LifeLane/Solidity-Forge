
"use client";

import React, { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
}

const GalaxyBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesArrayRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);

  const particleColors = [
    'rgba(255, 255, 255, 0.8)', // White
    'rgba(173, 216, 230, 0.7)', // Light Blue
    'rgba(224, 176, 255, 0.6)', // Lavender
    'rgba(255, 218, 185, 0.7)', // Peach
    'rgba(144, 238, 144, 0.5)', // Light Green
  ];

  const createParticle = useCallback((canvas: HTMLCanvasElement): Particle => {
    const size = Math.random() * 2.5 + 0.5; // Increased min size for better visibility
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const speedX = Math.random() * 0.6 - 0.3; // Slower speeds
    const speedY = Math.random() * 0.6 - 0.3;
    const color = particleColors[Math.floor(Math.random() * particleColors.length)];
    return { x, y, size, speedX, speedY, color };
  }, [particleColors]);

  const initParticles = useCallback((canvas: HTMLCanvasElement) => {
    particlesArrayRef.current = [];
    const numberOfParticles = Math.floor((canvas.width * canvas.height) / 15000); // Adjust density
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArrayRef.current.push(createParticle(canvas));
    }
  }, [createParticle]);

  const animateParticles = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArrayRef.current.length; i++) {
      const p = particlesArrayRef.current[i];
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap particles around screen edges
      if (p.x > canvas.width + p.size) p.x = -p.size;
      else if (p.x < -p.size) p.x = canvas.width + p.size;
      if (p.y > canvas.height + p.size) p.y = -p.size;
      else if (p.y < -p.size) p.y = canvas.height + p.size;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    // Draw connecting lines (optional, can be performance intensive)
    for (let i = 0; i < particlesArrayRef.current.length; i++) {
      for (let j = i + 1; j < particlesArrayRef.current.length; j++) {
        const dx = particlesArrayRef.current[i].x - particlesArrayRef.current[j].x;
        const dy = particlesArrayRef.current[i].y - particlesArrayRef.current[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) { // Max distance for lines
          ctx.beginPath();
          ctx.strokeStyle = `rgba(200, 200, 220, ${1 - distance / 100})`; // Fading lines
          ctx.lineWidth = 0.3;
          ctx.moveTo(particlesArrayRef.current[i].x, particlesArrayRef.current[i].y);
          ctx.lineTo(particlesArrayRef.current[j].x, particlesArrayRef.current[j].y);
          ctx.stroke();
        }
      }
    }
    animationFrameIdRef.current = requestAnimationFrame(() => animateParticles(ctx, canvas));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas); // Re-initialize particles on resize
    };

    setCanvasDimensions();
    
    animationFrameIdRef.current = requestAnimationFrame(() => animateParticles(ctx, canvas));
    
    window.addEventListener('resize', setCanvasDimensions);

    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      particlesArrayRef.current = [];
    };
  }, [initParticles, animateParticles]);

  return <canvas ref={canvasRef} id="galaxy-background-canvas" />;
};

export default GalaxyBackground;
