import socketio
from fastapi import FastAPI


# Socket.IO ASGI server core objects
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
rest = FastAPI()
asgi_app = socketio.ASGIApp(sio, other_asgi_app=rest)

