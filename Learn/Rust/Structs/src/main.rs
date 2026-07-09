// Structs - demonstrates struct definitions, impl blocks, derived traits, and tuple structs.

#[derive(Debug, Clone, PartialEq)]
struct Point {
    x: f64,
    y: f64,
}

impl Point {
    // associated function: called as Point::new(...), not on an instance
    fn new(x: f64, y: f64) -> Point {
        Point { x, y }           // field init shorthand: x means x: x
    }

    // method: takes &self, reads fields without taking ownership
    fn distance_from_origin(&self) -> f64 {
        (self.x * self.x + self.y * self.y).sqrt()
    }

    // method that consumes and returns a modified copy
    fn translate(&self, dx: f64, dy: f64) -> Point {
        Point { x: self.x + dx, y: self.y + dy }
    }
}

// tuple struct: fields accessed by index, not by name
#[derive(Debug)]
struct Color(u8, u8, u8);

impl Color {
    fn new(r: u8, g: u8, b: u8) -> Color {
        Color(r, g, b)
    }

    fn is_gray(&self) -> bool {
        self.0 == self.1 && self.1 == self.2
    }
}

fn main() {
    // --- basic construction and field access ---
    println!("--- basic struct ---");
    let p1 = Point::new(3.0, 4.0);
    println!("p1 = ({}, {})", p1.x, p1.y);
    println!("distance = {:.2}", p1.distance_from_origin());

    // --- Debug printing with {:?} and {:#?} ---
    println!("--- debug print ---");
    println!("{:?}", p1);
    println!("{:#?}", p1);

    // --- clone and equality ---
    println!("--- clone and PartialEq ---");
    let p2 = p1.clone();
    println!("p1 == p2: {}", p1 == p2);

    // --- struct update syntax: copy most fields from another instance ---
    println!("--- update syntax ---");
    let p3 = Point { x: 1.0, ..p1 };   // y is copied from p1
    println!("{:?}", p3);

    // --- mutable instance ---
    println!("--- mutation ---");
    let mut p4 = Point::new(0.0, 0.0);
    p4.x = 5.0;
    p4.y = 12.0;
    println!("{:?}, distance = {:.2}", p4, p4.distance_from_origin());

    // --- method returning a new struct ---
    println!("--- translate ---");
    let p5 = p4.translate(1.0, -2.0);
    println!("{:?}", p5);

    // --- tuple struct ---
    println!("--- tuple struct ---");
    let red   = Color::new(255, 0, 0);
    let gray  = Color::new(128, 128, 128);
    println!("{:?}, is_gray: {}", red,  red.is_gray());
    println!("{:?}, is_gray: {}", gray, gray.is_gray());
}
