## Prompt

When given the command "fix_all in file [path]", proceed through all steps without asking for approval or confirmation for any tool use, file reads, or edits:

1. Read `fix_text_block.md` from the same directory as this file.
2. Read the specified file.
3. Apply the `fix_text_block.md` instructions to the specified file. Write the result back.
4. Read `fix_image.md` from the same directory as this file.
5. Apply the `fix_image.md` instructions to the same file. Write the result back.
6. Discard all instructions from `fix_text_block.md` and `fix_image.md` — do not carry them forward.
7. Read `fix_voice.md` from the same directory as this file.
8. Apply the `fix_voice.md` instructions to the same file. Write the result back.
9. Read `fix_defn_styles.md` from the same directory as this file.
10. Apply the `fix_defn_styles.md` instructions to the same file. Write the result back.