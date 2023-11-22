import React, { FC, useState } from 'react'
import './App.css'
import Header from './Header'
import { UserProvider } from './context/user.context'
import { useMagic } from './context/magic.context'
import { Steps, steps } from './steps'
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()
function App() {
    const [currentStep, setCurrentStep] = useState<Steps>(Steps.PICK_USER)
    const { magic } = useMagic()

    if (magic) return <h1>APLIKACJA ZNISZCZONA</h1>

    const renderStep = () => {
        const step = steps.find(q => q.order === currentStep)
        if (step) {
            return <step.component onNext={() => setCurrentStep(step?.order + 1)} />
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
