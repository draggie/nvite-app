import React, { FC, useMemo, useState } from 'react'
import { IStep } from '../interfaces/util'
import { Card } from 'primereact/card'
import { Row } from 'primereact/row'
import { RotatingImage } from '../components/RotatingImage'

export const SantaStep: FC<IStep> = ({ onNext }) => {
    const winningNumber = useMemo(() => Math.floor(Math.random() * 3) + 1, [])
    const [result, setResult] = useState<number[]>([])

    const handleRotationComplete = (index: number) => {
        const newResult = [...result]
        newResult.push(index)
        setResult(newResult)
        if (newResult.includes(winningNumber)) {
            onNext()
        }
    }

    const getSantaImage = (index: number) => {
        if (result.includes(index)) {
            if (index === winningNumber) {
                return '/gift.png'
            } else {
                return '/grinch.jpg'
            }
        } else {
            return '/santa.png'
        }
    }

    return (
        <Card title='Oh nie, Twoja odpowiedź ukryła się za jednym z Mikołajów!'>
            <Row>
                <RotatingImage
                    onRotationComplete={() => handleRotationComplete(1)}
                    height='250'
                    src={getSantaImage(1)}
                />
                <RotatingImage
                    onRotationComplete={() => handleRotationComplete(2)}
                    height='250'
                    src={getSantaImage(2)}
                />
                <RotatingImage
                    onRotationComplete={() => handleRotationComplete(3)}
                    height='250'
                    src={getSantaImage(3)}
                />
            </Row>
        </Card>
    )
}
