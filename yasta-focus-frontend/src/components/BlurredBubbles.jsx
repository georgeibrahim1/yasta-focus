export default function BlurredBubbles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl animate-glow"></div>
      <div className="absolute bottom-32 left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-glow" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-glow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-indigo-500/25 rounded-full blur-3xl animate-glow" style={{ animationDelay: '3s' }}></div>
    </div>
  )
}
