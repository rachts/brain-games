interface GameHeaderProps {
  title: string
  description: string
}

export function GameHeader({ title, description }: GameHeaderProps) {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-4xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
