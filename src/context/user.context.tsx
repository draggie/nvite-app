import { IUser } from '../ListPicker'
import { createContext, FunctionComponent, ReactNode, useContext, useState } from 'react'

export interface IUserContext {
    currentUser: IUser | null
    setCurrentUser: (user: IUser | null) => void
    targetUser: IUser | null
    setTargetUser: (user: IUser | null) => void
}
const UserContext = createContext<IUserContext | undefined>(undefined)

export const UserProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<IUser | null>(null)
    const [targetUser, setTargetUser] = useState<IUser | null>(null)

    const value = {
        currentUser,
        setCurrentUser,
        targetUser,
        setTargetUser,
    }

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = (): IUserContext => {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
