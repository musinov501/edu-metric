export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">{children}</div>
    </div>
  );
}
