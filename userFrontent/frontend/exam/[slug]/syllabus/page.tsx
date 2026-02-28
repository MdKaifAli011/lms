import React from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  BookOpen,
  Clock,
  Target,
  CheckCircle,
  PlayCircle,
  Lock,
  Flame,
  Zap,
  TrendingUp,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { GradientBg } from '@/components/ui/gradient-bg'

import { Header } from '@/app/(frontend)/components/Header'
import { ExamCategoriesBarWrapper } from './ExamCategoriesBarWrapper'

/* ---------------- TYPES ---------------- */

interface BreadcrumbItem {
  label: string
  href: string
}

interface SyllabusPageProps {
  params: Promise<{
    slug: string
  }>
}

interface Topic {
  id: string
  title: string
  description: string
  type: 'video' | 'reading' | 'practice' | 'quiz'
  duration: string
  completed?: boolean
  isLocked?: boolean
}

interface Module {
  id: string
  title: string
  description: string
  topics: Topic[]
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  progress?: number
  isLocked?: boolean
}

/* ---------------- MOCK ACADEMIC DATA ---------------- */

const mockExamData = {
  id: 'neet-2026',
  title: 'NEET / JEE Foundation Course',
  description:
    'A concept-first academic syllabus designed for NEET, JEE, SAT, and IB aspirants. Focused on fundamentals, problem-solving, and exam readiness.',
  duration: '24 Weeks',
  difficulty: 'Intermediate',
  totalModules: 5,
  completedModules: 1,
  overallProgress: 22,

  modules: [
    {
      id: 'm1',
      title: 'Physics – Mechanics',
      description:
        'Build strong fundamentals in mechanics with theory, illustrations, and numericals.',
      duration: '6 Weeks',
      difficulty: 'Beginner',
      progress: 60,
      topics: [
        {
          id: 't1',
          title: 'Units & Measurements',
          description: 'SI units, dimensional analysis, and error calculation',
          type: 'reading',
          duration: '35 min',
          completed: true,
        },
        {
          id: 't2',
          title: 'Motion in One Dimension',
          description: 'Displacement, velocity, acceleration, and graphs',
          type: 'video',
          duration: '50 min',
          completed: true,
        },
        {
          id: 't3',
          title: 'Practice: Kinematics',
          description: 'Numerical problems (NEET / JEE level)',
          type: 'practice',
          duration: '45 min',
        },
      ],
    },

    {
      id: 'm2',
      title: 'Chemistry – Atomic Structure',
      description:
        'Understand atoms, quantum numbers, and electronic configuration.',
      duration: '4 Weeks',
      difficulty: 'Intermediate',
      progress: 35,
      topics: [
        {
          id: 't4',
          title: 'Dalton & Modern Atomic Theory',
          description: 'Evolution of atomic models',
          type: 'reading',
          duration: '30 min',
          completed: true,
        },
        {
          id: 't5',
          title: 'Quantum Numbers',
          description: 'Principal, azimuthal, magnetic & spin numbers',
          type: 'video',
          duration: '55 min',
        },
        {
          id: 't6',
          title: 'Practice: Atomic Structure',
          description: 'MCQs & numerical problems',
          type: 'practice',
          duration: '40 min',
        },
      ],
    },

    {
      id: 'm3',
      title: 'Mathematics – Algebra',
      description:
        'Core algebra concepts required for JEE, SAT, and IB mathematics.',
      duration: '5 Weeks',
      difficulty: 'Intermediate',
      isLocked: true,
      topics: [
        {
          id: 't7',
          title: 'Linear Equations',
          description: 'One and two variable equations',
          type: 'reading',
          duration: '30 min',
          isLocked: true,
        },
        {
          id: 't8',
          title: 'Quadratic Equations',
          description: 'Roots, graphs, and applications',
          type: 'video',
          duration: '60 min',
          isLocked: true,
        },
      ],
    },
  ] as Module[],
}

/* ---------------- HELPERS ---------------- */

const getDifficultyColor = (level: string) => {
  switch (level) {
    case 'Beginner':
      return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0'
    case 'Intermediate':
      return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0'
    case 'Advanced':
      return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

const getTopicIcon = (type: string) => {
  switch (type) {
    case 'video':
      return PlayCircle
    case 'reading':
      return BookOpen
    case 'practice':
      return Target
    case 'quiz':
      return CheckCircle
    default:
      return BookOpen
  }
}

const getTopicTypeColor = (type: string) => {
  switch (type) {
    case 'video':
      return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
    case 'reading':
      return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
    case 'practice':
      return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-orange-500/25'
    case 'quiz':
      return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

/* ---------------- PAGE ---------------- */

export default async function SyllabusPage({ params }: SyllabusPageProps) {
  const { slug } = await params
  const exam = mockExamData

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Exams', href: '/exams' },
    { label: exam.title, href: `/exam/${slug}` },
    { label: 'Syllabus', href: '#' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <ExamCategoriesBarWrapper />

      <div className="h-[80px]" />

      <GradientBg variant="subtle" intensity="low">
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="h-3 w-3 opacity-50" />}
                <Link 
                  href={item.href} 
                  className="hover:text-foreground transition-all duration-200 hover:scale-105"
                >
                  {item.label}
                </Link>
              </React.Fragment>
            ))}
          </nav>

          {/* Enhanced Course Header */}
          <div className="mb-10">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-1 shadow-xl shadow-purple-500/25">
              <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-5 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 animate-pulse" />
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">Active Course</span>
                    </div>
                    
                    <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-3">
                      {exam.title}
                    </h1>
                    
                    <p className="text-sm text-muted-foreground mb-4 max-w-2xl leading-relaxed">
                      {exam.description}
                    </p>

                    <div className="flex flex-wrap gap-3 mb-4">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                        <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{exam.duration}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                        <BookOpen className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                          {exam.completedModules}/{exam.totalModules} modules
                        </span>
                      </div>
                      
                      <Badge className={`${getDifficultyColor(exam.difficulty)} px-3 py-1 text-xs font-semibold shadow-md`}>
                        {exam.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <div className="w-full lg:w-64">
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl" />
                      
                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-muted-foreground">Overall Progress</span>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-blue-500" />
                            <span className="text-lg font-bold text-foreground">{exam.overallProgress}%</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <Progress value={exam.overallProgress} className="h-2 bg-gray-200 dark:bg-gray-700" />
                        </div>
                        
                        <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm">
                          <Zap className="h-3 w-3 mr-1.5" />
                          Continue Learning
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Modules */}
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">Course Modules</h2>
              <p className="text-sm text-muted-foreground">Master each topic at your own pace</p>
            </div>

            {exam.modules.map((module, index) => (
              <Card key={module.id} className="group relative overflow-hidden rounded-xl border-0 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                {/* Gradient Top Border */}
                <div className={`h-1 bg-gradient-to-r ${
                  index === 0 ? 'from-blue-500 to-cyan-500' :
                  index === 1 ? 'from-purple-500 to-pink-500' :
                  'from-blue-500 to-indigo-500'
                }`} />
                
                <CardHeader className="pb-4">
                  <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`h-6 w-6 rounded-lg bg-gradient-to-r ${
                          index === 0 ? 'from-blue-500 to-cyan-500' :
                          index === 1 ? 'from-purple-500 to-pink-500' :
                          'from-blue-500 to-indigo-500'
                        } flex items-center justify-center text-white font-bold text-xs shadow-lg`}>
                          {index + 1}
                        </div>
                        <CardTitle className="text-lg font-bold text-foreground">
                          {module.title}
                        </CardTitle>
                        {module.isLocked && (
                          <Badge variant="outline" className="px-2 py-0.5 text-amber-600 border-amber-600 text-xs">
                            <Lock className="h-2.5 w-2.5 mr-1" />
                            Locked
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        {module.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                          <Clock className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                          <span className="text-xs font-medium">{module.duration}</span>
                        </div>
                        
                        <Badge className={`${getDifficultyColor(module.difficulty)} px-2 py-1 text-xs font-semibold shadow-md`}>
                          {module.difficulty}
                        </Badge>
                        
                        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                          <BookOpen className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                          <span className="text-xs font-medium">{module.topics.length} topics</span>
                        </div>
                      </div>
                    </div>

                    {!module.isLocked && (
                      <div className="w-full lg:w-48">
                        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-3 shadow-sm border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-muted-foreground">Progress</span>
                            <div className="flex items-center gap-1">
                              <Flame className="h-3 w-3 text-orange-500" />
                              <span className="text-sm font-bold text-foreground">{module.progress || 0}%</span>
                            </div>
                          </div>
                          
                          <Progress value={module.progress || 0} className="h-1.5 mb-2" />
                          
                          <div className="text-xs text-muted-foreground">
                            {Math.round((module.progress || 0) * module.topics.length / 100)} of {module.topics.length} completed
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 px-4 pb-4">
                  {module.topics.map((topic, _topicIndex) => {
                    const Icon = getTopicIcon(topic.type)

                    return (
                      <div
                        key={topic.id}
                        className={`group relative overflow-hidden rounded-lg border transition-all duration-300 ${
                          topic.isLocked
                            ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                            : 'bg-white dark:bg-gray-900 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center gap-3 p-3">
                          <div className="flex items-center gap-2">
                            <div className={`relative p-2 rounded-lg transition-all duration-300 ${
                              topic.isLocked
                                ? 'bg-gray-200 dark:bg-gray-700'
                                : getTopicTypeColor(topic.type)
                            } ${!topic.isLocked ? 'group-hover:scale-110' : ''}`}>
                              <Icon className="h-4 w-4" />
                              {topic.completed && (
                                <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full flex items-center justify-center">
                                  <CheckCircle className="h-2 w-2 text-white" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
                              <h4 className={`font-semibold text-foreground text-sm mb-0.5 ${
                                topic.completed ? 'line-through opacity-60' : ''
                              }`}>
                                {topic.title}
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {topic.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{topic.duration}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge
                                variant={topic.completed ? "default" : "outline"}
                                className={`text-xs px-2 py-0.5 ${
                                  topic.completed 
                                    ? 'bg-blue-500 text-white border-0' 
                                    : topic.isLocked 
                                    ? 'text-amber-600 border-amber-600' 
                                    : 'text-blue-600 border-blue-600'
                                }`}
                              >
                                {topic.completed ? (
                                  <><CheckCircle className="h-2.5 w-2.5 mr-1" /> Completed</>
                                ) : topic.isLocked ? (
                                  <><Lock className="h-2.5 w-2.5 mr-1" /> Locked</>
                                ) : (
                                  <><PlayCircle className="h-2.5 w-2.5 mr-1" /> Available</>
                                )}
                              </Badge>

                              {!topic.isLocked && (
                                <Button
                                  size="sm"
                                  variant={topic.completed ? "outline" : "default"}
                                  className={`transition-all duration-300 hover:scale-105 text-xs h-7 px-3 ${
                                    topic.completed 
                                      ? 'border-gray-300 hover:bg-gray-100' 
                                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm hover:shadow-md'
                                  }`}
                                >
                                  {topic.completed ? 'Review' : 'Start'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </GradientBg>
    </div>
  )
}
