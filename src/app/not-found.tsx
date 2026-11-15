import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-muted">This visualisation may be private, retired or moved.</p>
        <Link href="/" className="btn-secondary mt-6">
          Back to home
        </Link>
      </div>
    </div>
  );
}
