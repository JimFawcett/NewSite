// shapes_multifile/main.rs - multi-file example showing local module use within examples/.
// Run with: cargo run --example shapes_multifile

mod geometry;

use demonstrations::{Circle, Rectangle};

fn main() {
    println!("=== shapes_multifile example ===");

    let shapes_c = vec![Circle::new(1.0), Circle::new(3.0), Circle::new(5.0)];
    println!("Circles:");
    for c in &shapes_c {
        geometry::print_circle_report(c);
    }

    let shapes_r = vec![
        Rectangle::new(2.0, 8.0),
        Rectangle::new(5.0, 5.0),
        Rectangle::new(3.0, 7.0),
    ];
    println!("Rectangles:");
    for r in &shapes_r {
        geometry::print_rect_report(r);
    }
}
