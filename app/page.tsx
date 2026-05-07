import SpendForm from "@/components/spend-form";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-4 text-5xl font-bold">
          AI Spend Audit
        </h1>

        <p className="mb-10 text-lg text-white/70">
          Discover wasted AI subscription spend and cheaper alternatives.
        </p>

        <SpendForm />
      </div>
    </main>
  );
}