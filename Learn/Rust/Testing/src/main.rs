// Testing - shows the public API used by unit tests (lib.rs) and integration tests (tests/).

use testing::{add, clamp, is_palindrome, Accumulator};

fn main() {
    println!("add(2, 3)                        = {}", add(2, 3));
    println!("is_palindrome(\"racecar\")          = {}", is_palindrome("racecar"));
    println!("is_palindrome(\"hello\")            = {}", is_palindrome("hello"));
    println!("clamp(15, 0, 10)                 = {}", clamp(15, 0, 10));

    let mut acc = Accumulator::new();
    acc.add(10);
    acc.add(20);
    println!("Accumulator after 10+20          = {}", acc.total());
}
