'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Linkedin } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PlacedStudentCardProps {
  studentName: string
  role: string
  dateOrBatch: string
  companyLogo?: string | { url?: string } | null
  companyName?: string
  salaryPackage: string
  profileImage?: string | { url?: string } | null
  linkedInUrl?: string
  driveLink?: string
  order?: number
  href?: string
}

const gradientColors = [
  'from-blue-500 to-indigo-500',
  'from-orange-500 to-amber-500',
  'from-blue-500 to-indigo-500',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
]

export function PlacedStudentCard({
  studentName,
  role,
  dateOrBatch,
  companyLogo,
  companyName,
  salaryPackage,
  profileImage,
  linkedInUrl,
  driveLink,
  order = 0,
  href,
}: PlacedStudentCardProps) {
  const gradient = gradientColors[order % gradientColors.length]

  const profileImageUrl =
    typeof profileImage === 'object' ? profileImage?.url : profileImage

  const companyLogoUrl =
    typeof companyLogo === 'object' ? companyLogo?.url : companyLogo

  const firstLetter = studentName.charAt(0).toUpperCase()

  const card = (
    <Card
      className="
        group h-full overflow-hidden
        border border-border/60
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-xl
      "
    >
      {/* Top Accent */}
      <div className={`h-1 bg-gradient-to-r ${gradient}`} />

      <CardContent className="p-5 flex flex-col gap-4">
        {/* Profile */}
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt={studentName}
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-foreground">
                {firstLetter}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground leading-tight">
              {studentName}
            </h3>
            <p className="text-xs text-muted-foreground">{role}</p>

            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {dateOrBatch}
              </span>

              {linkedInUrl && (
                <Link
                  href={linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600 dark:text-blue-400 hover:opacity-80"
                >
                  <Linkedin className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Company */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Placed at</span>
          {companyLogoUrl ? (
            <div className="relative h-5 w-16">
              <Image
                src={companyLogoUrl}
                alt={companyName || 'Company'}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <span className="text-sm font-medium text-foreground">
              {companyName || 'Company'}
            </span>
          )}
        </div>

        {/* Salary */}
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground mb-1">
            Salary Package
          </p>
          <p className="text-lg font-bold text-foreground">
            {salaryPackage}{' '}
            <span className="text-sm font-medium">LPA</span>
          </p>
        </div>
      </CardContent>

      {/* Footer */}
      {driveLink && (
        <CardFooter className="p-5 pt-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.preventDefault()
              window.open(driveLink, '_blank')
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Offer / Proof
          </Button>
        </CardFooter>
      )}
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {card}
      </Link>
    )
  }

  return card
}
