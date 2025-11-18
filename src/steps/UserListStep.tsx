import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import ListPicker, { IUser } from '../ListPicker'
import React, { FC, useEffect, useRef, useState } from 'react'
import { IStep } from '../interfaces/util'
import { Toast } from 'primereact/toast'
import { useUser } from '../context/user.context'
import { ProgressSpinner } from 'primereact/progressspinner'
import { useSelectRandom } from '../mutations/user.mutation'

export const UserListStep: FC<IStep> = ({ onNext }) => {
    const toast = useRef<Toast | null>(null)
    const { currentUser, setCurrentUser, setTargetUser } = useUser()
    const [isLoading, setIsLoading] = useState(false)
    const { mutate, isError, isSuccess, data } = useSelectRandom(currentUser?.id as number)

    useEffect(() => {
        if (isError)
            toast.current?.show({
                severity: 'error',
                summary: 'Oj nie ładnie',
                detail: 'Oszukiwać tak!!!',
            })
        setIsLoading(false)
    }, [isError])

    useEffect(() => {
        if (isSuccess) {
            setTargetUser(data?.data)
            setTimeout(() => {
                setIsLoading(false)
                onNext()
            }, 5000)
        }
    }, [isSuccess, data, setTargetUser, onNext])

    return (
        <>
            {isLoading ? (
                <Card title='Przetwarzam'>
                    <div className='flex flex-column justify-content-center align-items-center'>
                        Trwa nagrzewanie kryształowej kuli ...
                        <ProgressSpinner />
                    </div>
                </Card>
            ) : (
                <Card
                    title='Wybierz siebie z listy'
                    footer={
                        <Button
                            disabled={!currentUser}
                            type='button'
                            onClick={() => {
                                mutate()
                                setIsLoading(true)
                            }}
                            className='mt-2'
                        >
                            Zatwierdź
                        </Button>
                    }
                    style={{ width: '25rem', marginBottom: '2em' }}
                >
                    <div className='flex flex-row justify-content-center'>
                        <ListPicker
                            selectedUser={currentUser as IUser}
                            onConfirm={setCurrentUser}
                        />
                    </div>
                </Card>
            )}

            <Toast ref={toast} />
        </>
    )
}
