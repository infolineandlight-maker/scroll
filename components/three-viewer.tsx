"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  SSAO,
  ToneMapping,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Lens object names for explosion effect
const LENS_OBJECT_NAMES = [
  "Circle002",
  "+Sphere001001",
  "new",
  "+Plane008001",
  "+SideButtons001",
  "Rings2001",
  "+Rings1001",
  "+Circle003001",
  "+Sphere003001",
  "+Circle001001",
  "Text001",
  "Plane006001",
  "+Plane005001",
  "+Sphere001",
  "+Cylinder001",
  "+BODY044001",
];

interface LensObjectData {
  object: THREE.Object3D;
  startPos: number;
  deltaPos: number;
}

interface CameraState {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

// Camera controller component
function CameraController({
  cameraState,
  controlsEnabled,
  onUpdate,
}: {
  cameraState: CameraState;
  controlsEnabled: boolean;
  onUpdate: () => void;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (!controlsEnabled) {
      camera.position.copy(cameraState.position);
      camera.lookAt(cameraState.target);
    }
  });

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[cameraState.position.x, cameraState.position.y, cameraState.position.z]}
        fov={45}
        near={0.1}
        far={1000}
      />
      <OrbitControls
        ref={controlsRef}
        enabled={controlsEnabled}
        target={[cameraState.target.x, cameraState.target.y, cameraState.target.z]}
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={15}
      />
    </>
  );
}

// Camera model component
function CameraModel({
  lensExpansion,
  lensVisible,
  onLoad,
}: {
  lensExpansion: number;
  lensVisible: boolean;
  onLoad: () => void;
}) {
  const { scene } = useGLTF("/assets/camera.glb");
  const lensObjectsRef = useRef<LensObjectData[]>([]);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && scene) {
      // Initialize lens objects
      const lensObjects: LensObjectData[] = [];
      
      scene.traverse((child) => {
        if (LENS_OBJECT_NAMES.includes(child.name)) {
          const startPos = child.position.z;
          const deltaPos = -Math.pow(Math.abs(startPos) * 1.5, 1.25);
          lensObjects.push({
            object: child,
            startPos,
            deltaPos,
          });
        }
      });
      
      lensObjectsRef.current = lensObjects;
      hasInitialized.current = true;
      onLoad();
    }
  }, [scene, onLoad]);

  // Update lens expansion
  useEffect(() => {
    lensObjectsRef.current.forEach(({ object, startPos, deltaPos }) => {
      object.position.z = startPos + lensExpansion * deltaPos;
    });
  }, [lensExpansion]);

  // Update lens visibility
  useEffect(() => {
    lensObjectsRef.current.forEach(({ object }) => {
      object.visible = lensVisible;
    });
  }, [lensVisible]);

  return <primitive object={scene} />;
}

// Post-processing effects
function Effects({ isMobile }: { isMobile: boolean }) {
  if (isMobile) {
    // Simplified effects for mobile
    return (
      <EffectComposer>
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer>
      <SSAO
        samples={16}
        radius={0.1}
        intensity={30}
        luminanceInfluence={0.6}
        color={new THREE.Color(0x000000)}
      />
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.9}
        luminanceSmoothing={0.025}
        mipmapBlur
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}

// Main scene component
function Scene({
  cameraState,
  controlsEnabled,
  lensExpansion,
  lensVisible,
  isMobile,
  onModelLoad,
  onUpdate,
}: {
  cameraState: CameraState;
  controlsEnabled: boolean;
  lensExpansion: number;
  lensVisible: boolean;
  isMobile: boolean;
  onModelLoad: () => void;
  onUpdate: () => void;
}) {
  return (
    <>
      <CameraController
        cameraState={cameraState}
        controlsEnabled={controlsEnabled}
        onUpdate={onUpdate}
      />
      
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} />
      
      <Environment files="/assets/environment.hdr" background={false} />
      
      <Suspense fallback={null}>
        <CameraModel
          lensExpansion={lensExpansion}
          lensVisible={lensVisible}
          onLoad={onModelLoad}
        />
      </Suspense>
      
      <Effects isMobile={isMobile} />
    </>
  );
}

// Check for mobile/tablet
function mobileAndTabletCheck(): boolean {
  if (typeof window === "undefined") return false;
  const userAgent = navigator.userAgent || navigator.vendor;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    userAgent.toLowerCase()
  );
}

export default function ThreeViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(false);
  const [lensExpansion, setLensExpansion] = useState(0);
  const [lensVisible, setLensVisible] = useState(true);
  const lensOnlyRef = useRef(false);

  // Camera state refs for GSAP animations
  const cameraStateRef = useRef<CameraState>({
    position: new THREE.Vector3(3.6, -0.04, -3.93),
    target: new THREE.Vector3(8.16, -0.13, 0.51),
  });
  const [cameraState, setCameraState] = useState<CameraState>({
    position: new THREE.Vector3(3.6, -0.04, -3.93),
    target: new THREE.Vector3(8.16, -0.13, 0.51),
  });

  // For GSAP to animate
  const positionProxy = useRef({ x: 3.6, y: -0.04, z: -3.93 });
  const targetProxy = useRef({ x: 8.16, y: -0.13, z: 0.51 });
  const lensProxy = useRef({ x: 0 });

  const onUpdate = useCallback(() => {
    setCameraState({
      position: new THREE.Vector3(
        positionProxy.current.x,
        positionProxy.current.y,
        positionProxy.current.z
      ),
      target: new THREE.Vector3(
        targetProxy.current.x,
        targetProxy.current.y,
        targetProxy.current.z
      ),
    });
  }, []);

  const expandUpdate = useCallback(() => {
    setLensExpansion(lensProxy.current.x);
  }, []);

  useEffect(() => {
    setIsMobile(mobileAndTabletCheck());
  }, []);

  const handleModelLoad = useCallback(() => {
    // Start intro animation
    const mobile = mobileAndTabletCheck();
    
    const introTL = gsap.timeline();
    introTL
      .to(".loader", { x: "150%", duration: 0.8, ease: "power4.inOut", delay: 1 })
      .fromTo(
        positionProxy.current,
        { x: 3.6, y: -0.04, z: -3.93 },
        { x: -3.6, y: -0.04, z: -3.93, duration: 4, onUpdate },
        "-=0.8"
      )
      .fromTo(
        targetProxy.current,
        { x: 3.16, y: -0.13, z: 0.51 },
        { x: mobile ? -0.1 : 0.86, y: -0.13, z: 0.51, duration: 4, onUpdate },
        "-=4"
      )
      .fromTo(
        ".header--container",
        { opacity: 0, y: "-100%" },
        { opacity: 1, y: "0%", ease: "power1.inOut", duration: 0.8 },
        "-=1"
      )
      .fromTo(
        ".hero--scroller",
        { opacity: 0, y: "150%" },
        { opacity: 1, y: "0%", ease: "power4.inOut", duration: 1 },
        "-=1"
      )
      .fromTo(
        ".hero--content",
        { opacity: 0, x: "-50%" },
        {
          opacity: 1,
          x: "0%",
          ease: "power4.inOut",
          duration: 1.8,
          onComplete: () => {
            setIsLoaded(true);
            setupScrollAnimation(mobile);
          },
        },
        "-=1"
      );
  }, [onUpdate]);

  const setupScrollAnimation = useCallback(
    (mobile: boolean) => {
      document.body.style.overflowY = "scroll";
      const loaderElement = document.querySelector(".loader");
      if (loaderElement && loaderElement.parentNode) {
        loaderElement.parentNode.removeChild(loaderElement);
      }

      const tl = gsap.timeline({ defaults: { ease: "none" } });

      // PERFORMANCE SECTION
      tl.to(positionProxy.current, {
        x: -2.5,
        y: 0.2,
        z: -3.5,
        scrollTrigger: {
          trigger: ".cam-view-2",
          start: "top bottom",
          end: "top top",
          scrub: true,
          immediateRender: false,
        },
        onUpdate,
      })
        .to(targetProxy.current, {
          x: mobile ? 0.1 : -0.6,
          y: -0.1,
          z: 0.9,
          scrollTrigger: {
            trigger: ".cam-view-2",
            start: "top bottom",
            end: "top top",
            scrub: true,
            immediateRender: false,
          },
          onUpdate,
        })
        .to(".hero--scroller", {
          opacity: 0,
          y: "150%",
          scrollTrigger: {
            trigger: ".cam-view-2",
            start: "top bottom",
            end: "top center",
            scrub: 1,
            immediateRender: false,
            pin: ".hero--scroller--container",
          },
        })
        .to(".hero--content", {
          opacity: 0,
          xPercent: "-100",
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".cam-view-2",
            start: "top bottom",
            end: "top top",
            scrub: 1,
            immediateRender: false,
            pin: ".hero--content",
          },
        })
        .addLabel("start")
        .fromTo(
          ".performance--content",
          { opacity: 0, x: "110%" },
          {
            opacity: 1,
            x: "0%",
            ease: "power4.out",
            scrollTrigger: {
              trigger: ".cam-view-2",
              start: "top bottom",
              end: "top top",
              scrub: 1,
              immediateRender: false,
              pin: ".performance--container",
            },
          }
        )
        .addLabel("Performance")

        // POWER SECTION
        .to(positionProxy.current, {
          x: -0.07,
          y: mobile ? 3 : 5.45,
          z: mobile ? -1.1 : -3.7,
          scrollTrigger: {
            trigger: ".cam-view-3",
            start: "top bottom",
            end: "top top",
            scrub: true,
            immediateRender: false,
          },
          onUpdate,
        })
        .to(targetProxy.current, {
          x: mobile ? -0.4 : -0.04,
          y: mobile ? -3.8 : -0.52,
          z: 0.61,
          scrollTrigger: {
            trigger: ".cam-view-3",
            start: "top bottom",
            end: "top top",
            scrub: true,
            immediateRender: false,
          },
          onUpdate,
        })
        .to(".performance--content", {
          autoAlpha: 0,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".cam-view-3",
            start: "top bottom",
            end: "top center",
            scrub: 1,
            immediateRender: false,
          },
        })
        .fromTo(
          ".power--content",
          { opacity: 0, x: "-110%" },
          {
            opacity: 1,
            x: "0%",
            ease: "power4.out",
            scrollTrigger: {
              trigger: ".cam-view-3",
              start: "top 20%",
              end: "top top",
              scrub: 1,
              immediateRender: false,
            },
          }
        )
        .fromTo(
          ".power--features--img",
          { opacity: 0, x: "110%" },
          {
            opacity: 1,
            x: "0%",
            ease: "power4.out",
            scrollTrigger: {
              trigger: ".cam-view-3",
              start: "top 20%",
              end: "top top",
              scrub: 1,
              immediateRender: false,
            },
          }
        )
        .addLabel("Power")

        // AUTOFOCUS SECTION
        .to(positionProxy.current, {
          x: -5.5,
          y: 1.7,
          z: 5,
          scrollTrigger: {
            trigger: ".cam-view-4",
            start: "top bottom",
            end: "top top",
            scrub: true,
            immediateRender: false,
          },
          onUpdate,
        })
        .to(targetProxy.current, {
          x: 0.04,
          y: 0.2,
          z: 0.6,
          scrollTrigger: {
            trigger: ".cam-view-4",
            start: "top bottom",
            end: "top top",
            scrub: true,
            immediateRender: false,
          },
          onUpdate,
        })
        .to(lensProxy.current, {
          x: 1,
          scrollTrigger: {
            trigger: ".cam-view-4",
            start: "top bottom",
            end: "top top",
            scrub: true,
            immediateRender: false,
          },
          onUpdate: expandUpdate,
        })
        .fromTo(
          ".autofocus--content",
          { opacity: 0, y: "130%" },
          {
            opacity: 1,
            y: "0%",
            duration: 0.5,
            ease: "power4.out",
            scrollTrigger: {
              trigger: ".cam-view-4",
              start: "top 20%",
              end: "top top",
              scrub: 1,
              immediateRender: false,
            },
          }
        )
        .addLabel("Autofocus")

        // EXPLORE SECTION
        .to(positionProxy.current, {
          x: -0.3,
          y: -0.3,
          z: -4.85,
          scrollTrigger: {
            trigger: ".cam-view-5",
            start: "top bottom",
            end: "top top",
            scrub: true,
            immediateRender: false,
          },
          onUpdate,
        })
        .to(targetProxy.current, {
          x: mobile ? -0.1 : -0.9,
          y: -0.17,
          z: 0.1,
          scrollTrigger: {
            trigger: ".cam-view-5",
            start: "top bottom",
            end: "top top",
            scrub: true,
            immediateRender: false,
          },
          onUpdate,
        })
        .to(lensProxy.current, {
          x: 0,
          scrollTrigger: {
            trigger: ".cam-view-5",
            start: "top bottom",
            end: "top top",
            scrub: true,
            immediateRender: false,
          },
          onUpdate: expandUpdate,
        })
        .fromTo(
          ".explore--content",
          { opacity: 0, x: "130%" },
          {
            opacity: 1,
            x: "0%",
            duration: 0.5,
            ease: "power4.out",
            scrollTrigger: {
              trigger: ".cam-view-5",
              start: "top bottom",
              end: "top top",
              scrub: 1,
              immediateRender: false,
            },
          }
        )
        .addLabel("Explore");

      // Mobile scroll snap
      if (mobile) {
        const style = document.createElement("style");
        style.textContent = `
          html, body {
            scroll-snap-type: y mandatory;
          }
        `;
        document.head.appendChild(style);
      }
    },
    [onUpdate, expandUpdate]
  );

  // Event handlers
  useEffect(() => {
    if (!isLoaded) return;

    const handleKnowMore = () => {
      const element = document.querySelector(".cam-view-2");
      if (element) {
        window.scrollTo({
          top: element.getBoundingClientRect().top + window.scrollY,
          left: 0,
          behavior: "smooth",
        });
      }
    };

    const handleExplore = () => {
      const exploreView = document.querySelector(".cam-view-5") as HTMLElement;
      const canvasView = document.getElementById("webgi-canvas-container") as HTMLElement;
      const header = document.querySelector(".header") as HTMLElement;
      const exitContainer = document.querySelector(".exit--container") as HTMLElement;

      if (exploreView) exploreView.style.pointerEvents = "none";
      if (canvasView) canvasView.style.zIndex = "1";
      if (header) header.style.position = "fixed";
      document.body.style.overflowY = "hidden";
      document.body.style.cursor = "grab";

      const tlExplore = gsap.timeline();
      tlExplore
        .to(positionProxy.current, { x: 5, y: 0.3, z: -4.5, duration: 2.5, onUpdate })
        .to(targetProxy.current, { x: -0.26, y: -0.2, z: 0.9, duration: 2.5, onUpdate }, "-=2.5")
        .fromTo(".header", { opacity: 0 }, { opacity: 1, duration: 1.5, ease: "power4.out" }, "-=2.5")
        .to(
          ".explore--content",
          {
            opacity: 0,
            x: "130%",
            duration: 1.5,
            ease: "power4.out",
            onComplete: () => {
              if (exitContainer) exitContainer.style.display = "flex";
              setControlsEnabled(true);
            },
          },
          "-=2.5"
        );
    };

    const handleExit = () => {
      const exploreView = document.querySelector(".cam-view-5") as HTMLElement;
      const canvasView = document.getElementById("webgi-canvas-container") as HTMLElement;
      const header = document.querySelector(".header") as HTMLElement;
      const exitContainer = document.querySelector(".exit--container") as HTMLElement;

      if (exploreView) exploreView.style.pointerEvents = "all";
      if (canvasView) canvasView.style.zIndex = "unset";
      if (header) header.style.position = "absolute";
      document.body.style.overflowY = "auto";
      if (exitContainer) exitContainer.style.display = "none";
      document.body.style.cursor = "default";
      setControlsEnabled(false);

      const tlExit = gsap.timeline();
      tlExit
        .to(positionProxy.current, { x: -0.3, y: -0.3, z: -4.85, duration: 1.2, ease: "power4.out", onUpdate })
        .to(targetProxy.current, { x: -0.9, y: -0.17, z: 0.1, duration: 1.2, ease: "power4.out", onUpdate }, "-=1.2")
        .to(".explore--content", { opacity: 1, x: "0%", duration: 0.5, ease: "power4.out" }, "-=1.2");

      setLensVisible(true);
      lensOnlyRef.current = false;
    };

    const handleBodyToggle = () => {
      const bodyButton = document.querySelector(".button--body") as HTMLElement;
      if (lensOnlyRef.current) {
        setLensVisible(true);
        lensOnlyRef.current = false;
        if (bodyButton) bodyButton.innerHTML = "view body only";
      } else {
        setLensVisible(false);
        lensOnlyRef.current = true;
        if (bodyButton) bodyButton.innerHTML = "view with lens";
      }
    };

    const knowMoreBtn = document.querySelector(".button-know-more");
    const exploreBtn = document.querySelector(".button-explore");
    const exitBtn = document.querySelector(".button--exit");
    const bodyBtn = document.querySelector(".button--body");

    knowMoreBtn?.addEventListener("click", handleKnowMore);
    exploreBtn?.addEventListener("click", handleExplore);
    exitBtn?.addEventListener("click", handleExit);
    bodyBtn?.addEventListener("click", handleBodyToggle);

    return () => {
      knowMoreBtn?.removeEventListener("click", handleKnowMore);
      exploreBtn?.removeEventListener("click", handleExplore);
      exitBtn?.removeEventListener("click", handleExit);
      bodyBtn?.removeEventListener("click", handleBodyToggle);
    };
  }, [isLoaded, onUpdate]);

  // Cleanup
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Prevent SSR render - Canvas must only render on client
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div id="webgi-canvas-container" ref={containerRef} />;
  }

  const dpr = typeof window !== "undefined" 
    ? Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5) 
    : 1;

  return (
    <div id="webgi-canvas-container" ref={containerRef}>
      <Canvas
        id="webgi-canvas"
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1;
        }}
        dpr={dpr}
        shadows
        flat={false}
      >
        <Scene
          cameraState={cameraState}
          controlsEnabled={controlsEnabled}
          lensExpansion={lensExpansion}
          lensVisible={lensVisible}
          isMobile={isMobile}
          onModelLoad={handleModelLoad}
          onUpdate={onUpdate}
        />
      </Canvas>
    </div>
  );
}

// Preload the model
useGLTF.preload("/assets/camera.glb");
