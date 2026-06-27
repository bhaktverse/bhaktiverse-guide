// Shared failure notifier. POSTs a generic JSON payload to NOTIFY_WEBHOOK_URL
// (works for Slack/Discord/n8n/Zapier — all accept generic JSON).
// No-op if the secret is not configured, so functions never break.
export type JobNotification = {
  job: "qa-runner" | "audio-self-heal" | "ingest-orchestrator" | string;
  status: "failed" | "degraded";
  reason: string;
  run_id?: string | null;
  retry_url?: string;
  details?: Record<string, unknown>;
};

export async function notifyJobFailure(n: JobNotification): Promise<void> {
  const url = Deno.env.get("NOTIFY_WEBHOOK_URL");
  if (!url) return;
  const payload = {
    text: `🚨 ${n.job} ${n.status.toUpperCase()}: ${n.reason}`,
    attachments: [
      {
        color: n.status === "failed" ? "#dc2626" : "#f59e0b",
        title: `${n.job} ${n.status}`,
        text: n.reason,
        fields: [
          { title: "Run ID", value: n.run_id ?? "—", short: true },
          { title: "Retry", value: n.retry_url ?? "Admin → Job Logs → Retry", short: true },
        ],
        ts: Math.floor(Date.now() / 1000),
      },
    ],
    job: n.job,
    status: n.status,
    reason: n.reason,
    run_id: n.run_id ?? null,
    details: n.details ?? {},
  };
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // never throw — telemetry must not break the job
  }
}
