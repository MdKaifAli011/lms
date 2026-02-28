'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import {
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Timer,
  Info,
  Award,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// shadcn
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

/* ---------------- TYPES ---------------- */

interface Option {
  text: string
  isCorrect: boolean
}

interface Question {
  question: string
  options: Option[]
  explanation?: string
  questionType?: 'single' | 'multiple'
}

interface InteractiveQuizProps {
  quizTitle?: string
  questions: Question[]
  timeLimit?: number
}

/* ---------------- COMPONENT ---------------- */

export function InteractiveQuiz({
  quizTitle = 'Practice Quiz',
  questions,
  timeLimit = 0,
}: InteractiveQuizProps) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number[]>>({})
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({})
  const [showResult, setShowResult] = useState(false)

  const [timeLeft, setTimeLeft] = useState(timeLimit * 60)
  const [timerStarted, setTimerStarted] = useState(false)

  // Refs for cleanup and performance
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const questionsRef = useRef(questions)

  // Update ref when questions change
  useEffect(() => {
    questionsRef.current = questions
  }, [questions])

  // ✅ FIX: never early-return before hooks
  const question = questions[current] ?? null

  /* ---------------- TIMER ---------------- */

  useEffect(() => {
    if (!timerStarted || showResult || timeLimit === 0) return

    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          setShowResult(true)
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [timerStarted, showResult, timeLimit])

  const formatTime = useCallback((s: number) => {
    const minutes = Math.floor(s / 60)
    const seconds = s % 60
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }, [])

  /* ---------------- ANSWERS ---------------- */

  const selectOption = useCallback((idx: number) => {
    if (!question) return // ✅ guard safely
    if (submitted[current] || showResult) return
    if (timeLimit && !timerStarted) setTimerStarted(true)

    const isMulti = question.questionType === 'multiple'
    setAnswers((prev) => {
      const prevAns = prev[current] ?? []
      return {
        ...prev,
        [current]: isMulti
          ? prevAns.includes(idx)
            ? prevAns.filter((i) => i !== idx)
            : [...prevAns, idx]
          : [idx],
      }
    })
  }, [question, submitted, current, showResult, timeLimit, timerStarted])

  const submitAnswer = useCallback(() => {
    if (!answers[current]?.length) return
    setSubmitted((p) => ({ ...p, [current]: true }))
  }, [answers, current])

  const goToQuestion = useCallback((questionIndex: number) => {
    if (questionIndex >= 0 && questionIndex < questions.length) {
      setCurrent(questionIndex)
    }
  }, [questions.length])

  const resetQuiz = useCallback(() => {
    setCurrent(0)
    setAnswers({})
    setSubmitted({})
    setShowResult(false)
    setTimeLeft(timeLimit * 60)
    setTimerStarted(false)
  }, [timeLimit])

  /* ---------------- STATS ---------------- */

  const stats = useMemo(() => {
    let score = 0
    const currentQuestions = questionsRef.current

    currentQuestions.forEach((q, i) => {
      const user = answers[i] ?? []
      const correct = q.options
        .map((o, idx) => (o.isCorrect ? idx : null))
        .filter((v): v is number => v !== null)

      if (user.length === correct.length && user.every((u) => correct.includes(u))) {
        score++
      }
    })

    return {
      score,
      total: currentQuestions.length,
      percent: currentQuestions.length === 0 ? 0 : Math.round((score / currentQuestions.length) * 100),
    }
  }, [answers])

  /* ---------------- ASSESSMENT REPORT ---------------- */

  if (showResult) {
    return (
      <div className="w-full">
        <Card className="overflow-hidden shadow-lg">
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />

          <CardHeader className="text-center py-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Award className="h-7 w-7 text-primary" />
            </div>

            <CardTitle className="text-2xl font-semibold">Assessment Report</CardTitle>

            <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
              {quizTitle}
            </p>
          </CardHeader>

          <CardContent className="grid grid-cols-1 gap-6 px-6 pb-10 sm:grid-cols-3">
            <ReportStat label="Score" value={`${stats.score} / ${stats.total}`} />
            <ReportStat label="Accuracy" value={`${stats.percent}%`} />
            <ReportStat
              label="Status"
              value={stats.percent >= 60 ? 'Passed' : 'Needs Review'}
              highlight={stats.percent >= 60}
            />
          </CardContent>

          <CardFooter className="flex justify-center pb-10">
            <Button size="lg" onClick={resetQuiz}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restart Assessment
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  /* ---------------- MAIN UI ---------------- */

  if (!question) {
    return null // ✅ safe AFTER hooks
  }

  const isMulti = question.questionType === 'multiple'
  const selectedAnswers = answers[current] || []
  const isSubmitted = submitted[current]
  const progress = ((current + 1) / questions.length) * 100

  return (
    <div className="w-full">
      <Card className="overflow-hidden shadow-lg">
        {/* Progress Bar */}
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <CardHeader className="pb-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  Question {current + 1} of {questions.length}
                </Badge>
                {isMulti && (
                  <Badge variant="secondary" className="text-xs">
                    Multiple Answers
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg leading-relaxed">{question.question}</CardTitle>
            </div>

            {/* Timer */}
            {timeLimit > 0 && (
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border',
                  timeLeft < 60
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700',
                )}
              >
                <Timer className={cn('w-4 h-4', timeLeft < 60 && 'text-red-500')} />
                <span
                  className={cn('font-mono text-sm font-medium', timeLeft < 60 && 'text-red-500')}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4 sm:p-6">
          {/* Answer Options - Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {question.options.map((option, idx) => {
              const isSelected = selectedAnswers.includes(idx)
              const isCorrect = option.isCorrect
              const showCorrect = isSubmitted && isCorrect
              const showIncorrect = isSubmitted && isSelected && !isCorrect

              return (
                <div
                  key={idx}
                  onClick={() => selectOption(idx)}
                  className={cn(
                    'relative rounded-xl border-2 p-3 sm:p-4 cursor-pointer transition-all duration-200 h-full',
                    'flex items-start gap-2 sm:gap-3',
                    isSubmitted && 'pointer-events-none',
                    !isSubmitted &&
                      'hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20',
                    !isSubmitted &&
                      isSelected &&
                      'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
                    showCorrect && 'border-green-500 bg-green-50 dark:bg-green-900/20',
                    showIncorrect && 'border-red-500 bg-red-50 dark:bg-red-900/20',
                    !isSubmitted && !isSelected && 'border-gray-200 dark:border-gray-700',
                  )}
                >
                  {/* Radio / Checkbox - Responsive sizing */}
                  <div className="mt-1">
                    {isMulti ? (
                      <div
                        className={cn(
                          'w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center',
                          isSelected
                            ? 'bg-purple-500 border-purple-500'
                            : 'border-gray-300 dark:border-gray-600',
                        )}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />}
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center',
                          isSelected ? 'border-purple-500' : 'border-gray-300 dark:border-gray-600',
                        )}
                      >
                        {isSelected && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-purple-500" />}
                      </div>
                    )}
                  </div>

                  {/* Option Text - Responsive typography */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm leading-relaxed text-gray-900 dark:text-gray-100 break-words">
                      {option.text}
                    </p>
                  </div>

                  {/* Correct / Wrong Icon - Responsive sizing */}
                  {isSubmitted && (
                    <div className="self-center">
                      {showCorrect && (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                      )}
                      {showIncorrect && (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500 flex items-center justify-center">
                          <X className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Explanation - Responsive spacing */}
          {isSubmitted && question.explanation && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
              <div className="flex items-start gap-2 sm:gap-3">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1 text-sm sm:text-base">Explanation</p>
                  <p className="text-blue-800 dark:text-blue-200 text-xs sm:text-sm leading-relaxed break-words">
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between items-center pt-4">
          {/* Previous Button */}
          <Button
            variant="outline"
            onClick={() => goToQuestion(current - 1)}
            disabled={current === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isSubmitted ? (
              <Button
                onClick={submitAnswer}
                disabled={selectedAnswers.length === 0}
                className="min-w-[100px]"
              >
                Submit Answer
              </Button>
            ) : (
              <>
                {current < questions.length - 1 ? (
                  <Button onClick={() => goToQuestion(current + 1)} className="min-w-[100px]">
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={() => setShowResult(true)} className="min-w-[140px]">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Results
                  </Button>
                )}
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

/* ---------------- SMALL ---------------- */

function ReportStat({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-6 text-center',
        'dark:border-neutral-800',
        highlight && 'border-blue-500',
      )}
    >
      <p className="text-xs uppercase text-neutral-500 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
