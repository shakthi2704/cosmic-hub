'use client'

import { useEffect, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { chapterLayout } from './chapterLayout'

/** The plane extends this many shadow-radii from the centre. */
const PLANE_S = 4.0

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const FRAG = /* glsl */ `
uniform float time;
uniform float S;
uniform float cosI;
uniform float roll;
varying vec2 vUv;

// Disk edges, in units of the shadow radius.
const float RIN = 1.5;
const float ROUT = 3.5;

float hash(vec3 p) {
  p = 50.0 * fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i + vec3(0.0, 0.0, 0.0)), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}

float fbm3(vec3 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 3; i++) { s += a * vnoise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; }
  return s / 0.875;
}

// Swirling gas. Inner gas orbits faster than outer gas (differential rotation).
float swirl(float rho, float phi) {
  float omega = 1.3 / pow(max(rho, 0.5), 1.5);
  float a = phi - time * omega * 0.5;
  vec3 p = vec3(cos(a) * 1.7, sin(a) * 1.7, rho * 2.4);
  return fbm3(p * 1.8);
}

// Light from the disk at radius rho. x01 < 0 is the side moving toward us (brighter).
vec3 diskLight(float rho, float phi, float x01) {
  float heat = clamp(pow(RIN / rho, 1.6), 0.0, 1.0);
  float n = swirl(rho, phi);
  float I = (0.3 + 1.1 * n) * (0.2 + 1.8 * heat);
  float doppler = 1.0 + 0.6 * x01;
  vec3 hot = mix(vec3(0.95, 0.28, 0.05), vec3(1.0, 0.9, 0.65), heat);
  return hot * I * doppler;
}

float bandMask(float rho) {
  return smoothstep(RIN, RIN + 0.12, rho) * (1.0 - smoothstep(ROUT - 0.9, ROUT, rho));
}

void main() {
  vec2 q = (vUv - 0.5) * 2.0 * S;
  float cr = cos(roll);
  float sr = sin(roll);
  q = vec2(cr * q.x + sr * q.y, -sr * q.x + cr * q.y);
  float r = length(q);

  // The disk seen at an angle: an ellipse, flattened by cosI.
  float rhoD = length(vec2(q.x, q.y / cosI));
  float phiD = atan(q.y / cosI, q.x);
  vec3 direct = diskLight(rhoD, phiD, -q.x / max(rhoD, 0.001)) * bandMask(rhoD);
  bool isFront = q.y < 0.0;

  // The far half is hidden behind the hole.
  float farVis = smoothstep(0.98, 1.1, r);

  // Lensed image of the far side of the disk, bent over the top (and faintly under the bottom).
  float rr = max(r - 1.0, 0.0);
  float archMask = mix(0.3, 1.0, smoothstep(-0.3, 0.6, q.y / max(r, 0.001)));
  vec3 arch = diskLight(RIN + rr * 1.1, atan(q.y, q.x), -q.x / max(r, 0.001))
            * exp(-rr * 2.6) * archMask * step(1.0, r) * 1.6;

  // Thin bright ring at the edge of the shadow.
  float ring = exp(-pow((r - 1.015) / 0.02, 2.0));
  vec3 ringCol = vec3(1.0, 0.82, 0.55) * ring * 1.4;

  vec3 back = arch + ringCol;
  if (!isFront) back += direct * farVis;
  back *= 1.0 - smoothstep(S * 0.8, S, r);   // fade out before the plane's edge
  back = 1.0 - exp(-back * 1.3);              // soft tone mapping

  vec3 front = isFront ? 1.0 - exp(-direct * 1.3) : vec3(0.0);

  float shadow = 1.0 - smoothstep(0.985, 1.0, r);          // the black disc
  float aB = max(shadow, clamp(max(back.r, max(back.g, back.b)), 0.0, 1.0));
  float aF = clamp(max(front.r, max(front.g, front.b)), 0.0, 1.0);

  // Premultiplied: the near half of the disk sits in front of everything else.
  vec3 rgb = front + (1.0 - aF) * back;
  float a = aF + (1.0 - aF) * aB;
  gl_FragColor = vec4(rgb, a);
}
`

interface BlackHoleProps {
    /** Journey value (in steps), updated every frame by useJourney's subscribe(). */
    stRef: MutableRefObject<number>
    /** Chapter number. Overview is at step 2*index, detail at 2*index + 1. */
    index: number
}

export default function BlackHole({ stRef, index }: BlackHoleProps) {
    const groupRef = useRef<THREE.Group>(null)
    const matRef = useRef<THREE.ShaderMaterial>(null)
    const motion = useRef({ time: 0, px: 0, py: 0, reduced: false })

    useEffect(() => {
        motion.current.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }, [])

    useFrame((state, delta) => {
        const group = groupRef.current
        const mat = matRef.current
        if (!group || !mat) return

        const m = motion.current
        const dt = Math.min(delta, 0.05)
        const { width: W, height: H } = state.size
        const L = chapterLayout(stRef.current, index, W, H, { scale: 0.5 })
        group.visible = L.visible
        if (!L.visible) return

        // With reduced motion the gas stands still and the pointer is ignored.
        if (!m.reduced) {
            m.time += dt
            m.px += (state.pointer.x - m.px) * (1 - Math.exp(-dt * 3))
            m.py += (state.pointer.y - m.py) * (1 - Math.exp(-dt * 3))
        }
        mat.uniforms.time.value = m.time
        mat.uniforms.cosI.value = 0.22 + m.py * 0.06 // pointer tilts the disk
        mat.uniforms.roll.value = -0.12 + m.px * 0.1

        group.position.set(L.sceneX, L.sceneY, 0)
        group.scale.setScalar(Math.max(L.radius, 0.001))
    })

    return (
        <group ref={groupRef}>
            <mesh>
                <planeGeometry args={[2 * PLANE_S, 2 * PLANE_S]} />
                <shaderMaterial
                    ref={matRef}
                    uniforms={{
                        time: { value: 0 },
                        S: { value: PLANE_S },
                        cosI: { value: 0.22 },
                        roll: { value: -0.12 },
                    }}
                    vertexShader={VERT}
                    fragmentShader={FRAG}
                    transparent
                    premultipliedAlpha
                    depthWrite={false}
                />
            </mesh>
        </group>
    )
}