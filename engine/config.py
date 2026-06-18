from dataclasses import dataclass


@dataclass
class ModelConfig:
    planner: str = "mistral"
    coder: str = "llama3"
    tester: str = "phi3"
    reader: str = "mistral"


@dataclass
class PipelineConfig:
    max_iterations: int = 3
    temperature: float = 0.0
    timeout_seconds: int = 300


MODELS = ModelConfig()
PIPELINE = PipelineConfig()
