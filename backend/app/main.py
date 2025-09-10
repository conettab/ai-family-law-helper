from fastapi import FastAPI

app = FastAPI()

@app.get("/conversations")
async def read_conversations():
    # Placeholder for fetching conversations
    return [{"id": 1, "title": "Sample Conversation"}]

@app.get("/conversations/{id}")
async def get_messages(conversation_id: int):
    # Placeholder for fetching messages in a conversation
    return [{"text": "Hello", "sender": "user"}, {"text": "Hi there!", "sender": "assistant"}]

@app.post("/ask")
async def ask_question(question: str, conversation_id: int = None):
    # Placeholder for processing a question and returning an answer
    return {"answer": "This is a placeholder answer."}

