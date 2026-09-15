# Text_Tone

Rules for generating prose on this site. [PageExample.html](../../PageExample.html) is the reference. Match the voice it shows, with the adjustments in Section 2.

Readers are experienced software engineers. Write for someone who has not seen this codebase before.

## 1. What to take from the reference

Use the styles, JavaScript, and page structure from [PageExample.html](../../PageExample.html).

Read `Page_Structure.md` before writing a page.

## 2. Adjustments to the reference

Four rules override what the example does.

**Prefer active voice.** Name the actor. The example writes "all seven options are printed"; write "the verbose block prints all seven options". Passive is acceptable when the actor is unknown or genuinely irrelevant, which is rare in code description.

**Drop hyperbole.** No "powerful", "seamless", "elegant", "dramatically", "vastly". The example calls one idiom "nice", which is near the ceiling. Prefer stating what the code does and letting the reader judge.

**Minimize adjectives.** Cut any adjective that survives deletion without loss. "A small adapter that adapts one API to the other" carries its weight because size is the point. "A robust, flexible, modern parser" carries none.

**No em dashes outside Markdown.** In HTML pages, source files, code comments, and scripts, use a hyphen with spaces around it for an aside: `like this - an aside - continuing`. A comma, a colon, or a second sentence also works. Markdown files may use em dashes.

## 3. Sentence shape

Write declarative sentences in present tense. One idea per sentence.

Use a colon to introduce an enumeration: "the design goal is to make the wiring itself readable: parse args, configure `Output`, configure `DirNav`, register two lambda callbacks, run the walk, print a summary."

Keep the subject concrete. Prefer "`CmdLine` parses argv" over "argv parsing is performed". Prefer a named component over "the system" or "the framework".

Avoid these openings, which delay the subject:
- "It is important to note that ..."
- "There are several ways to ..."
- "One of the key aspects of ... is that ..."

## 4. Naming code in prose

Wrap identifiers, filenames, switches, and literal output in `<code>` or backticks. Spell them exactly as they appear in the source, including case.

Name a file the first time you discuss it: "`EntryPoint/src/main.cpp`". Use the short form afterward.

When a rule comes from a specification, cite the section: "per Spec_TextFinder.md Section 3.4". A reader who disagrees needs to know where to argue.

## 5. Structure

Number sections and subsections. The example uses `5.`, `5.1`, `5.2`, `5.3`, and each heading carries an anchor for the section menu.

Use an unordered list for independent points and an ordered list for a sequence. The example uses `class="tight"` for both.

Put the source last. Prose explains what to look for, then the reader looks.

## 6. Before and after

| Instead of | Write |
|------------|-------|
| A powerful and flexible command-line parser is provided. | `CmdLine` parses argv and applies defaults. |
| It should be noted that errors are handled gracefully. | Every error path except traversal failure degrades silently and the walk continues. |
| The module system provides significant benefits. | CMake resolves build order from the imports. No forward declarations, no include-order concerns. |
| Several options can be configured by the user. | Seven switches control the search. Section 5 lists them. |
| This elegant solution leverages modern C++ idioms. | The `/p` line joins the pattern list with `std::views::join_with(',')`. |

## 7. Checklist

Before publishing generated prose, confirm:

1. Most sentences name their actor.
2. No em dashes appear outside Markdown.
3. Each adjective earns its place.
4. Counts are given as numbers.
5. Identifiers match the source exactly.
6. Claims about behavior cite the specification or the code.
7. Nothing is described as powerful, seamless, robust, or elegant.
