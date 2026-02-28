import React, { Suspense } from 'react'
import { PendingActionCard } from '../PendingActionCard'
import { PendingActionCardSkeleton } from '../PendingActionCardSkeleton'

export function PendingActionsSection() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-foreground mb-2">Pending Actions</h3>
        <p className="text-muted-foreground">
          Complete these actions to stay on track
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <PendingActionCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PendingActionCard
            courseName="Infosys Decode"
            actionType="Course Action"
            description="Topics requiring immediate attention"
            count={42}
            actionText="Complete it now!"
            impactMessage="It will impact your placement"
            order={0}
          />
          <PendingActionCard
            courseName="Front-End Technologies"
            actionType="Course Action"
            description="Topics requiring immediate attention"
            count={4}
            actionText="Complete it now!"
            impactMessage="It will impact your placement"
            order={1}
          />
          <PendingActionCard
            courseName="Automation Testing With Selenium"
            actionType="Course Action"
            description="Topics requiring immediate attention"
            actionText="Complete it now!"
            impactMessage="It will impact your placement"
            order={2}
          />
        </div>
      </Suspense>
    </section>
  )
}
