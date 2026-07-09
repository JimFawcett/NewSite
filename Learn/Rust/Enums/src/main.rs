// Enums - demonstrates enum variants, data-carrying variants, match, Option, and if let.

#[derive(Debug)]
#[allow(dead_code)]
enum Direction {
    North,
    South,
    East,
    West,
}

// variants can carry different data shapes
#[derive(Debug)]
enum Shape {
    Circle(f64),                   // tuple variant: radius
    Rectangle(f64, f64),           // tuple variant: width, height
    Triangle { base: f64, height: f64 }, // struct variant: named fields
}

impl Shape {
    fn area(&self) -> f64 {
        match self {
            Shape::Circle(r)                      => std::f64::consts::PI * r * r,
            Shape::Rectangle(w, h)                => w * h,
            Shape::Triangle { base, height }      => 0.5 * base * height,
        }
    }
}

// Option<T>: either Some value or None - no null pointers in Rust
fn find_first_even(nums: &[i32]) -> Option<i32> {
    for &n in nums {
        if n % 2 == 0 {
            return Some(n);
        }
    }
    None
}

fn main() {
    // --- basic enum and match ---
    println!("--- basic match ---");
    let dir = Direction::North;
    let msg = match dir {
        Direction::North => "heading north",
        Direction::South => "heading south",
        Direction::East  => "heading east",
        Direction::West  => "heading west",
    };
    println!("{msg}");

    // --- data-carrying variants ---
    println!("--- Shape areas ---");
    let shapes = vec![
        Shape::Circle(3.0),
        Shape::Rectangle(4.0, 5.0),
        Shape::Triangle { base: 6.0, height: 4.0 },
    ];
    for s in &shapes {
        println!("{:?} => area = {:.2}", s, s.area());
    }

    // --- Option: match to handle Some and None ---
    println!("--- Option with match ---");
    let nums = vec![1, 3, 5, 8, 9];
    match find_first_even(&nums) {
        Some(n) => println!("first even: {n}"),
        None    => println!("no even number found"),
    }

    let empty: Vec<i32> = vec![1, 3, 5];
    match find_first_even(&empty) {
        Some(n) => println!("first even: {n}"),
        None    => println!("no even number found"),
    }

    // --- Option methods: unwrap_or, map ---
    println!("--- Option methods ---");
    let val = find_first_even(&nums).unwrap_or(-1);
    println!("unwrap_or: {val}");

    let doubled = find_first_even(&nums).map(|n| n * 2);
    println!("map doubled: {doubled:?}");

    // --- if let: concise single-variant check ---
    println!("--- if let ---");
    if let Some(n) = find_first_even(&nums) {
        println!("found even with if let: {n}");
    }

    // --- match with a guard ---
    println!("--- match guard ---");
    let number = 7;
    match number {
        n if n < 0  => println!("{n} is negative"),
        0           => println!("zero"),
        n if n < 10 => println!("{n} is a small positive"),
        n           => println!("{n} is large"),
    }
}
