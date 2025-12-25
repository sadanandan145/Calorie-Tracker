import { Navigation } from "./Navigation";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="max-w-md mx-auto w-full px-4 pt-4 sm:pt-8 animate-in fade-in duration-500">
        {children}
      </main>
      <Navigation />
    </div>
  );
}
