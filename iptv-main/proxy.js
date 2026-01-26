export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    res.status(400).json({ error: "Missing ?url parameter" });
    return;
  }

  try {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type");
    const data = await response.arrayBuffer();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", contentType || "application/octet-stream");
    res.send(Buffer.from(data));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch target", details: err.message });
  }
}
