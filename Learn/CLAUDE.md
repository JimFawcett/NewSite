# Language Learning Tutorials

## Purpose
Tutorial content teaching programming languages, aimed at graduates from a 
technical college program without much experience with production software
development.
Each subfolder is a self-contained set of tutorials for one language.

## Structure
- One subfolder per language (Rust/, Cpp/, Python/, CSharp/, ...)
- Each tutorial subfolder should follow the same internal layout:
  src/, build/, examples/, exercises/, README.md walkthrough

## Tutorial conventions (apply to every language)
- Every concept gets a runnable example before any exercise
- Prefer small, focused examples over one large program
- Explain *why*, not just *how* — call out the design reasoning
- Include a "common mistakes" section per topic
- Target audience: graduates of technical college program without much real experience

## Cross-language themes to reuse
- Code examples all have one or more comments with a minimum of a title comment
- Memory model comparisons (stack/heap, ownership, GC)
- Concurrency primitives (threads, async, channels)
- Error handling philosophy
When a concept has a natural cross-language comparison, note it —
these become good bridge material between subfolders.

## Do NOT
- Don't use content from any folder above the Learn folder
- Don't assume prior knowledge of any other language in this repo
- Don't duplicate language-specific syntax rules here — that belongs
  in the subfolder's own CLAUDE.md
  
# Text style
  read ClaudeText.md
