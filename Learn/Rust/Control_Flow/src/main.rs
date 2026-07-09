// Control_Flow - demonstrates if/else, loop, while, for, and match in Rust.

fn main() {
    // --- if / else as a statement ---
    let temp = 72;
    if temp > 80 {
        println!("hot");
    } else if temp > 60 {
        println!("comfortable");
    } else {
        println!("cold");
    }

    // --- if as an expression (both arms must have the same type) ---
    let description = if temp > 60 { "warm" } else { "cool" };
    println!("temp is {description}");

    // --- loop: runs forever until break ---
    let mut n = 0;
    let result = loop {
        n += 1;
        if n == 5 {
            break n * 2;  // break carries a value out of the loop
        }
    };
    println!("loop result = {result}");

    // --- while: condition checked before each iteration ---
    let mut count = 3;
    while count > 0 {
        println!("count = {count}");
        count -= 1;
    }

    // --- for over a range ---
    for i in 0..4 {
        print!("{i} ");
    }
    println!();  // newline after the row of numbers

    // --- for over a range, inclusive upper bound ---
    for i in 1..=3 {
        print!("{i} ");
    }
    println!();

    // --- for over a slice ---
    let words = ["alpha", "beta", "gamma"];
    for word in &words {
        println!("{word}");
    }

    // --- match: exhaustive pattern matching ---
    let score = 85;
    let grade = match score {
        90..=100 => "A",
        80..=89  => "B",
        70..=79  => "C",
        _        => "below C",
    };
    println!("grade = {grade}");
}
