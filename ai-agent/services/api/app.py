import logging
import os
import re
from pathlib import Path
from typing import Dict, List, Optional

import pandas as pd
import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from recbole.config import Config
from recbole.data import create_dataset, data_preparation
from recbole.model.sequential_recommender import BERT4Rec

BASE_DIR = Path(__file__).resolve().parents[2]
RECOMMENDER_DIR = BASE_DIR / "recommender"
DEFAULT_MODEL_DIR = RECOMMENDER_DIR / "saved"
FALLBACK_MODEL_DIRS = [
    RECOMMENDER_DIR / "training" / "saved",
]
CONFIG_FILE = RECOMMENDER_DIR / "configs" / "bert4rec.yaml"
DATA_DIR = RECOMMENDER_DIR / "dataset"
RAW_DATA_DIR = BASE_DIR / "data" / "raw"

DEFAULT_MODEL_PATTERN = "BERT4Rec-*.pth"
DEFAULT_TOPK = int(os.environ.get("CHATBOT_TOPK", "5"))
RELOAD_TOKEN = os.environ.get("CHATBOT_RELOAD_TOKEN")


class RecommendationItem(BaseModel):
    item_id: int
    item_name: str
    score: Optional[float] = None


class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    top_k: Optional[int] = None


class ChatResponse(BaseModel):
    reply: str
    recommendations: Optional[List[RecommendationItem]] = None
    model_ready: bool = True


app = FastAPI(title="Second-hand Chatbot Service")
logger = logging.getLogger("ai_agent.service")

if not logging.getLogger().handlers:
    logging.basicConfig(level=logging.INFO)

ARTIFACTS: Dict[str, object] = {}
TORCH_INFERENCE_LOCK = torch.multiprocessing.Lock()
MODEL_READY = False
MODEL_STATUS = "initializing"


class ReloadRequest(BaseModel):
    token: Optional[str] = None


def resolve_checkpoint() -> Path:
    custom_path = os.environ.get("CHATBOT_MODEL_PATH")
    if custom_path:
        path = Path(custom_path)
        if not path.exists():
            raise FileNotFoundError(f"Chatbot model not found at {path}")
        return path

    model_dir_override = os.environ.get("CHATBOT_MODEL_DIR")
    search_dirs = []
    if model_dir_override:
        search_dirs.append(Path(model_dir_override))
    search_dirs.append(DEFAULT_MODEL_DIR)
    search_dirs.extend(FALLBACK_MODEL_DIRS)

    candidates: List[Path] = []
    for directory in search_dirs:
        if not directory.exists():
            continue
        matches = sorted(
            directory.glob(DEFAULT_MODEL_PATTERN),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )
        candidates.extend(matches)

    if not candidates:
        attempted = ", ".join(str(d) for d in search_dirs)
        raise FileNotFoundError(f"No model checkpoints matching {DEFAULT_MODEL_PATTERN} in [{attempted}]")

    return candidates[0]


def load_product_map() -> Dict[str, str]:
    possible_files = [
        DATA_DIR / "test" / "products.csv",
        DATA_DIR / "products.csv",
        RAW_DATA_DIR / "products.csv",
    ]

    for file_path in possible_files:
        if file_path.exists():
            df = pd.read_csv(file_path)
            df.columns = [c.strip().lower() for c in df.columns]
            if "item_id" in df.columns and "product_name" in df.columns:
                return dict(zip(df["item_id"].astype(str), df["product_name"].astype(str)))
            if "product_id" in df.columns and "name" in df.columns:
                return dict(zip(df["product_id"].astype(str), df["name"].astype(str)))
    return {}


def build_config() -> Config:
    config = Config(
        model="BERT4Rec",
        dataset="ecommerce",
        config_file_list=[str(CONFIG_FILE)],
    )
    config["data_path"] = str(DATA_DIR)
    preferred_dir = Path(os.environ.get("CHATBOT_MODEL_DIR") or DEFAULT_MODEL_DIR)
    if not preferred_dir.exists():
        fallback_existing = next((d for d in FALLBACK_MODEL_DIRS if d.exists()), None)
        if fallback_existing:
            preferred_dir = fallback_existing
    preferred_dir.mkdir(parents=True, exist_ok=True)
    config["checkpoint_dir"] = str(preferred_dir)
    config["device"] = "cpu"
    config["use_gpu"] = False
    return config


def load_artifacts():
    checkpoint_path = resolve_checkpoint()
    product_map = load_product_map()
    config = build_config()

    dataset = create_dataset(config)
    train_data, _, _ = data_preparation(config, dataset)

    model = BERT4Rec(config, train_data.dataset).to(config["device"])
    try:
        checkpoint = torch.load(
            checkpoint_path,
            map_location=torch.device(config["device"]),
            weights_only=False,
        )
    except TypeError:
        # For older torch versions that do not accept weights_only kwarg
        checkpoint = torch.load(
            checkpoint_path,
            map_location=torch.device(config["device"]),
        )
    state_dict = checkpoint["state_dict"] if isinstance(checkpoint, dict) and "state_dict" in checkpoint else checkpoint
    model.load_state_dict(state_dict)
    model.eval()

    uid_field = dataset.uid_field
    iid_field = dataset.iid_field

    return {
        "model": model,
        "config": config,
        "dataset": dataset,
        "uid_field": uid_field,
        "iid_field": iid_field,
        "product_map": product_map,
        "checkpoint_path": checkpoint_path,
    }


def refresh_artifacts() -> Dict[str, object]:
    global ARTIFACTS, MODEL_READY, MODEL_STATUS
    with TORCH_INFERENCE_LOCK:
        artifacts = load_artifacts()
        ARTIFACTS = artifacts
        MODEL_READY = True
        MODEL_STATUS = f"model_loaded:{artifacts.get('checkpoint_path')}"
    logger.info("Reloaded chatbot model from %s", ARTIFACTS.get("checkpoint_path"))
    return artifacts


@app.on_event("startup")
def startup_event():
    global ARTIFACTS, MODEL_READY, MODEL_STATUS
    if ARTIFACTS:
        return

    torch.set_num_threads(int(os.environ.get("CHATBOT_TORCH_THREADS", "1")))
    try:
        ARTIFACTS = load_artifacts()
        MODEL_READY = True
        MODEL_STATUS = f"model_loaded:{ARTIFACTS.get('checkpoint_path')}"
        logger.info("Loaded chatbot model from %s", ARTIFACTS.get("checkpoint_path"))
    except FileNotFoundError as exc:
        MODEL_READY = False
        MODEL_STATUS = str(exc)
        ARTIFACTS = {}
        logger.warning("Chatbot model checkpoint not found: %s", exc)
    except Exception as exc:
        MODEL_READY = False
        MODEL_STATUS = f"load_failed:{exc}"
        ARTIFACTS = {}
        logger.exception("Failed to load chatbot model")


@app.post("/internal/reload")
def reload_endpoint(request: ReloadRequest):
    if RELOAD_TOKEN and request.token != RELOAD_TOKEN:
        raise HTTPException(status_code=403, detail="Token không hợp lệ.")
    try:
        artifacts = refresh_artifacts()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("Reload chatbot thất bại")
        raise HTTPException(status_code=500, detail=f"Không thể reload: {exc}") from exc

    checkpoint = artifacts.get("checkpoint_path")
    dataset = artifacts.get("dataset")
    users = getattr(dataset, "user_num", None)
    items = getattr(dataset, "item_num", None)
    return {
        "status": "ok",
        "checkpoint": str(checkpoint) if checkpoint else None,
        "users": users,
        "items": items,
    }


def simple_reply(message: str) -> str:
    normalized = message.lower()
    presets = {
        "giao": "Đơn hàng của bạn thường được giao trong 1-3 ngày làm việc tùy khu vực.",
        "ship": "Phí vận chuyển miễn phí với đơn từ 2 triệu. Đơn nhỏ hơn có phí 50.000đ.",
        "bảo": "Mọi sản phẩm đều được bảo hành tối thiểu 3 tháng. Chi tiết vui lòng cung cấp mã đơn.",
        "order": "Bạn có thể theo dõi đơn tại trang Tài khoản > Đơn hàng hoặc cung cấp mã đơn để được hỗ trợ nhanh.",
        "thanh": "Hệ thống hiện hỗ trợ thanh toán tiền mặt, chuyển khoản và COD. Chọn phương thức tại bước đặt hàng nhé!",
    }

    for keyword, reply in presets.items():
        if keyword in normalized:
            return reply
    return "Cảm ơn bạn! Nhân viên sẽ liên hệ trong ít phút. Bạn có thể để lại số điện thoại hoặc mô tả chi tiết hơn nhé."


def looks_like_recommendation_request(message: str) -> bool:
    normalized = message.lower()
    keywords = ["gợi ý", "goi y", "recommend", "gợi ý sản phẩm", "suggest"]
    return any(keyword in normalized for keyword in keywords)


def extract_user_id_from_message(message: str) -> Optional[str]:
    match = re.search(r"user\s*(\w+)", message.lower())
    if match:
        return match.group(1)
    digits = re.findall(r"\d+", message)
    if digits:
        return digits[0]
    return None


def recommend_for_user(user_token: str, topk: int) -> List[RecommendationItem]:
    if not MODEL_READY or not ARTIFACTS:
        raise RuntimeError("Hệ thống gợi ý chưa sẵn sàng.")

    model: BERT4Rec = ARTIFACTS["model"]  # type: ignore[assignment]
    config: Config = ARTIFACTS["config"]  # type: ignore[assignment]
    dataset = ARTIFACTS["dataset"]  # type: ignore[assignment]
    uid_field = ARTIFACTS["uid_field"]  # type: ignore[assignment]
    iid_field = ARTIFACTS["iid_field"]  # type: ignore[assignment]
    product_map: Dict[str, str] = ARTIFACTS["product_map"]  # type: ignore[assignment]

    try:
        uid_internal = dataset.token2id(uid_field, [str(user_token)])[0]
    except KeyError as exc:
        raise ValueError(f"Không tìm thấy dữ liệu cho người dùng {user_token}.") from exc

    user_mask = dataset.inter_feat[uid_field] == uid_internal
    interacted_items = dataset.inter_feat[user_mask][iid_field].tolist()
    if not interacted_items:
        raise ValueError("Chưa có lịch sử để gợi ý sản phẩm.")

    try:
        max_len = int(config["MAX_ITEM_LIST_LENGTH"])
    except KeyError:
        max_len = int(config["seq_len"])
    seq = interacted_items[-max_len:]
    seq_tensor = torch.tensor([seq], device=model.device)
    seq_len_tensor = torch.tensor([len(seq)], device=model.device)
    uid_tensor = torch.tensor([uid_internal], device=model.device)

    with TORCH_INFERENCE_LOCK:
        with torch.no_grad():
            scores = model.full_sort_predict(
                {
                    "uid": uid_tensor,
                    "item_id_list": seq_tensor,
                    "item_length": seq_len_tensor,
                },
            )

    scores = scores.squeeze(0)
    top_values, top_indices = torch.topk(scores, k=min(topk * 3, scores.numel()))

    seen_items = set(interacted_items)
    recommendations: List[RecommendationItem] = []

    for score, item_internal in zip(top_values.tolist(), top_indices.tolist()):
        if item_internal in seen_items:
            continue
        item_token = dataset.id2token(iid_field, [item_internal])[0]
        item_token_str = str(item_token)
        item_name = product_map.get(item_token_str, f"Sản phẩm {item_token_str}")
        try:
            item_id = int(item_token_str)
        except ValueError:
            logger.warning("Item token %s không phải số nguyên, bỏ qua gợi ý này.", item_token_str)
            continue
        recommendations.append(
            RecommendationItem(
                item_id=item_id,
                item_name=item_name,
                score=round(float(score), 4),
            ),
        )
        if len(recommendations) >= topk:
            break

    if not recommendations:
        raise ValueError("Không tìm thấy sản phẩm phù hợp để gợi ý.")

    return recommendations


@app.get("/health")
def health_check():
    return {
        "status": "ok" if MODEL_READY else "degraded",
        "modelReady": MODEL_READY,
        "details": MODEL_STATUS,
    }


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Tin nhắn không được để trống.")

    wants_recommendation = looks_like_recommendation_request(message)
    user_token = request.user_id or extract_user_id_from_message(message)

    if wants_recommendation and not MODEL_READY:
        return ChatResponse(
            reply="Hệ thống gợi ý đang bảo trì. Vui lòng thử lại sau ít phút hoặc để lại thông tin để nhân viên hỗ trợ.",
            model_ready=False,
        )

    if wants_recommendation and not user_token:
        reply = (
            "Mình cần bạn đăng nhập hoặc cung cấp mã người dùng để gợi ý sản phẩm phù hợp nhé."
        )
        return ChatResponse(reply=reply, model_ready=MODEL_READY)

    if wants_recommendation and user_token:
        topk = request.top_k or DEFAULT_TOPK
        try:
            recommendations = recommend_for_user(user_token, topk)
        except RuntimeError:
            return ChatResponse(
                reply="Hệ thống gợi ý đang bảo trì. Bạn vui lòng thử lại sau nhé!",
                model_ready=False,
            )
        except ValueError as exc:
            return ChatResponse(reply=str(exc), model_ready=MODEL_READY)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Không thể gợi ý lúc này: {exc}") from exc

        lines = [
            f"Gợi ý dành cho bạn (User {user_token}):",
            *[
                f"{idx + 1}. {item.item_name} (ID: {item.item_id})"
                for idx, item in enumerate(recommendations)
            ],
        ]
        reply = "\n".join(lines)
        return ChatResponse(reply=reply, recommendations=recommendations, model_ready=True)

    reply = simple_reply(message)
    return ChatResponse(reply=reply, model_ready=MODEL_READY)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "service.app:app",
        host=os.environ.get("CHATBOT_HOST", "0.0.0.0"),
        port=int(os.environ.get("CHATBOT_PORT", "8008")),
        reload=bool(os.environ.get("CHATBOT_RELOAD")),
    )
