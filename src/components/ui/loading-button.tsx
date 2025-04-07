import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ButtonProps } from "@radix-ui/react-button"
import { cn } from "@/lib/utils"

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
}

export function LoadingButton({
  isLoading,
  children,
  loadingText = "處理中...",
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button 
      disabled={isLoading} 
      className={cn(
        "relative",
        isLoading && "cursor-wait",
        className
      )}
      {...props}
    >
      <span className={cn(
        "flex items-center justify-center gap-2",
        isLoading && "opacity-0"
      )}>
        {children}
      </span>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <Spinner className="h-4 w-4" />
          <span>{loadingText}</span>
        </div>
      )}
    </Button>
  )
} 