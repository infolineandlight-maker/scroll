"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  ViewerApp,
  AssetManagerPlugin,
  timeout,
  SSRPlugin,
  mobileAndTabletCheck,
  GBufferPlugin,
  ProgressivePlugin,
  TonemapPlugin,
  SSAOPlugin,
  GroundPlugin,
  FrameFadePlugin,
  BloomPlugin,
  TemporalAAPlugin,
  RandomizedDirectionalLightPlugin,
  AssetImporter,
  createStyles,
} from "webgi";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

interface LensObject {
  position: { z: number };
  visible: boolean;
  userData: {
    __startPos?: number;
    __deltaPos?: number;
  };
}

export default function WebGiViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<ViewerApp | null>(null);
  const lensObjectsRef = useRef<LensObject[]>([]);
  const lensComponentsPositionRef = useRef({ x: 0 });
  const needsUpdateRef = useRef(true);
  const lensOnlyRef = useRef(false);

  const onUpdate = useCallback(() => {
    needsUpdateRef.current = true;
  }, []);

  const expandUpdate = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    for (const o of lensObjectsRef.current) {
      if (o.userData.__startPos !== undefined && o.userData.__deltaPos !== undefined) {
        o.position.z =
          o.userData.__startPos + lensComponentsPositionRef.current.x * o.userData.__deltaPos;
      }
    }
    viewer.setDirty();
    viewer.renderer.resetShadows();
  }, []);

  const setLensAppearance = useCallback((value: boolean) => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    for (const o of lensObjectsRef.current) {
      o.visible = value;
    }
    viewer.scene.setDirty({ sceneUpdate: true });
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    let isUnmounted = false;

    async function setupViewer() {
      if (!canvasRef.current || isUnmounted) return;

      const viewer = new ViewerApp({
        canvas: canvasRef.current,
        useRgbm: true,
        useGBufferDepth: true,
        isAntialiased: false,
      });

      viewerRef.current = viewer;
      const isMobile = mobileAndTabletCheck();

      viewer.renderer.displayCanvasScaling = Math.min(window.devicePixelRatio, 1);

      const manager = await viewer.addPlugin(AssetManagerPlugin);
      const camera = viewer.scene.activeCamera;
      const position = camera.position;
      const target = camera.target;

      // Interface Elements
      const exploreView = document.querySelector(".cam-view-5") as HTMLElement;
      const canvasView = document.getElementById("webgi-canvas") as HTMLElement;
      const canvasContainer = document.getElementById("webgi-canvas-container") as HTMLElement;
      const exitContainer = document.querySelector(".exit--container") as HTMLElement;
      const loaderElement = document.querySelector(".loader") as HTMLElement;
      const header = document.querySelector(".header") as HTMLElement;
      const bodyButton = document.querySelector(".button--body") as HTMLElement;

      // Add WEBGi plugins
      await viewer.addPlugin(GBufferPlugin);
      await viewer.addPlugin(new ProgressivePlugin(32));
      await viewer.addPlugin(new TonemapPlugin(true, true));
      const ssr = await viewer.addPlugin(SSRPlugin);
      const ssao = await viewer.addPlugin(SSAOPlugin);
      await viewer.addPlugin(FrameFadePlugin);
      await viewer.addPlugin(GroundPlugin);
      const bloom = await viewer.addPlugin(BloomPlugin);
      await viewer.addPlugin(TemporalAAPlugin);
      await viewer.addPlugin(RandomizedDirectionalLightPlugin, false);

      if (ssr?.passes?.ssr?.passObject) {
        ssr.passes.ssr.passObject.lowQualityFrames = 0;
      }
      if (bloom?.pass?.passObject) {
        bloom.pass.passObject.bloomIterations = 2;
      }
      if (ssao?.passes?.ssao?.passObject?.material?.defines) {
        ssao.passes.ssao.passObject.material.defines.NUM_SAMPLES = 4;
      }

      // WEBGi loader
      const importer = manager.importer as AssetImporter;

      importer.addEventListener("onStart", () => {
        target.set(8.16, -0.13, 0.51);
        position.set(3.6, -0.04, -3.93);
        onUpdate();
      });

      importer.addEventListener("onProgress", (ev: { loaded: number; total: number }) => {
        const progressRatio = ev.loaded / ev.total;
        document
          .querySelector(".progress")
          ?.setAttribute("style", `transform: scaleX(${progressRatio})`);
      });

      importer.addEventListener("onLoad", () => {
        introAnimation();
      });

      viewer.renderer.refreshPipeline();

      // WEBGi load model
      await manager.addFromPath("/assets/camera.glb");

      const lensObjects: LensObject[] = [];
      for (const obj of LENS_OBJECT_NAMES) {
        const found = viewer.scene.findObjectsByName(obj);
        if (found && found[0]) {
          const o = found[0] as unknown as LensObject;
          o.userData.__startPos = o.position.z;
          o.userData.__deltaPos = -Math.pow(Math.abs(o.position.z) * 1.5, 1.25);
          lensObjects.push(o);
        }
      }
      lensObjectsRef.current = lensObjects;

      if (camera.controls) camera.controls.enabled = false;

      // WEBGi mobile adjustments
      if (isMobile) {
        if (ssr?.passes?.ssr?.passObject) {
          ssr.passes.ssr.passObject.stepCount /= 2;
        }
        bloom.enabled = false;
        camera.setCameraOptions({ fov: 65 });
      }

      window.scrollTo(0, 0);

      await timeout(50);

      function introAnimation() {
        const introTL = gsap.timeline();
        introTL
          .to(".loader", { x: "150%", duration: 0.8, ease: "power4.inOut", delay: 1 })
          .fromTo(
            position,
            { x: 3.6, y: -0.04, z: -3.93 },
            { x: -3.6, y: -0.04, z: -3.93, duration: 4, onUpdate },
            "-=0.8"
          )
          .fromTo(
            target,
            { x: 3.16, y: -0.13, z: 0.51 },
            { x: isMobile ? -0.1 : 0.86, y: -0.13, z: 0.51, duration: 4, onUpdate },
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
              onComplete: setupScrollAnimation,
            },
            "-=1"
          );
      }

      function setupScrollAnimation() {
        document.body.style.overflowY = "scroll";
        if (loaderElement && loaderElement.parentNode) {
          loaderElement.parentNode.removeChild(loaderElement);
        }

        const tl = gsap.timeline({ defaults: { ease: "none" } });

        // PERFORMANCE SECTION
        tl.to(position, {
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
          .to(target, {
            x: isMobile ? 0.1 : -0.6,
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
          .to(position, {
            x: -0.07,
            y: isMobile ? 3 : 5.45,
            z: isMobile ? -1.1 : -3.7,
            scrollTrigger: {
              trigger: ".cam-view-3",
              start: "top bottom",
              end: "top top",
              scrub: true,
              immediateRender: false,
            },
            onUpdate,
          })
          .to(target, {
            x: isMobile ? -0.4 : -0.04,
            y: isMobile ? -3.8 : -0.52,
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
          .to(position, {
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
          .to(target, {
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
          .to(lensComponentsPositionRef.current, {
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
          .to(position, {
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
          .to(target, {
            x: isMobile ? -0.1 : -0.9,
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
          .to(lensComponentsPositionRef.current, {
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
      }

      // Custom wheel scrolling for desktop
      if (!isMobile) {
        const sections = document.querySelectorAll(".section");
        const sectionTops: number[] = [];
        sections.forEach((section) => {
          sectionTops.push(section.getBoundingClientRect().top);
        });
        setupCustomWheelSmoothScrolling(viewer, document.documentElement, sectionTops);
      } else {
        createStyles(`
          html, body {
            scroll-snap-type: y mandatory;
          }
        `);
      }

      viewer.addEventListener("preFrame", () => {
        if (needsUpdateRef.current) {
          camera.positionUpdated(false);
          camera.targetUpdated(true);
          needsUpdateRef.current = false;
        }
      });

      // KNOW MORE EVENT
      document.querySelector(".button-know-more")?.addEventListener("click", () => {
        const element = document.querySelector(".cam-view-2");
        if (element) {
          window.scrollTo({
            top: element.getBoundingClientRect().top,
            left: 0,
            behavior: "smooth",
          });
        }
      });

      // EXPLORE ALL FEATURES EVENT
      document.querySelector(".button-explore")?.addEventListener("click", () => {
        if (exploreView) exploreView.style.pointerEvents = "none";
        if (canvasView) canvasView.style.pointerEvents = "all";
        if (canvasContainer) canvasContainer.style.zIndex = "1";
        if (header) header.style.position = "fixed";
        document.body.style.overflowY = "hidden";
        document.body.style.cursor = "grab";
        exploreAnimation();
      });

      function exploreAnimation() {
        const tlExplore = gsap.timeline();

        tlExplore
          .to(position, { x: 5, y: 0.3, z: -4.5, duration: 2.5, onUpdate })
          .to(target, { x: -0.26, y: -0.2, z: 0.9, duration: 2.5, onUpdate }, "-=2.5")
          .fromTo(
            ".header",
            { opacity: 0 },
            { opacity: 1, duration: 1.5, ease: "power4.out" },
            "-=2.5"
          )
          .to(
            ".explore--content",
            {
              opacity: 0,
              x: "130%",
              duration: 1.5,
              ease: "power4.out",
              onComplete: onCompleteExplore,
            },
            "-=2.5"
          );
      }

      function onCompleteExplore() {
        if (exitContainer) exitContainer.style.display = "flex";
        if (camera.controls) camera.controls.enabled = true;
      }

      document.querySelector(".button--exit")?.addEventListener("click", () => {
        if (exploreView) exploreView.style.pointerEvents = "all";
        if (canvasView) canvasView.style.pointerEvents = "none";
        if (canvasContainer) canvasContainer.style.zIndex = "unset";
        document.body.style.overflowY = "auto";
        if (exitContainer) exitContainer.style.display = "none";
        if (header) header.style.position = "absolute";
        document.body.style.cursor = "default";
        exitAnimation();
      });

      // EXIT EVENT
      function exitAnimation() {
        if (camera.controls) camera.controls.enabled = false;

        const tlExit = gsap.timeline();

        tlExit
          .to(position, { x: -0.3, y: -0.3, z: -4.85, duration: 1.2, ease: "power4.out", onUpdate })
          .to(
            target,
            { x: -0.9, y: -0.17, z: 0.1, duration: 1.2, ease: "power4.out", onUpdate },
            "-=1.2"
          )
          .to(
            ".explore--content",
            { opacity: 1, x: "0%", duration: 0.5, ease: "power4.out" },
            "-=1.2"
          );
        setLensAppearance(true);
        lensOnlyRef.current = false;
      }

      // VIEW BODY EVENT
      bodyButton?.addEventListener("click", () => {
        if (lensOnlyRef.current) {
          setLensAppearance(true);
          lensOnlyRef.current = false;
          bodyButton.innerHTML = "view body only";
        } else {
          setLensAppearance(false);
          lensOnlyRef.current = true;
          bodyButton.innerHTML = "view with lens";
        }
      });
    }

    function setupCustomWheelSmoothScrolling(
      viewer: ViewerApp,
      element: HTMLElement,
      snapPositions: number[],
      speed = 1.5
    ) {
      let customScrollY = element.scrollTop;
      let frameDelta = 0;
      let scrollVelocity = 0;

      const wheelHandler = (e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        frameDelta = Math.min(
          Math.max(e.deltaY * speed, -window.innerHeight / 3),
          window.innerHeight / 3
        );
        return false;
      };

      window.addEventListener("wheel", wheelHandler, { passive: false });

      const idleSpeedFactor = 0.05;
      const snapSpeedFactor = 0.4;
      const snapProximity = window.innerHeight / 4;
      const wheelDamping = 0.25;
      const velocityDamping = 0.2;

      viewer.addEventListener("preFrame", () => {
        if (Math.abs(frameDelta) < 1) {
          const nearestSection = snapPositions.reduce((prev, curr) =>
            Math.abs(curr - customScrollY) < Math.abs(prev - customScrollY) ? curr : prev
          );
          const d = nearestSection - customScrollY;
          scrollVelocity = d * (Math.abs(d) < snapProximity ? snapSpeedFactor : idleSpeedFactor);
        }
        scrollVelocity += frameDelta * wheelDamping;
        frameDelta *= 1 - wheelDamping;
        if (Math.abs(frameDelta) < 0.01) frameDelta = 0;
        if (Math.abs(scrollVelocity) > 0.01) {
          customScrollY = Math.max(customScrollY + scrollVelocity * velocityDamping, 0);
          element.scrollTop = customScrollY;
          scrollVelocity *= 1 - velocityDamping;
        } else {
          scrollVelocity = 0;
        }
      });
    }

    setupViewer();

    return () => {
      isUnmounted = true;
      if (viewerRef.current) {
        viewerRef.current.dispose();
      }
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [onUpdate, expandUpdate, setLensAppearance]);

  return (
    <div id="webgi-canvas-container">
      <canvas id="webgi-canvas" ref={canvasRef} />
    </div>
  );
}
