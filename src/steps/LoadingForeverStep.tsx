import React, { useState, useEffect } from 'react'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Card } from 'primereact/card'
import { IStep } from '../interfaces/util'
import { ProgressBar } from 'primereact/progressbar'

const captions = [
    'Ładowanie... Proszę czekać...',
    'Zbieranie prezentów od Mikołaja...',
    'Sprawdzanie listy grzecznych dzieci...',
    'Liczenie reniferów...',
    'Pobieranie pliku: prezent.zip...',
    'Rozpakowywanie elfów...',
    'Odpinanie sań od chmury...',
    'Świąteczne czary w toku...',
    'Próbujemy złapać świątecznego ducha...',
    'Ładowanie ładunku prezentów...',
    'Przygotowanie choinki do wyświetlania...',
]

export const LoadingForeverStep: React.FC<IStep> = ({ onNext }) => {
    const [progress, setProgress] = useState(0)
    const [captionIndex, setCaptionIndex] = useState(0)

    useEffect(() => {
        // Increment progress every 500ms
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev < 100) {
                    return prev + 5 // Increment by 5%
                }
                return prev
            })
        }, 1000)

        // Change captions every 3 seconds
        const captionInterval = setInterval(() => {
            setCaptionIndex(prevIndex => (prevIndex + 1) % captions.length)
        }, 1000)

        // Call onNext when progress reaches 100%
        if (progress >= 100) {
            clearInterval(progressInterval)
            clearInterval(captionInterval)
            onNext()
        }

        return () => {
            clearInterval(progressInterval)
            clearInterval(captionInterval)
        }
    }, [progress, onNext])
    return (
        <Card className='p-mb-3' style={{ textAlign: 'center' }}>
            <h2>Mikołaj pracuje, proszę czekać...</h2>
            <p>{captions[captionIndex]}</p>
            <ProgressBar value={progress} style={{ width: '100%' }}></ProgressBar>
        </Card>
    )
}
