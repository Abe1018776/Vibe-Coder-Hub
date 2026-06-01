import { Container, Eyebrow } from "@/components/brand/layout";
import { GetListedForm } from "@/components/directory/get-listed-form";

export const metadata = { title: "Get listed" };

export default function GetListedPage() {
  return (
    <Container className="max-w-2xl py-12 md:py-16">
      <div className="text-center">
        <Eyebrow>Join the directory</Eyebrow>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,2.75rem)] font-bold tracking-tight text-ink">
          Get listed — it&apos;s free
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[17px] text-muted-foreground">
          Tell us who you are and what you do. No account needed — we review every
          submission and add the good ones to the directory.
        </p>
      </div>
      <div className="mt-9 rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)] md:p-8">
        <GetListedForm />
      </div>
    </Container>
  );
}
