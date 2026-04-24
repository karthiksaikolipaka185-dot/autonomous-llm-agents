import os
import numpy as np
import faiss
import google.generativeai as genai
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

# ==========================================
# SETUP & CONFIGURATION
# ==========================================
# Load environment variables from .env file (Expected to have GEMINI_API_KEY)
load_dotenv()

# Configure the Gemini API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("WARNING: GEMINI_API_KEY not found in environment variables. Please check your .env file.")
genai.configure(api_key=api_key)

# Initialize the Gemini model
# We use gemini-1.5-flash as it's fast and suitable for demo purposes
model = genai.GenerativeModel('gemini-1.5-flash') 


# ==========================================
# PHASE 1: DOCUMENT INGESTION PHASE
# ==========================================
print("Initializing Document Ingestion Phase...")

# 1. Load learning content (cheat sheets / formulas / concepts)
documents = [
    "sin θ = opposite / hypotenuse",
    "cos θ = adjacent / hypotenuse",
    "tan θ = opposite / adjacent",
    "sin 30 = 1/2",
    "cos 30 = √3/2",
    "tan 45 = 1",
    "Trigonometry studies relationships between angles and sides of triangles",
    "The Pythagorean identity is sin²θ + cos²θ = 1"
]

# 2. Convert each chunk into embeddings
# We use SentenceTransformer to convert text into numerical vectors that represent meaning
print("Downloading/Loading Embedding Model...")
embedder = SentenceTransformer('all-MiniLM-L6-v2')

print("Encoding documents into embeddings...")
document_embeddings = embedder.encode(documents)

# 3. Store embeddings in a vector database (FAISS)
embedding_dimension = document_embeddings.shape[1]

# Create a FAISS Index using L2 (Euclidean) distance for similarity search
vector_db = faiss.IndexFlatL2(embedding_dimension)

# Add the document embeddings to the vector database
vector_db.add(np.array(document_embeddings))
print("Vector database ready!")


# ==========================================
# BONUS COMMENTS (FOR VIVA / PRESENTATION)
# ==========================================
"""
📝 VIVA / PRESENTATION NOTES:

Q: Why might a normal LLM hallucinate?
A: A normal LLM answers based purely on the static data it was trained on. 
   It might forget specific exact values, mix up complicated concepts, or confidently 
   fabricate incorrect information when it lacks specific memory of the topic 
   (e.g. inventing a wrong formula for a specific math problem).

Q: Why does RAG improve accuracy?
A: RAG grounds the LLM in undeniable facts. Before asking the LLM to generate an answer, 
   we retrieve exactly the relevant data (from our trusted database) and inject it into 
   the prompt. This severely limits hallucinations because the LLM is instructed to 
   base its answers ONLY on the provided context.

Q: How does this apply to personalized learning apps?
A: In a real personalized learning app, the vector database would hold the student's 
   exact curriculum, past mistakes, or current chapter notes. When a student asks a doubt, 
   the RAG agent fetches the specific textbook's terminology and the exact methods taught 
   in class, acting as a bespoke tutor rather than a generic search engine.
"""


# ==========================================
# PART 1: NORMAL LLM TUTOR
# ==========================================
def normal_llm_tutor(question):
    """
    Directly sends the question to the LLM.
    No context. No retrieval.
    """
    prompt = f"You are a JEE Mathematics tutor. Answer the student's question clearly.\nQuestion: {question}"
    
    # Generate response
    response = model.generate_content(prompt)
    return response.text


# ==========================================
# PART 2: RAG + LLM TUTOR
# ==========================================
def rag_llm_tutor(question):
    """
    Implements Phase 2 (Query Processing) and Phase 3 (Generation).
    """
    # ------------------------------------------
    # PHASE 2: QUERY PROCESSING PHASE
    # ------------------------------------------
    # 1. Convert user query into an embedding using the exact same model
    question_embedding = embedder.encode([question])
    
    # 2. Perform similarity search using FAISS to get the top 2 relevant chunks
    k = 2  # Number of vectors to retrieve
    distances, indices = vector_db.search(np.array(question_embedding), k)
    
    # 3. Create augmented context from the retrieved chunks
    retrieved_chunks = [documents[i] for i in indices[0]]
    context = "\n".join(retrieved_chunks)
    
    # ------------------------------------------
    # PHASE 3: GENERATION PHASE
    # ------------------------------------------
    # 1. Send clearly formatted prompt to LLM with the context injected
    prompt = f"""You are a JEE Mathematics tutor.

Use the following context to answer the question:

Context:
{context}

Question:
{question}

Explain clearly in simple steps."""

    # Generate response
    response = model.generate_content(prompt)
    return response.text


# ==========================================
# PART 3: MAIN COMPARISON
# ==========================================
if __name__ == "__main__":
    test_question = "What is sin 30?"

    print("\n" + "="*60)
    print("🤖 NORMAL LLM TUTOR")
    print("="*60)
    try:
        print(normal_llm_tutor(test_question))
    except Exception as e:
        print(f"Error calling Normal LLM: {e}")

    print("\n" + "="*60)
    print("🧠 RAG + LLM TUTOR")
    print("="*60)
    try:
        print(rag_llm_tutor(test_question))
    except Exception as e:
        print(f"Error calling RAG Tutor: {e}")
