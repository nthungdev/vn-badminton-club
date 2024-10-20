import classNames from 'classnames'

export default function BasePage({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={classNames('py-4', className)}>{children}</div>
}
