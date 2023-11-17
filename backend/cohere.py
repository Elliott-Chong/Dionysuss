import cohere
import os
import dotenv

dotenv.load_dotenv()
co = cohere.Client(os.getenv("COHERE_API_KEY"))


def chat_cohere(chat_history, message, documents):
    response = co.chat(message=message, chat_history=chat_history, documents=documents)
    answer = response.text
    return answer
