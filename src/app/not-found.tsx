import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-6xl text-teal-600">404</p>
      <h1 className="mt-3 font-display text-2xl text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        That page doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center rounded-[10px] bg-teal-600 px-5 text-sm font-medium text-white transition-transform active:scale-[0.98]"
      >
        Back home
      </Link>
    </div>
  );
}
