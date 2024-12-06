import React, { useState } from 'react'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { IStep } from '../interfaces/util'

export const SnowballFightStep: React.FC<IStep> = ({ onNext }) => {
    const [hits, setHits] = useState(0)
    const targetHits = 5 // Number of hits required to win

    const characters = [
        { id: 1, x: 10, y: 50 },
        { id: 2, x: 30, y: 20 },
        { id: 3, x: 70, y: 40 },
        { id: 4, x: 50, y: 80 },
        { id: 5, x: 90, y: 30 },
    ]

    const handleHit = (id: number) => {
        setHits(prevHits => prevHits + 1)
        // Optionally, remove or animate the hit character
    }

    const resetGame = () => {
        setHits(0)
    }

    return (
        <Card className='p-mb-3' style={{ textAlign: 'center', width: '90%' }}>
            <h2>Śnieżkowa bitwa!</h2>
            {hits < targetHits ? (
                <p>Rzuć śnieżką w {targetHits} postaci, aby wygrać bitwę!</p>
            ) : (
                <p style={{ color: 'green' }}>Gratulacje! Wygrałeś śnieżkową bitwę! 🎉</p>
            )}
            <div
                style={{
                    width: '100%',
                    height: '400px',
                    border: '2px dashed #ccc',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: '#f0f0f0',
                }}
            >
                {characters.map(
                    (char, index) =>
                        hits < targetHits && (
                            <div
                                key={char.id}
                                onClick={() => handleHit(char.id)}
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    backgroundColor: 'blue',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: `${char.y}%`,
                                    left: `${char.x}%`,
                                    transform: 'translate(-50%, -50%)',
                                    cursor: 'pointer',
                                    animation: `moveCharacter ${3 + index}s infinite alternate`,
                                }}
                            ></div>
                        ),
                )}
            </div>
            {hits < targetHits ? (
                <p style={{ marginTop: '10px' }}>
                    Trafienia: {hits}/{targetHits}
                </p>
            ) : (
                <Button
                    label='Dalej'
                    icon='pi pi-check'
                    className='p-button-success'
                    onClick={onNext}
                    style={{ marginTop: '20px' }}
                />
            )}
            <style>{`
                @keyframes moveCharacter {
                    0% { transform: translate(-50%, -50%) translateX(0); }
                    100% { transform: translate(-50%, -50%) translateX(20px); }
                }
            `}</style>
        </Card>
    )
}
