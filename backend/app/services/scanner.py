import base64
import json
import fitz  # pymupdf
from openai import OpenAI
from app.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

def encode_bytes(data: bytes) -> str:
    return base64.b64encode(data).decode("utf-8")

def pdf_to_image_bytes(pdf_bytes: bytes) -> bytes:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page = doc[0]
    mat = fitz.Matrix(2, 2)
    pix = page.get_pixmap(matrix=mat)
    return pix.tobytes("png")

def scan_invoice(file_bytes: bytes, file_type: str) -> dict:
    if file_type == "application/pdf":
        image_bytes = pdf_to_image_bytes(file_bytes)
        mime = "image/png"
    else:
        image_bytes = file_bytes
        mime = file_type

    base64_image = encode_bytes(image_bytes)

    prompt = """You are an expert invoice data extractor. Carefully read every part of this invoice image and extract the following fields.

Return ONLY a valid JSON object with no extra text, no markdown, no explanation:

{
  "client_name": "The full name or company name of WHO IS BEING BILLED (the customer/recipient, not the seller). Look for labels like 'Bill To', 'Client', 'Customer', 'To', 'Sold To'.",
  "client_email": "Email address of the client being billed if visible, otherwise null",
  "amount": "The TOTAL amount due as a number only — no currency symbols, no commas. Look for 'Total', 'Amount Due', 'Balance Due', 'Grand Total'.",
  "currency": "The 3-letter ISO currency code. Detect from currency symbols: $ = USD, £ = GBP, € = EUR, ₹ = INR, ₨ or Rs = PKR. If you see PKR, USD, GBP etc written out, use that. Default to USD only if absolutely no currency indicator exists.",
  "due_date": "Payment due date in YYYY-MM-DD format. Look for 'Due Date', 'Payment Due', 'Due By'. If not found, use null.",
  "invoice_number": "The invoice reference number. Look for 'Invoice #', 'Invoice No', 'Inv #', 'Reference'.",
  "notes": "Brief description of the service or product being invoiced if visible, otherwise null"
}

Important rules:
- client_name must be the BUYER not the seller
- currency must be detected from symbols or text on the invoice, never assume USD unless there is no other indicator
- amount should be the final total, not subtotal
- If a field truly cannot be found, use null"""

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

    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)