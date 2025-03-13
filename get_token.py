import requests
import json
import sys

def get_token(email, password):
    url = "http://localhost:8000/api/v1/auth/jwt/login"
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "username": email,
        "password": password
    }
    
    try:
        response = requests.post(url, headers=headers, data=data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print(f"\nToken: {token}")
            
            # Also get user info
            user_url = "http://localhost:8000/api/v1/users/me"
            user_headers = {
                "Authorization": f"Bearer {token}"
            }
            user_response = requests.get(user_url, headers=user_headers)
            
            if user_response.status_code == 200:
                user_data = user_response.json()
                is_admin = user_data.get("is_superuser", False)
                print(f"User: {user_data.get('email')}")
                print(f"Admin: {is_admin}")
                print(f"First Name: {user_data.get('first_name')}")
                print(f"Last Name: {user_data.get('last_name')}")
            
            return token
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"Exception: {str(e)}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python get_token.py <email> <password>")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    
    token = get_token(email, password)
    
    if token:
        print("\nUse this token for testing:")
        print(f"python test_get_messages.py {token}")
        print(f"python test_post_message.py {token} \"Your message here\"")
    else:
        print("\nFailed to get token.") 