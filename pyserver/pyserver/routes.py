from .core import rest


@rest.get("/health")
def health():
    return {"status": "ok"}

