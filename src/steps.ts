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
    FINAL_STEP,
}

interface IStepComponent {
    order: Steps
    component: FC<IStep>
}

export const steps: IStepComponent[] = [
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
        order: Steps.FINAL_STEP,
        component: FinalStep,
    },
]
