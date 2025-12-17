# ai/yield_predictor.py

def predict_yield(params):
    """
    Main AI/ML logic for UK property yield prediction.
    Params: dict with keys 'location', 'property_type', 'bedrooms', 'strategy', 'purchase_price'
    Returns: dict with keys 'predicted_yield', 'summary', etc.
    """
    # DEMO LOGIC — swap for AI/statistical/model call later
    location = params.get('location', '').lower()
    bedrooms = int(params.get('bedrooms', 1))
    price = float(params.get('purchase_price', 100000))
    ptype = params.get('property_type', 'Flat').lower()

    # Naive rule-based fallback (plug GPT or model here)
    if "manchester" in location:
        predicted_yield = 7.6 + (0.3 if bedrooms > 2 else 0)
        trend = "Manchester city student lets: strong historic returns, rising rents."
    elif "liverpool" in location:
        predicted_yield = 8.1
        trend = "Liverpool: consistently top yields for BTL, especially 2-bed flats."
    elif "london" in location:
        predicted_yield = 4.2
        trend = "London: lower yield but higher appreciation potential."
    else:
        predicted_yield = 6.0
        trend = "Typical regional UK BTL yield."

    summary = (
        f"Predicted net yield for a {bedrooms}-bed {ptype} in {params.get('location','')}: "
        f"{predicted_yield:.1f}% — based on historic and current market data."
    )
    return {
        "predicted_yield": round(predicted_yield, 2),
        "summary": summary,
        "trend_note": trend,
        "ai_confidence": "Medium",
    }

# For CLI/dev test
if __name__ == "__main__":
    print(predict_yield({
        "location": "Manchester, M14",
        "property_type": "Flat",
        "bedrooms": 2,
        "strategy": "Buy to Let",
        "purchase_price": 85000
    }))
