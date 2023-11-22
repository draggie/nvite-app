import React, { FC, useEffect, useState } from 'react'
import { Card } from 'primereact/card'
import { useUser } from '../context/user.context'
import { IStep } from '../interfaces/util'
import { useMagic } from '../context/magic.context'

export const FinalStep: FC<IStep> = ({ onNext }) => {
    const [timer, setTimer] = useState(30)
    const { setMagic } = useMagic()
    const { targetUser } = useUser()

    useEffect(() => {
        let t: NodeJS.Timeout
        t = setInterval(() => {
            setTimer(timer - 1)
        }, 1000)

        if (timer === 0) {
            localStorage.setItem('magic', 'true')
            setMagic(true)
        }

        return () => clearInterval(t)
    }, [timer])

    return (
        <Card title='No dobra, po co ta agresja'>
            Twój wynik to: <b>{targetUser?.name}</b>
            <br />
            Lepiej go zapisz, bo ta aplikacja ulegnie samozniszczeniu za:
            <b> {timer} s</b>
        </Card>
    )
}
