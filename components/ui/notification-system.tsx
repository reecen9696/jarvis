interface NotificationSystemProps {
  message: string
  visible: boolean
}

export function NotificationSystem({ message, visible }: NotificationSystemProps) {
  return (
    <div className="notification" style={{ opacity: visible ? 1 : 0 }}>
      {message}
    </div>
  )
}
