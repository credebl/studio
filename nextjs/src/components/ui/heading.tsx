import React from 'react'
interface HeadingProps {
  title: string
  description: string
}

export const Heading: React.FC<HeadingProps> = ({ title, description }) => (
  <div>
    <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
)
