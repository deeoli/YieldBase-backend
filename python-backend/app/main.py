from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.properties import router as properties_router
from .routes.health import router as health_router

app = FastAPI(title="YieldBase Backend (MVP)")

# CORS for local Next.js dev (3000/3001)
app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:3000", "http://localhost:3001"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# Routes
app.include_router(properties_router, prefix="/api")
app.include_router(health_router, prefix="/api") 


@app.get("/api/health")
def health():
    return {"status": "ok"}


