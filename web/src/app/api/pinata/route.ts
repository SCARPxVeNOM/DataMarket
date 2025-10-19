import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const jwt = process.env.PINATA_JWT || "";
  if (!jwt) {
    return new Response(JSON.stringify({ error: "PINATA_JWT missing" }), { status: 500 });
  }

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pinataOptions: { cidVersion: 1 }, pinataContent: body }),
  });

  if (!res.ok) {
    const text = await res.text();
    return new Response(JSON.stringify({ error: text }), { status: 500 });
  }
  const json = await res.json();
  return Response.json({ cid: json.IpfsHash });
}


