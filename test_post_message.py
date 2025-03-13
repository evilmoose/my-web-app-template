import requests
import json
import sys

# Replace with your actual admin token
TOKEN = "YOUR_ADMIN_TOKEN_HERE"

def test_post_message(token, content):
    url = "http://localhost:8000/api/v1/blog/post"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    data = {
        "content": content
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(json.dumps(data, indent=2))
            print("\nMessage posted successfully!")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {str(e)}")

if __name__ == "__main__":
    # Get token from command line if provided
    if len(sys.argv) > 1:
        TOKEN = sys.argv[1]
    
    # Get message content from command line if provided
    content = "Test message from API"
    if len(sys.argv) > 2:
        content = sys.argv[2]
    
    test_post_message(TOKEN, content) 