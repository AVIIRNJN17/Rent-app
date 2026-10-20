import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  Sliders,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Box,
  Eye,
  Maximize2,
  Info,
} from 'lucide-react';

interface ThreeStudioViewProps {
  language: 'en' | 'hi';
}

type FinishMode = 'royal-gold' | 'marble-ivory' | 'midnight-obsidian' | 'antique-bronze';
type SceneMode = 'mascot' | 'apartment';

export const ThreeStudioView: React.FC<ThreeStudioViewProps> = ({ language }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Studio Settings State
  const [sceneMode, setSceneMode] = useState<SceneMode>('mascot');
  const [activeFinish, setActiveFinish] = useState<FinishMode>('royal-gold');
  const [explodedAmount, setExplodedAmount] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [activeInfo, setActiveInfo] = useState<string | null>(null);

  // References to Three.js elements for runtime updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const mascotGroupRef = useRef<THREE.Group | null>(null);
  const roomGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const explodedRef = useRef<number>(0);
  const autoRotateRef = useRef<boolean>(true);

  // Sync state to refs for animation loop
  useEffect(() => {
    explodedRef.current = explodedAmount;
  }, [explodedAmount]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Material finish definitions
  const getMaterialParams = (finish: FinishMode) => {
    switch (finish) {
      case 'royal-gold':
        return {
          color: 0xd4af37,
          metalness: 0.95,
          roughness: 0.16,
          emissive: 0x1f1604,
        };
      case 'marble-ivory':
        return {
          color: 0xf3f0eb,
          metalness: 0.08,
          roughness: 0.22,
          emissive: 0x050505,
        };
      case 'midnight-obsidian':
        return {
          color: 0x181816,
          metalness: 0.88,
          roughness: 0.28,
          emissive: 0x080808,
        };
      case 'antique-bronze':
        return {
          color: 0x966838,
          metalness: 0.92,
          roughness: 0.35,
          emissive: 0x180f05,
        };
    }
  };

  // Update materials when finish changes
  useEffect(() => {
    const params = getMaterialParams(activeFinish);
    materialsRef.current.forEach((mat) => {
      mat.color.setHex(params.color);
      mat.metalness = params.metalness;
      mat.roughness = params.roughness;
      mat.emissive.setHex(params.emissive);
      mat.needsUpdate = true;
    });
  }, [activeFinish]);

  // Switch scene mode visibility
  useEffect(() => {
    if (mascotGroupRef.current && roomGroupRef.current) {
      mascotGroupRef.current.visible = sceneMode === 'mascot';
      roomGroupRef.current.visible = sceneMode === 'apartment';
    }
  }, [sceneMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0e0d0b);
    scene.fog = new THREE.FogExp2(0x0e0d0b, 0.025);

    const width = container.clientWidth;
    const height = container.clientHeight || 550;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4.5, 9);
    camera.lookAt(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.9);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffeedd, 0x111122, 0.8);
    scene.add(hemisphereLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.5);
    keyLight.position.set(6, 10, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd4af37, 1.2);
    fillLight.position.set(-6, 4, -4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffd700, 2, 12);
    rimLight.position.set(0, 6, -5);
    scene.add(rimLight);

    // 3. Ground Mirror / Pedestal Shadow Receiver
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0c0b0a,
      roughness: 0.4,
      metalness: 0.6,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    // Subtle imperial grid circles
    const gridCircle1 = new THREE.RingGeometry(3.8, 3.84, 64);
    const gridMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, side: THREE.DoubleSide, opacity: 0.25, transparent: true });
    const ring1 = new THREE.Mesh(gridCircle1, gridMat);
    ring1.rotation.x = -Math.PI / 2;
    ring1.position.y = 0.002;
    scene.add(ring1);

    const gridCircle2 = new THREE.RingGeometry(2.1, 2.14, 64);
    const ring2 = new THREE.Mesh(gridCircle2, gridMat);
    ring2.rotation.x = -Math.PI / 2;
    ring2.position.y = 0.002;
    scene.add(ring2);

    // Helper material creator
    const mats: THREE.MeshStandardMaterial[] = [];
    const initialParams = getMaterialParams(activeFinish);

    const createPBRMat = () => {
      const m = new THREE.MeshStandardMaterial({
        color: initialParams.color,
        metalness: initialParams.metalness,
        roughness: initialParams.roughness,
        emissive: initialParams.emissive,
      });
      mats.push(m);
      return m;
    };

    // ==========================================
    // 4. MODEL 1: PROCEDURAL ROYAL CAT MASCOT
    // ==========================================
    const mascotGroup = new THREE.Group();
    mascotGroupRef.current = mascotGroup;
    scene.add(mascotGroup);

    // Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.4, 32);
    const pedestal = new THREE.Mesh(pedestalGeo, createPBRMat());
    pedestal.position.y = 0.2;
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    mascotGroup.add(pedestal);

    const pedestalStepGeo = new THREE.CylinderGeometry(1.35, 1.45, 0.2, 32);
    const pedestalStep = new THREE.Mesh(pedestalStepGeo, createPBRMat());
    pedestalStep.position.y = 0.5;
    pedestalStep.castShadow = true;
    mascotGroup.add(pedestalStep);

    // Body Group (Explodable)
    const bodyPart = new THREE.Group();
    const torsoGeo = new THREE.CylinderGeometry(0.7, 1.0, 1.5, 32);
    const torso = new THREE.Mesh(torsoGeo, createPBRMat());
    torso.position.y = 1.35;
    torso.castShadow = true;
    bodyPart.add(torso);

    // Paws
    const pawGeo = new THREE.CapsuleGeometry(0.2, 0.45, 12, 16);
    const pawL = new THREE.Mesh(pawGeo, createPBRMat());
    pawL.position.set(-0.4, 0.75, 0.65);
    pawL.rotation.x = 0.3;
    pawL.castShadow = true;
    bodyPart.add(pawL);

    const pawR = new THREE.Mesh(pawGeo, createPBRMat());
    pawR.position.set(0.4, 0.75, 0.65);
    pawR.rotation.x = 0.3;
    pawR.castShadow = true;
    bodyPart.add(pawR);

    // Elegant curved tail
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.7, -0.7),
      new THREE.Vector3(0.5, 1.1, -1.0),
      new THREE.Vector3(0.7, 1.6, -0.8),
      new THREE.Vector3(0.5, 2.0, -0.4),
    ]);
    const tailGeo = new THREE.TubeGeometry(curve, 32, 0.12, 12, false);
    const tail = new THREE.Mesh(tailGeo, createPBRMat());
    tail.castShadow = true;
    bodyPart.add(tail);
    mascotGroup.add(bodyPart);

    // Collar with Inscribed Imperial Coin (Explodable)
    const collarPart = new THREE.Group();
    const collarTorus = new THREE.TorusGeometry(0.68, 0.08, 16, 32);
    const collarMesh = new THREE.Mesh(collarTorus, createPBRMat());
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.y = 2.05;
    collarMesh.castShadow = true;
    collarPart.add(collarMesh);

    // Imperial Rupee Coin Locket
    const coinGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 32);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.98,
      roughness: 0.12,
    });
    const coin = new THREE.Mesh(coinGeo, coinMat);
    coin.rotation.x = Math.PI / 2;
    coin.position.set(0, 1.85, 0.72);
    coin.castShadow = true;
    collarPart.add(coin);

    // Small jewel in center of coin
    const jewelGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const rubyMat = new THREE.MeshStandardMaterial({
      color: 0x990022,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x440011,
    });
    const jewel = new THREE.Mesh(jewelGeo, rubyMat);
    jewel.position.set(0, 1.85, 0.76);
    collarPart.add(jewel);
    mascotGroup.add(collarPart);

    // Head Group (Explodable)
    const headPart = new THREE.Group();
    const headGeo = new THREE.SphereGeometry(0.72, 32, 32);
    const head = new THREE.Mesh(headGeo, createPBRMat());
    head.position.y = 2.65;
    head.scale.set(1.05, 0.95, 1.0);
    head.castShadow = true;
    headPart.add(head);

    // Cat Ears
    const earGeo = new THREE.ConeGeometry(0.32, 0.55, 16);
    const earL = new THREE.Mesh(earGeo, createPBRMat());
    earL.position.set(-0.45, 3.25, 0.05);
    earL.rotation.z = 0.35;
    earL.rotation.x = -0.15;
    earL.castShadow = true;
    headPart.add(earL);

    const earR = new THREE.Mesh(earGeo, createPBRMat());
    earR.position.set(0.45, 3.25, 0.05);
    earR.rotation.z = -0.35;
    earR.rotation.x = -0.15;
    earR.castShadow = true;
    headPart.add(earR);

    // Emerald Cat Eyes
    const eyeGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const emeraldMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.05,
      metalness: 0.8,
      emissive: 0x053320,
    });
    const eyeL = new THREE.Mesh(eyeGeo, emeraldMat);
    eyeL.position.set(-0.25, 2.7, 0.62);
    eyeL.scale.set(1, 1.3, 0.6);
    headPart.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, emeraldMat);
    eyeR.position.set(0.25, 2.7, 0.62);
    eyeR.scale.set(1, 1.3, 0.6);
    headPart.add(eyeR);

    // Nose & Whiskers
    const noseGeo = new THREE.ConeGeometry(0.08, 0.08, 16);
    const nose = new THREE.Mesh(noseGeo, rubyMat);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 2.5, 0.72);
    headPart.add(nose);
    mascotGroup.add(headPart);

    // Imperial Greek Crown (Explodable)
    const crownPart = new THREE.Group();
    const crownBase = new THREE.CylinderGeometry(0.42, 0.46, 0.16, 24, 1, true);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.98,
      roughness: 0.14,
      emissive: 0x2b1c03,
    });
    const crownMesh = new THREE.Mesh(crownBase, crownMat);
    crownMesh.position.y = 3.32;
    crownMesh.castShadow = true;
    crownPart.add(crownMesh);

    // 5 Crown Points
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const pointGeo = new THREE.ConeGeometry(0.1, 0.28, 8);
      const pointMesh = new THREE.Mesh(pointGeo, crownMat);
      const radius = 0.44;
      pointMesh.position.set(Math.sin(angle) * radius, 3.52, Math.cos(angle) * radius);
      pointMesh.castShadow = true;
      crownPart.add(pointMesh);

      // Pearl ball on top of tip
      const ballGeo = new THREE.SphereGeometry(0.05, 12, 12);
      const ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.9 });
      const ball = new THREE.Mesh(ballGeo, ballMat);
      ball.position.set(Math.sin(angle) * radius, 3.68, Math.cos(angle) * radius);
      crownPart.add(ball);
    }
    mascotGroup.add(crownPart);

    // ==========================================
    // 5. MODEL 2: ISOMETRIC APARTMENT ROOM
    // ==========================================
    const roomGroup = new THREE.Group();
    roomGroupRef.current = roomGroup;
    roomGroup.visible = false;
    scene.add(roomGroup);

    // Room Floor Base Slab
    const floorSlabGeo = new THREE.BoxGeometry(4.2, 0.35, 4.2);
    const floorSlab = new THREE.Mesh(floorSlabGeo, createPBRMat());
    floorSlab.position.y = 0.175;
    floorSlab.receiveShadow = true;
    roomGroup.add(floorSlab);

    // Parquet Floor Inlay
    const parquetGeo = new THREE.BoxGeometry(4.0, 0.05, 4.0);
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x936538,
      roughness: 0.35,
      metalness: 0.2,
    });
    const parquet = new THREE.Mesh(parquetGeo, woodMat);
    parquet.position.y = 0.37;
    parquet.receiveShadow = true;
    roomGroup.add(parquet);

    // Back Wall (Explodable)
    const backWallPart = new THREE.Group();
    const backWallGeo = new THREE.BoxGeometry(4.2, 2.8, 0.25);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xded8ce,
      roughness: 0.4,
      metalness: 0.1,
    });
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 1.75, -2.0);
    backWall.receiveShadow = true;
    backWall.castShadow = true;
    backWallPart.add(backWall);

    // Digital Electricity Meter on Wall
    const meterBoxGeo = new THREE.BoxGeometry(0.5, 0.7, 0.12);
    const meterMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 });
    const meterBox = new THREE.Mesh(meterBoxGeo, meterMat);
    meterBox.position.set(1.2, 2.3, -1.82);
    meterBox.castShadow = true;
    backWallPart.add(meterBox);

    // Glowing LED LCD on meter
    const screenGeo = new THREE.PlaneGeometry(0.36, 0.22);
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 1.2,
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(1.2, 2.38, -1.75);
    backWallPart.add(screen);
    roomGroup.add(backWallPart);

    // Left Wall with Window Cutout (Explodable)
    const leftWallPart = new THREE.Group();
    const leftWallGeo = new THREE.BoxGeometry(0.25, 2.8, 4.2);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-2.0, 1.75, 0);
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;
    leftWallPart.add(leftWall);

    // Window frame on left wall
    const windowFrameGeo = new THREE.BoxGeometry(0.3, 1.4, 1.4);
    const windowMat = new THREE.MeshStandardMaterial({ color: 0x4a3b2c, roughness: 0.5 });
    const windowFrame = new THREE.Mesh(windowFrameGeo, windowMat);
    windowFrame.position.set(-1.95, 2.0, 0);
    leftWallPart.add(windowFrame);

    // Window Glass with soft glow
    const glassGeo = new THREE.BoxGeometry(0.05, 1.2, 1.2);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x88ccee,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.8,
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(-1.95, 2.0, 0);
    leftWallPart.add(glass);
    roomGroup.add(leftWallPart);

    // Furniture: Bed
    const bedPart = new THREE.Group();
    const bedBaseGeo = new THREE.BoxGeometry(1.6, 0.4, 2.2);
    const bedBase = new THREE.Mesh(bedBaseGeo, woodMat);
    bedBase.position.set(-0.9, 0.6, -0.7);
    bedBase.castShadow = true;
    bedPart.add(bedBase);

    const mattressGeo = new THREE.BoxGeometry(1.5, 0.25, 2.1);
    const mattressMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
    const mattress = new THREE.Mesh(mattressGeo, mattressMat);
    mattress.position.set(-0.9, 0.85, -0.7);
    mattress.castShadow = true;
    bedPart.add(mattress);

    const blanketGeo = new THREE.BoxGeometry(1.52, 0.18, 1.4);
    const blanketMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.5, metalness: 0.3 });
    const blanket = new THREE.Mesh(blanketGeo, blanketMat);
    blanket.position.set(-0.9, 0.9, -0.3);
    blanket.castShadow = true;
    bedPart.add(blanket);

    const pillowGeo = new THREE.BoxGeometry(1.2, 0.15, 0.45);
    const pillow = new THREE.Mesh(pillowGeo, mattressMat);
    pillow.position.set(-0.9, 1.05, -1.45);
    bedPart.add(pillow);
    roomGroup.add(bedPart);

    // Furniture: Desk & Laptop
    const deskPart = new THREE.Group();
    const deskTopGeo = new THREE.BoxGeometry(1.4, 0.1, 0.75);
    const deskTop = new THREE.Mesh(deskTopGeo, woodMat);
    deskTop.position.set(1.0, 1.1, 0.8);
    deskTop.castShadow = true;
    deskPart.add(deskTop);

    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.75);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 });
    const leg1 = new THREE.Mesh(legGeo, legMat);
    leg1.position.set(0.4, 0.73, 0.5);
    deskPart.add(leg1);
    const leg2 = new THREE.Mesh(legGeo, legMat);
    leg2.position.set(1.6, 0.73, 0.5);
    deskPart.add(leg2);
    const leg3 = new THREE.Mesh(legGeo, legMat);
    leg3.position.set(0.4, 0.73, 1.1);
    deskPart.add(leg3);
    const leg4 = new THREE.Mesh(legGeo, legMat);
    leg4.position.set(1.6, 0.73, 1.1);
    deskPart.add(leg4);

    // Laptop
    const laptopBaseGeo = new THREE.BoxGeometry(0.4, 0.02, 0.3);
    const laptop = new THREE.Mesh(laptopBaseGeo, legMat);
    laptop.position.set(1.0, 1.16, 0.8);
    deskPart.add(laptop);

    const laptopScreenGeo = new THREE.BoxGeometry(0.4, 0.28, 0.02);
    const laptopScreen = new THREE.Mesh(laptopScreenGeo, screenMat);
    laptopScreen.position.set(1.0, 1.3, 0.68);
    laptopScreen.rotation.x = -0.2;
    deskPart.add(laptopScreen);

    // Warm Room Lamp with glowing shade
    const lampPoleGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.2);
    const lampPole = new THREE.Mesh(lampPoleGeo, legMat);
    lampPole.position.set(1.6, 1.45, -1.4);
    deskPart.add(lampPole);

    const shadeGeo = new THREE.ConeGeometry(0.28, 0.35, 16, 1, true);
    const shadeMat = new THREE.MeshStandardMaterial({
      color: 0xffe6aa,
      emissive: 0xffaa33,
      emissiveIntensity: 0.8,
      side: THREE.DoubleSide,
    });
    const shade = new THREE.Mesh(shadeGeo, shadeMat);
    shade.position.set(1.6, 2.45, -1.4);
    deskPart.add(shade);

    const lampLight = new THREE.PointLight(0xffaa44, 2.5, 5);
    lampLight.position.set(1.6, 2.35, -1.4);
    lampLight.castShadow = true;
    deskPart.add(lampLight);

    roomGroup.add(deskPart);

    materialsRef.current = mats;

    // 6. User Interaction: Pointer Orbit Drag & Damping
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = 0.4;
    let sphericalPhi = Math.PI / 4;
    let sphericalRadius = 8.5;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      sphericalTheta -= deltaX * 0.008;
      sphericalPhi -= deltaY * 0.008;
      sphericalPhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, sphericalPhi));
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      sphericalRadius += e.deltaY * 0.005;
      sphericalRadius = Math.max(4.5, Math.min(14, sphericalRadius));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    domElement.addEventListener('wheel', handleWheel, { passive: false });

    // 7. Responsive Resizing
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 550;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation & Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Auto rotation
      if (autoRotateRef.current && !isDragging) {
        sphericalTheta += delta * 0.25;
      }

      // Camera positioning via spherical coordinates
      const targetY = sceneMode === 'mascot' ? 1.8 : 1.4;
      camera.position.x = sphericalRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      camera.position.y = sphericalRadius * Math.cos(sphericalPhi) + targetY;
      camera.position.z = sphericalRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.lookAt(0, targetY, 0);

      // Smooth exploded view displacement interpolation
      const exp = explodedRef.current;

      // Mascot exploded parts
      if (crownPart) {
        crownPart.position.y = THREE.MathUtils.lerp(crownPart.position.y, exp * 1.5, 0.1);
      }
      if (headPart) {
        headPart.position.y = THREE.MathUtils.lerp(headPart.position.y, exp * 0.9, 0.1);
      }
      if (collarPart) {
        collarPart.position.y = THREE.MathUtils.lerp(collarPart.position.y, exp * 0.4, 0.1);
        collarPart.scale.setScalar(THREE.MathUtils.lerp(collarPart.scale.x, 1 + exp * 0.35, 0.1));
      }
      if (bodyPart) {
        bodyPart.position.y = THREE.MathUtils.lerp(bodyPart.position.y, -exp * 0.2, 0.1);
      }

      // Apartment exploded parts
      if (backWallPart) {
        backWallPart.position.z = THREE.MathUtils.lerp(backWallPart.position.z, -exp * 1.8, 0.1);
      }
      if (leftWallPart) {
        leftWallPart.position.x = THREE.MathUtils.lerp(leftWallPart.position.x, -exp * 1.8, 0.1);
      }
      if (bedPart) {
        bedPart.position.y = THREE.MathUtils.lerp(bedPart.position.y, exp * 0.6, 0.1);
      }
      if (deskPart) {
        deskPart.position.x = THREE.MathUtils.lerp(deskPart.position.x, exp * 0.9, 0.1);
        deskPart.position.y = THREE.MathUtils.lerp(deskPart.position.y, exp * 0.5, 0.1);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      domElement.removeEventListener('wheel', handleWheel);

      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }

      renderer.dispose();
      mats.forEach((m) => m.dispose());
    };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-8.5rem)] min-h-[580px] bg-[#0E0D0B] rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl flex flex-col">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      />

      {/* Top Floating Header HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-zinc-950/85 backdrop-blur-md border border-amber-500/35 shadow-lg">
          <div className="p-1 rounded-lg bg-amber-500/20 text-[#D4AF37]">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold font-cinzel text-amber-100 tracking-wider">
              {sceneMode === 'mascot'
                ? language === 'hi'
                  ? 'शाही मैस्कॉट स्टूडियो 3D'
                  : 'ROYAL MASCOT 3D STUDIO'
                : language === 'hi'
                ? 'आइसोमेट्रिक कमरा स्टूडियो'
                : 'ISOMETRIC APARTMENT 3D'}
            </h2>
            <p className="text-[10px] text-zinc-400 font-medium">
              {language === 'hi'
                ? 'माउस या टच से घुमाएं और एक्सप्लोर करें'
                : 'Drag to orbit • Pinch to zoom'}
            </p>
          </div>
        </div>

        {/* Scene Mode Switcher */}
        <div className="pointer-events-auto flex items-center p-1 rounded-2xl bg-zinc-950/85 backdrop-blur-md border border-amber-500/35 shadow-lg">
          <button
            onClick={() => setSceneMode('mascot')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              sceneMode === 'mascot'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-md shadow-amber-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'शाही मैस्कॉट' : 'Royal Mascot'}</span>
          </button>
          <button
            onClick={() => setSceneMode('apartment')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              sceneMode === 'apartment'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-md shadow-amber-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'कमरा लेआउट' : 'Room Layout'}</span>
          </button>
        </div>
      </div>

      {/* Floating Info Tooltip */}
      {activeInfo && (
        <div className="absolute top-16 left-4 max-w-xs p-3 rounded-2xl bg-zinc-950/95 backdrop-blur-md border border-amber-500/40 text-xs text-amber-100 shadow-xl z-20 animate-in fade-in">
          <p className="leading-relaxed">{activeInfo}</p>
          <button
            onClick={() => setActiveInfo(null)}
            className="mt-2 text-[10px] text-[#D4AF37] underline font-semibold"
          >
            {language === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>
      )}

      {/* Collapsible Bottom Control Dock (<= 15% Viewport footprint) */}
      <div className="absolute bottom-3 left-3 right-3 sm:left-6 sm:right-6 z-20 pointer-events-auto">
        <div className="rounded-2xl bg-[#141311]/92 backdrop-blur-md border border-amber-500/35 shadow-2xl p-3 text-white transition-all duration-300">
          {/* Dock Header & Collapse Toggle */}
          <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[11px] font-bold font-cinzel text-amber-200 tracking-wider">
                {language === 'hi' ? 'नियंत्रण डॉक' : '3D STUDIO CONTROLS'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Auto rotate toggle */}
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all ${
                  autoRotate
                    ? 'bg-amber-500/20 border-amber-500/50 text-[#D4AF37]'
                    : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'
                }`}
                title="Toggle Auto Rotation"
              >
                <RotateCcw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} />
                <span>{language === 'hi' ? 'घूर्णन' : 'Rotate'}</span>
              </button>

              {/* Collapse button */}
              <button
                onClick={() => setDockCollapsed(!dockCollapsed)}
                className="p-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                title={dockCollapsed ? 'Expand Controls' : 'Collapse Controls'}
              >
                {dockCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Collapsible Content */}
          {!dockCollapsed && (
            <div className="pt-2.5 grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              {/* Material Finish Switcher */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span className="font-semibold text-amber-300/90">
                    {language === 'hi' ? 'प्रीमियम फिनिश' : 'Material Finish'}
                  </span>
                  <span className="capitalize text-zinc-300">{activeFinish.replace('-', ' ')}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => setActiveFinish('royal-gold')}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center border transition-all ${
                      activeFinish === 'royal-gold'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black border-amber-300 shadow-md shadow-amber-500/30'
                        : 'bg-zinc-900 border-zinc-800 text-amber-200 hover:border-amber-500/40'
                    }`}
                  >
                    24K Gold
                  </button>
                  <button
                    onClick={() => setActiveFinish('marble-ivory')}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center border transition-all ${
                      activeFinish === 'marble-ivory'
                        ? 'bg-zinc-100 text-zinc-900 border-white shadow-md'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    Marble
                  </button>
                  <button
                    onClick={() => setActiveFinish('midnight-obsidian')}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center border transition-all ${
                      activeFinish === 'midnight-obsidian'
                        ? 'bg-zinc-800 text-amber-300 border-amber-500/70 shadow-md'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    Obsidian
                  </button>
                  <button
                    onClick={() => setActiveFinish('antique-bronze')}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center border transition-all ${
                      activeFinish === 'antique-bronze'
                        ? 'bg-gradient-to-r from-yellow-800 to-amber-900 text-amber-100 border-amber-600 shadow-md'
                        : 'bg-zinc-900 border-zinc-800 text-amber-300/70 hover:border-amber-700'
                    }`}
                  >
                    Bronze
                  </button>
                </div>
              </div>

              {/* Exploded View Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span className="font-semibold text-amber-300/90 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-[#D4AF37]" />
                    {language === 'hi' ? 'एक्सप्लोडेड व्यू (परतें)' : 'Exploded View'}
                  </span>
                  <span className="font-mono text-amber-400">{Math.round(explodedAmount * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={explodedAmount}
                    onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                  {explodedAmount > 0 && (
                    <button
                      onClick={() => setExplodedAmount(0)}
                      className="text-[9px] font-bold text-zinc-400 hover:text-white px-1.5 py-0.5 rounded bg-zinc-800"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
