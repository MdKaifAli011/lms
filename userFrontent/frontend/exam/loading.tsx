import { PageLoadingSkeleton } from '../components/RouteLoadingSkeletons'

export default function ExamLoading() {
  return (
    <PageLoadingSkeleton
      showSectionTitle
      cardCount={6}
    />
  )
}
