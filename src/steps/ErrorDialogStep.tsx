import React, { useState } from 'react'
import { Button } from 'primereact/button'
import { IStep } from '../interfaces/util'

interface ErrorDialog {
    title: string
    message: string
    buttonText: string
}

const errorDialogs: ErrorDialog[] = [
    {
        title: '⚠️ Application Error',
        message: 'The application has encountered an unexpected error.\n\nError Code: 0xSANTA_404\n\nWould you like to send an error report?',
        buttonText: 'Send Report',
    },
    {
        title: '❌ Runtime Exception',
        message: 'NullPointerException: Santa object is null\n\nStack trace:\n  at Christmas.getPresent()\n  at User.expectGift()\n  at Application.run()\n\nThis error has been logged.',
        buttonText: 'OK',
    },
    {
        title: '🔴 Critical System Failure',
        message: 'SYSTEM ERROR: Presents.exe has stopped working\n\nWindows can check online for a solution to the problem.\n\n[Cancel] [Check online] [Close program]',
        buttonText: 'Check online',
    },
    {
        title: '⚠️ Warning',
        message: 'Unable to connect to Santa\'s server.\n\nConnection timeout after 30 seconds.\n\nPlease check your internet connection and try again.',
        buttonText: 'Retry',
    },
    {
        title: '💥 Fatal Error',
        message: 'ERROR: Cannot read property "presents" of undefined\n\nTypeError: Cannot read property "presents" of undefined\n    at renderChristmas (app.js:42)\n    at executeMagic (app.js:1337)',
        buttonText: 'Continue',
    },
    {
        title: '🚨 Security Alert',
        message: 'WARNING: Unauthorized access detected!\n\nSomeone is trying to access your gift list without proper authorization.\n\nThis incident will be reported to the North Pole Security Department.',
        buttonText: 'Acknowledge',
    },
    {
        title: '😅 Just Kidding!',
        message: 'Haha, gotcha! 😄\n\nDon\'t worry, everything is fine. This was just a prank!\n\nClick to continue...',
        buttonText: 'Continue',
    },
]

export const ErrorDialogStep: React.FC<IStep> = ({ onNext }) => {
    const [currentDialogIndex, setCurrentDialogIndex] = useState(0)
    const [isVisible, setIsVisible] = useState(true)

    const handleButtonClick = () => {
        if (currentDialogIndex < errorDialogs.length - 1) {
            setIsVisible(false)
            setTimeout(() => {
                setCurrentDialogIndex(currentDialogIndex + 1)
                setIsVisible(true)
            }, 200)
        } else {
            onNext()
        }
    }

    const currentDialog = errorDialogs[currentDialogIndex]

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
            }}
        >
            <div
                style={{
                    backgroundColor: '#f0f0f0',
                    border: '2px solid #333',
                    borderRadius: '4px',
                    padding: '20px',
                    minWidth: '400px',
                    maxWidth: '500px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    opacity: isVisible ? 1 : 0,
                    transition: 'opacity 0.2s',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '15px',
                        borderBottom: '1px solid #ccc',
                        paddingBottom: '10px',
                    }}
                >
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                        {currentDialog.title}
                    </h3>
                </div>
                <div
                    style={{
                        marginBottom: '20px',
                        whiteSpace: 'pre-line',
                        lineHeight: '1.6',
                        color: '#333',
                    }}
                >
                    {currentDialog.message}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <Button
                        label={currentDialog.buttonText}
                        onClick={handleButtonClick}
                        className='p-button-sm'
                        style={{
                            minWidth: '100px',
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

