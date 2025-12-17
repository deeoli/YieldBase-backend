# from dotenv import load_dotenv
# load_dotenv()
# import os
# import openai
# from fastapi import FastAPI, Request
# from fastapi.responses import JSONResponse
# import re

# app = FastAPI()

# openai.api_key = os.getenv("GROQ_API_KEY")
# openai.api_base = "https://api.groq.com/openai/v1"

# @app.post("/api/ai-yield")
# async def ai_yield(request: Request):
#     data = await request.json()
#     location = data.get("location")
#     property_type = data.get("property_type")
#     bedrooms = data.get("bedrooms")
#     strategy = data.get("strategy")
#     purchase_price = data.get("purchase_price")

#     prompt = (
#         f"You are an expert UK property investment AI. "
#         f"Based on UK market data from 2020–2025, local yields, rental trends, "
#         f"and BTL returns, estimate a realistic NET yield for a {bedrooms}-bed {property_type} in {location} using the '{strategy}' strategy. "
#         f"Purchase price: £{purchase_price}. "
#         f"Return a valid JSON: predicted_yield (number), summary (sentence), trend_note (sentence), ai_confidence (Low/Medium/High). "
#         f"Respond with JSON only. Do not say anything else."
#     )

#     try:
#         response = openai.ChatCompletion.create(
#             model="llama3-70b-8192",
#             messages=[{"role": "user", "content": prompt}],
#             max_tokens=150,
#             temperature=0.3,
#         )
#         reply = response["choices"][0]["message"]["content"]
#         print("AI raw reply:", reply)  # Debug!

#         # Try to extract JSON block if AI adds any text
#         match = re.search(r'({.*?})', reply, re.DOTALL)
#         if match:
#             json_str = match.group(1)
#         else:
#             json_str = reply

#         import json
#         result = json.loads(json_str)
#         return JSONResponse(result)
#     except Exception as e:
#         return JSONResponse({"error": str(e)}, status_code=500)
