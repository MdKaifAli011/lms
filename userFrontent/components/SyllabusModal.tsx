'use client'

import React, { useState } from 'react'
import { Download, BookOpen, Target, CheckCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SyllabusModalProps {
  exam: {
    id: string
    title: string
    slug?: string
    image?: { url?: string | null } | string | null
    order?: number | null
  }
  isOpen: boolean
  onClose: () => void
}

interface SyllabusItem {
  id: string
  title: string
  description: string
  duration: string
  topics: string[]
  completed: boolean
  progress: number
}

export function SyllabusModal({ exam, isOpen, onClose }: SyllabusModalProps) {
  const [activeTab, setActiveTab] = useState('overview')
  
  // Mock syllabus data - in real app, this would come from the exam's content
  const syllabusData: SyllabusItem[] = [
    {
      id: '1',
      title: 'Foundation Concepts',
      description: 'Build strong fundamentals with basic concepts and principles',
      duration: '2 weeks',
      topics: ['Introduction', 'Basic Concepts', 'Problem Solving', 'Practice Tests'],
      completed: false,
      progress: 0
    },
    {
      id: '2',
      title: 'Core Topics',
      description: 'Deep dive into the main subject areas and advanced concepts',
      duration: '4 weeks',
      topics: ['Advanced Topics', 'Complex Problems', 'Case Studies', 'Mock Tests'],
      completed: false,
      progress: 25
    },
    {
      id: '3',
      title: 'Test Series',
      description: 'Comprehensive test series to evaluate your preparation',
      duration: '3 weeks',
      topics: ['Mock Test 1', 'Mock Test 2', 'Mock Test 3', 'Final Exam'],
      completed: false,
      progress: 10
    },
    {
      id: '4',
      title: 'Revision & Doubts',
      description: 'Final revision and doubt clearing sessions with experts',
      duration: '1 week',
      topics: ['Quick Revision', 'Doubt Sessions', 'Exam Tips'],
      completed: false,
      progress: 0
    }
  ]

  const completedTopics = syllabusData.filter(item => item.completed).length
  const totalTopics = syllabusData.reduce((acc, item) => acc + item.topics.length, 0)
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <BookOpen className="h-5 w-5" />
            <span>{exam.title} - Syllabus</span>
          </DialogTitle>
        </DialogHeader>

        <DialogDescription className="text-center">
          Complete syllabus overview and detailed topic breakdown
        </DialogDescription>

        <div className="space-y-6">
          {/* Overview Stats */}
          <Card>
            <CardHeader>
              <div className="text-lg font-semibold">Syllabus Overview</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{syllabusData.length}</div>
                  <div className="text-sm text-muted-foreground">Modules</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{totalTopics}</div>
                  <div className="text-sm text-muted-foreground">Total Topics</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{overallProgress}%</div>
                  <div className="text-sm text-muted-foreground">Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{completedTopics}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Overall Progress</span>
                  <span>{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Syllabus Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="topics">Topics</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4">
                {syllabusData.map((module) => (
                  <Card key={module.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-primary" />
                          </div>
                          <h4 className="font-semibold text-foreground">{module.title}</h4>
                        </div>
                        <Badge variant={module.completed ? 'default' : 'secondary'}>
                          {module.completed ? 'Completed' : `${module.progress}%`}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {module.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">{module.duration}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Topics:</span>
                          <span className="font-medium">{module.topics.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="topics" className="space-y-4">
              <div className="space-y-4">
                {syllabusData.map((module) => (
                  <Card key={module.id}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        {module.title}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ul className="space-y-2">
                        {module.topics.map((topic, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs font-medium text-muted-foreground">
                                {index + 1}
                              </span>
                            </div>
                            <span className="text-sm text-foreground">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-6 ml-8">
                  {syllabusData.map((module, index) => (
                    <div key={module.id} className="relative flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground">{module.title}</h4>
                        <p className="text-sm text-muted-foreground">{module.duration}</p>
                        <p className="text-xs text-muted-foreground">
                          Week {index + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <ResourcesTab />
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onClose} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Download Syllabus
            <Download className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ResourcesTab() {
  const resources = [
    {
      title: 'Study Materials',
      description: 'Comprehensive study guides and reference materials',
      type: 'pdf',
      size: '2.5MB',
      icon: '📚'
    },
    {
      title: 'Practice Papers',
      description: 'Previous year papers with solutions',
      type: 'pdf',
      size: '1.8MB',
      icon: '📄'
    },
    {
      title: 'Video Lectures',
      description: 'Recorded video lectures by expert faculty',
      type: 'video',
      size: '5GB',
      icon: '🎥'
    },
    {
      title: 'Mock Tests',
      description: 'Full-length mock tests with detailed analysis',
      type: 'link',
      size: 'N/A',
      icon: '📝'
    }
  ]

  return (
    <div className="space-y-4">
      {resources.map((resource, index) => (
        <Card key={index} className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{resource.icon}</div>
            <div>
              <h4 className="font-semibold text-foreground">{resource.title}</h4>
              <p className="text-sm text-muted-foreground">{resource.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">Type:</span>
                <span className="capitalize">{resource.type}</span>
                {resource.size && (
                  <>
                    <span className="font-medium">Size:</span>
                    <span>{resource.size}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </Card>
      ))}
    </div>
  )
}
