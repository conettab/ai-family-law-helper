from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from google import genai
import os
import asyncpg

# Load the env variables
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initalise clients
app = FastAPI()
aiClient = genai.Client()

async def connect_db():
    return await asyncpg.connect(DATABASE_URL, ssl="require")

# I hate dealing with CORS issues, just wildcard for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NewConversationRequest(BaseModel):
    title: str | None = None

@app.post("/newConversation")
async def create_conversation(request: NewConversationRequest):
    conn = await connect_db()
    try:
        conversation_id = await conn.fetchval("INSERT INTO conversations (title) VALUES ($1) RETURNING id",
                                              request.title
        )
        return {"conversation_id": conversation_id}
    finally:
        await conn.close()

@app.get("/conversations")
async def read_conversations():
    conn = await connect_db()
    try:
        rows = await conn.fetch("SELECT id, title FROM conversations")
        # Convert asyncpg Record objects to dict
        conversations = [dict(row) for row in rows]
        return conversations
    finally:
        await conn.close()

@app.get("/conversations/{id}")
async def get_messages(id: str):
    conn = await connect_db()
    try:
        rows = await conn.fetch("SELECT content, role FROM messages WHERE conversation_id = ($1) ORDER BY created_at ASC",
                                id)
        return [{"text": conversation["content"], "sender": conversation["role"]} for conversation in rows]
    finally:
        await conn.close()

class AskRequest(BaseModel):
    question: str
    conversation_id: str

@app.post("/ask")
async def ask_question(request: AskRequest):
    conn = await connect_db()
    answer_text = "Yes! I think you should sue!"  
    try:
        # Save user message
        await conn.execute(
            "INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)",
            request.conversation_id,
            "user",
            request.question
        )

        try:
            # Call OpenAI
            response = aiClient.models.generate_content(
              model="gemini-2.5-flash",
              contents=request.question,
            )


            if response:
                answer_text = response.text
            else:
                answer_text = "I'm sorry, I couldn't generate a response."
            
            print("OpenAI response:", response)

        except Exception as e:
            print("OpenAI error:", e)
            # Keep fallback `answer_text`

        # Save assistant response in DB
        await conn.execute(
            "INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)",
            request.conversation_id,
            "assistant",
            answer_text
        )

        return {"answer": answer_text}

    finally:
        await conn.close()


