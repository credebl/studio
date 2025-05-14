import { Button } from '@/components/ui/button'
import { IconBrandGithub } from '@tabler/icons-react'
import React from 'react'

export default function CtaGithub(): React.JSX.Element {
  return (
    <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
      <a
        href="https://github.com/Kiranism/next-shadcn-dashboard-starter"
        rel="noopener noreferrer"
        target="_blank"
        className="dark:text-foreground"
      >
        <IconBrandGithub />
      </a>
    </Button>
  )
}
