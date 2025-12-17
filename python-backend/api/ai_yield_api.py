from dotenv import load_dotenv
load_dotenv()

import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import openai
import re
import json
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

client = openai.OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/ai-yield")
async def ai_yield(request: Request):
    data = await request.json()
    location = data.get("location")
    property_type = data.get("property_type")
    bedrooms = data.get("bedrooms")
    strategy = data.get("strategy")
    purchase_price = data.get("purchase_price")

    prompt = (
        f"You are an expert UK property investment AI. "
        f"Based on UK market data from 2020–2025, local yields, rental trends, "
        f"and BTL returns, estimate a realistic NET yield for a {bedrooms}-bed {property_type} in {location} using the '{strategy}' strategy. "
        f"Purchase price: £{purchase_price}. "
        f"Return a valid JSON: predicted_yield (number), summary (sentence), trend_note (sentence), ai_confidence (Low/Medium/High). "
        f"Respond with JSON only. Do not say anything else."
    )

    try:
        response = client.chat.completions.create(
            model="anthropic/claude-3-sonnet",  # Or another model OpenRouter supports
            messages=[{"role": "user", "content": prompt}],
            max_tokens=256,
            temperature=0.3,
        )
        reply = response.choices[0].message.content
        print("AI raw reply:", reply)
        match = re.search(r'({.*?})', reply, re.DOTALL)
        json_str = match.group(1) if match else reply
        result = json.loads(json_str)
        return JSONResponse(result)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


# import asyncio
# import os
# import json
# from dotenv import load_dotenv
# import httpx
# from fastapi import FastAPI, Request
# from fastapi.responses import JSONResponse

# load_dotenv()

# OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
# OPENROUTER_API_BASE = "https://openrouter.ai/api/v1"
# HEADERS = {
#     "Authorization": f"Bearer {OPENROUTER_API_KEY}",
#     "HTTP-Referer": "http://localhost",
#     "X-Title": "uk-property-ai"
# }

# MODELS = [
#     "openai/gpt-4.1",
#     "openai/gpt-4.1-2025-04-14",
#     "anthropic/claude-3-opus",
#     "anthropic/claude-3.7-sonnet",
#     "meta-llama/llama-3.3-70b-instruct",
#     "mistralai/mistral-large-2411",
#     "google/gemini-2.0-flash-001"
# ]

# app = FastAPI()

# PROMPT_TEMPLATE = (
#     "You are an expert UK property investment AI. Based on UK market data from 2020–2025, local yields, "
#     "rental trends, and BTL returns, estimate a realistic NET yield for a {bedrooms}-bed {property_type} in {location} "
#     "using the '{strategy}' strategy. Purchase price: £{purchase_price}. "
#     "Return a valid JSON: predicted_yield (number), summary (sentence), trend_note (sentence), ai_confidence (Low/Medium/High). "
#     "Respond with JSON only. Do not say anything else."
# )

# async def query_model(model, prompt):
#     payload = {
#         "model": model,
#         "messages": [{"role": "user", "content": prompt}],
#         "max_tokens": 256,
#         "temperature": 0.3
#     }
#     async with httpx.AsyncClient(timeout=60.0) as client:
#         try:
#             resp = await client.post(
#                 f"{OPENROUTER_API_BASE}/chat/completions",
#                 headers=HEADERS,
#                 json=payload
#             )
#             print(f"\n--- {model} RAW RESPONSE ---\n", resp.status_code, resp.text)  # 👈 DEBUG print
#             data = resp.json()
#             content = data["choices"][0]["message"]["content"]
#             # Try to extract only the JSON object
#             import re
#             match = re.search(r'({.*?})', content, re.DOTALL)
#             obj = json.loads(match.group(1)) if match else {"error": "AI did not return valid JSON"}
#             obj["model"] = model
#             return obj
#         except Exception as e:
#             return {"error": str(e), "model": model}

# @app.post("/api/ai-yield")
# async def ai_yield(request: Request):
#     data = await request.json()
#     prompt = PROMPT_TEMPLATE.format(
#         location=data.get("location"),
#         property_type=data.get("property_type"),
#         bedrooms=data.get("bedrooms"),
#         strategy=data.get("strategy"),
#         purchase_price=data.get("purchase_price")
#     )

#     # Run all models in parallel
#     results = await asyncio.gather(*(query_model(model, prompt) for model in MODELS))

#     # Aggregate predictions
#     predicted_yields = [r.get("predicted_yield") for r in results if isinstance(r.get("predicted_yield"), (int, float))]
#     avg_yield = round(sum(predicted_yields)/len(predicted_yields), 2) if predicted_yields else None

#     response = {
#         "average_predicted_yield": avg_yield,
#         "per_model": results
#     }
#     return JSONResponse(response)
