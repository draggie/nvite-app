import React, { useState, useEffect, useRef } from 'react'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { IStep } from '../interfaces/util'

// Target: rotate phone 90 degrees (landscape) or use keyboard to simulate
const TARGET_BETA = 90 // Beta is the front-to-back tilt (portrait to landscape)
const TOLERANCE = 15 // degrees of tolerance
const KEYBOARD_ROTATION_SPEED = 5 // degrees per keypress

export const PhoneRotationStep: React.FC<IStep> = ({ onNext }) => {
    const [rotation, setRotation] = useState({ alpha: 0, beta: 0, gamma: 0 })
    const [keyboardBeta, setKeyboardBeta] = useState(0) // Simulated rotation for keyboard
    const [targetReached, setTargetReached] = useState(false)
    const [permissionGranted, setPermissionGranted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isMobile, setIsMobile] = useState(false)
    const [usingKeyboard, setUsingKeyboard] = useState(false)
    const orientationListenerRef = useRef<((event: DeviceOrientationEvent) => void) | null>(null)
    const keyboardListenerRef = useRef<((event: KeyboardEvent) => void) | null>(null)

    // Detect if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            ) || (window.innerWidth <= 768)
            setIsMobile(isMobileDevice)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Handle keyboard controls (for desktop/web)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Only handle if not on mobile or if gyroscope is not available
            if (isMobile && permissionGranted) return

            let newBeta = keyboardBeta

            switch (event.key) {
                case 'ArrowUp':
                    event.preventDefault()
                    newBeta = Math.min(keyboardBeta + KEYBOARD_ROTATION_SPEED, 180)
                    setKeyboardBeta(newBeta)
                    setUsingKeyboard(true)
                    checkTargetReached(newBeta)
                    break
                case 'ArrowDown':
                    event.preventDefault()
                    newBeta = Math.max(keyboardBeta - KEYBOARD_ROTATION_SPEED, -180)
                    setKeyboardBeta(newBeta)
                    setUsingKeyboard(true)
                    checkTargetReached(newBeta)
                    break
                case 'ArrowLeft':
                    event.preventDefault()
                    // Rotate around z-axis (alpha)
                    setRotation(prev => ({ ...prev, alpha: (prev.alpha + KEYBOARD_ROTATION_SPEED) % 360 }))
                    break
                case 'ArrowRight':
                    event.preventDefault()
                    // Rotate around z-axis (alpha)
                    setRotation(prev => ({ ...prev, alpha: (prev.alpha - KEYBOARD_ROTATION_SPEED + 360) % 360 }))
                    break
            }
        }

        keyboardListenerRef.current = handleKeyDown
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            if (keyboardListenerRef.current) {
                window.removeEventListener('keydown', keyboardListenerRef.current)
            }
        }
    }, [keyboardBeta, isMobile, permissionGranted])

    const checkTargetReached = (beta: number) => {
        const betaAbs = Math.abs(beta)
        const reached = betaAbs >= TARGET_BETA - TOLERANCE && betaAbs <= TARGET_BETA + TOLERANCE
        setTargetReached(reached)
    }

    // Handle device orientation (for mobile)
    useEffect(() => {
        if (!isMobile) {
            // On desktop, use keyboard controls by default
            setUsingKeyboard(true)
            return
        }

        const requestPermission = async () => {
            // Check if DeviceOrientationEvent is available
            if (typeof DeviceOrientationEvent === 'undefined') {
                setError('Twoja przeglądarka nie obsługuje żyroskopu. Użyj klawiszy strzałek.')
                setUsingKeyboard(true)
                return
            }

            // iOS 13+ requires permission
            if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
                try {
                    const permission = await (DeviceOrientationEvent as any).requestPermission()
                    if (permission === 'granted') {
                        setPermissionGranted(true)
                        startListening()
                    } else {
                        setError('Potrzebujemy dostępu do żyroskopu. Możesz użyć klawiszy strzałek jako alternatywy.')
                        setUsingKeyboard(true)
                    }
                } catch (err) {
                    setError('Błąd podczas żądania dostępu do żyroskopu. Użyj klawiszy strzałek.')
                    setUsingKeyboard(true)
                }
            } else {
                // Android or older iOS - no permission needed
                setPermissionGranted(true)
                startListening()
            }
        }

        const startListening = () => {
            const handleOrientation = (event: DeviceOrientationEvent) => {
                if (event.beta !== null && event.gamma !== null && event.alpha !== null) {
                    setRotation({
                        alpha: event.alpha, // 0-360, rotation around z-axis (compass)
                        beta: event.beta,   // -180 to 180, front-to-back tilt
                        gamma: event.gamma  // -90 to 90, left-to-right tilt
                    })

                    // Check if target rotation is reached
                    const betaAbs = Math.abs(event.beta)
                    checkTargetReached(event.beta)
                }
            }

            orientationListenerRef.current = handleOrientation
            window.addEventListener('deviceorientation', handleOrientation as EventListener)

            return () => {
                if (orientationListenerRef.current) {
                    window.removeEventListener('deviceorientation', orientationListenerRef.current as EventListener)
                }
            }
        }

        requestPermission()

        return () => {
            if (orientationListenerRef.current) {
                window.removeEventListener('deviceorientation', orientationListenerRef.current as EventListener)
            }
        }
    }, [isMobile])

    // Update target reached state when keyboard beta changes
    useEffect(() => {
        if (usingKeyboard) {
            checkTargetReached(keyboardBeta)
        }
    }, [keyboardBeta, usingKeyboard])

    const handleRequestPermission = async () => {
        if (typeof DeviceOrientationEvent !== 'undefined' && 
            typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const permission = await (DeviceOrientationEvent as any).requestPermission()
                if (permission === 'granted') {
                    setPermissionGranted(true)
                    setError(null)
                    setUsingKeyboard(false)
                } else {
                    setError('Potrzebujemy dostępu do żyroskopu')
                }
            } catch (err) {
                setError('Błąd podczas żądania dostępu')
            }
        }
    }

    // Get current beta value (from gyroscope or keyboard)
    const currentBeta = usingKeyboard ? keyboardBeta : rotation.beta
    const currentAlpha = rotation.alpha

    return (
        <Card 
            title='Obróć telefon!'
            style={{ textAlign: 'center', width: '90%' }}
        >
            {isMobile && !permissionGranted && !usingKeyboard ? (
                <div>
                    <p>Musimy uzyskać dostęp do żyroskopu Twojego telefonu</p>
                    <Button 
                        label='Udziel dostępu'
                        onClick={handleRequestPermission}
                        className='p-button-primary'
                    />
                    <div style={{ marginTop: '15px' }}>
                        <Button 
                            label='Użyj klawiszy strzałek zamiast tego'
                            onClick={() => {
                                setUsingKeyboard(true)
                                setError(null)
                            }}
                            className='p-button-secondary'
                            outlined
                        />
                    </div>
                    {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                </div>
            ) : (
                <div>
                    <h3>
                        {usingKeyboard 
                            ? 'Użyj strzałek ↑↓ aby obrócić telefon do pozycji poziomej'
                            : 'Obróć telefon do pozycji poziomej'}
                    </h3>
                    
                    {usingKeyboard && (
                        <div style={{ 
                            margin: '15px 0',
                            padding: '10px',
                            backgroundColor: '#e3f2fd',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}>
                            <strong>Sterowanie klawiaturą:</strong>
                            <div style={{ marginTop: '5px' }}>
                                ↑ Obróć w górę | ↓ Obróć w dół
                            </div>
                        </div>
                    )}

                    <div style={{ 
                        margin: '20px 0',
                        padding: '20px',
                        backgroundColor: targetReached ? '#4caf50' : '#f0f0f0',
                        borderRadius: '8px',
                        transition: 'background-color 0.3s',
                        minHeight: '100px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                            {targetReached ? '✓ Właściwa pozycja!' : 'Obróć telefon...'}
                        </p>
                        
                        {/* Visual indicator */}
                        <div style={{
                            width: '80px',
                            height: '80px',
                            border: '3px solid #333',
                            borderRadius: '8px',
                            backgroundColor: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transform: `rotate(${currentBeta}deg)`,
                            transition: usingKeyboard ? 'transform 0.1s ease' : 'none',
                            margin: '10px 0'
                        }}>
                            <span style={{ fontSize: '24px' }}>📱</span>
                        </div>

                        <div style={{ marginTop: '10px', fontSize: '14px', opacity: 0.7 }}>
                            <div>Beta (pochylenie): {currentBeta.toFixed(1)}°</div>
                            <div>Cel: {TARGET_BETA}° ± {TOLERANCE}°</div>
                            {!usingKeyboard && (
                                <div style={{ marginTop: '5px' }}>
                                    Alpha (kompas): {currentAlpha.toFixed(1)}°
                                </div>
                            )}
                        </div>
                    </div>

                    {targetReached && (
                        <Button
                            label='Kontynuuj'
                            onClick={onNext}
                            className='p-button-success'
                            style={{ marginTop: '20px' }}
                        />
                    )}

                    {isMobile && usingKeyboard && (
                        <div style={{ marginTop: '15px' }}>
                            <Button 
                                label='Spróbuj użyć żyroskopu'
                                onClick={handleRequestPermission}
                                className='p-button-secondary'
                                outlined
                                size='small'
                            />
                        </div>
                    )}
                </div>
            )}
        </Card>
    )
}

