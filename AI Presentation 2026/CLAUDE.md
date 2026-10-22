# CLAUDE.md — AI Presentation 2026

Guidance for generating prose and pages in this folder.

## Audience

Readers are mostly post-graduates — MS and PhD — in non-STEM programs. They read and write
at a high level, but they do not program and do not share an engineering vocabulary.

Consequences for the writing:

- Define a technical term the first time it appears, in one sentence, then use it freely.
- Replace jargon when a plain word carries the same meaning. Keep the jargon when it is the
  term the reader will meet elsewhere, and define it.
- Explain scale with a comparison the reader already has. A figure alone does not land.
- Assume no familiarity with code, build tools, or system architecture. Where a mechanism
  matters, describe what it does, not how it is implemented.
- Do not condescend. The reader is an expert in another field and will notice.

The tone rules below apply unchanged, except that the reference audience they assume
(experienced software engineers) is replaced by the one described here.

---

# Text_Tone

Rules for generating prose on this site. [Introduction.html](Introduction.html) is the reference. Match the voice it shows, with the adjustments in Section 2.

## 1. What to take from the reference

Use the styles, JavaScript, and page structure from [Introduction.html](Introduction.html).

## 2. Adjustments to the reference

Four rules override what the example does.

**Prefer active voice.** Name the actor. The example writes "all seven options are printed"; write "the verbose block prints all seven options". Passive is acceptable when the actor is unknown or genuinely irrelevant, which is rare in code description.

**Drop hyperbole.** No "powerful", "seamless", "elegant", "dramatically", "vastly". The example calls one idiom "nice", which is near the ceiling. Prefer stating what the code does and letting the reader judge.

**Minimize adjectives.** Cut any adjective that survives deletion without loss. "A small adapter that adapts one API to the other" carries its weight because size is the point. "A robust, flexible, modern parser" carries none.

**No em dashes outside Markdown.** In HTML pages, source files, code comments, and scripts, use a hyphen with spaces around it for an aside: `like this - an aside - continuing`. A comma, a colon, or a second sentence also works. Markdown files may use em dashes.

## 3. Sentence shape

Write declarative sentences in present tense. One idea per sentence.

Use a colon to introduce an enumeration: "the presentation moves in one direction: what the models do, what they cost, who pays, and what breaks."

Keep the subject concrete. Prefer "the training run consumes the power" over "power is consumed during training". Prefer a named actor over "the system" or "the industry".

Avoid these openings, which delay the subject:
- "It is important to note that ..."
- "There are several ways to ..."
- "One of the key aspects of ... is that ..."

## 4. Naming sources in prose

Wrap filenames, model names, and literal output in `<code>` or backticks. Spell them exactly as they appear in the source, including case.

Name a file the first time you discuss it: "`Anthropic_Financials_2021-2025.pdf`". Use the short form afterward.

When a figure or claim comes from one of the source documents, cite it: "per `DataCenters_8.4_Geographic_Distribution.pdf`". A reader who disagrees needs to know where to argue.

## 5. Structure

Number sections and subsections. The example uses `5.`, `5.1`, `5.2`, `5.3`, and each heading carries an anchor for the section menu.

Use an unordered list for independent points and an ordered list for a sequence.

Put the source last. Prose explains what to look for, then the reader looks.

## 6. Before and after

| Instead of | Write |
|------------|-------|
| A powerful and flexible language model is provided. | The model answers in plain language and cites nothing unless you ask it to. |
| It should be noted that errors are handled gracefully. | When the model does not know an answer it often supplies a fluent wrong one. Nothing in the output marks the difference. |
| Training costs have grown dramatically. | Training spend rose from tens of millions to billions of dollars between 2020 and 2025. |
| Several deployment options can be configured by the user. | Six deployment patterns appear in practice. Session 2 lists them. |
| This elegant solution leverages a modern infrastructure stack. | The request runs in a data center sited for power, not for proximity to the user. |

## 7. Checklist

Before publishing generated prose, confirm:

1. Most sentences name their actor.
2. No em dashes appear outside Markdown.
3. Each adjective earns its place.
4. Counts are given as numbers.
5. Identifiers match the source exactly.
6. Claims about behavior cite the specification or the code.
7. Nothing is described as powerful, seamless, robust, or elegant.
8. Every technical term is defined at first use.
