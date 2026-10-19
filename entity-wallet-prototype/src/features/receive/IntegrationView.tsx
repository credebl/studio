"use client";

import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Switch } from "@/components/ui/Switch";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { formatDate } from "@/features/controllership/scopeModel";
import { useDemo } from "@/lib/demoStore";

import { useIssuer } from "./issuerShared";

/**
 * SCR-CRD-10 — Integration settings. FLOW-CRD-03 step 5: set up and watch
 * Kind A delivery, where the issuer's own system answers requests.
 *
 * THE ONE TECHNICAL SCREEN
 *
 * Read by the office's integration lead, so it is the one place webhook,
 * secret and event are allowed words (§2.4). Everything an officer or a
 * business reads stays in plain language; here the mechanics are named,
 * because naming them is what lets someone fix them.
 *
 * THE QUEUE IS THE SAFETY NET
 *
 * With fallback on, a request the system doesn't pick up lands on the
 * officers' queue (SCR-CRD-08, E6), so a broken webhook slows the office
 * down rather than stopping it. The failing banner says how long and what
 * the last error was — the two things the integration lead needs first.
 *
 * Nothing here sends anything: the test event and the log are fixtures.
 */
type Face = "live" | "default" | "empty" | "failing" | "error" | "offline";

export function IntegrationView() {
  const { integration, setWebhook, rotateSecret, createClient, setQueueFallback, sendTestEvent, hydrated } = useDemo();
  const issuer = useIssuer();
  const forced = useScreenState("SCR-CRD-10", ["live", "default", "empty", "failing", "error", "offline"]) as Face;
  const [url, setUrl] = useState(integration.webhookUrl ?? "");
  const [editingUrl, setEditingUrl] = useState(false);
  const [client, setClient] = useState("");
  const [testFailed, setTestFailed] = useState(false);

  const natural: Face = !integration.webhookUrl && !editingUrl ? "empty" : integration.failingSince ? "failing" : testFailed ? "error" : "default";
  const face: Face = forced === "live" ? natural : forced;
  const readOnly = face === "offline";

  const header = <PageHeader crumbs={[{ label: issuer.name }, { label: "Integration" }]} title="Integration settings" />;

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  if (!issuer.isOwner) {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          {header}
          <Panel>
            <p className="relative z-[4] m-0 text-[14px] text-body">Only the issuing office&rsquo;s owner sets up its integration.</p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  if (face === "empty") {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          {header}
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <p className="m-0 text-[14px] text-body">Not set up. Requests go to your officers&rsquo; queue.</p>
              <div>
                <GradientButton onClick={() => setEditingUrl(true)}>Set up</GradientButton>
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const test = () => {
    if (forced === "error") {
      setTestFailed(true);
      return;
    }
    setTestFailed(false);
    sendTestEvent();
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        {header}
        {face === "failing" ? (
          <p role="alert" className="m-0 rounded-[12px] border px-4 py-3 text-[13.5px] leading-[1.6] text-body" style={{ borderColor: "var(--ndi-warning)" }}>
            We haven&rsquo;t been able to deliver requests to your system since {formatDate(integration.failingSince ?? new Date().toISOString())}. Last
            error: {integration.lastError ?? "HTTP 503"}.
          </p>
        ) : null}
        {face === "error" ? (
          <p role="alert" className="m-0 rounded-[12px] border px-4 py-3 text-[13px] text-body" style={{ borderColor: "var(--text-danger)" }}>
            The test event failed: HTTP 502. Response body: &ldquo;upstream connect error or disconnect/reset before headers&rdquo;.
          </p>
        ) : null}
        {face === "offline" ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. These are the settings as last loaded.
          </p>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <p className={LABEL_CLASS}>Webhook URL</p>
              {editingUrl || !integration.webhookUrl ? (
                <div className="flex flex-wrap items-end gap-2.5">
                  <label className={`${FIELD_BLOCK_CLASS} min-w-[280px] flex-1`}>
                    <span className="sr-only">Webhook URL</span>
                    <input className={FIELD_CLASS} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://drc.gov.bt/ndi/credential-requests" />
                  </label>
                  <GradientButton
                    disabled={readOnly || !/^https:\/\/\S+$/.test(url.trim())}
                    onClick={() => {
                      setWebhook(url);
                      setEditingUrl(false);
                    }}
                  >
                    Save
                  </GradientButton>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <code className="font-mono text-[13px] text-body">{integration.webhookUrl}</code>
                  <HairlineButton onClick={() => setEditingUrl(true)} disabled={readOnly}>
                    Change URL
                  </HairlineButton>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <p className={LABEL_CLASS}>Signing secret</p>
                <p className="m-0 font-mono text-[13px] text-body">whsec_••••••••••••••••</p>
                <p className="m-0 text-[12.5px] text-faint">
                  {integration.secretRotatedAt ? `Rotated ${formatDate(integration.secretRotatedAt)}` : "Created when the URL is saved"}
                </p>
              </div>
              <HairlineButton onClick={rotateSecret} disabled={readOnly || !integration.webhookUrl}>
                Rotate secret
              </HairlineButton>
            </div>

            <div className="flex flex-col gap-2">
              <p className={LABEL_CLASS}>Answering clients</p>
              {integration.clients.length ? (
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {integration.clients.map((c) => (
                    <li key={c.id} className="text-[13px] text-body">
                      {c.name} <span className="text-faint">· created {formatDate(c.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="m-0 text-[13px] text-muted">None yet. Your system needs one to answer requests.</p>
              )}
              <div className="flex flex-wrap items-end gap-2.5">
                <label className={`${FIELD_BLOCK_CLASS} min-w-[220px]`}>
                  <span className="sr-only">Client name</span>
                  <input className={FIELD_CLASS} value={client} onChange={(e) => setClient(e.target.value)} placeholder="Taxpayer registration system" />
                </label>
                <HairlineButton
                  disabled={readOnly || !client.trim()}
                  onClick={() => {
                    createClient(client);
                    setClient("");
                  }}
                >
                  Create a client
                </HairlineButton>
              </div>
            </div>

            <Switch
              id="queue-fallback"
              checked={integration.queueFallback}
              onChange={setQueueFallback}
              disabled={readOnly}
              label="Fall back to the officers' queue"
              description="A request your system hasn't picked up appears on Requests to answer, so an officer can answer it."
            />

            <div className="border-t border-subtle pt-4">
              <GradientButton onClick={test} disabled={readOnly || !integration.webhookUrl}>
                Send a test event
              </GradientButton>
            </div>
          </div>
        </Panel>

        <section aria-labelledby="int-log" className="flex flex-col gap-3">
          <h2 id="int-log" className="m-0 font-display text-[15px] font-semibold text-strong">
            Delivery log
          </h2>
          <Panel padded={false}>
            <DataTable columns={["Event", "Attempt", "Status", "Latency", "When"]} empty={{ icon: "fileText", title: "Nothing delivered yet.", message: "", compact: true }}>
              {integration.log.length
                ? integration.log.map((e) => (
                    <tr key={e.id}>
                      <td className="font-mono text-[12.5px] text-body">{e.event}</td>
                      <td>{e.attempt}</td>
                      <td className="font-mono text-[12.5px]">{e.status}</td>
                      <td>{e.latencyMs} ms</td>
                      <td>{formatDate(e.at)}</td>
                    </tr>
                  ))
                : null}
            </DataTable>
          </Panel>
        </section>
      </div>
    </AppShell>
  );
}
