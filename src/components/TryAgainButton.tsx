"use client";

export function TryAgainButton() {
  return (
    <button
      type="button"
      className="btn"
      style={{ width: "auto", padding: "14px 28px" }}
      onClick={() => location.reload()}
    >
      Try again
    </button>
  );
}
