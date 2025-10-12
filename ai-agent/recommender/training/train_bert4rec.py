from pathlib import Path

import torch
from recbole.quick_start import run_recbole


if __name__ == "__main__":
    if hasattr(torch.serialization, "_default_to_weights_only"):
        torch.serialization._default_to_weights_only = (
            lambda pickle_module=None: False  # disable weights_only for RecBole checkpoints
        )
    project_root = Path(__file__).resolve().parents[1]
    run_recbole(
        model="BERT4Rec",
        config_file_list=[str(project_root / "configs" / "bert4rec.yaml")],
        config_dict={
            "data_path": str(project_root / "dataset"),
        },
    )
