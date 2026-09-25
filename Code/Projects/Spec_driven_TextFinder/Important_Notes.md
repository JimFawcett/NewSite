# Important Notes

Open questions and deferred decisions for `Spec_driven_TextFinder/` and its children. Each entry names something a reader of the specifications would otherwise have to rediscover: a case no document settles, a rule one implementation has outrun, or a change that has landed in [Spec_TextFinder.md](Spec_TextFinder.md) and not yet in every implementation.

This file is not a specification. Nothing here authorizes code, and [Constitution.md](Constitution.md) rule 1 is unaffected by it: a `Spec*.md` or `*Structure.md` remains the only source code may derive from. An entry here is a record that something needs settling, and where the settling would go.

**Why deferred rather than fixed.** Three of the entries below describe rules that would be right to fix at the project level and that would then oblige four implementations to change together. Four working implementations are worth more than four consistent ones that are each mid-edit, so these are recorded and left. Each entry states what the rule would be, so that a later pass has the decision already made and only the code to write.

---

## N1 — A root path with a trailing separator is unspecified

**Status:** open. **Affects:** §3.4. **Found:** 2026-09-24, while reviewing the Python thread.

§3.4 builds `<path>` from the root path's own text followed by the entry names descended through, joined with `/`. Applied literally to a root the user typed with a trailing separator, it doubles that separator:

    -P src/     ->  src//foo.py
    -P src\     ->  src//foo.py   (on Windows, after §3.4's \-to-/ normalization)

No sentence in §3.4 addresses this, so each implementation invents a rule or emits the doubled separator. The Python implementation invents one — see N3 — and the other three have not been checked.

**The rule this should become.** A root path's text contributes no trailing separator to `<path>`: one separator is written between the root and the first entry name, whatever the root's text ends with. Stated in §3.4 beside the `.` exemption it resembles, since both are cases where the root's text as typed is not the text emitted.

**Why it matters.** `<path>` is stdout, and §6 compares stdout byte for byte. Two implementations that guess differently here disagree on every line of a run whose root the user happened to type with a trailing slash — which is most of them, given shell tab-completion appends one.

---

## N2 — §3.6 does not settle a directory whose name will not render

**Status:** open. **Affects:** §3.6. **Found:** 2026-09-24, while writing the Python specifications.

§3.6 gives two rules that a directory bearing an unrenderable name satisfies at once:

- among the entries that are **not** counted, "one whose name will not render, which §3.4 announces whatever /p holds" — written of files;
- and "A directory that drew a `cannot open` announcement is counted, because the attempt was made and these are counts of work attempted rather than of work that succeeded."

A directory whose name will not render draws `cannot open` under §3.4 and is never entered, so the first rule says not counted and the second says counted.

**The reading the Python implementation takes**, recorded in [Spec_Python_TextFinder_Dirnav.md](Python_Spec_driven_TextFinder/Python_Spec_driven_Dirnav/Spec_Python_TextFinder_Dirnav.md) §8.1: **not counted**. §3.6's primary rule counts a directory "when TextFinder reads its entries or tries to," and this one is refused before the attempt, exactly as a pruned directory is. The clause about an announced directory governs one whose enumeration was attempted and failed.

**Why it has not surfaced.** It cannot arise in C#, where the runtime substitutes U+FFFD before the library sees the name and the entry becomes unopenable rather than unrenderable. It arises on POSIX in C++, Rust, and Python. So the first symptom will be a run-summary count that differs between C# and the other three on Linux and agrees everywhere on Windows — which is a hard shape of bug to read backwards.

**What to do.** Fix the reading in §3.6 in one clause, then check C++ and Rust against it. The Python implementation already behaves as above.

---

## N3 — The Python implementation outruns §3.4 on the trailing separator

**Status:** open, and a [Constitution.md](Constitution.md) rule 1 matter. **Affects:** the Python implementation. **Found:** 2026-09-24.

`_join` in `python_textfinder_dirnav` carries this branch:

```python
if parent.endswith("/"):
    return parent + name
```

§3.4 authorizes the `parent == "."` branch beside it and authorizes the `/` join. Nothing authorizes suppressing a doubled separator. Rule 1 requires the document to change first, and the document that would change is [Spec_TextFinder.md](Spec_TextFinder.md) §3.4 — see N1 — which is deferred.

The branch is left in place deliberately rather than removed: removing it would make the Python implementation emit `src//foo.py`, which no document asks for either, and would trade an unauthorized rule for an unwanted output. It is recorded here so that the next reader finds a known gap rather than an unexplained line, and so that settling N1 closes this entry with it.

---

## N4 — §5's /p normalization gained a second trim

**Status:** **closed** — landed in [Spec_TextFinder.md](Spec_TextFinder.md) and implemented in all four. **Affects:** §5, and the Cmdline component of all four implementations. **Changed:** 2026-09-24. **Closed:** 2026-09-24.

§5 previously normalized a `/p` item by trimming it and then stripping one leading dot. That order can leave whitespace inside the result: `". cpp"` normalized to `" cpp"`, an extension no file can carry, which then put a second space into the §5.3 listing line that §5.3 otherwise keeps free of stray whitespace.

§5 now reads: trim, strip one leading dot if present, **trim again**. `". cpp"` normalizes to `"cpp"`.

**Carried into the three remaining threads on 2026-09-24**, Rust first while reviewing that thread for idiom and code smells, then C++ and C# together. Each took the same three edits, specification ahead of code per [Constitution.md](Constitution.md) rule 1: §7 of its `Spec_*_Cmdline.md` gained the second trim in its normalization sequence and a paragraph saying why it is not redundant; its normalizer gained a second trim between the dot strip and the empties test, calling the same trim the first one calls so the six characters keep one definition; and its unit suite gained a case pairing a dot with whitespace, asserting both the normalized value and the §5.3 listing line.

That test was the gap in every thread. Each suite already held a trim case and a dot case, and each missed this by one variable — one exercising whitespace with no dot, the other a dot with no whitespace — which is how three implementations reached a passing suite with the rule unimplemented.

**Verified across all four.** `/p ". cs, .<tab>txt" /v true` now yields the listing line `/p cs, txt` from every one of the four binaries. The unit suites pass whole: Rust 90, C++ 100 over three suites, C# 118 over three suites.

---

## N5 — The shared fixture is wired into Python only

**Status:** open. **Affects:** §6.2 and the integration suite of each implementation. **Added:** 2026-09-24.

[Fixture/](Fixture/) holds one canonical tree, a set of command lines, and the stdout and exit code each is required to produce. §6.2 describes it. Its purpose is to give the four implementations one artifact to agree with, in place of agreeing with each other — a shared misreading of §3 through §5 is invisible when the only check is one implementation against another, and a disagreement between two gives no evidence about which is wrong.

The Python integration suite drives it. The C++, Rust, and C# suites do not yet. Until they do, the fixture is a regression check for one implementation rather than the cross-implementation check it exists to be.

The expected outputs were captured from the Python implementation and reviewed against §3 through §5 rather than derived independently, which [Fixture/Fixture.md](Fixture/Fixture.md) states plainly. That makes them weaker evidence than a hand-written artifact would be, and stronger than no artifact: a second implementation run against them either agrees, or finds a defect in one of the two.
