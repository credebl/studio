'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import type { KnownAgentOption } from '@/features/admin/types'
import { Label } from '@/components/ui/label'

export const CUSTOM_AGENT_ID = '__custom__'

const sourceLabel: Record<KnownAgentOption['source'], string> = {
  allowlist: 'Configured',
  'cloud-wallet': 'Base wallet',
  'platform-org': 'Org wallet',
}

export const AgentEndpointField = ({
  value,
  options,
  selectedId,
  onSelect,
  onChange,
}: {
  value: string
  options: KnownAgentOption[]
  selectedId: string
  onSelect: (value: string) => void
  onChange: (value: string) => void
}): React.JSX.Element => {
  const showInput = options.length === 0 || selectedId === CUSTOM_AGENT_ID

  return (
    <div className="space-y-2">
      <Label htmlFor={showInput ? 'agent-endpoint' : 'agent-endpoint-select'}>
        Agent endpoint
      </Label>
      {options.length > 0 ? (
        <Select value={selectedId || undefined} onValueChange={onSelect}>
          <SelectTrigger id="agent-endpoint-select">
            <SelectValue placeholder="Choose a known agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Known agents</SelectLabel>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  <span className="flex min-w-0 flex-col items-start">
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-muted-foreground font-mono text-xs break-all">
                      {option.endpoint}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {sourceLabel[option.source]}
                      {option.description ? ` · ${option.description}` : ''}
                    </span>
                  </span>
                </SelectItem>
              ))}
              <SelectItem value={CUSTOM_AGENT_ID}>Custom endpoint…</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : null}
      {showInput ? (
        <Input
          id="agent-endpoint"
          name="agentEndpoint"
          type="text"
          required
          maxLength={2048}
          value={value}
          placeholder="https://agent.example.com:4001"
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby="agent-endpoint-description"
        />
      ) : (
        <input name="agentEndpoint" type="hidden" value={value} />
      )}
      <p
        id="agent-endpoint-description"
        className="text-muted-foreground text-sm"
      >
        Choose a known agent, or enter the base URL of an agent-controller
        v2.3.3 instance, including the port if it is not the default.
      </p>
    </div>
  )
}
