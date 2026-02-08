export async function POST(req) {
  try {
    const { content } = await req.json();

    if (!content || content.length < 30) {
      return Response.json({ error: "Content too short" }, { status: 400 });
    }

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/google/pegasus-xsum",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: content,
          parameters: {
            max_length: 30,
            min_length: 8,
            do_sample: false
          }
        }),
      }
    );

    const result = await response.json();
    console.log("HF RESULT:", result);

    if (Array.isArray(result) && result[0]?.summary_text) {
      return Response.json({ summary: result[0].summary_text });
    }

    return Response.json({ error: "AI failed" }, { status: 500 });

  } catch (error) {
    console.error("AI ERROR:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}