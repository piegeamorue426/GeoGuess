export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold text-primary mb-4">GeoGuess</h1>
      <p className="text-lg text-gray-400 mb-8">Explore the world, one guess at a time</p>
      <button className="px-8 py-3 bg-primary text-background font-semibold rounded-lg hover:bg-primary-dark transition-colors animate-pulse-glow">
        Start Game
      </button>
    </main>
  );
}
