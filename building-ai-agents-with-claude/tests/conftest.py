import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROJECTS = ROOT / "projects"


def load(project, module):
    """Import projects/<project>/<module>.py as its own module (projects share file names)."""
    folder = PROJECTS / project
    sys.path.insert(0, str(folder))
    try:
        for name in ("watch", "store", "desk", "config", "tools", "brief"):
            sys.modules.pop(name, None)
        spec = importlib.util.spec_from_file_location(
            f"{project}_{module}", folder / f"{module}.py"
        )
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        return mod
    finally:
        sys.path.remove(str(folder))
