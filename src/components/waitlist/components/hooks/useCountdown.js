import { useEffect, useState } from "react"

export default function useCountdown(initialSeconds, initialCondition, onComplete) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  useEffect(() => {
    if (initialCondition) {
      const interval = setInterval(() => {
        setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
      
      const timer = setTimeout(() => {
        onComplete()
      }, initialSeconds * 1000)
      return () => {
        clearInterval(interval)
        clearTimeout(timer)
      }
    }
    }, [onComplete, initialCondition, initialSeconds])
  return secondsLeft
}