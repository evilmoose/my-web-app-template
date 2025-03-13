import requests
import json

# First, login to get a token
login_url = "http://localhost:8000/api/v1/auth/jwt/login"
login_data = {
    "username": "user@example.com",  # Replace with a regular user email
    "password": "userpassword"       # Replace with a regular user password
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
    
    # Try to post a message with the token (should fail)
    post_url = "http://localhost:8000/api/v1/blog/post"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }
    data = {"content": "This is a test blog post from a non-admin user!"}
    
    response = requests.post(post_url, headers=headers, json=data)
    
    print(f"Post Status Code: {response.status_code}")
    print(f"Post Response: {response.text}")
    
    # Try to get messages (should succeed)
    get_url = "http://localhost:8000/api/v1/blog/messages"
    get_response = requests.get(get_url, headers={"Authorization": f"Bearer {access_token}"})
    
    print(f"Get Messages Status Code: {get_response.status_code}")
    print(f"Get Messages Response: {get_response.text}")
else:
    print("Login failed, cannot test endpoints") 