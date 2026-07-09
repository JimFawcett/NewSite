// Traits - demonstrates defining traits, implementing them, default methods, and trait bounds.

use std::fmt::Debug;

trait Area {
    fn area(&self) -> f64;

    // default method: implementors inherit this unless they override it
    fn describe(&self) -> String {
        format!("shape with area {:.2}", self.area())
    }
}

struct Circle    { radius: f64 }
struct Rectangle { width: f64, height: f64 }

impl Area for Circle {
    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }
}

impl Area for Rectangle {
    fn area(&self) -> f64 { self.width * self.height }

    fn describe(&self) -> String {
        format!("rectangle {}x{} area={:.2}", self.width, self.height, self.area())
    }
}

// impl Trait syntax: accept any type implementing Area
fn print_area(shape: &impl Area) {
    println!("{}", shape.describe());
}

// generic syntax: both arguments must be the same concrete type
fn largest_area<T: Area>(a: &T, b: &T) -> f64 {
    a.area().max(b.area())
}

// trait object version: accepts two different concrete types
fn largest_area_dyn(a: &dyn Area, b: &dyn Area) -> f64 {
    a.area().max(b.area())
}

// trait object: &dyn Area hides the concrete type, enabling heterogeneous collections
fn print_all(shapes: &[&dyn Area]) {
    for s in shapes { println!("{}", s.describe()); }
}

// multiple bounds with +
#[derive(Debug)]
struct Square { side: f64 }

impl Area for Square {
    fn area(&self) -> f64 { self.side * self.side }
}

fn debug_area<T: Area + Debug>(shape: &T) {
    println!("{shape:?} => area {:.2}", shape.area());
}

fn main() {
    let c = Circle    { radius: 3.0 };
    let r = Rectangle { width: 4.0, height: 5.0 };
    let s = Square    { side: 6.0 };

    println!("--- impl Trait ---");
    print_area(&c);
    print_area(&r);

    println!("--- generic bound ---");
    println!("largest (same type): {:.2}", largest_area(&c, &c));
    println!("largest (dyn):       {:.2}", largest_area_dyn(&c, &r));

    println!("--- dyn Trait ---");
    let shapes: Vec<&dyn Area> = vec![&c, &r, &s];
    print_all(&shapes);

    println!("--- multiple bounds ---");
    debug_area(&s);
}
