import { TryAgainButton } from "@/components/TryAgainButton";

export const metadata = { title: "Bible in a Year | Offline" };

export default function OfflinePage() {
  return (
    <main className="offline-page">
      <div className="offline-glyph">
        <span />
      </div>
      <p className="eyebrow">Offline</p>
      <h1>No connection</h1>
      <p style={{ marginTop: 12, marginBottom: 26 }}>
        You&apos;re offline and this page hasn&apos;t been viewed before, so there&apos;s
        nothing cached yet. Days you&apos;ve already opened stay readable offline.
      </p>
      <TryAgainButton />
    </main>
  );
}
