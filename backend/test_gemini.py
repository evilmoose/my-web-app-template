import requests
import json

def test_gemini_api():
    """Test the Google Gemini API directly"""
    api_key = "AIzaSyA1gm1i5Y9pGmPVEzCmqb6_YP9FN-YjLqI"  # This is from your .env file
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "contents": [{
            "parts": [{
                "text": "Explain how AI works in one paragraph"
            }]
        }]
    }
    
    try:
        print("Sending request to Gemini API...")
        response = requests.post(url, headers=headers, json=payload)
        print(f"Response status code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("\nAPI Response:")
            print(json.dumps(result, indent=2))
            
            if "candidates" in result and len(result["candidates"]) > 0:
                text = result["candidates"][0]["content"]["parts"][0]["text"]
                print("\nGenerated Text:")
                print(text)
            else:
                print("\nNo candidates found in the response.")
        else:
            print("\nError Response:")
            print(response.text)
    except Exception as e:
        print(f"Error calling Gemini API: {str(e)}")

if __name__ == "__main__":
    test_gemini_api() 