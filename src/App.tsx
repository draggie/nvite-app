import React, { FC, useState } from 'react'
import './App.css'
import Header from './Header'
import { UserProvider } from './context/user.context'
import { useMagic } from './context/magic.context'
import { Steps, steps, getStepByIndex, getTotalSteps } from './steps'
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()
function App() {
    // Use sequence index instead of enum order for randomized steps
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
    const { magic } = useMagic()

    if (magic) return <h1>APLIKACJA ZNISZCZONA</h1>

    const renderStep = () => {
        const step = getStepByIndex(currentStepIndex)
        if (step) {
            return <step.component onNext={() => {
                // Move to next step in sequence
                const nextIndex = currentStepIndex + 1
                if (nextIndex < getTotalSteps()) {
                    setCurrentStepIndex(nextIndex)
                }
            }} />
        }
    }

    return (
        <QueryClientProvider client={queryClient}>
            <UserProvider>
                <div className='App'>
                    <Header />
                    <div className='flex flex-row align-items-center justify-content-center mt-5'>
                        {renderStep()}
                    </div>
                </div>
            </UserProvider>
        </QueryClientProvider>
    )
}

export default App
