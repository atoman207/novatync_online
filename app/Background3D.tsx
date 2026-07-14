"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/* Soft round dot so star particles render as glows, not squares */
function makeDotTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.6)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/* Tech-stack logos (Simple Icons slugs + brand-ish colors for a dark bg) */
const STACK_ICONS: [slug: string, color: string][] = [
  ["react", "61DAFB"],
  ["nextdotjs", "FFFFFF"],
  ["nodedotjs", "5FA04E"],
  ["laravel", "FF2D20"],
  ["python", "FFD43B"],
  ["typescript", "3178C6"],
  ["docker", "2496ED"],
  ["kubernetes", "326CE5"],
  ["postgresql", "699ECA"],
  ["graphql", "E10098"],
  ["tailwindcss", "06B6D4"],
  ["anthropic", "EEF1F8"],
  ["huggingface", "FFD21E"],
  ["redis", "FF4438"],
  ["mongodb", "47A248"],
  ["php", "777BB4"],
];

/**
 * Full-page ambient 3D scene rendered behind every section:
 * a drifting starfield plus glowing tech-stack logos flowing in
 * 3D space, with mouse parallax and scroll-linked camera depth.
 */
export default function Background3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 11;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    /* ---------- starfield ---------- */
    const COUNT = 1500;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const palette = [
      new THREE.Color(0xf0c05a),
      new THREE.Color(0xffd97a),
      new THREE.Color(0x4f7cff),
      new THREE.Color(0x4dd6ff),
      new THREE.Color(0xffffff),
      new THREE.Color(0xffffff),
    ];
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = -Math.random() * 20 + 4;
      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        size: 0.09,
        map: makeDotTexture(),
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    scene.add(stars);

    /* ---------- flowing tech-stack logo sprites ---------- */
    const iconGroup = new THREE.Group();
    scene.add(iconGroup);

    type FloatingIcon = {
      sprite: THREE.Sprite;
      home: THREE.Vector3;
      speed: number;
      phase: number;
      amp: number;
      flow: number;
    };
    const icons: FloatingIcon[] = [];

    STACK_ICONS.forEach(([slug, color], i) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // rasterize the SVG logo with a soft glow in its brand color
        const c = document.createElement("canvas");
        c.width = c.height = 160;
        const ctx = c.getContext("2d")!;
        ctx.shadowColor = `#${color}`;
        ctx.shadowBlur = 26;
        ctx.drawImage(img, 28, 28, 104, 104);
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;

        const sprite = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            opacity: 0.55,
            depthWrite: false,
          })
        );
        // spread icons around the viewport edges at varying depths
        const angle = (i / STACK_ICONS.length) * Math.PI * 2;
        const home = new THREE.Vector3(
          Math.cos(angle) * (7 + Math.random() * 6),
          (Math.random() - 0.5) * 16,
          -3 - Math.random() * 10
        );
        sprite.position.copy(home);
        const s = 1.5 + Math.random() * 0.8;
        sprite.scale.set(s, s, 1);
        iconGroup.add(sprite);
        icons.push({
          sprite,
          home,
          speed: 0.25 + Math.random() * 0.4,
          phase: Math.random() * Math.PI * 2,
          amp: 0.7 + Math.random() * 0.9,
          flow: 0.12 + Math.random() * 0.22,
        });
      };
      img.src = `https://cdn.simpleicons.org/${slug}/${color}`;
    });

    /* ---------- input: mouse parallax + scroll depth ---------- */
    const pointer = { x: 0, y: 0 };
    let scrollT = 0;
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      const max = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      scrollT = window.scrollY / max; // 0 → 1 across the whole page
    };
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();

    /* ---------- animation loop ---------- */
    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      stars.rotation.y += dt * 0.012;
      stars.rotation.x = Math.sin(t * 0.05) * 0.05;

      // logos flow sideways and bob in depth, each at its own rhythm
      const SPAN = 36; // wrap width so icons re-enter offscreen from the other side
      icons.forEach((ic) => {
        const drift = (ic.home.x + 18 + t * ic.flow) % SPAN;
        ic.sprite.position.x = drift - 18;
        ic.sprite.position.y = ic.home.y + Math.sin(t * ic.speed + ic.phase) * ic.amp;
        ic.sprite.position.z = ic.home.z + Math.sin(t * ic.speed * 0.5 + ic.phase) * 1.4;
        (ic.sprite.material as THREE.SpriteMaterial).opacity =
          0.42 + Math.sin(t * ic.speed + ic.phase) * 0.18;
      });
      // the whole icon field counter-rotates gently with the mouse
      iconGroup.rotation.y += (pointer.x * 0.16 - iconGroup.rotation.y) * 0.02;
      iconGroup.rotation.x += (-pointer.y * 0.1 - iconGroup.rotation.x) * 0.02;

      // camera drifts with the mouse and dives slightly as you scroll
      camera.position.x += (pointer.x * 1.1 - camera.position.x) * 0.03;
      camera.position.y += (-pointer.y * 0.8 - scrollT * 3 - camera.position.y) * 0.03;
      camera.position.z = 11 - scrollT * 2.5;
      camera.lookAt(0, camera.position.y * 0.4, 0);

      renderer.render(scene, camera);
    };
    animate();

    /* ---------- cleanup ---------- */
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      starGeo.dispose();
      (stars.material as THREE.PointsMaterial).map?.dispose();
      (stars.material as THREE.PointsMaterial).dispose();
      icons.forEach((ic) => {
        ic.sprite.material.map?.dispose();
        ic.sprite.material.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="bg3d" aria-hidden="true" />;
}
