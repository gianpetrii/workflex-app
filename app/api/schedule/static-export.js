export const dynamic = "force-static";

export async function GET() {
  return new Response(JSON.stringify({ message: "Static export" }), {
    headers: { "content-type": "application/json" },
  })
} 