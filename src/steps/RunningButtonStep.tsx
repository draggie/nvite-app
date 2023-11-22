import React, { FC } from 'react'
import { IStep } from '../interfaces/util'
import { Card } from 'primereact/card'
import { TeleportingButton } from '../components/TeleportingButton'

export const RunningButtonStep: FC<IStep> = ({ onNext }) => {
    return (
        <Card title='Ok, dobra po prostu potwierdź po raz ostatni'>
            <TeleportingButton maxTeleports={10} onPress={onNext} />
        </Card>
    )
}
