// geometry.rs - local helper module for the shapes_multifile example.

use demonstrations::{Circle, Rectangle};

pub fn print_circle_report(c: &Circle) {
    println!("  {:?}", c);
    println!("    area          = {:.4}", c.area());
    println!("    circumference = {:.4}", c.circumference());
}

pub fn print_rect_report(r: &Rectangle) {
    println!("  {:?}", r);
    println!("    area          = {:.2}", r.area());
    println!("    perimeter     = {:.2}", r.perimeter());
    println!("    is_square     = {}", r.is_square());
}
