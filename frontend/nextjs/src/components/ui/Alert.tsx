interface AlertProps {
  type: "error" | "success" | "warning" | "info";
  message: string;
  onDismiss?: () => void;
}

const alertStyles: Record<string, string> = {
  error: "bg-red-50 text-red-800 border-red-200",
  success: "bg-green-50 text-green-800 border-green-200",
  warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
  info: "bg-blue-50 text-blue-800 border-blue-200",
};

export function Alert({ type, message, onDismiss }: AlertProps) {
  return (
    <div
      className={`rounded-md border p-4 ${alertStyles[type]}`}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm">{message}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
