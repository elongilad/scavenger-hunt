import ScavengerHuntStation from '@/components/ScavengerHuntStation';
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900">
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-white text-3xl font-bold text-center mb-8">
          🎂 Birthday Mission Control 🕵️‍♂️
        </h1>
        <ScavengerHuntStation />
      </main>
    </div>
  );
}