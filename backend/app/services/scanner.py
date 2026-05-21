import base64
import json
import fitz  # pymupdf
from openai import OpenAI
from app.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

def encode_bytes(data: bytes) -> str:
    return base64.b64encode(data).decode("utf-8")

def pdf_to_image_bytes(pdf_bytes: bytes) -> bytes:
    """Convert first page of PDF to PNG image bytes."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page = doc[0]
    mat = fitz.Matrix(2, 2)  # 2x zoom for better quality
    pix = page.get_pixmap(matrix=mat)
    return pix.tobytes("png")

def scan_invoice(file_bytes: bytes, file_type: str) -> dict:
    # Convert PDF to image first
    if file_type == "application/pdf":
        image_bytes = pdf_to_image_bytes(file_bytes)
        mime = "image/png"
    else:
        image_bytes = file_bytes
        mime = file_type

    base64_image = encode_bytes(image_bytes)

    prompt = """You are an invoice data extractor. Extract the following fields from this invoice and return ONLY a valid JSON object with no extra text:
{
  "client_name": "full name or company name of who is being billed",
  "client_email": "email of client if visible, otherwise null",
  "amount": numeric amount as a number only no currency symbols,
  "currency": "3 letter currency code e.g. USD PKR GBP EUR",
  "due_date": "date in YYYY-MM-DD format, if not found use null",
  "invoice_number": "invoice number or reference",
  "notes": "brief description of service if visible otherwise null"
}
If any field is not found, use null. Return only the JSON, no explanation."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime};base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        max_tokens=500
    )

    raw = response.choices[0].message.content.strip()

    # Clean up markdown if model wraps response
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)