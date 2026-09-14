/**
 * The lazily loaded Three.js layer: loads the configured glTF model, lights it,
 * and drives the gaze choreography from src/avatar-performance.ts.
 *
 * Every tunable value here comes from `avatar`, `lighting` and `animation` in
 * src/config/site.ts — you should not need to edit this file to restyle or
 * replace the model.
 *
 * Copyright (c) 2026 Falcon Forged Ventures LLC. All rights reserved.
 * Licensed, not sold. See LICENSE.md.
 */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { AvatarPerformance } from "./avatar-performance.ts";
import { siteConfig } from "./config/site.ts";

/** The world-space size the model is normalised to before `avatar.scale`. */
const NORMALIZED_MAX_DIMENSION = 2.85;

export async function createAvatar(
  container: HTMLElement,
  portrait: HTMLElement,
  onFallback: () => void,
) {
  const { avatar: avatarConfig, lighting, animation } = siteConfig;
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = lighting.exposure;
  renderer.setClearColor(0, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1.5, 1.5, 1.5, -1.5, 0.1, 30);
  camera.position.z = 7;
  const pivot = new THREE.Group();
  scene.add(pivot);
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, 0.04);
  room.dispose();
  pmrem.dispose();
  scene.environment = environment.texture;
  scene.environmentIntensity = lighting.environmentIntensity;
  const makeLight = (spec: typeof lighting.key) => {
    const light = new THREE.DirectionalLight(new THREE.Color(spec.color), spec.intensity);
    light.position.set(spec.position.x, spec.position.y, spec.position.z);
    return light;
  };
  scene.add(makeLight(lighting.key), makeLight(lighting.fill), makeLight(lighting.rim));
  let paused = false;
  let stopped = false;
  let last = 0;
  let clock = 0;
  let frameCount = 0;
  const life = new AvatarPerformance(0, Math.random, {
    intensity: animation.intensity,
    speed: animation.speed,
    idleAfterSeconds: animation.idleAfterSeconds,
    pointerTracking: animation.pointerTracking,
  });
  const cleanups: (() => void)[] = [];
  function disposeObject(object: THREE.Object3D) {
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    object.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        geometries.add(node.geometry);
        (Array.isArray(node.material) ? node.material : [node.material]).forEach((material) =>
          materials.add(material),
        );
      }
      if (node instanceof THREE.SkinnedMesh) node.skeleton.dispose();
    });
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) {
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) textures.add(value);
      });
      material.dispose();
    }
    for (const texture of textures) texture.dispose();
  }
  function dispose() {
    if (stopped) return;
    stopped = true;
    renderer.setAnimationLoop(null);
    cleanups.forEach((cleanup) => cleanup());
    disposeObject(scene);
    environment.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    portrait.classList.remove("is-ready");
  }
  try {
    const gltf = await new GLTFLoader()
      .setMeshoptDecoder(MeshoptDecoder)
      .loadAsync(avatarConfig.model);
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    gltf.scene.position.sub(center);
    const model = new THREE.Group();
    model.add(gltf.scene);
    const modelScale = (NORMALIZED_MAX_DIMENSION / Math.max(size.x, size.y, size.z)) * avatarConfig.scale;
    model.scale.setScalar(modelScale);
    model.position.set(avatarConfig.position.x, avatarConfig.position.y, avatarConfig.position.z);
    model.rotation.set(avatarConfig.rotation.x, avatarConfig.rotation.y, avatarConfig.rotation.z);
    pivot.add(model);

    const { left: leftEyeName, right: rightEyeName } = avatarConfig.eyeNodes;
    const eyes: THREE.Object3D[] = [];
    gltf.scene.traverse((node) => {
      if (node.name === leftEyeName || node.name === rightEyeName) eyes.push(node);
    });
    const hasEyeRig =
      eyes.length === 2 &&
      eyes.some((eye) => eye.name === leftEyeName) &&
      eyes.some((eye) => eye.name === rightEyeName);
    if (avatarConfig.requireEyes && !hasEyeRig) {
      throw new Error(
        `The model at ${avatarConfig.model} must contain exactly one "${leftEyeName}" and one ` +
          `"${rightEyeName}" pivot. Rename the nodes in your model, update avatar.eyeNodes in ` +
          "src/config/site.ts, or set avatar.requireEyes to false to animate the head only. " +
          "See docs/CUSTOMIZATION.md § 3D avatar.",
      );
    }
    if (!hasEyeRig) eyes.length = 0;
    const restEyes = eyes.map((eye) => eye.quaternion.clone());
    const gaze = new THREE.Quaternion();
    const eyeEuler = new THREE.Euler(0, 0, 0, "YXZ");
    const halfSize = size.clone().multiplyScalar(modelScale / 2);
    const framing = gltf.scene.userData.avatarFraming;
    const measuredFraming =
      framing?.version === 1 &&
      framing.normalizedMaxDimension === NORMALIZED_MAX_DIMENSION &&
      typeof framing.halfWidth === "number" &&
      Number.isFinite(framing.halfWidth) &&
      framing.halfWidth > 0 &&
      typeof framing.halfHeight === "number" &&
      Number.isFinite(framing.halfHeight) &&
      framing.halfHeight > 0
        ? { halfWidth: framing.halfWidth, halfHeight: framing.halfHeight }
        : null;
    // Production assets bake tight bounds from actual vertices across head poses.
    // Older assets retain conservative box framing without runtime vertex scans.
    // The baked framing was measured at scale 1, so honour avatar.scale here.
    const framedHalfWidth =
      (measuredFraming ? measuredFraming.halfWidth * avatarConfig.scale : undefined) ??
      (halfSize.x + halfSize.z * Math.sin(0.34) + halfSize.y * Math.sin(0.1)) * 1.04;
    const framedHalfHeight =
      (measuredFraming ? measuredFraming.halfHeight * avatarConfig.scale : undefined) ??
      (halfSize.y +
        halfSize.z * Math.sin(0.21) +
        halfSize.x * (Math.sin(0.1) + Math.sin(0.21) * Math.sin(0.34))) *
        1.04;
    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      const aspect = width / height;
      const halfHeight = Math.max(1.5, framedHalfHeight, framedHalfWidth / aspect);
      renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.5 : 1.75));
      renderer.setSize(width, height, false);
      camera.left = -halfHeight * aspect;
      camera.right = halfHeight * aspect;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
      if (paused) renderer.render(scene, camera);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    cleanups.push(() => observer.disconnect());
    const pointer = (event: PointerEvent) => {
      if (paused || document.hidden || !["mouse", "pen"].includes(event.pointerType)) return;
      const bounds = container.getBoundingClientRect();
      life.pointer(
        (event.clientX - bounds.left - bounds.width / 2) / Math.max(innerWidth * 0.42, 1),
        (event.clientY - bounds.top - bounds.height / 2) / Math.max(innerHeight * 0.42, 1),
        clock,
        true,
      );
    };
    const leave = () => life.leave();
    const visibility = () => {
      last = 0;
      life.leave();
    };
    const lost = (event: Event) => {
      event.preventDefault();
      portrait.dataset.status = "fallback";
      dispose();
      onFallback();
    };
    window.addEventListener("pointermove", pointer, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    document.addEventListener("visibilitychange", visibility);
    renderer.domElement.addEventListener("webglcontextlost", lost);
    cleanups.push(() => {
      window.removeEventListener("pointermove", pointer);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
    });
    container.appendChild(renderer.domElement);
    renderer.render(scene, camera);
    portrait.classList.add("is-ready");
    portrait.dataset.status = "live";
    portrait.dataset.eyes = String(eyes.length);
    portrait.dataset.rig = hasEyeRig ? "eyes-only" : "head-only";
    function animate(time: number) {
      if (stopped) return;
      if (document.hidden || paused) {
        last = 0;
        return;
      }
      const fpsCap = innerWidth < 700 ? animation.maxFps.mobile : animation.maxFps.desktop;
      if (last && time - last < 1000 / fpsCap - 1) return;
      const dt = last ? Math.min(0.05, (time - last) / 1000) : 1 / 60;
      last = time;
      clock += dt;
      const frame = life.update(clock, dt, true);
      pivot.rotation.set(frame.headPitch + frame.breath, frame.headYaw, frame.headRoll);
      // The generated head has narrow static lids; keep pupils inside their openings.
      const eyePitch = THREE.MathUtils.clamp(frame.eyePitch, -0.1, 0.1);
      const eyeYaw = THREE.MathUtils.clamp(frame.eyeYaw, -0.24, 0.24);
      eyeEuler.set(eyePitch, eyeYaw, 0, "YXZ");
      gaze.setFromEuler(eyeEuler);
      eyes.forEach((eye, i) => eye.quaternion.copy(restEyes[i]).multiply(gaze));
      renderer.render(scene, camera);
      if (++frameCount % 10 === 0) {
        portrait.dataset.mode = frame.mode;
        portrait.dataset.look = frame.stateName;
        portrait.dataset.lookProgress = frame.stateProgress.toFixed(3);
        portrait.dataset.lookCycle = String(frame.cycle);
        portrait.dataset.headYaw = frame.headYaw.toFixed(4);
        portrait.dataset.eyeYaw = eyeYaw.toFixed(4);
        portrait.dataset.headPitch = frame.headPitch.toFixed(4);
        portrait.dataset.headRoll = frame.headRoll.toFixed(4);
        portrait.dataset.eyePitch = eyePitch.toFixed(4);
      }
    }
    renderer.setAnimationLoop(animate);
    return {
      setPaused(value: boolean) {
        paused = value;
        last = 0;
        life.leave();
        if (value) {
          life.update(clock, 0, false);
          pivot.rotation.set(0, 0, 0);
          eyes.forEach((eye, i) => eye.quaternion.copy(restEyes[i]));
          renderer.render(scene, camera);
          portrait.dataset.mode = "paused";
          portrait.dataset.look = "rest";
          portrait.dataset.headYaw = "0";
          portrait.dataset.headPitch = "0";
          portrait.dataset.headRoll = "0";
          portrait.dataset.eyeYaw = "0";
          portrait.dataset.eyePitch = "0";
        }
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
