from .core import asgi_app, sio, rest  # re-exported for uvicorn

# Importing routes and events attaches handlers via decorators
from . import routes as _routes  # noqa: F401
from . import events as _events  # noqa: F401

__all__ = ["asgi_app", "sio", "rest"]

