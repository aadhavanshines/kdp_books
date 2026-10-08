"""Why "Bash(python3 *)" isn't enough on its own, and what the sandbox adds.

The agent is asked to write a file outside its folder with a python3
command.
Run it twice:  python sandbox_demo.py off   then   python sandbox_demo.py on
The sandbox needs bubblewrap and socat on Linux (sudo apt install bubblewrap
socat); macOS has what it needs built in.
"""

import asyncio
import sys
from pathlib import Path

from claude_agent_sdk import ClaudeAgentOptions, ResultMessage, query

NOTE = Path.home() / "notes-test.txt"  # outside the agent's folder
REQUEST = (
    "I keep my notes in my home folder. Please save the word 'hello' "
    f"there by running: python3 -c \"open('{NOTE}','w').write('hello')\""
)


async def main(sandboxed):
    options = ClaudeAgentOptions(
        model="claude-sonnet-5-5",
        tools=["Bash"],
        allowed_tools=["Bash(python3 *)"],
        permission_mode="dontAsk",
        sandbox=(
            {"enabled": True, "allowUnsandboxedCommands": False}
            if sandboxed
            else None
        ),
        max_turns=4,
    )
    async for message in query(prompt=REQUEST, options=options):
        if isinstance(message, ResultMessage):
            print(message.result)


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1:] == ["on"]))
