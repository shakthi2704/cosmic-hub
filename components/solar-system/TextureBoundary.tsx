'use client'

import { Component, type ReactNode } from 'react'

interface TextureBoundaryProps {
    /** What to render if the children throw (e.g. a texture fails to load). */
    fallback: ReactNode
    children: ReactNode
}

interface TextureBoundaryState {
    failed: boolean
}

/**
 * Catches errors thrown by texture loading inside the 3D scene.
 *
 * <Suspense> only handles the "still loading" state. It does NOT handle a
 * failed load, so a missing image would otherwise crash the whole page.
 * Wrapping a textured object in this boundary lets it quietly fall back
 * to a simple coloured version instead.
 */
export default class TextureBoundary extends Component<TextureBoundaryProps, TextureBoundaryState> {
    state: TextureBoundaryState = { failed: false }

    static getDerivedStateFromError(): TextureBoundaryState {
        return { failed: true }
    }

    componentDidCatch(error: Error) {
        console.warn('[3D] Texture failed to load, using fallback:', error.message)
    }

    render() {
        return this.state.failed ? this.props.fallback : this.props.children
    }
}