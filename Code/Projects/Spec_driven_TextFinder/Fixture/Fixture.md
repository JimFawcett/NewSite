# Fixture — the shared conformance artifact

One tree, one list of command lines, and the stdout and exit code each of them is required to produce. [Spec_TextFinder.md](../Spec_TextFinder.md) §6.2 describes what this is for; this document describes what is in it and how a suite drives it.

## Why it exists

§6 makes the four implementations comparable to one another. That catches a difference and gives no evidence about which side is wrong, and it cannot catch anything at all when two implementations share a misreading — which is the likely failure, since the later implementations are written from documents the earlier ones shaped. A committed artifact turns "the four agree" into "the four agree with something", and a disagreement then points at one implementation rather than at a pair.

It also pins behavior that the prose fixes but no implementation would otherwise be tested on. Three cases below exist only because a review found the rule unsettled or unstated: `help-outranks-bad-regex` and `help-outranks-verbose` hold §5.4's resolution order, and `skip-list-never-prunes-a-root` holds the §3.2 exemption that is one sentence of prose and easy to lose.

## What it is not

It does not fix stderr. §2 and §5.2 leave every implementation its own wording there, and §6 already scopes its guarantee to stdout and the exit code, so a case that exits 1 records what stdout held and what the process returned and says nothing about the text that explained it.

It does not fix emission order across directory entries. §3.2 leaves a directory's entries in the order the platform's own enumeration yields them, and §6 records that the total order is reproducible only over the same tree on the same platform and filesystem. The comparison rule below is what keeps that from making the artifact platform-specific.

## The tree

`tree/` holds eleven files chosen so that each admission and selection rule of §3.2, §3.3, and §5 is reached by at least one of them.

| Path | Bytes | What it is there for |
|---|---|---|
| `tree/alpha.txt` | 17 | three LF-terminated lines; the ordinary case |
| `tree/crlf.txt` | 10 | CRLF terminators — one terminator, not two, and no CR left on the line text |
| `tree/cr.md` | 7 | a bare CR terminator and a final line with no terminator at all |
| `tree/empty.txt` | 0 | zero size: counted by §3.6, no block and no announcement under the no-content case |
| `tree/bom.txt` | 14 | a leading UTF-8 BOM that must not belong to the first line |
| `tree/binary.bin` | 3 | a NUL byte: §3.3's binary test |
| `tree/invalid.txt` | 8 | invalid UTF-8 with no NUL, so only the UTF-8 test rejects it |
| `tree/.gitignore` | 71 | a dot-file, whose extension §5 fixes as `gitignore` |
| `tree/noext` | 6 | no extension at all |
| `tree/sub/deep.txt` | 6 | one level down, for `/s` |
| `tree/build/pruned.txt` | 6 | under a default skip-list name, for pruning and for the root exemption |

`tree/.gitignore` holds a comment rather than a pattern. It is a real `.gitignore` to git, so its content is kept inert on purpose; nothing about the case it serves depends on what is in it.

`.gitattributes` in this folder sets `* -text`, which stops git normalizing line endings anywhere beneath it. Without it a checkout on Windows would rewrite `crlf.txt` and `cr.md`, and `alpha.txt` with them, and three cases would fail for a reason that has nothing to do with the implementation under test.

## The cases

`cases.txt` holds one case per line: `name | mode | exit | arguments`. Blank lines and lines beginning with `#` are skipped. Arguments are separated by single spaces, and no case needs an argument holding a space, a comma, or the empty string, so a runner splits on space and needs no quote handling in any of the four languages.

A runner sets its working directory to this folder, runs the implementation's executable with the case's arguments, and checks two things:

- **the exit code** equals the case's third field, exactly;
- **stdout** equals `expected/<name>.txt`, compared per the case's mode.

`mode` is one of two:

- **`ordered`** — stdout must equal the expected bytes exactly. Used where the output has only one possible order: a root that is a single file, a listing, the help text, or an empty stdout.
- **`unordered`** — the lines of stdout, sorted, must equal the expected file, which is stored sorted. Used where the output spans a directory whose entry order §3.2 leaves to the platform. A runner additionally checks that the **last line emitted**, before sorting, is the run summary, since §3.6 fixes that and sorting would otherwise hide it.

stdout is compared as bytes, not as decoded text, so a CR that a runtime inserted is a failure rather than something a line-based comparison would absorb. Every expected file is LF-terminated throughout.

## Provenance, stated rather than implied

The expected files were captured from the Python implementation on 2026-09-24 and then read against §3 through §5 case by case — the counts, the block forms, the announcement gating, and the exit codes each checked against the sentence that fixes them. They were not derived independently of an implementation, and this is the honest limit of what they are worth: a case where the Python implementation and the specification disagree in the same direction as the reviewer would have been committed as correct.

They are still worth more than no artifact. A second implementation run against them either agrees, or finds a defect — and the defect is then in one of two named places rather than somewhere in a pair of implementations that merely differ.

If a case here is ever found to contradict [Spec_TextFinder.md](../Spec_TextFinder.md), the specification wins and the expected file is regenerated. That is [Constitution.md](../Constitution.md) rule 1 applied to this folder: these files are captured output, not a source of truth, and nothing may be derived from them.

## Status

The Python integration suite drives every case here. The C++, Rust, and C# suites do not yet, which [Important_Notes.md](../Important_Notes.md) N5 records.
