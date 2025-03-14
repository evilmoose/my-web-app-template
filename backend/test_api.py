import requests
import json

# Base URL for the API
BASE_URL = "http://localhost:8000"

def test_root():
    """Test the root endpoint"""
    response = requests.get(f"{BASE_URL}/")
    print("Root endpoint response:", response.status_code)
    print(response.json())
    print()

def test_api_without_auth():
    """Test API endpoints without authentication to see the error responses"""
    # Test projects endpoint
    projects_response = requests.get(f"{BASE_URL}/api/v1/projects/")
    print("Projects endpoint response:", projects_response.status_code)
    print(projects_response.text)
    print()
    
    # Test creating a project without auth
    project_data = {
        "name": "Test Project",
        "description": "A test project created via API"
    }
    create_response = requests.post(
        f"{BASE_URL}/api/v1/projects/",
        json=project_data
    )
    print("Create project without auth response:", create_response.status_code)
    print(create_response.text)
    print()

def test_direct_gemini_api():
    """Test the Google Gemini API directly to verify it works"""
    api_key = "AIzaSyA1gm1i5Y9pGmPVEzCmqb6_YP9FN-YjLqI"  # This is from your .env file
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "contents": [{
            "parts": [{
                "text": "Explain how AI works"
            }]
        }]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        print("Direct Gemini API response:", response.status_code)
        print(response.text[:500] + "..." if len(response.text) > 500 else response.text)
    except Exception as e:
        print(f"Error calling Gemini API: {str(e)}")

if __name__ == "__main__":
    test_root()
    test_api_without_auth()
    test_direct_gemini_api() 