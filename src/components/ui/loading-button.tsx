import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ButtonProps } from "@radix-ui/react-button"

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean
  children: React.ReactNode
  loadingText?: string
}

export function LoadingButton({
  isLoading,
  children,
  loadingText = "處理中...",
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={isLoading} {...props}>
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <Spinner className="h-4 w-4" />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </Button>
  )
} 