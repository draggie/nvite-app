import { FC } from 'react'
import { IStep } from './interfaces/util'
import { UserListStep } from './steps/UserListStep'
import { InitialResultStep } from './steps/InitialResultStep'
import { AreYouSureStep } from './steps/AreYouSureStep'
import { AreYouSureSureStep } from './steps/AreYouSureSureStep'
import { RunningButtonStep } from './steps/RunningButtonStep'
import { SantaStep } from './steps/SantaStep'
import { FinalStep } from './steps/FinalStep'
import { LoadingForeverStep } from './steps/LoadingForeverStep'
import { ClickFrenzyStep } from './steps/ClickFrenzyStep'
import { SnowballFightStep } from './steps/SnowballFightStep'
import { ErrorDialogStep } from './steps/ErrorDialogStep'
import { TilePuzzleStep } from './steps/TilePuzzleStep'

export enum Steps {
    PICK_USER,
    SHOW_INITIAL_RESULT,
    ARE_YOU_SURE,
    ARE_YOU_SURE_SURE,
    RUNNING_BUTTON,
    SANTA_STEP,
    LOADING,
    Frenzy,
    Snowball,
    PUZZLE,
    PHONE_ROTATION,
    ERROR_DIALOG,
    FINAL_STEP,
}

interface IStepComponent {
    order: Steps
    component: FC<IStep>
}

// All step components mapped to their enum values
const allStepComponents: IStepComponent[] = [
    {
        order: Steps.PICK_USER,
        component: UserListStep,
    },
    {
        order: Steps.SHOW_INITIAL_RESULT,
        component: InitialResultStep,
    },
    {
        order: Steps.ARE_YOU_SURE,
        component: AreYouSureStep,
    },
    {
        order: Steps.ARE_YOU_SURE_SURE,
        component: AreYouSureSureStep,
    },
    {
        order: Steps.RUNNING_BUTTON,
        component: RunningButtonStep,
    },
    {
        order: Steps.RUNNING_BUTTON,
        component: RunningButtonStep,
    },
    {
        order: Steps.SANTA_STEP,
        component: SantaStep,
    },
    {
        order: Steps.LOADING,
        component: LoadingForeverStep,
    },
    {
        order: Steps.Frenzy,
        component: ClickFrenzyStep,
    },
    {
        order: Steps.Snowball,
        component: SnowballFightStep,
    },
    {
        order: Steps.PUZZLE,
        component: TilePuzzleStep,
    },
    {
        order: Steps.ERROR_DIALOG,
        component: ErrorDialogStep,
    },
    {
        order: Steps.FINAL_STEP,
        component: FinalStep,
    },
]

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// Create randomized step sequence (first, second, and last are fixed)
const createRandomizedSteps = (): IStepComponent[] => {
    // Get first step (PICK_USER)
    const firstStep = allStepComponents.find(s => s.order === Steps.PICK_USER)!
    
    // Get second step (SHOW_INITIAL_RESULT)
    const secondStep = allStepComponents.find(s => s.order === Steps.SHOW_INITIAL_RESULT)!
    
    // Get last step (FINAL_STEP)
    const lastStep = allStepComponents.find(s => s.order === Steps.FINAL_STEP)!
    
    // Get all middle steps (everything except first, second, and last)
    const middleSteps = allStepComponents.filter(
        s => s.order !== Steps.PICK_USER && 
             s.order !== Steps.SHOW_INITIAL_RESULT && 
             s.order !== Steps.FINAL_STEP
    )
    
    // Shuffle the middle steps
    const shuffledMiddleSteps = shuffleArray(middleSteps)
    
    // Combine: first + second + shuffled middle + last
    return [firstStep, secondStep, ...shuffledMiddleSteps, lastStep]
}

// Generate the randomized step sequence
export const steps: IStepComponent[] = createRandomizedSteps()

// Helper function to get step by sequence index
export const getStepByIndex = (index: number): IStepComponent | undefined => {
    return steps[index]
}

// Helper function to get the total number of steps
export const getTotalSteps = (): number => {
    return steps.length
}
