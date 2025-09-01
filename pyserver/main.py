from pyserver.main import asgi_app  # expose for uvicorn

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(asgi_app, host="0.0.0.0", port=8000)
