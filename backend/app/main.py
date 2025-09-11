from typing import Optional
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import os
import asyncpg

app = FastAPI()

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

OPENAI_KEY = os.getenv("API_KEY")

aiClient = OpenAI(api_key=OPENAI_KEY)

async def connect_db():
    return await asyncpg.connect(DATABASE_URL, ssl="require")
app.add_middleware( # I hate dealing with CORS issues
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
    # Placeholder for fetching messages in a conversation
    return [{"text": f"Hello{id}", "sender": "user"}, {"text": "Hi there!", "sender": "assistant"}]

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
            response = aiClient.responses.create(
                model="gpt-3.5-turbo",
                input=request.question
            )

            if response and response.output:
                answer_text = response.output[0].content[0].text
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


