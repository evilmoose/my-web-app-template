import requests
import json

# First, login to get a token
login_url = "http://localhost:8000/api/v1/auth/jwt/login"
login_data = {
    "username": "admin@example.com",  # Replace with your admin email
    "password": "adminpassword"       # Replace with your admin password
}

login_response = requests.post(
    login_url, 
    data=login_data,
    headers={"Content-Type": "application/x-www-form-urlencoded"}
)

print(f"Login Status Code: {login_response.status_code}")
print(f"Login Response: {login_response.text}")

# If login successful, get the token
if login_response.status_code == 200:
    token_data = login_response.json()
    access_token = token_data.get("access_token")
    
    # Now post a message with the token
    post_url = "http://localhost:8000/api/v1/blog/post"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }
    data = {"content": "This is a test blog post from FastAPI with admin authentication!"}
    
    response = requests.post(post_url, headers=headers, json=data)
    
    print(f"Post Status Code: {response.status_code}")
    print(f"Post Response: {response.text}")
else:
    print("Login failed, cannot post message") 