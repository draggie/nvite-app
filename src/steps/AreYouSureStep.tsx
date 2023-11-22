import React, { FC } from 'react'
import { IStep } from '../interfaces/util'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'

export const AreYouSureStep: FC<IStep> = ({ onNext }) => {
    return (
        <Card
            title='Czy na pewno ?'
            footer={
                <div className='flex flex-column align-items-center'>
                    <Button className='mb-2' onClick={() => onNext()}>
                        Tak, na pewno chcę poznać wynik
                    </Button>
                    <Button onClick={() => onNext()}>Nie, musze przemyśleć swoje życie</Button>
                </div>
            }
        ></Card>
    )
}
