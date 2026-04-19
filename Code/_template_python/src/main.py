import sys
from .part1 import Part1


def main() -> None:
    args = sys.argv[1:]
    if not args:
        print("Usage: {{project_name}} [options]")
        return

    # TODO: wire components and drive execution
    _p = Part1()


if __name__ == "__main__":
    main()
