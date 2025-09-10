from typing import Optional
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware( # I hate dealing with CORS issues
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/conversations")
async def read_conversations():
    # Placeholder for fetching conversations
    return [{"id": 1, "title": "Sample Conversation"}, {"id": 2, "title": "Sample Conversation 2"}]

@app.get("/conversations/{id}")
async def get_messages(conversation_id: int):
    # Placeholder for fetching messages in a conversation
    return [{"text": "Hello", "sender": "user"}, {"text": "Hi there!", "sender": "assistant"}]

class AskRequest(BaseModel):
    question: str
    conversation_id: Optional[int] = None

@app.post("/ask")
async def ask_question(request: AskRequest):
    # Placeholder for processing a question and returning an answer
    return {"answer": f"This is a placeholder answer for: {request.question}"}

