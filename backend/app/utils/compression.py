"""
Compression helpers – zlib-based, for optional large-record payload compression.
"""

import zlib
import json
from typing import Any


def compress_payload(data: Any) -> bytes:
    """Serialize to JSON then compress with zlib."""
    raw = json.dumps(data, default=str).encode("utf-8")
    return zlib.compress(raw)


def decompress_payload(blob: bytes) -> Any:
    """Decompress zlib blob and deserialize from JSON."""
    raw = zlib.decompress(blob)
    return json.loads(raw.decode("utf-8"))
