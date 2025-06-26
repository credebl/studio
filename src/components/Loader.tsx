import { JSX } from 'react'

const Loader = ({ size = 30 }: { size?: number }): JSX.Element => (
  <div className="flex h-full w-full items-center justify-center">
    <div
      className="border-t-primary animate-spin rounded-full border-2"
      style={{
        width: size,
        height: size,
        borderTopColor: 'var(--primary)',
      }}
    />
  </div>
)

export default Loader
