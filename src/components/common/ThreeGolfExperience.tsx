'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Camera, Image as ImageIcon, Pause, Play } from 'lucide-react';

const VISTA_IMAGES = [
  {
    id: 1,
    url: '/images/golf_bg_1.jpg',
    title: 'Sunset Championship Course',
    subtitle: 'Golden hour vista over luxury fairway',
  },
  {
    id: 2,
    url: '/images/golf_bg_2.jpg',
    title: 'Floodlit Night Resort',
    subtitle: 'Atmospheric evening green under floodlights',
  },
  {
    id: 3,
    url: '/images/golf_bg_3.jpg',
    title: 'Coastal Ocean Cliffside',
    subtitle: 'Dramatic cliffside green overlooking sea',
  },
  {
    id: 4,
    url: '/images/golf_bg_4.jpg',
    title: 'PGA Championship Pin',
    subtitle: 'Morning mist with glowing pin & cup',
  },
  {
    id: 5,
    url: '/images/golf_bg_5.jpg',
    title: 'Aerial Dusk Vista',
    subtitle: 'Panoramic aerial view of luxury golf estate',
  },
];

export default function ThreeGolfExperience() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentVistaIndex, setCurrentVistaIndex] = useState(0);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Auto-rotate background vistas every 10 seconds
  useEffect(() => {
    if (!isAutoRotate) return;
    const timer = setInterval(() => {
      setCurrentVistaIndex((prev) => (prev + 1) % VISTA_IMAGES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [isAutoRotate]);

  useEffect(() => {
    // Check reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsReducedMotion(true);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070a, 0.04);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Lighting System (Metallic Gold Highlights)
    const ambientLight = new THREE.AmbientLight(0xfff5e0, 0.6);
    scene.add(ambientLight);

    const goldSunLight = new THREE.DirectionalLight(0xd4af37, 2.2);
    goldSunLight.position.set(5, 8, 5);
    scene.add(goldSunLight);

    const warmFillLight = new THREE.PointLight(0xc5a059, 1.5, 20);
    warmFillLight.position.set(-4, -2, 4);
    scene.add(warmFillLight);

    // 3. 3D Metallic Golf Ball Object
    const ballGeometry = new THREE.SphereGeometry(1.2, 64, 64);
    
    // Create procedurally bump-mapped golf ball material
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = '#000000';
      for (let x = 0; x < 128; x += 16) {
        for (let y = 0; y < 128; y += 16) {
          ctx.beginPath();
          ctx.arc(x + 8, y + 8, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    const bumpTexture = new THREE.CanvasTexture(canvas);
    bumpTexture.wrapS = THREE.RepeatWrapping;
    bumpTexture.wrapT = THREE.RepeatWrapping;
    bumpTexture.repeat.set(8, 8);

    const goldBallMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.25,
      bumpMap: bumpTexture,
      bumpScale: 0.04,
    });

    const golfBallMesh = new THREE.Mesh(ballGeometry, goldBallMaterial);
    golfBallMesh.position.set(3.2, -1.2, 0);
    scene.add(golfBallMesh);

    // 4. Floating Metallic Gold Particle Dust Field (150 Particles)
    const particleCount = 150;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 20;
      particlePositions[i + 1] = (Math.random() - 0.5) * 20;
      particlePositions[i + 2] = (Math.random() - 0.5) * 15;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xf5e6ab,
      size: 0.08,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 5. Scroll & Mouse Dynamic Motion Tracking
    let targetScrollY = 0;
    let currentScrollY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 6. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth scroll interpolation
      currentScrollY += (targetScrollY - currentScrollY) * 0.06;
      const scrollRatio = currentScrollY / (document.body.scrollHeight || 1);

      // Rotate 3D Golf Ball
      golfBallMesh.rotation.x += 0.005;
      golfBallMesh.rotation.y += 0.008;

      // Parallax position updates based on scroll depth & mouse
      golfBallMesh.position.y = -1.2 + Math.sin(Date.now() * 0.001) * 0.2 - scrollRatio * 4;
      golfBallMesh.position.x = 3.2 + targetMouseX * 1.5;

      particles.rotation.y = Date.now() * 0.00015 + scrollRatio * 0.5;
      particles.rotation.x = targetMouseY * 0.5;

      camera.position.y = -targetMouseY * 0.4 - scrollRatio * 1.5;
      camera.position.x = targetMouseX * 0.6;
      camera.lookAt(0, -scrollRatio * 1.5, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      ballGeometry.dispose();
      goldBallMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, [isReducedMotion]);

  const currentVista = VISTA_IMAGES[currentVistaIndex];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Dynamic 2D High-Res Background Image Layer */}
      {VISTA_IMAGES.map((vista, idx) => {
        const isActive = idx === currentVistaIndex;
        return (
          <div
            key={vista.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-30 scale-105' : 'opacity-0 scale-100'
            }`}
            style={{
              backgroundImage: `url(${vista.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'opacity 1.4s ease-in-out, transform 14s ease-out',
            }}
          />
        );
      })}

      {/* Deep Obsidian & Gold Glass Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05070A]/90 via-[#0A0E17]/85 to-[#05070A]/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-amber-700/5 to-transparent opacity-70" />

      {/* Three.js WebGL 3D Canvas Mounting Layer */}
      {!isReducedMotion && <div ref={mountRef} className="absolute inset-0 pointer-events-none" />}

      {/* Floating Interactive Background Control Widget */}
      <div className="pointer-events-auto fixed bottom-6 right-6 z-40">
        <div className="relative group">
          <button
            onClick={() => setShowControls(!showControls)}
            className="px-4 py-2.5 rounded-full bg-[#0A0E17]/90 border border-amber-500/30 backdrop-blur-xl text-xs font-semibold text-slate-200 shadow-2xl hover:border-amber-400 hover:bg-[#121826] transition flex items-center gap-2"
            title="Switch Background Vista"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline text-[11px] font-mono tracking-widest uppercase text-amber-300 font-bold">
              3D VISTA {currentVistaIndex + 1}/5
            </span>
          </button>

          {/* Dropdown Menu */}
          {showControls && (
            <div className="absolute bottom-14 right-0 w-72 bg-[#0A0E17]/95 border border-amber-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl text-slate-200 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 font-serif">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Select Golf Vista (5 Views)
                </span>
                <button
                  onClick={() => setIsAutoRotate(!isAutoRotate)}
                  className={`p-1 rounded-lg text-xs transition ${
                    isAutoRotate ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                  title={isAutoRotate ? 'Pause Slideshow' : 'Play Slideshow'}
                >
                  {isAutoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {VISTA_IMAGES.map((vista, idx) => (
                  <button
                    key={vista.id}
                    onClick={() => setCurrentVistaIndex(idx)}
                    className={`w-full p-2 rounded-xl text-left transition flex items-center gap-2.5 border ${
                      idx === currentVistaIndex
                        ? 'bg-amber-500/15 border-amber-400/40 text-white font-semibold'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }`}
                  >
                    <div
                      className="w-10 h-7 rounded-lg shrink-0 bg-cover bg-center border border-white/10"
                      style={{ backgroundImage: `url(${vista.url})` }}
                    />
                    <div className="overflow-hidden text-left">
                      <div className="text-[11px] truncate font-semibold">{vista.title}</div>
                      <div className="text-[9px] text-slate-400 truncate">{vista.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-[10px] text-slate-500 text-center border-t border-white/10 pt-2">
                {isAutoRotate ? 'Auto-rotating every 10s' : 'Auto-rotation paused'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
