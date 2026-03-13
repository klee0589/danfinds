Deno.serve(async (_req) => {
  const content = `google.com, pub-9420381871665480, DIRECT, f08c47fec0942fa0`;

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
});