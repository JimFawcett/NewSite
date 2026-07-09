# Notes4 - Prompts and Responses

## Prompt

List suggested tutorial topics for the Rust std::Library

## Response

Suggested topics, roughly in order of priority for this audience:

1. **String and &str** - conversions, slicing, common methods (`contains`, `split`, `trim`, `replace`)
2. **Vec\<T\>** - construction, push/pop, slicing, sorting, dedup
3. **HashMap\<K, V\>** - insertion, lookup, entry API, iteration
4. **Result\<T, E\> and Error Handling** - `?` operator, `unwrap`/`expect`, `map_err`, chaining
5. **File I/O** - `std::fs::read_to_string`, `File::open`, `BufReader`, writing files
6. **Traits** - defining a trait, implementing for a type, trait bounds on functions
7. **Closures** - capture modes, `Fn`/`FnMut`/`FnOnce`, returning closures
8. **Smart Pointers** - `Box<T>` for heap allocation, `Rc<T>` for shared ownership
9. **Threads** - `std::thread::spawn`, `join`, moving data into threads, `Arc<Mutex<T>>`
10. **Formatting and Display** - implementing `std::fmt::Display` vs `Debug`, format strings

Result (#4) should come before File I/O (#5) since file operations all return `Result`
and beginners hit the `?` operator immediately when they open a file. Traits (#6) should
come before Smart Pointers (#8) - `Box<dyn Trait>` makes no sense without trait objects.
