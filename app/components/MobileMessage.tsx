// app/components/MobileMessage.tsx
export default function MobileMessage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-6xl md:text-8xl font-black text-amber-500 mb-8 tracking-wider">
          The Ashen Key
        </h1>
        <p className="text-2xl md:text-3xl text-gray-300">
          This detective story is mobile-only.
        </p>
        <p className="text-xl text-gray-500 mt-6">
          Open this link on your phone to begin.
        </p>
      </div>
    </main>
  );
}
