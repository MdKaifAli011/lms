import React, { Suspense } from 'react'
import { AttendanceCard } from '../AttendanceCard'
import { AttendanceCardSkeleton } from '../AttendanceCardSkeleton'

export function AttendanceSection() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-foreground mb-2">Attendance</h3>
        <p className="text-muted-foreground">
          Track your attendance across all courses
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <AttendanceCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AttendanceCard
            courseName="Java"
            attendancePercentage={74.3}
            total={105}
            present={78}
            absent={27}
            order={0}
          />
          <AttendanceCard
            courseName="Automation Testing With Selenium"
            attendancePercentage={33.3}
            total={24}
            present={8}
            absent={16}
            order={1}
          />
          <AttendanceCard
            courseName="Front-End Technologies"
            attendancePercentage={72.7}
            total={44}
            present={32}
            absent={12}
            order={2}
          />
        </div>
      </Suspense>
    </section>
  )
}
