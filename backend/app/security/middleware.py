import time
from typing import Dict, Tuple
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.core.config import settings

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' *"
        )
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 120):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        # client_ip -> (timestamp_window_start, count)
        self.clients: Dict[str, Tuple[float, int]] = {}

    async def dispatch(self, request: Request, call_next):
        # Exempt health check, docs, and testclient runner
        if request.url.path in ["/health", "/docs", "/openapi.json", "/redoc"]:
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        if client_ip in ("testclient", "test"):
            return await call_next(request)
        current_time = time.time()
        
        # Periodic cleanup if too large
        if len(self.clients) > 10000:
            self.clients = {ip: val for ip, val in self.clients.items() if current_time - val[0] < 60}

        if client_ip in self.clients:
            window_start, count = self.clients[client_ip]
            if current_time - window_start < 60:
                if count >= self.requests_per_minute:
                    return JSONResponse(
                        status_code=429,
                        content={
                            "detail": "Rate limit exceeded. Please try again in a minute.",
                            "status": "RATE_LIMITED"
                        },
                        headers={"Retry-After": "60"}
                    )
                self.clients[client_ip] = (window_start, count + 1)
            else:
                self.clients[client_ip] = (current_time, 1)
        else:
            self.clients[client_ip] = (current_time, 1)

        return await call_next(request)
