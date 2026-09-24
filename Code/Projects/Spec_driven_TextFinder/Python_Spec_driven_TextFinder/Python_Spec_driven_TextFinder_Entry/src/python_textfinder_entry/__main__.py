# __main__.py - converts main's returned value into the process exit code

import sys

from .entry import main

sys.exit(main(sys.argv))
