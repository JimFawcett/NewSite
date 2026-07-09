// Demonstrations/lib.rs - small public library used by examples in examples/.

/// Returns the sum of two integers.
pub fn add(a: i32, b: i32) -> i32 { a + b }

/// Clamps value to the inclusive range [lo, hi].
pub fn clamp(value: i32, lo: i32, hi: i32) -> i32 {
    if value < lo { lo } else if value > hi { hi } else { value }
}

/// Returns the number of whitespace-delimited words in s.
pub fn word_count(s: &str) -> usize {
    s.split_whitespace().count()
}

/// Returns a Vec of the unique words in s, sorted alphabetically.
pub fn unique_words(s: &str) -> Vec<&str> {
    let mut words: Vec<&str> = s.split_whitespace().collect();
    words.sort_unstable();
    words.dedup();
    words
}

#[derive(Debug)]
pub struct Circle {
    pub radius: f64,
}

impl Circle {
    pub fn new(radius: f64) -> Self { Circle { radius } }
    pub fn area(&self) -> f64 { std::f64::consts::PI * self.radius * self.radius }
    pub fn circumference(&self) -> f64 { 2.0 * std::f64::consts::PI * self.radius }
}

#[derive(Debug)]
pub struct Rectangle {
    pub width: f64,
    pub height: f64,
}

impl Rectangle {
    pub fn new(width: f64, height: f64) -> Self { Rectangle { width, height } }
    pub fn area(&self) -> f64 { self.width * self.height }
    pub fn perimeter(&self) -> f64 { 2.0 * (self.width + self.height) }
    pub fn is_square(&self) -> bool { self.width == self.height }
}
