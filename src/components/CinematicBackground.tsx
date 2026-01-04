import { useRef, useMemo, useEffect, Suspense, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolioStore } from '@/lib/store';

// ============ AURORA / NORTHERN LIGHTS EFFECT ============
function Aurora({ performanceTier }: { performanceTier: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color('#22c55e') }, // Green
    uColor2: { value: new THREE.Color('#0ea5e9') }, // Cyan
    uColor3: { value: new THREE.Color('#8b5cf6') }, // Purple
  }), []);

  const vertexShader = `
    varying vec2 vUv;
    varying float vElevation;
    uniform float uTime;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Wave distortion
      float wave = sin(pos.x * 0.5 + uTime * 0.3) * 0.5 +
                   sin(pos.x * 0.3 + uTime * 0.2) * 0.3;
      pos.y += wave;
      vElevation = wave;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    varying vec2 vUv;
    varying float vElevation;
    
    void main() {
      // Gradient based on position and time
      float gradient = vUv.y + sin(vUv.x * 3.0 + uTime * 0.5) * 0.1;
      
      // Mix colors
      vec3 color = mix(uColor1, uColor2, gradient);
      color = mix(color, uColor3, sin(vUv.x * 2.0 + uTime * 0.3) * 0.5 + 0.5);
      
      // Fade at edges
      float alpha = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
      alpha *= smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
      alpha *= 0.15 + vElevation * 0.05;
      
      gl_FragColor = vec4(color, alpha);
    }
  `;

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  if (performanceTier === 'low') return null;

  return (
    <mesh ref={mesh} position={[0, 5, -15]} rotation={[-0.3, 0, 0]}>
      <planeGeometry args={[40, 12, performanceTier === 'high' ? 64 : 32, 16]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ============ LAYERED FOG PLANES ============
function FogPlane({ 
  y, 
  z, 
  opacity, 
  speed, 
  color,
  performanceTier 
}: { 
  y: number; 
  z: number; 
  opacity: number; 
  speed: number; 
  color: string;
  performanceTier: string;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const initialX = useRef((Math.random() - 0.5) * 5);

  useFrame(({ clock }) => {
    if (mesh.current && performanceTier !== 'low') {
      // Slow horizontal drift
      mesh.current.position.x = initialX.current + Math.sin(clock.elapsedTime * speed) * 2;
      // Subtle vertical bob
      mesh.current.position.y = y + Math.sin(clock.elapsedTime * speed * 0.5) * 0.3;
      // Slow rotation
      mesh.current.rotation.z = Math.sin(clock.elapsedTime * speed * 0.3) * 0.05;
    }
  });

  return (
    <mesh ref={mesh} position={[initialX.current, y, z]}>
      <planeGeometry args={[35, 6]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function LayeredFog({ performanceTier }: { performanceTier: string }) {
  const fogLayers = useMemo(() => {
    if (performanceTier === 'low') {
      return [
        { y: -2, z: -6, opacity: 0.08, speed: 0.1, color: '#1a3328' },
      ];
    }
    if (performanceTier === 'medium') {
      return [
        { y: -4, z: -8, opacity: 0.06, speed: 0.08, color: '#0d1f17' },
        { y: -2, z: -6, opacity: 0.08, speed: 0.1, color: '#1a3328' },
        { y: 0, z: -5, opacity: 0.05, speed: 0.12, color: '#162920' },
      ];
    }
    // High
    return [
      { y: -5, z: -10, opacity: 0.04, speed: 0.06, color: '#0a1510' },
      { y: -4, z: -8, opacity: 0.06, speed: 0.08, color: '#0d1f17' },
      { y: -2.5, z: -7, opacity: 0.07, speed: 0.09, color: '#132a1f' },
      { y: -1, z: -6, opacity: 0.08, speed: 0.1, color: '#1a3328' },
      { y: 0.5, z: -5, opacity: 0.05, speed: 0.12, color: '#162920' },
      { y: 2, z: -4, opacity: 0.03, speed: 0.15, color: '#1a3830' },
    ];
  }, [performanceTier]);

  return (
    <>
      {fogLayers.map((layer, i) => (
        <FogPlane key={i} {...layer} performanceTier={performanceTier} />
      ))}
    </>
  );
}

// ============ FLOATING PARTICLES (mist/fireflies) ============
function MistParticles({ performanceTier }: { performanceTier: string }) {
  const mesh = useRef<THREE.Points>(null);
  
  const count = performanceTier === 'low' ? 50 : performanceTier === 'medium' ? 150 : 300;
  
  const [positions, sizes, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const spd = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Spread in a wide area
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15 - 2;
      pos[i * 3 + 2] = Math.random() * -15 - 2;
      
      // Varying sizes
      siz[i] = Math.random() * 0.03 + 0.01;
      
      // Different drift speeds
      spd[i * 3] = (Math.random() - 0.5) * 0.003;
      spd[i * 3 + 1] = Math.random() * 0.005 + 0.001;
      spd[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
    }
    
    return [pos, siz, spd];
  }, [count]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const posArray = mesh.current.geometry.attributes.position.array as Float32Array;
    const time = clock.elapsedTime;
    
    for (let i = 0; i < count; i++) {
      posArray[i * 3] += speeds[i * 3] + Math.sin(time * 0.5 + i) * 0.001;
      posArray[i * 3 + 1] += speeds[i * 3 + 1];
      posArray[i * 3 + 2] += speeds[i * 3 + 2];
      
      // Reset particles that drift too far
      if (posArray[i * 3 + 1] > 8) {
        posArray[i * 3] = (Math.random() - 0.5) * 30;
        posArray[i * 3 + 1] = -8;
        posArray[i * 3 + 2] = Math.random() * -15 - 2;
      }
      if (Math.abs(posArray[i * 3]) > 18) {
        posArray[i * 3] = -posArray[i * 3] * 0.9;
      }
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#4ade80"
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ============ DISTANT STARS ============
function DistantStars({ performanceTier }: { performanceTier: string }) {
  const mesh = useRef<THREE.Points>(null);
  const count = performanceTier === 'low' ? 500 : performanceTier === 'medium' ? 1500 : 3000;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Distribute on a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 50 + Math.random() * 50;
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi) - 30;
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.y = clock.elapsedTime * 0.003;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        color="#ffffff"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

// ============ SILHOUETTE TREES (background) ============
function TreeSilhouettes({ performanceTier }: { performanceTier: string }) {
  const count = performanceTier === 'low' ? 5 : performanceTier === 'medium' ? 10 : 20;
  
  const trees = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: (i - count / 2) * 3 + (Math.random() - 0.5) * 2,
      z: -12 - Math.random() * 8,
      height: 2 + Math.random() * 3,
      width: 0.8 + Math.random() * 0.6,
    }));
  }, [count]);

  return (
    <group>
      {trees.map((tree, i) => (
        <mesh key={i} position={[tree.x, -3 + tree.height / 2, tree.z]}>
          <coneGeometry args={[tree.width, tree.height, 6]} />
          <meshBasicMaterial color="#050a08" transparent opacity={0.9} />
        </mesh>
      ))}
      {/* Ground silhouette */}
      <mesh position={[0, -4, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 20]} />
        <meshBasicMaterial color="#030705" />
      </mesh>
    </group>
  );
}

// ============ MOUSE PARALLAX CAMERA RIG ============
function CameraRig({ performanceTier }: { performanceTier: string }) {
  const { camera } = useThree();
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const targetX = useRef(0);
  const targetY = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY.current = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    const parallaxStrength = performanceTier === 'low' ? 0.2 : 0.5;
    const smoothing = performanceTier === 'low' ? 0.01 : 0.03;
    
    targetX.current = mouseX.current * parallaxStrength;
    targetY.current = mouseY.current * parallaxStrength * 0.5;
    
    camera.position.x += (targetX.current - camera.position.x) * smoothing;
    camera.position.y += (targetY.current - camera.position.y) * smoothing;
    camera.lookAt(0, 0, -5);
  });

  return null;
}

// ============ MAIN SCENE ============
function Scene({ performanceTier }: { performanceTier: string }) {
  return (
    <>
      {/* Deep dark background */}
      <color attach="background" args={['#030806']} />
      
      {/* Atmospheric fog */}
      <fog attach="fog" args={['#0a1510', 8, 35]} />
      
      {/* Subtle ambient light */}
      <ambientLight intensity={0.1} />
      
      {/* Colored directional lights for atmosphere */}
      <directionalLight position={[10, 10, 5]} intensity={0.15} color="#22c55e" />
      <directionalLight position={[-10, 5, -5]} intensity={0.1} color="#0ea5e9" />
      
      {/* Layer order (back to front): stars, aurora, trees, fog, particles */}
      <DistantStars performanceTier={performanceTier} />
      <Aurora performanceTier={performanceTier} />
      <TreeSilhouettes performanceTier={performanceTier} />
      <LayeredFog performanceTier={performanceTier} />
      <MistParticles performanceTier={performanceTier} />
      
      <CameraRig performanceTier={performanceTier} />
    </>
  );
}

// ============ LOADING FALLBACK ============
function LoadingFallback() {
  return (
    <div 
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(ellipse at 50% 100%, hsl(150 30% 6%) 0%, hsl(220 20% 3%) 70%)',
      }}
    />
  );
}

// ============ MAIN COMPONENT ============
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
          background: `
            radial-gradient(ellipse at 30% 20%, hsl(150 40% 8% / 0.5) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 30%, hsl(200 40% 10% / 0.3) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 100%, hsl(150 30% 6%) 0%, hsl(220 20% 3%) 70%)
          `,
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
          camera={{ position: [0, 0, 6], fov: 55 }}
          dpr={performanceTier === 'low' ? 1 : performanceTier === 'medium' ? 1.5 : 2}
          frameloop={isVisible ? 'always' : 'never'}
          gl={{ 
            antialias: performanceTier === 'high',
            powerPreference: performanceTier === 'low' ? 'low-power' : 'high-performance',
            alpha: false,
          }}
        >
          <Scene performanceTier={performanceTier} />
        </Canvas>
      </Suspense>
      
      {/* Gradient overlays for text readability */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(180deg, 
              hsl(220 20% 4% / 0.2) 0%, 
              transparent 30%, 
              transparent 60%, 
              hsl(220 20% 4% / 0.5) 85%,
              hsl(220 20% 4% / 0.8) 100%
            )
          `,
        }}
      />
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, hsl(220 20% 4% / 0.4) 100%)',
        }}
      />
    </div>
  );
}
