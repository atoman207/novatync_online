"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* Soft round dot for particles */
function makeDotTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.7)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/* Big soft golden halo behind the coin */
function makeGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(240,192,90,0.55)");
  g.addColorStop(0.4, "rgba(240,150,60,0.22)");
  g.addColorStop(0.75, "rgba(79,124,255,0.08)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

/* Back face of the medallion — engraved gold with a "Y" monogram */
function makeBackTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
  g.addColorStop(0, "#f7d67c");
  g.addColorStop(0.55, "#d4a94a");
  g.addColorStop(0.85, "#9a6f1c");
  g.addColorStop(1, "#6e4c10");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);

  // engraved rings
  ctx.strokeStyle = "rgba(90,60,10,0.55)";
  for (const r of [235, 205, 118]) {
    ctx.lineWidth = r === 118 ? 4 : 6;
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  // radial notches
  ctx.lineWidth = 3;
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(256 + Math.cos(a) * 210, 256 + Math.sin(a) * 210);
    ctx.lineTo(256 + Math.cos(a) * 230, 256 + Math.sin(a) * 230);
    ctx.stroke();
  }
  // monogram (horizontally symmetric, so mirroring is invisible)
  ctx.fillStyle = "#4a340c";
  ctx.font = "700 200px 'Space Grotesk', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Y", 256, 268);
  return new THREE.CanvasTexture(c);
}

export default function AvatarCoin3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    /* ---------- renderer / scene / camera ---------- */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 4.6);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight || mount.clientWidth);
    mount.appendChild(renderer.domElement);

    /* ---------- lights ---------- */
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const key = new THREE.DirectionalLight(0xffe2a8, 2.4);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rimBlue = new THREE.PointLight(0x4f7cff, 30, 20);
    rimBlue.position.set(-4, -2, 3);
    scene.add(rimBlue);
    const rimGold = new THREE.PointLight(0xf0c05a, 24, 20);
    rimGold.position.set(4, 2, -3);
    scene.add(rimGold);

    /* ---------- the orb ---------- */
    const coin = new THREE.Group(); // the spinning orb
    scene.add(coin);

    const loader = new THREE.TextureLoader();
    const avatarTex = loader.load("/avatar3.jpg");
    avatarTex.colorSpace = THREE.SRGBColorSpace;

    const R = 1.12;

    // Planar-project a texture onto a hemisphere so the image reads like the
    // flat photo bulging into 3D (no fisheye wrap): uv = (x,y) mapped to [0,1].
    const planarUVs = (geo: THREE.SphereGeometry, mirrorX: boolean) => {
      const pos = geo.attributes.position;
      const uv = geo.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const u = (mirrorX ? -pos.getX(i) : pos.getX(i)) / (2 * R) + 0.5;
        const v = pos.getY(i) / (2 * R) + 0.5;
        uv.setXY(i, u, v);
      }
      uv.needsUpdate = true;
      return geo;
    };

    // front hemisphere (+Z): the portrait, glossy like a lacquered pearl
    const front = new THREE.Mesh(
      planarUVs(new THREE.SphereGeometry(R, 96, 64, 0, Math.PI), false),
      new THREE.MeshPhysicalMaterial({
        map: avatarTex,
        roughness: 0.38,
        metalness: 0.05,
        clearcoat: 0.85,
        clearcoatRoughness: 0.22,
      })
    );
    coin.add(front);

    // back hemisphere (-Z): engraved gold
    const backTex = makeBackTexture();
    backTex.colorSpace = THREE.SRGBColorSpace;
    const back = new THREE.Mesh(
      planarUVs(new THREE.SphereGeometry(R, 96, 64, Math.PI, Math.PI), true),
      new THREE.MeshStandardMaterial({
        map: backTex,
        metalness: 0.85,
        roughness: 0.32,
        emissive: 0x6b5216,
        emissiveIntensity: 0.25,
      })
    );
    coin.add(back);

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf0c05a,
      metalness: 0.95,
      roughness: 0.28,
      emissive: 0x8a6a1e,
      emissiveIntensity: 0.35,
    });

    // golden band along the seam where the hemispheres meet
    const band = new THREE.Mesh(new THREE.TorusGeometry(R, 0.038, 24, 128), goldMat);
    coin.add(band);

    /* ---------- gyroscope rings ---------- */
    const ringsGroup = new THREE.Group();
    scene.add(ringsGroup);

    const ringSpecs: { radius: number; tube: number; color: number; opacity: number }[] = [
      { radius: 1.55, tube: 0.014, color: 0xf0c05a, opacity: 0.95 },
      { radius: 1.72, tube: 0.009, color: 0x4f7cff, opacity: 0.85 },
      { radius: 1.88, tube: 0.007, color: 0x4dd6ff, opacity: 0.6 },
    ];
    const rings = ringSpecs.map((spec, i) => {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(spec.radius, spec.tube, 16, 128),
        new THREE.MeshBasicMaterial({
          color: spec.color,
          transparent: true,
          opacity: spec.opacity,
        })
      );
      mesh.rotation.set(Math.PI / 2.4 + i * 0.5, i * 0.9, i * 0.4);
      ringsGroup.add(mesh);
      return mesh;
    });

    /* ---------- orbiting particles ---------- */
    const COUNT = 700;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const palette = [
      new THREE.Color(0xf0c05a),
      new THREE.Color(0xffd97a),
      new THREE.Color(0x4f7cff),
      new THREE.Color(0x4dd6ff),
      new THREE.Color(0xffffff),
    ];
    for (let i = 0; i < COUNT; i++) {
      const radius = 1.7 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.75;
      positions[i * 3 + 2] = radius * Math.cos(phi);
      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        size: 0.045,
        map: makeDotTexture(),
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    scene.add(particles);

    /* ---------- pulsing halo ---------- */
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeGlowTexture(),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    glow.position.z = -1.4;
    glow.scale.setScalar(6);
    scene.add(glow);

    /* ---------- interaction ---------- */
    const pointer = { x: 0, y: 0 };
    let rotY = 0;
    let spinVel = 0; // extra velocity from drag/click, decays over time
    let dragging = false;
    let lastX = 0;
    let movedSinceDown = 0;

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (dragging) {
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        movedSinceDown += Math.abs(dx);
        rotY += dx * 0.012;
        spinVel = dx * 0.55;
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      movedSinceDown = 0;
      mount.style.cursor = "grabbing";
    };
    const onPointerUp = () => {
      if (dragging && movedSinceDown < 6) spinVel += 7; // clean click → spin impulse
      dragging = false;
      mount.style.cursor = "grab";
    };
    window.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    /* ---------- resize ---------- */
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight || w;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    /* ---------- animation loop ---------- */
    const clock = new THREE.Clock();
    let raf = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      // coin: idle rotation + inertia from user spin
      if (!dragging) {
        rotY += (0.55 + spinVel) * dt;
        spinVel *= Math.exp(-1.8 * dt);
      }
      coin.rotation.y = rotY;
      coin.rotation.x = Math.sin(t * 0.7) * 0.07 + pointer.y * 0.18;
      coin.position.y = Math.sin(t * 1.1) * 0.06;

      // gyroscope rings
      rings[0].rotation.x += dt * 0.7;
      rings[0].rotation.y += dt * 0.35;
      rings[1].rotation.y += dt * 0.55;
      rings[1].rotation.z += dt * 0.3;
      rings[2].rotation.x -= dt * 0.4;
      rings[2].rotation.z += dt * 0.5;
      ringsGroup.rotation.y = pointer.x * 0.25;
      ringsGroup.rotation.x = pointer.y * 0.2;

      // particles drift
      particles.rotation.y += dt * 0.06;
      particles.rotation.x = Math.sin(t * 0.25) * 0.12;

      // halo pulse
      const pulse = 6 + Math.sin(t * 1.6) * 0.5;
      glow.scale.setScalar(pulse);

      // camera parallax
      camera.position.x += (pointer.x * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (-pointer.y * 0.35 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    /* ---------- cleanup ---------- */
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      mount.removeEventListener("pointerdown", onPointerDown);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            const mat = m as THREE.Material & { map?: THREE.Texture | null };
            mat.map?.dispose();
            mat.dispose();
          });
        }
        if (obj instanceof THREE.Sprite) {
          obj.material.map?.dispose();
          obj.material.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webglFailed) {
    return (
      <div className="avatar3d-canvas avatar3d-fallback" aria-label="Portrait of Yuco">
        <img src="/avatar3.jpg" alt="Yuco" />
      </div>
    );
  }

  return <div ref={mountRef} className="avatar3d-canvas" aria-label="3D golden orb with portrait of Yuco" />;
}
