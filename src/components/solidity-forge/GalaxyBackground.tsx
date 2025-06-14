
"use client";

import React, { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  currentAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number; // For sinusoidal twinkle
  color: string;
}

const GalaxyBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesArrayRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);

  const particleColors = [
    'rgba(255, 255, 255, 0.9)', // Bright White
    'rgba(220, 220, 255, 0.8)', // Pale Blueish White
    'rgba(255, 240, 230, 0.7)', // Faint Warm White
    'rgba(200, 200, 200, 0.6)', // Dimmer White
  ];

  const createParticle = useCallback((canvas: HTMLCanvasElement): Particle => {
    const size = Math.random() * 2 + 0.5; // Smaller, more star-like sizes
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const baseAlpha = Math.random() * 0.5 + 0.3; // Base transparency
    const color = particleColors[Math.floor(Math.random() * particleColors.length)];
    const twinkleSpeed = Math.random() * 0.02 + 0.005; // How fast it twinkles
    const twinklePhase = Math.random() * Math.PI * 2; // Initial phase for twinkle

    return { 
      x, 
      y, 
      size, 
      baseAlpha, 
      currentAlpha: baseAlpha,
      twinkleSpeed,
      twinklePhase,
      color 
    };
  }, [particleColors]);

  const initParticles = useCallback((canvas: HTMLCanvasElement) => {
    particlesArrayRef.current = [];
    const numberOfParticles = Math.floor((canvas.width * canvas.height) / 9000); // Adjust density for stars
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArrayRef.current.push(createParticle(canvas));
    }
  }, [createParticle]);

  const animateParticles = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particlesArrayRef.current.length; i++) {
      const p = particlesArrayRef.current[i];

      // Twinkling effect using a sine wave for smooth transition
      p.twinklePhase += p.twinkleSpeed;
      const twinkleValue = (Math.sin(p.twinklePhase) + 1) / 2; // Normalize to 0-1
      p.currentAlpha = p.baseAlpha * (0.5 + twinkleValue * 0.5); // Vary opacity from 50% to 100% of baseAlpha

      // Optional: very slow drift for a subtle parallax effect (can be removed if pure static is preferred)
      // p.x += (Math.random() - 0.5) * 0.05;
      // p.y += (Math.random() - 0.5) * 0.05;

      // Wrap particles around screen edges if they drift
      // if (p.x > canvas.width + p.size) p.x = -p.size;
      // else if (p.x < -p.size) p.x = canvas.width + p.size;
      // if (p.y > canvas.height + p.size) p.y = -p.size;
      // else if (p.y < -p.size) p.y = canvas.height + p.size;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      // Apply currentAlpha to the particle's color
      const colorParts = p.color.substring(p.color.indexOf('(') + 1, p.color.lastIndexOf(')')).split(',');
      if (colorParts.length === 4) { // rgba
        ctx.fillStyle = `rgba(${colorParts[0]}, ${colorParts[1]}, ${colorParts[2]}, ${p.currentAlpha})`;
      } else { // rgb (though unlikely with current setup)
         ctx.fillStyle = `rgba(${colorParts[0]}, ${colorParts[1]}, ${colorParts[2]}, ${p.currentAlpha})`;
      }
      ctx.fill();
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
      initParticles(canvas);
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
