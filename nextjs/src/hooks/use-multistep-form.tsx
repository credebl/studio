import {
  JSXElementConstructor,
  ReactElement,
  useCallback,
  useState,
} from 'react'
interface MultistepForm {
  currentStepIndex: number
  step: ReactElement<any, string | JSXElementConstructor<any>>
  steps: ReactElement<any, string | JSXElementConstructor<any>>[]
  isFirstStep: boolean
  isLastStep: boolean
  goTo: (index: number) => void
  next: () => void
  back: () => void
}
export default function useMultistepForm(
  steps: ReactElement<any>[],
): MultistepForm {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const next = useCallback(() => {
    setCurrentStepIndex((i) => Math.min(i + 1, steps.length - 1))
  }, [steps.length])

  const back = useCallback(() => {
    setCurrentStepIndex((i) => Math.max(i - 1, 0))
  }, [])

  const goTo = useCallback((index: number) => {
    setCurrentStepIndex(index)
  }, [])

  return {
    currentStepIndex,
    step: steps[currentStepIndex],
    steps,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === steps.length - 1,
    goTo,
    next,
    back,
  }
}
