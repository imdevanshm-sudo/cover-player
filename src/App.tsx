import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <main className="relative w-full h-screen mesh-bg overflow-hidden flex items-center justify-center">
      {/* Grain overlay for acoustic/raw texture */}
      <div className="grain-overlay" />
      
      {/* Content */}
      <MusicPlayer />
    </main>
  );
}
