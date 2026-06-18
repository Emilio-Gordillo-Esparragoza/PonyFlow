from langchain_core.language_models import BaseLLM
from langchain_community.llms import Ollama

OLLAMA_BASE = "http://localhost:11434"


def create_llm(
    model: str, temperature: float = 0.0, streaming: bool = False
) -> BaseLLM:
    return Ollama(
        model=model, base_url=OLLAMA_BASE, temperature=temperature, streaming=streaming
    )
