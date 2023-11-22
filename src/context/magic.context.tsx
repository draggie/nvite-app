import { createContext, FC, PropsWithChildren, useContext, useState } from 'react'

export interface IMagicContext {
    magic: boolean
    setMagic: (magic: boolean) => void
}

const MagicContext = createContext<IMagicContext | undefined>(undefined)

export const MagicProvider: FC<PropsWithChildren> = ({ children }) => {
    const [magic, setMagic] = useState<boolean>(!!localStorage.getItem('magic'))

    const value = {
        magic,
        setMagic,
    }

    return <MagicContext.Provider value={value}>{children}</MagicContext.Provider>
}

export const useMagic = (): IMagicContext => {
    const context = useContext(MagicContext)
    if (context === undefined) {
        throw new Error('useMagic must be used within a MagicProvider')
    }
    return context
}
