
"use client";

import React, { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  currentAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
  velocityX: number; // For drift
  velocityY: number; // For drift
}

const GalaxyBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesArrayRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);

  // Futuristic Sentient UI Spec: Cyan neural points, opacity: 0.1, drift motion
  const particleColors = [
    'rgba(0, 255, 255, 0.7)', // Cyan base
    'rgba(0, 220, 255, 0.6)', // Slightly less saturated cyan
    'rgba(100, 255, 255, 0.8)', // Lighter cyan
  ];

  const createParticle = useCallback((canvas: HTMLCanvasElement): Particle => {
    const size = Math.random() * 1.5 + 0.3; // Smaller, more point-like
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    // Spec: opacity: 0.1. Let's make baseAlpha around this, twinkle can vary it slightly.
    const baseAlpha = Math.random() * 0.1 + 0.05; // Centered around 0.1
    const color = particleColors[Math.floor(Math.random() * particleColors.length)];
    const twinkleSpeed = Math.random() * 0.015 + 0.003;
    const twinklePhase = Math.random() * Math.PI * 2;
    
    // Drift motion
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.1 + 0.02; // Slow drift
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;


    return { 
      x, 
      y, 
      size, 
      baseAlpha, 
      currentAlpha: baseAlpha,
      twinkleSpeed,
      twinklePhase,
      color,
      velocityX,
      velocityY
    };
  }, [particleColors]);

  const initParticles = useCallback((canvas: HTMLCanvasElement) => {
    particlesArrayRef.current = [];
    // Adjust density: fewer, more subtle points for "neural" feel
    const numberOfParticles = Math.floor((canvas.width * canvas.height) / 15000); 
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArrayRef.current.push(createParticle(canvas));
    }
  }, [createParticle]);

  const animateParticles = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particlesArrayRef.current.length; i++) {
      const p = particlesArrayRef.current[i];

      p.twinklePhase += p.twinkleSpeed;
      const twinkleValue = (Math.sin(p.twinklePhase) + 1) / 2; 
      // Keep opacity low, varying around the baseAlpha of ~0.1
      p.currentAlpha = p.baseAlpha * (0.7 + twinkleValue * 0.6); // e.g. 0.07 to 0.13 if base is 0.1

      // Drift motion
      p.x += p.velocityX;
      p.y += p.velocityY;

      // Wrap particles for continuous drift
      if (p.x > canvas.width + p.size) p.x = -p.size;
      else if (p.x < -p.size) p.x = canvas.width + p.size;
      if (p.y > canvas.height + p.size) p.y = -p.size;
      else if (p.y < -p.size) p.y = canvas.height + p.size;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      
      const colorParts = p.color.substring(p.color.indexOf('(') + 1, p.color.lastIndexOf(')')).split(',');
      if (colorParts.length === 4) {
        ctx.fillStyle = `rgba(${colorParts[0]}, ${colorParts[1]}, ${colorParts[2]}, ${p.currentAlpha})`;
      } else {
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
      canvas.height = document.body.scrollHeight; // Ensure canvas covers full scrollable height
      initParticles(canvas);
    };
    
    // Initial setup
    setCanvasDimensions();
    animationFrameIdRef.current = requestAnimationFrame(() => animateParticles(ctx, canvas));
    
    // Handle resize and scroll
    const handleResize = () => setCanvasDimensions();
    // Recalculate on scroll if body height changes (dynamic content)
    // This might be too performance intensive, consider debouncing or specific triggers
    // For now, only resize.
    // const handleScroll = () => {
    //   if (document.body.scrollHeight !== canvas.height) {
    //     setCanvasDimensions();
    //   }
    // };

    window.addEventListener('resize', handleResize);
    // window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      // window.removeEventListener('scroll', handleScroll);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      particlesArrayRef.current = [];
    };
  }, [initParticles, animateParticles]);

  return <canvas ref={canvasRef} id="galaxy-background-canvas" />;
};

export default GalaxyBackground;
