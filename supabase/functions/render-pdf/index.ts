// Server-side PDF rendering via Browserless.io.
// Pixel-perfect, Devanagari-safe output for any spiritual report.
//
// Body: { html: string, filename?: string, options?: { format?: "A4"|"Letter", landscape?: boolean, marginMm?: number } }
// OR:    { url: string, ... }   // browserless will navigate to URL and screenshot the page
//
// Returns: application/pdf binary stream.
//
// Why Browserless: managed headless Chrome; reliable Devanagari rendering with
// embedded Google Fonts; ~$0.005/render on free tier (1k/mo).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "content-disposition",
};

interface Body {
  html?: string;
  url?: string;
  filename?: string;
  options?: {
    format?: "A4" | "Letter";
    landscape?: boolean;
    marginMm?: number;
    printBackground?: boolean;
  };
}

// Wrap user HTML with Devanagari-safe defaults
function wrapHtml(html: string): string {
  if (/<html[\s>]/i.test(html)) return html;
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&family=Inter:wght@400;500;600;700&family=Cormorant+Garamond:wght@500;700&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{box-sizing:border-box}
  html,body{margin:0;padding:0;background:#fff;color:#111;font-family:'Inter','Noto Sans Devanagari',system-ui,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  h1,h2,h3{font-family:'Cormorant Garamond','Inter',serif;page-break-after:avoid}
  .devanagari,[lang="hi"],[lang="sa"]{font-family:'Noto Sans Devanagari',serif !important;hyphens:none;word-break:keep-all}
  img{max-width:100%;height:auto}
  table{border-collapse:collapse;width:100%}
  .page-break{page-break-after:always}
  .avoid-break{page-break-inside:avoid;break-inside:avoid}
  @page{size:A4;margin:12mm}
</style></head><body>${html}</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Require authenticated caller to prevent credit-drain abuse.
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const jwt = authHeader.replace("Bearer ", "");
    const { data, error: authErr } = await supa.auth.getClaims(jwt);
    if (authErr || !data?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (_e) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as Body;
    // SSRF hardening: the `url` field is no longer accepted. Only inline HTML
    // is rendered, eliminating the risk of Browserless fetching internal hosts
    // (e.g. 169.254.169.254 metadata) on an attacker's behalf.
    if (!body.html) {
      return new Response(JSON.stringify({ error: "html required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = Deno.env.get("BROWSERLESS_API_KEY");
    if (!token) {
      return new Response(JSON.stringify({ error: "BROWSERLESS_API_KEY missing" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const opts = body.options ?? {};
    const margin = `${opts.marginMm ?? 12}mm`;

    const browserlessPayload = {
      html: wrapHtml(body.html),
      options: {
        format: opts.format ?? "A4",
        landscape: !!opts.landscape,
        printBackground: opts.printBackground ?? true,
        preferCSSPageSize: true,
        margin: { top: margin, bottom: margin, left: margin, right: margin },
      },
      gotoOptions: { waitUntil: "networkidle0", timeout: 30000 },
      waitFor: 1500,
    };


    const r = await fetch(`https://production-sfo.browserless.io/pdf?token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(browserlessPayload),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error("Browserless error:", r.status, errText);
      return new Response(JSON.stringify({ error: `Browserless ${r.status}`, detail: errText.slice(0, 500) }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pdfBuf = await r.arrayBuffer();
    const filename = (body.filename || "BhaktVerse_Report").replace(/[^a-zA-Z0-9_\-]/g, "_");
    return new Response(pdfBuf, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
        "Cache-Control": "private, max-age=0, no-store",
      },
    });
  } catch (e) {
    console.error("render-pdf error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
