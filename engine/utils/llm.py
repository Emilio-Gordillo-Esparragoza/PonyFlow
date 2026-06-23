from langchain_ollama import OllamaLLM

OLLAMA_BASE = "http://localhost:11434"


def create_llm(model: str, temperature: float = 0.0) -> OllamaLLM:
    return OllamaLLM(model=model, base_url=OLLAMA_BASE, temperature=temperature)


def create_streaming_llm(model: str, temperature: float = 0.0) -> OllamaLLM:
    return OllamaLLM(model=model, base_url=OLLAMA_BASE, temperature=temperature)
