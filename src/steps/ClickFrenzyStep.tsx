import React, { useState, useEffect } from 'react'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { IStep } from '../interfaces/util'

export const ClickFrenzyStep: React.FC<IStep> = ({ onNext }) => {
    const [clickCount, setClickCount] = useState(0)
    const [timeLeft, setTimeLeft] = useState(10) // 10 seconds to complete
    const [isFailed, setIsFailed] = useState(false)
    const targetClicks = 20

    useEffect(() => {
        if (timeLeft === 0 && clickCount < targetClicks) {
            setIsFailed(true)
            setClickCount(0) // Reset the counter
        }

        const timer = timeLeft > 0 ? setInterval(() => setTimeLeft(prev => prev - 1), 1000) : null
        return () => clearInterval(timer!)
    }, [timeLeft, clickCount, targetClicks])

    const handleClick = () => {
        if (clickCount + 1 >= targetClicks) {
            onNext() // User succeeds, move to the next step
        } else {
            setClickCount(clickCount + 1)
        }
    }

    const handleRetry = () => {
        setIsFailed(false)
        setTimeLeft(10) // Reset the timer
        setClickCount(0)
    }

    return (
        <Card className='p-mb-3' style={{ textAlign: 'center', width: '90%' }}>
            <h2>Kliknij szybko!</h2>
            {!isFailed ? (
                <p>
                    Kliknij przycisk <strong>{targetClicks}</strong> razy w ciągu{' '}
                    <strong>{timeLeft}</strong> sekund!
                </p>
            ) : (
                <p style={{ color: 'red' }}>
                    Nie wystarczająco szybko dla sań Mikołaja! Spróbuj ponownie.
                </p>
            )}
            <Button
                label='Kliknij mnie!'
                icon='pi pi-hand-point-up'
                className='p-button-lg p-button-warning'
                onClick={handleClick}
                disabled={isFailed || timeLeft === 0}
            />
            <p style={{ marginTop: '10px' }}>
                Kliknięcia: {clickCount}/{targetClicks}
            </p>
            {isFailed && (
                <Button
                    label='Spróbuj ponownie'
                    icon='pi pi-refresh'
                    className='p-button-sm p-button-danger'
                    onClick={handleRetry}
                    style={{ marginTop: '20px' }}
                />
            )}
        </Card>
    )
}
