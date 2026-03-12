import httpx
from sqlalchemy.orm import Session
from app.models.user import User
from app.utils.jwt import create_access_token
from app.config import settings

GOOGLE_TOKEN_URL  = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

async def exchange_code_for_user(code: str, db: Session) -> dict:
    async with httpx.AsyncClient() as client:
        # Exchange auth code for tokens
        token_res = await client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        token_data = token_res.json()

        # Fetch user info from Google
        user_res = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {token_data['access_token']}"}
        )
        google_user = user_res.json()

    # Upsert user in DB
    user = db.query(User).filter(User.email == google_user["email"]).first()
    if not user:
        user = User(
            email=google_user["email"],
            full_name=google_user.get("name"),
            google_id=google_user["id"],
            avatar_url=google_user.get("picture"),
            auth_provider="google",
            is_verified=True,  # Google already verified the email
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.google_id:
        # Link Google to existing account
        user.google_id = google_user["id"]
        user.avatar_url = google_user.get("picture")
        user.auth_provider = "google"
        user.is_verified = True
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}
