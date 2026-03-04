# Markdown Quick Reference

## Headings
```
# H1      ## H2      ### H3      #### H4
```

## Emphasis
```
*italic*   **bold**   ***bold italic***   ~~strikethrough~~
```

## Lists
```
- unordered       1. ordered
- item            2. item
  - nested           - nested (indent 2 spaces)
```

## Links & Images
```
[link text](https://url.com)
![alt text](image.png)
[link text][ref]   then elsewhere:  [ref]: https://url.com
```

## Code
```
`inline code`

    indented block (4 spaces)

```python
fenced block (triple backticks, optional language)
```
```

## Blockquotes
```
> quoted text
> > nested quote
```

## Tables
```
| Header | Header |
|--------|--------|
| cell   | cell   |
| cell   | cell   |
```
Column alignment: `|:---|` left, `|:---:|` center, `|---:|` right

## Horizontal Rule
```
---   or   ***   or   ___
```

## Task Lists
```
- [x] completed
- [ ] incomplete
```

## Footnotes
```
Text with footnote.[^1]
[^1]: Footnote text here.
```

## Escaping
Prefix with `\` to escape: `\*  \#  \[  \]  \`  \-  \.  \!`

## Line Breaks
End a line with two spaces for a `<br>`, or leave a blank line for a new paragraph.

---
*Rendering varies slightly between GitHub, Obsidian, VS Code, and other tools.*
