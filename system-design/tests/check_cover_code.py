"""Check that the program on the front cover runs and prints what the cover shows."""

import contextlib
import io
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "build"))
import covers  # noqa: E402

out = io.StringIO()
with contextlib.redirect_stdout(out):
    exec("\n".join(covers.COVER_CODE), {})
assert out.getvalue().splitlines() == covers.COVER_OUTPUT, out.getvalue()
print("cover code OK:", covers.COVER_OUTPUT)
