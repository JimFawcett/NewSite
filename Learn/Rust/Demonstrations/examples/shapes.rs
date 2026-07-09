// shapes.rs - demonstrates Circle and Rectangle from the demonstrations library.
// Run with: cargo run --example shapes

use demonstrations::{Circle, Rectangle};

fn main() {
    println!("=== shapes example ===");

    let c = Circle::new(5.0);
    println!("Circle r=5:");
    println!("  area          = {:.4}", c.area());
    println!("  circumference = {:.4}", c.circumference());

    let r = Rectangle::new(4.0, 6.0);
    println!("Rectangle 4x6:");
    println!("  area          = {:.1}", r.area());
    println!("  perimeter     = {:.1}", r.perimeter());
    println!("  is_square     = {}", r.is_square());

    let sq = Rectangle::new(5.0, 5.0);
    println!("Rectangle 5x5:");
    println!("  is_square     = {}", sq.is_square());
}
