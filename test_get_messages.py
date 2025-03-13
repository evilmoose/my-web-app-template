import requests
import json
import sys

# Replace with your actual token
TOKEN = "YOUR_TOKEN_HERE"

def test_get_messages(token, limit=5):
    url = f"http://localhost:8000/api/v1/blog/messages?limit={limit}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(json.dumps(data, indent=2))
            
            if "messages" in data:
                print(f"\nFound {len(data['messages'])} messages")
            elif "error" in data:
                print(f"\nError: {data['error']}")
            else:
                print("\nUnexpected response format")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {str(e)}")

if __name__ == "__main__":
    # Get token from command line if provided
    if len(sys.argv) > 1:
        TOKEN = sys.argv[1]
    
    # Get limit from command line if provided
    limit = 5
    if len(sys.argv) > 2:
        limit = int(sys.argv[2])
    
    test_get_messages(TOKEN, limit) 