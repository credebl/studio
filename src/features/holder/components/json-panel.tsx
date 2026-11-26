interface JsonPanelProps {
  value: unknown
  label?: string
}

export function JsonPanel({
  value,
  label = 'Details',
}: JsonPanelProps): React.JSX.Element {
  const text = JSON.stringify(value ?? null, null, 2) ?? 'null'

  return (
    <details className="border-border bg-muted/30 rounded-md border p-3 text-sm">
      <summary className="cursor-pointer font-medium">{label}</summary>
      <pre className="text-muted-foreground mt-3 max-h-80 overflow-auto text-xs break-words whitespace-pre-wrap">
        {text}
      </pre>
    </details>
  )
}
