# Spec.md — {{PROJECT_NAME}}/EntryPoint

*Responsibility: Parse the command line, wire all library components together,
and drive execution.  Does not re-state the details of its dependencies.*

---

## Inputs

- `argc`, `argv` from the OS

## Flow

1. Parse the command line.
2. If no arguments or `-h`: print help and exit 0.
3. Configure each library component with values from the command line.
4. Wire callbacks / interfaces between components.
5. Run the top-level operation.
6. Print a summary and exit 0 on success, 1 on failure.

<!-- INPUT NEEDED: Fill in the project-specific flow between steps 3-5. -->

## Error Handling

- Invalid command-line values: print a clear message and exit 1.
- Operational errors: propagate from library components; report and exit 1.

---

*End of Spec.md*
