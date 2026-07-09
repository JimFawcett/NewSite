// Variables - demonstrates bindings, mutability, primitive types, and shadowing in Rust.
fn main() {
    // --- immutable binding (default) ---
    let x = 5;
    println!("x = {x}");

    // --- mutable binding ---
    let mut count = 0;
    count += 1;
    println!("count = {count}");

    // --- explicit type annotation ---
    let ratio: f64 = 3.14;
    println!("ratio = {ratio}");

    // --- boolean ---
    let is_ready: bool = true;
    println!("is_ready = {is_ready}");

    // --- character (Unicode scalar value, 4 bytes) ---
    let letter: char = 'R';
    println!("letter = {letter}");

    // --- shadowing: rebind the same name with a new value or type ---
    let x = x * 2;          // new immutable binding, shadows the first x
    println!("x after shadowing = {x}");

    // --- type inference across integer sizes ---
    let big: i64 = 1_000_000;
    let small: i8 = 127;
    println!("big = {big}, small = {small}");

    // --- unsigned integer ---
    let index: usize = 42;
    println!("index = {index}");
}
