# demo.py - runs Python_TextFinder against this project's own tree and shows what it
# produces, per Spec_TextFinder.md §6.2 and the fixed invocation set of
# Page_Structure.md §7.1. It asserts nothing and fails nothing; its output moves as
# the tree changes, so a capture states the date it was taken.
#
# Run through run_demo.bat.

import datetime
import os
import subprocess
import sys

EXTENSIONS = "md, ixx, cpp, rs, cs, py"
SHOWN = 14

HERE = os.path.dirname(os.path.abspath(__file__))
IMPLEMENTATION = os.path.dirname(HERE)
PROJECT_ROOT = os.path.dirname(IMPLEMENTATION)
LAUNCHER = os.path.join(
    IMPLEMENTATION,
    "Python_TextFinder.bat" if os.name == "nt" else "Python_TextFinder")

CASES = [
    ((
        "No switch at all. The command line names no work, so Python_TextFinder lists",
        "the options a real invocation would start from and exits 0 (Spec_TextFinder.md §3.1).",
    ), []),
    ((
        "Default expression. The default /r of . with no /n or /L needs no file content,",
        "so each selected file is reported by its path line alone (Spec_TextFinder.md §3.3).",
    ), ["-P", ".", "-p", EXTENSIONS]),
    ((
        "The two-level block of §3.4: a path written once, then an indented detail line",
        "per match carrying the line number and the line's text.",
    ), ["-P", ".", "-p", EXTENSIONS, "-r", "too large", "-n", "true", "-L", "true"]),
    ((
        "The same search with /L false, leaving the line number alone on each detail line.",
    ), ["-P", ".", "-p", EXTENSIONS, "-r", "too large", "-n", "true"]),
    ((
        "Which documents cite the parent specification. Neither /n nor /L, so every block",
        "is its path line and no path is written twice.",
    ), ["-P", ".", "-p", EXTENSIONS, "-r", r"Spec_TextFinder\.md"]),
    ((
        "The same search one level deep, /s false entering no subdirectory.",
    ), ["-P", ".", "-p", EXTENSIONS, "-r", r"Spec_TextFinder\.md", "-s", "false"]),
    ((
        "/h false adds a line for each file that matched nothing - the files case 5 left",
        "silent - alongside the resolved option set from /v true.",
    ), ["-P", ".", "-p", EXTENSIONS, "-r", r"Spec_TextFinder\.md",
        "-h", "false", "-v", "true"]),
    ((
        "Two roots, traversed in the order /P gave them. Each path begins with the root",
        "whose subtree holds it, and the skip list prunes __pycache__ beneath both.",
    ), ["-P", "Python_Spec_driven_TextFinder/Python_Spec_driven_Cmdline",
        "-P", "Python_Spec_driven_TextFinder/Python_Spec_driven_Output",
        "-p", "py", "-r", "^def ", "-n", "true", "-L", "true"]),
    ((
        "A root path that cannot be opened is announced and the run still exits 0, while",
        "an error announcement ignores /h true.",
    ), ["-P", "no_such_directory",
        "-P", "Python_Spec_driven_TextFinder/Python_TextFinder_Structure.md",
        "-r", "import"]),
    ((
        "A malformed expression. §5.2 puts the option listing on stdout first, so the /r",
        "line shows what failed, then the diagnostic on stderr, and the exit code is 1.",
    ), ["-P", ".", "-p", EXTENSIONS, "-r", "def ("]),
    ((
        "The help text of §5.1, written to stdout under /H, traversing nothing.",
    ), ["/H", "true"]),
]


def emit(text=""):
    sys.stdout.write(text + "\n")


# The local date when run_demo.bat supplies it, the UTC civil date otherwise, so that
# a capture dates itself however the demonstration was started.
def today():
    supplied = os.environ.get("TEXTFINDER_DEMO_DATE")
    if supplied:
        return supplied
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")


def forward(path):
    return path.replace("\\", "/")


# Restores the quotes the shell removed, so the echoed command line can be retyped.
def quoted(argument):
    if " " in argument or "," in argument:
        return '"' + argument + '"'
    return argument


def case(number, note, arguments):
    indent = " " * (len(str(number)) + 2)
    emit(f"{number}. " + ("\n" + indent).join(note))
    emit(("  $ Python_TextFinder " + " ".join(quoted(a) for a in arguments)).rstrip())
    emit()

    completed = subprocess.run([LAUNCHER, *arguments], capture_output=True,
                               cwd=PROJECT_ROOT, env=os.environ.copy())
    stdout = completed.stdout.decode("utf-8")
    stderr = completed.stderr.decode("utf-8")

    lines = stdout.rstrip("\n").split("\n") if stdout else []
    emitted = len(lines)
    if stderr:
        lines += ["[stderr] " + line for line in stderr.rstrip("\n").split("\n")]

    for line in lines[:SHOWN]:
        emit("" if not line else "      " + line)

    if len(lines) > SHOWN:
        emit(f"      ... {len(lines) - SHOWN} more")

        # Page_Structure.md §7.2 part 4: the run summary is the last line a traversing
        # run writes, so the excerpt above never reaches it. Show it rather than withhold it.
        if emitted > SHOWN and lines[emitted - 1].startswith("accessed "):
            emit("      " + lines[emitted - 1])

    emit()
    emit(f"  {emitted} line(s), exit {completed.returncode}")
    emit()


def main():
    # the driver's own stream, not the sink under test: a capture holds UTF-8 whatever
    # the console code page, and § reaches a redirected file unchanged
    sys.stdout.reconfigure(encoding="utf-8")

    emit()
    emit("Python_TextFinder demonstration")
    emit("  date:       " + today())
    emit("  executable: " + forward(LAUNCHER))
    emit("  root:       " + forward(PROJECT_ROOT))
    emit('  extensions: "' + EXTENSIONS + '"')
    emit()

    for number, (note, arguments) in enumerate(CASES, 1):
        case(number, note, arguments)

    emit("demonstration complete")
    return 0


if __name__ == "__main__":
    sys.exit(main())
