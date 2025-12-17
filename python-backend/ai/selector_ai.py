import openai

def suggest_selectors(html_snippet):
    prompt = f"""
    Given the following HTML snippet, suggest CSS selectors to extract:
    1. Title
    2. Price
    3. Link

    HTML:
    {html_snippet}
    """
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message['content']
