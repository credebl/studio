export interface ConfirmState {
  title: string
  description: string
  confirmLabel: string
  destructive?: boolean
  action: () => Promise<void>
}

export interface AlertState {
  message: string
  type: 'success' | 'failure'
}
