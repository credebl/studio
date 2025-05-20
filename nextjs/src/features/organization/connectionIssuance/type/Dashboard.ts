export interface IDashboard {
  title: string
  options: IOptions[]
  backButtonPath: string
}

export interface IOptions {
  type?: string
  path: string
  heading: string
  description: string
}
