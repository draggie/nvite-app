import React, { FC } from 'react'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { IStep } from '../interfaces/util'

export const AreYouSureSureStep: FC<IStep> = ({ onNext }) => {
    return (
        <Card
            title='Ale dasz sobie rękę uciąć, że chcesz poznać wynik ?'
            footer={
                <div className='flex flex-column align-items-center'>
                    <Button className='mb-2' onClick={() => onNext()}>
                        Tak
                    </Button>
                    <Button className='mb-2' onClick={() => onNext()}>
                        Nie wiem
                    </Button>
                    <Button className='mb-2' onClick={() => onNext()}>
                        Chcę do domu
                    </Button>
                    <Button onClick={() => onNext()}>Tak ty jebany programie</Button>
                </div>
            }
        ></Card>
    )
}
