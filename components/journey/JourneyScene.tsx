'use client'

import { Suspense, type MutableRefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import Planet, { MARS, EARTH, SATURN, type PlanetConfig } from './Planet'
import Sun from './Sun'
import BlackHole from './BlackHole'
import Galaxy from './Galaxy'
import TextureBoundary from '../solar-system/TextureBoundary'
import { JOURNEY_CONTENT } from '@/lib/journey-content'

type SceneObject =
    | { kind: 'planet'; config: PlanetConfig }
    | { kind: 'sun' }
    | { kind: 'blackhole' }
    | { kind: 'galaxy' }

// Which 3D object belongs to which chapter (same slugs as the content).
const OBJECTS: Record<string, SceneObject> = {
    mars: { kind: 'planet', config: MARS },
    earth: { kind: 'planet', config: EARTH },
    saturn: { kind: 'planet', config: SATURN },
    sun: { kind: 'sun' },
    'black-hole': { kind: 'blackhole' },
    galaxy: { kind: 'galaxy' },
}

interface JourneySceneProps {
    /** Journey value (in steps), updated every frame by useJourney's subscribe(). */
    stRef: MutableRefObject<number>
    /** False pauses rendering (for example when scrolled past the journey). */
    active: boolean
}

export default function JourneyScene({ stRef, active }: JourneySceneProps) {
    return (
        <Canvas
            orthographic
            camera={{ position: [0, 0, 10000], near: 1, far: 30000, zoom: 1 }}
            dpr={[1, 2]}
            gl={{ alpha: true, antialias: true }}
            frameloop={active ? 'always' : 'never'}
        >
            {JOURNEY_CONTENT.map((c, i) => {
                const o = OBJECTS[c.slug]
                if (!o) return null
                return (
                    <TextureBoundary key={c.slug} fallback={null}>
                        <Suspense fallback={null}>
                            {o.kind === 'planet' ? (
                                <Planet stRef={stRef} index={i} config={o.config} />
                            ) : o.kind === 'sun' ? (
                                <Sun stRef={stRef} index={i} />
                            ) : o.kind === 'blackhole' ? (
                                <BlackHole stRef={stRef} index={i} />
                            ) : (
                                <Galaxy stRef={stRef} index={i} />
                            )}
                        </Suspense>
                    </TextureBoundary>
                )
            })}
        </Canvas>
    )
}