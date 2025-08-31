import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

app = FastAPI()

# CORS so frontend (Next.js) can call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Transcript(BaseModel):
    text: str

# ✅ Simple summary
@app.post("/summarize")
def summarize(transcript: Transcript):
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={"model": "mistral", "prompt": transcript.text, "stream": False},
    )
    data = response.json()
    return {"summary": data.get("response", "")}

# ✅ Structured extraction
@app.post("/extract")
def extract(transcript: Transcript):
    prompt = f"""
    You are an AI meeting assistant.
    Given the transcript below, extract in pure JSON with no extra text.

    JSON schema:
    {{
      "summary": "- point1\\n- point2",
      "decisions": ["decision1", "decision2"],
      "action_items": [{{"owner": "name", "task": "task", "due_date": "date"}}],
      "deadlines": [{{"item": "item", "date": "date"}}]
    }}

    Transcript:
    {transcript.text}
    """

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={"model": "mistral", "prompt": prompt, "stream": False},
    )
    data = response.json()
    raw = data.get("response", "")

    # --- FIX: ensure valid JSON parsing ---
    try:
        structured = json.loads(raw)   # try parsing directly
    except:
        try:
            # fallback: extract JSON part from text
            start = raw.find("{")
            end = raw.rfind("}")
            structured = json.loads(raw[start:end+1])
        except:
            structured = {"summary": raw, "decisions": [], "action_items": [], "deadlines": []}

    return structured
