import { KBarResults, useMatches } from 'kbar'

import React from 'react'
import ResultItem from './result-item'

export default function RenderResults(): React.JSX.Element {
  const { results, rootActionId } = useMatches()

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }): React.JSX.Element => {
        const result =
          typeof item === 'string' ? (
            <div className="text-primary-foreground px-4 py-2 text-sm uppercase opacity-50">
              {item}
            </div>
          ) : (
            <ResultItem
              action={item}
              active={active}
              currentRootActionId={rootActionId ?? ''}
            />
          )
        return result
      }}
    />
  )
}
