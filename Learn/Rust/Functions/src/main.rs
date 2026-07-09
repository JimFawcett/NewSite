// Functions - demonstrates function definitions, parameters, return values, and expressions in Rust.

// Basic function: no parameters, no return value (returns unit type ()).
fn greet() {
    println!("Hello from greet()");
}

// Function with parameters. Types are always required on parameters.
fn add(a: i32, b: i32) -> i32 {
    a + b  // no semicolon: this expression is the return value
}

// Function with an explicit return for early exit.
fn first_positive(values: &[i32]) -> i32 {
    for &v in values {
        if v > 0 {
            return v;  // exits immediately
        }
    }
    -1  // default: tail expression returned if no early return fired
}

// Function returning a tuple to deliver multiple values.
fn min_max(a: i32, b: i32) -> (i32, i32) {
    if a < b { (a, b) } else { (b, a) }
}

fn main() {
    greet();

    let sum = add(3, 4);
    println!("add(3, 4) = {sum}");

    let nums = [-2, -1, 5, 8];
    println!("first_positive = {}", first_positive(&nums));

    let (lo, hi) = min_max(9, 3);
    println!("min = {lo}, max = {hi}");
}
