import { useEffect, useRef, useState } from 'react'
import { Niivue, NVImage } from '@niivue/niivue'

function makeOverlayOptions(activation, threshold, opacity) {
  const floor = Math.max(Number(threshold) || 0, Math.abs(activation.max || 1) * 0.001, Number.EPSILON)
  return {
    url: activation.niftiBuffer.slice(0),
    name: 'activation-map.nii',
    colormap: 'hot',
    opacity,
    cal_min: floor,
    cal_max: Math.max(activation.max, floor * 1.01),
    ignoreZeroVoxels: true,
    colorbarVisible: false,
  }
}

export function BrainVolume3D({ background, activation, threshold, opacity, coordinates }) {
  const canvasRef = useRef(null)
  const niivueRef = useRef(null)
  const overlayRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [overlayError, setOverlayError] = useState('')

  useEffect(() => {
    if (!background?.niftiBuffer || !canvasRef.current) return undefined

    let cancelled = false
    const niivue = new Niivue({
      backColor: [0.035, 0.055, 0.09, 1],
      crosshairColor: [0.48, 0.72, 0.82, 0.34],
      crosshairWidth: 0.7,
      isOrientCube: true,
      show3Dcrosshair: true,
      isRadiologicalConvention: false,
      isSliceMM: true,
      isResizeCanvas: true,
    })
    niivueRef.current = niivue
    setError('')
    setReady(false)

    const initialize = async () => {
      try {
        await niivue.attachToCanvas(canvasRef.current)
        const template = await NVImage.loadFromUrl({
          url: background.niftiBuffer.slice(0),
          name: 'mni_2mm.nii',
          colormap: 'gray',
          opacity: 0.24,
          ignoreZeroVoxels: true,
          colorbarVisible: false,
        })
        if (cancelled) return
        niivue.addVolume(template)
        niivue.setSliceType(niivue.sliceTypeRender)
        niivue.setRenderAzimuthElevation(110, 16)
        niivue.setScale(1.05)
        setReady(true)
      } catch (cause) {
        if (!cancelled) setError(cause?.message || 'The 3D view could not start in this browser.')
      }
    }

    initialize()
    return () => {
      cancelled = true
      niivue.cleanup()
      if (niivueRef.current === niivue) niivueRef.current = null
      overlayRef.current = null
      setReady(false)
    }
  }, [background])

  useEffect(() => {
    const niivue = niivueRef.current
    if (!ready || !niivue || !activation?.niftiBuffer) return undefined
    let cancelled = false
    setOverlayError('')
    let nextOverlay = null

    const addOverlay = async () => {
      try {
        nextOverlay = await NVImage.loadFromUrl(makeOverlayOptions(activation, threshold, opacity))
        if (cancelled) return
        niivue.addVolume(nextOverlay)
        overlayRef.current = nextOverlay
        niivue.setSliceType(niivue.sliceTypeRender)
      } catch (cause) {
        if (!cancelled) setOverlayError(cause?.message || 'The activation overlay could not be displayed.')
      }
    }

    addOverlay()
    return () => {
      cancelled = true
      if (nextOverlay && overlayRef.current === nextOverlay) {
        niivue.removeVolume(nextOverlay)
        overlayRef.current = null
      }
    }
  }, [activation, ready])

  useEffect(() => {
    const niivue = niivueRef.current
    const overlay = overlayRef.current
    if (!ready || !niivue || !overlay || !activation) return
    const options = makeOverlayOptions(activation, threshold, opacity)
    overlay.cal_min = options.cal_min
    overlay.cal_max = options.cal_max
    niivue.setOpacity(niivue.volumes.indexOf(overlay), opacity)
    niivue.updateGLVolume()
    niivue.drawScene()
  }, [activation, opacity, ready, threshold])

  useEffect(() => {
    const niivue = niivueRef.current
    if (!ready || !niivue || coordinates.some(value => !Number.isFinite(value))) return
    try {
      niivue.scene.crosshairPos = niivue.mm2frac(coordinates)
      niivue.drawScene()
    } catch {
      // The template can still be loading while coordinate controls are edited.
    }
  }, [coordinates, ready])

  const resetView = () => {
    const niivue = niivueRef.current
    if (!niivue) return
    niivue.setRenderAzimuthElevation(110, 16)
    niivue.setScale(1.05)
    niivue.drawScene()
  }

  return (
    <section className='viewer__volume-card' aria-label='Interactive 3D brain map'>
      <div className='viewer__volume-heading'>
        <div>
          <span className='viewer__volume-kicker'>INTERACTIVE ATLAS</span>
          <h3>3D activation overview</h3>
          <p>Drag to rotate · scroll to zoom · inspect coordinates in the linked slices</p>
        </div>
        <button type='button' className='viewer__reset-view' onClick={resetView} disabled={!ready}>Reset view</button>
      </div>
      <div className='viewer__volume-stage'>
        <canvas ref={canvasRef} aria-label='Rotatable MNI brain volume with activation overlay' />
        {!ready && !error && <div className='viewer__volume-status'>Preparing 3D template…</div>}
        {ready && !activation && <div className='viewer__volume-status viewer__volume-status--small'>Waiting for an activation map</div>}
        {(error || overlayError) && <div className='viewer__volume-error'>{error || overlayError}</div>}
        <div className='viewer__volume-legend'><span /> Activation</div>
        <div className='viewer__volume-location'>MNI <b>{coordinates.map(value => Math.round(value)).join(', ')}</b> mm</div>
      </div>
    </section>
  )
}
