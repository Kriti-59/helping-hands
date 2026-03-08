from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, requests, volunteers, organizations, matches

app = FastAPI(title="Helping Hands API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(requests.router)
app.include_router(volunteers.router)
app.include_router(organizations.router)
app.include_router(matches.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Helping Hands API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}