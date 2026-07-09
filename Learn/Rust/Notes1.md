# Notes1 - Suggested Beginner Topics After Hello

## Prompt

What topics do you suggest for beginners after Hello?

## Response

A natural six-step progression for this audience:

1. **Variables and Types** - `let`, mutability, integer/float/bool/char, type inference
2. **Functions** - parameters, return values, expressions vs. statements
3. **Control Flow** - `if`/`else`, `loop`, `while`, `for` over a range
4. **Ownership and Borrowing** - the core Rust concept; introduce it early before the borrow checker starts blocking them
5. **Structs** - grouping data, `impl` blocks, methods
6. **Enums and Match** - `Option`, `Result`, pattern matching

Ownership (#4) is the one to push earlier than most tutorials do - waiting until after collections means beginners hit confusing compiler errors with no mental model for why. A short, focused tutorial on the stack/heap distinction and move semantics right after they have basic syntax pays off immediately.
