import React, { FC, useState } from 'react'
import './RotatingImage.css'
import { ImageProps } from 'primereact/image'
interface IRotatingImageProps extends ImageProps {
    onRotationComplete?: () => void
}
export const RotatingImage: FC<IRotatingImageProps> = ({ onRotationComplete, ...rest }) => {
    const [isRotating, setIsRotating] = useState(false)

    const handleAnimationEnd = () => {
        setIsRotating(false)
        if (onRotationComplete) {
            onRotationComplete()
        }
    }

    const handleClick = () => {
        setIsRotating(true)
    }

    return (
        <img
            {...rest}
            className={isRotating ? 'rotate' : ''}
            onClick={handleClick}
            onAnimationEnd={handleAnimationEnd}
            alt='rotating'
        />
    )
}
