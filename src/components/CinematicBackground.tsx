import { useRef, useMemo, useEffect, Suspense, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import { usePortfolioStore } from '@/lib/store';

// Particle system for atmospheric effect
function Particles({ count = 200, performanceTier }: { count?: number; performanceTier: string }) {
  const mesh = useRef<THREE.Points>(null);
  const actualCount = performanceTier === 'low' ? Math.floor(count / 3) : performanceTier === 'medium' ? Math.floor(count / 1.5) : count;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(actualCount * 3);
    const vel = new Float32Array(actualCount * 3);
    
    for (let i = 0; i < actualCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
      
      vel[i * 3] = (Math.random() - 0.5) * 0.002;
      vel[i * 3 + 1] = Math.random() * 0.005 + 0.002;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
    }
    
    return [pos, vel];
  }, [actualCount]);

  useFrame(() => {
    if (!mesh.current) return;
    const positions = mesh.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < actualCount; i++) {
      positions[i * 3] += velocities[i * 3];
      positions[i * 3 + 1] += velocities[i * 3 + 1];
      positions[i * 3 + 2] += velocities[i * 3 + 2];
      
      // Reset particles that go too high
      if (positions[i * 3 + 1] > 10) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = -10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
      }
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={actualCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#4ade80"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Animated fog/mist effect
function MistLayer({ y = 0, performanceTier }: { y?: number; performanceTier: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (mesh.current && performanceTier !== 'low') {
      mesh.current.rotation.z = Math.sin(clock.elapsedTime * 0.1) * 0.1;
      mesh.current.position.x = Math.sin(clock.elapsedTime * 0.05) * 0.5;
    }
  });

  if (performanceTier === 'low') return null;

  return (
    <mesh ref={mesh} position={[0, y, -8]} rotation={[0, 0, 0]}>
      <planeGeometry args={[30, 8]} />
      <meshBasicMaterial
        color="#1a3a2a"
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Mouse parallax effect
function CameraRig() {
  const { camera, mouse } = useThree();
  const targetX = useRef(0);
  const targetY = useRef(0);

  useFrame(() => {
    targetX.current = mouse.x * 0.3;
    targetY.current = mouse.y * 0.2;
    
    camera.position.x += (targetX.current - camera.position.x) * 0.02;
    camera.position.y += (targetY.current - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// Main scene
function Scene({ performanceTier }: { performanceTier: string }) {
  return (
    <>
      <color attach="background" args={['#0a0f14']} />
      <fog attach="fog" args={['#0a1510', 5, 25]} />
      
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.3} color="#4ade80" />
      
      <Stars
        radius={100}
        depth={50}
        count={performanceTier === 'low' ? 1000 : performanceTier === 'medium' ? 3000 : 5000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />
      
      <Particles performanceTier={performanceTier} />
      
      <MistLayer y={-3} performanceTier={performanceTier} />
      <MistLayer y={-1} performanceTier={performanceTier} />
      <MistLayer y={1} performanceTier={performanceTier} />
      
      {performanceTier !== 'low' && (
        <>
          <Cloud
            position={[-8, 3, -10]}
            speed={0.2}
            opacity={0.1}
            bounds={[10, 2, 2]}
            segments={performanceTier === 'high' ? 20 : 10}
          />
          <Cloud
            position={[8, 2, -12]}
            speed={0.15}
            opacity={0.08}
            bounds={[12, 2, 2]}
            segments={performanceTier === 'high' ? 20 : 10}
          />
        </>
      )}
      
      <CameraRig />
    </>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="absolute inset-0 bg-background" />
  );
}

export function CinematicBackground() {
  const { featureFlags, performanceTier } = usePortfolioStore();
  const [isVisible, setIsVisible] = useState(true);

  // Handle visibility change to pause rendering when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Respect reduced motion and feature flag
  if (featureFlags.reducedMotion || !featureFlags.backgroundEnabled) {
    return (
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, hsl(145 30% 8%) 0%, hsl(220 20% 4%) 70%)',
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div 
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
      role="presentation"
    >
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          dpr={performanceTier === 'low' ? 1 : performanceTier === 'medium' ? 1.5 : 2}
          frameloop={isVisible ? 'always' : 'never'}
          gl={{ 
            antialias: performanceTier === 'high',
            powerPreference: performanceTier === 'low' ? 'low-power' : 'high-performance',
          }}
        >
          <Scene performanceTier={performanceTier} />
        </Canvas>
      </Suspense>
      
      {/* Gradient overlay for text readability */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, hsl(220 20% 4% / 0.3) 50%, hsl(220 20% 4% / 0.7) 100%)',
        }}
      />
    </div>
  );
}
