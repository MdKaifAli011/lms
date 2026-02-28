import React, { Suspense } from 'react'
import { PlacedStudentCard } from '../PlacedStudentCard'
import { PlacedStudentCardSkeleton } from '../PlacedStudentCardSkeleton'

export function RecentlyPlacedStudentsSection() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h3 className="text-3xl font-bold text-foreground mb-2">Recently Placed Students</h3>
        <p className="text-muted-foreground">
          Success stories from our students
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <PlacedStudentCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PlacedStudentCard
            studentName="veereshkumar b s"
            role="Software Engineer Train..."
            dateOrBatch="16th-June-2025(Ayush)"
            companyName="Ondemand"
            salaryPackage="3"
            order={0}
            driveLink="#"
          />
          <PlacedStudentCard
            studentName="Praveen Kumar"
            role="Java Backend Develope..."
            dateOrBatch="04th-Aug-2025"
            companyName="Sapient"
            salaryPackage="4.5"
            order={1}
            driveLink="#"
          />
          <PlacedStudentCard
            studentName="Haveesh"
            role="Backend Engineer"
            dateOrBatch="KOD-AUG-231A"
            companyName="radware"
            salaryPackage="9"
            order={2}
            driveLink="#"
          />
        </div>
      </Suspense>
    </section>
  )
}
