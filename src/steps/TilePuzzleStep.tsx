import React, { useMemo, useState } from 'react'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { IStep } from '../interfaces/util'

const GRID_SIZE = 3
const TOTAL_TILES = GRID_SIZE * GRID_SIZE
const IMAGE_URL = '/gift.png'

const shuffleTiles = (): number[] => {
    const base = Array.from({ length: TOTAL_TILES }, (_, i) => i)

    for (let i = base.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[base[i], base[j]] = [base[j], base[i]]
    }

    if (base.every((value, idx) => value === idx)) {
        ;[base[0], base[1]] = [base[1], base[0]]
    }

    return base
}

export const TilePuzzleStep: React.FC<IStep> = ({ onNext }) => {
    const [tiles, setTiles] = useState<number[]>(() => shuffleTiles())
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [isSolved, setIsSolved] = useState(false)

    const instructions = useMemo(
        () => [
            'Na ekranie masz siatkę z rozsypanym obrazkiem prezentu.',
            'Przeciągaj kafelki tak, aby ułożyć poprawny obraz.',
            'Kiedy wszystko zaskoczy na miejsce, odsłoni się kod do kolejnego etapu.',
        ],
        []
    )

    const swapTiles = (sourceIndex: number, targetIndex: number) => {
        if (sourceIndex === targetIndex) return

        setTiles((prev) => {
            const updated = [...prev]
            ;[updated[sourceIndex], updated[targetIndex]] = [
                updated[targetIndex],
                updated[sourceIndex],
            ]

            if (updated.every((value, idx) => value === idx)) {
                setIsSolved(true)
            }

            return updated
        })
    }

    const handleDragStart = (index: number) => {
        setDraggedIndex(index)
    }

    const handleDrop = (index: number) => {
        if (draggedIndex === null) return
        swapTiles(draggedIndex, index)
        setDraggedIndex(null)
    }

    const tileSize = 96

    return (
        <Card title='Układanka przestrzenna'>
            <div style={{ marginBottom: '1rem', lineHeight: 1.5 }}>
                {instructions.map((line, idx) => (
                    <div key={idx}>{idx + 1}. {line}</div>
                ))}
            </div>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID_SIZE}, ${tileSize}px)`,
                    gap: '6px',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                }}
            >
                {tiles.map((tileIndex, positionIndex) => {
                    const col = tileIndex % GRID_SIZE
                    const row = Math.floor(tileIndex / GRID_SIZE)

                    return (
                        <div
                            key={`${tileIndex}-${positionIndex}`}
                            draggable={!isSolved}
                            onDragStart={() => handleDragStart(positionIndex)}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => handleDrop(positionIndex)}
                            style={{
                                width: tileSize,
                                height: tileSize,
                                borderRadius: '8px',
                                border: '2px solid rgba(255,255,255,0.4)',
                                backgroundImage: `url(${IMAGE_URL})`,
                                backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
                                backgroundPosition: `${(col / (GRID_SIZE - 1)) * 100}% ${
                                    (row / (GRID_SIZE - 1)) * 100
                                }%`,
                                cursor: isSolved ? 'default' : 'grab',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
                                transition: 'transform 0.2s ease',
                            }}
                        />
                    )
                })}
            </div>
            {isSolved ? (
                <div
                    style={{
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        alignItems: 'center',
                    }}
                >
                    <Button label='Kontynuuj' onClick={onNext} />
                </div>
            ) : (
                <div style={{ textAlign: 'center', opacity: 0.8 }}>
                    Przesuwaj kafelki, aż obrazek prezentu będzie cały.
                </div>
            )}
        </Card>
    )
}


