// basic.rs - demonstrates add and clamp from the demonstrations library.
// Run with: cargo run --example basic

use demonstrations::{add, clamp};

fn main() {
    println!("=== basic example ===");

    let sum = add(7, 3);
    println!("add(7, 3)         = {sum}");

    let clamped_high = clamp(25, 0, 20);
    let clamped_low  = clamp(-5, 0, 20);
    let clamped_mid  = clamp(10, 0, 20);
    println!("clamp(25, 0, 20)  = {clamped_high}");
    println!("clamp(-5, 0, 20)  = {clamped_low}");
    println!("clamp(10, 0, 20)  = {clamped_mid}");
}
