export const metadata = { title: "Bible in a Year | Offline" };

export default function OfflinePage() {
  return (
    <main>
      <div className="card">
        <p className="eyebrow">Offline</p>
        <h1>No connection</h1>
        <p>
          You&apos;re offline and this page hasn&apos;t been viewed before, so there&apos;s
          nothing cached yet. Days you&apos;ve already opened stay readable offline.
        </p>
      </div>
    </main>
  );
}
