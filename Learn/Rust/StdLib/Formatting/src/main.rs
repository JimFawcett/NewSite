// Formatting - demonstrates Display, Debug, format specifiers, and the fmt module.

use std::fmt;

struct Point { x: f64, y: f64 }

impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}

impl fmt::Debug for Point {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Point {{ x: {}, y: {} }}", self.x, self.y)
    }
}

fn main() {
    let p = Point { x: 3.0, y: 4.0 };

    // --- Display vs Debug ---
    println!("--- Display vs Debug ---");
    println!("Display: {p}");
    println!("Debug:   {p:?}");

    // --- numeric format specifiers ---
    println!("--- numeric ---");
    let n = 42;
    let f = 3.14159_f64;
    println!("decimal:  {n}");
    println!("binary:   {n:b}");
    println!("octal:    {n:o}");
    println!("hex:      {n:x}");
    println!("float 2dp:{f:.2}");
    println!("sci:      {f:e}");

    // --- width and alignment ---
    println!("--- alignment ---");
    println!("right:  '{n:>8}'");
    println!("left:   '{n:<8}'");
    println!("center: '{n:^8}'");
    println!("zero:   '{n:08}'");

    // --- named arguments ---
    println!("--- named args ---");
    let name = "Rust";
    let edition = 2021;
    println!("language={name}, edition={edition}");

    // --- format! builds a String ---
    println!("--- format! ---");
    let s = format!("point is {p}, debug: {p:?}");
    println!("{s}");

    // --- eprintln! writes to stderr ---
    eprintln!("this line goes to stderr");
}
