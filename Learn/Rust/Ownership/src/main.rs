// Ownership - demonstrates move semantics, cloning, Copy types, and borrowing in Rust.

fn print_len(s: &String) {           // borrows s; caller keeps ownership
    println!("length = {}", s.len());
}

fn append_bang(s: &mut String) {     // mutably borrows s; caller keeps ownership
    s.push('!');
}

fn take_ownership(s: String) {       // s is moved in; dropped when this function returns
    println!("taken: {s}");
}                                    // s is dropped here

fn main() {
    // --- move: ownership transfers; original binding is no longer valid ---
    println!("--- move ---");
    let a = String::from("hello");
    let b = a;                       // a is moved into b
    // println!("{a}");              // would not compile: a was moved
    println!("{b}");

    // --- clone: deep copy; both bindings remain valid ---
    println!("--- clone ---");
    let c = String::from("world");
    let d = c.clone();
    println!("c = {c}, d = {d}");   // both usable

    // --- Copy types: integers, bools, chars copy automatically ---
    println!("--- Copy types ---");
    let x = 42;
    let y = x;                       // x is copied, not moved
    println!("x = {x}, y = {y}");   // both valid

    // --- shared reference: borrow without taking ownership ---
    println!("--- shared borrow ---");
    let s = String::from("Rust");
    print_len(&s);                   // lend s to the function
    println!("still have s: {s}");  // s is still ours

    // --- multiple shared references allowed simultaneously ---
    println!("--- multiple shared refs ---");
    let r1 = &s;
    let r2 = &s;
    println!("r1 = {r1}, r2 = {r2}");

    // --- mutable reference: exclusive borrow for mutation ---
    println!("--- mutable borrow ---");
    let mut t = String::from("hello");
    append_bang(&mut t);
    println!("{t}");                 // "hello!"

    // --- ownership passed into a function: caller loses it ---
    println!("--- move into function ---");
    let u = String::from("goodbye");
    take_ownership(u);
    // println!("{u}");             // would not compile: u was moved

    // --- scope drop: value is freed when its owner goes out of scope ---
    println!("--- scope drop ---");
    {
        let scoped = String::from("temporary");
        println!("{scoped}");
    }                                // scoped is dropped here; memory freed
    println!("scoped is gone");
}
