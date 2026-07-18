from langchain_ollama import OllamaLLM
from config import PIPELINE

OLLAMA_BASE = "http://localhost:11434"


def create_llm(model: str, temperature: float | None = None) -> OllamaLLM:
    if temperature is None:
        temperature = PIPELINE.temperature
    return OllamaLLM(model=model, base_url=OLLAMA_BASE, temperature=temperature)


def create_streaming_llm(model: str, temperature: float | None = None) -> OllamaLLM:
    return create_llm(model, temperature=temperature)
