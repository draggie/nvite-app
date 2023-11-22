import { FC, useState } from 'react'
import { Button } from 'primereact/button'

interface ITeleportingButtonProps {
    maxTeleports: number
    onPress: () => void
}
export const TeleportingButton: FC<ITeleportingButtonProps> = ({ maxTeleports, onPress }) => {
    const [teleportsRemaining, setTeleportsRemaining] = useState(maxTeleports)
    const [position, setPosition] = useState({ top: '18%', left: '49%' })

    const changePosition = () => {
        if (teleportsRemaining <= 0) return
        setPosition({ top: `${Math.random() * 90}%`, left: `${Math.random() * 90}%` })
        setTeleportsRemaining(teleportsRemaining - 1)
    }

    return (
        <Button
            style={{ position: 'absolute', top: position.top, left: position.left }}
            onMouseEnter={changePosition}
            label='Tak'
            onClick={onPress}
        />
    )
}
