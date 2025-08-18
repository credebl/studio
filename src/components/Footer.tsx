import React from 'react'

interface IFooter {
  fixed?: boolean
}

const Footer: React.FC<IFooter> = ({ fixed = false }) => (
  <footer
    className={`text-muted-foreground mt-5 mb-1 text-center text-xs md:mb-4 md:text-sm ${
      fixed ? 'fixed bottom-0 w-full' : ''
    }`}
  >
    © {new Date().getFullYear()} AYANWORKS TECHNOLOGY SOLUTIONS PRIVATE
    LIMITED.
  </footer>
)

export default Footer
