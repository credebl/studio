import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

import { Button } from '@/components/ui/button'
import { JSX } from 'react'
import { XIcon } from 'lucide-react'

export function AlertDialogDemo({
  handler,
}: Readonly<{
  handler: () => void
}>): JSX.Element {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Set Primary DID</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="flex flex-col justify-between text-center">
        <AlertDialogCancel asChild className="relative">
          <Button
            variant="ghost"
            aria-label="Close"
            className="absolute top-2 right-2 border-none p-1 shadow-none outline-none hover:bg-inherit hover:text-inherit"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </AlertDialogCancel>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            This will change the Primary Selected DID.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="grid grid-cols-2">
          <AlertDialogCancel className="text-destructive hover:text-destructive">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handler}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
