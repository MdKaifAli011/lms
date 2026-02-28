import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'
import { Header } from './components/Header'
import { ExamCategoriesBar } from './components/ExamCategoriesBar'
import {
  HeroSection,
  AllExamsSection,
  MasteryPathSection,
  CTASection,
  FeaturesSection,
  FooterComponent,
} from './components/home'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  await payload.auth({ headers })

  // Fetch exams sorted by order (only active ones for public)
  const { docs: exams } = await payload.find({
    collection: 'exams',
    where: {
      isActive: {
        equals: true,
      },
    },
    sort: 'order',
    limit: 100,
    depth: 1,
  })

  return (
    <div className="min-h-screen  bg-background">
      {/* Header */}
      <Header />

      {/* Exam Categories Bar */}
      <ExamCategoriesBar exams={exams} />

      {/* Spacer to account for fixed headers (h-12 header + h-8 categories bar = 48px + 32px = 80px) */}
      <div className="h-[80px]" />

      {/* Hero Section */}
      <HeroSection />

      {/* All Exams Section */}
      <AllExamsSection exams={exams} />

      {/* 7-Level Mastery Path */}
      <MasteryPathSection />

       {/* Elite Features */}
       <FeaturesSection />

      {/* Step Through the Door CTA */}
      <CTASection />

     

      {/* Footer */}
      <FooterComponent payloadConfig={payloadConfig} />
    </div>
  )
}
