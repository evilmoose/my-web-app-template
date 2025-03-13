import discord
import asyncio
from app.core.config import settings
import threading
import queue

# Create message queues for communication between FastAPI and Discord bot
send_queue = queue.Queue()
response_queue = queue.Queue()

intents = discord.Intents.default()
intents.messages = True  # Enable message fetching
client = discord.Client(intents=intents)

class DiscordService:
    @staticmethod
    async def fetch_messages(channel_id, limit=5):
        """ Fetch recent messages from a Discord channel. """
        # For fetching messages, we'll use a synchronous approach
        # Put request in queue and wait for response
        request_id = threading.get_ident()
        send_queue.put(("fetch", request_id, channel_id, limit))
        
        # Wait for response with timeout
        try:
            for _ in range(30):  # 3 second timeout (100ms * 30)
                if not response_queue.empty():
                    resp_id, response = response_queue.get()
                    if resp_id == request_id:
                        return response
                await asyncio.sleep(0.1)
            return {"error": "Timeout waiting for Discord response"}
        except Exception as e:
            return {"error": f"Error fetching messages: {str(e)}"}

    @staticmethod
    async def send_message(channel_id, content):
        """ Send a message to a Discord channel. """
        # Put message in queue for Discord bot to send
        request_id = threading.get_ident()
        send_queue.put(("send", request_id, channel_id, content))
        
        # Wait for response with timeout
        try:
            for _ in range(30):  # 3 second timeout (100ms * 30)
                if not response_queue.empty():
                    resp_id, response = response_queue.get()
                    if resp_id == request_id:
                        return response
                await asyncio.sleep(0.1)
            return {"error": "Timeout waiting for Discord response"}
        except Exception as e:
            return {"error": f"Error sending message: {str(e)}"}

@client.event
async def on_ready():
    print(f"✅ Bot is online as {client.user}")
    # Start the queue processing task
    client.loop.create_task(process_queue())

async def process_queue():
    """Process messages from the send queue"""
    while True:
        # Check if there are messages to process
        if not send_queue.empty():
            try:
                action, request_id, channel_id, data = send_queue.get()
                channel = client.get_channel(int(channel_id))
                
                if not channel:
                    response_queue.put((request_id, {"error": "Channel not found"}))
                    continue
                
                if action == "send":
                    # Send message
                    message = await channel.send(data)
                    response_queue.put((request_id, {"message_id": message.id, "content": data}))
                elif action == "fetch":
                    # Fetch messages - manually collect from history instead of using flatten()
                    messages = []
                    async for msg in channel.history(limit=data):
                        messages.append(msg)
                    
                    message_data = [{"id": str(msg.id), "author": msg.author.name, "content": msg.content} for msg in messages]
                    response_queue.put((request_id, message_data))
            except Exception as e:
                print(f"Error processing Discord queue: {str(e)}")
                # Send error back to the requester
                response_queue.put((request_id, {"error": f"Error processing request: {str(e)}"}))
        
        # Sleep to avoid high CPU usage
        await asyncio.sleep(0.1)

# Run the bot
def start_discord_bot():
    client.run(settings.DISCORD_BOT_TOKEN)

