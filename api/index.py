import os
import sys

# Ensure backend directory is in python sys.path for Vercel serverless execution
backend_path = os.path.join(os.path.dirname(__file__), "..", "backend")
abs_backend_path = os.path.abspath(backend_path)
if abs_backend_path not in sys.path:
    sys.path.insert(0, abs_backend_path)

from app.main import app  # ASGI app for Vercel Serverless
