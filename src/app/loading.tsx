import BasePage from '@/components/BasePage'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Loading() {
  return (
    <BasePage className='flex-1 h-full flex items-center justify-center'>
      <LoadingSpinner sizeClasses="size-10" />
    </BasePage>
  )
}
