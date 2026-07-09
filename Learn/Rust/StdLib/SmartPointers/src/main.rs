// SmartPointers - demonstrates Box<T>, Rc<T>, and RefCell<T> in Rust.

use std::rc::Rc;
use std::cell::RefCell;

#[derive(Debug)]
#[allow(dead_code)]
enum List {
    Cons(i32, Box<List>),
    Nil,
}

fn main() {
    // --- Box<T>: single-owner heap allocation ---
    println!("--- Box ---");
    let b = Box::new(42);
    println!("boxed: {b}, deref: {}", *b);

    // Box makes recursive types possible by giving the compiler a known size
    let list = List::Cons(1, Box::new(List::Cons(2, Box::new(List::Nil))));
    println!("{list:?}");

    // --- Rc<T>: shared ownership on a single thread ---
    println!("--- Rc ---");
    let shared = Rc::new(String::from("shared data"));
    let c1 = Rc::clone(&shared);
    let c2 = Rc::clone(&shared);
    println!("value: {shared}, ref count: {}", Rc::strong_count(&shared));
    drop(c1);
    println!("after drop c1, count: {}", Rc::strong_count(&shared));
    drop(c2);
    println!("after drop c2, count: {}", Rc::strong_count(&shared));

    // --- RefCell<T>: interior mutability, borrow checked at runtime ---
    println!("--- RefCell ---");
    let data = RefCell::new(vec![1, 2, 3]);
    {
        let mut v = data.borrow_mut();
        v.push(4);
    }
    println!("{:?}", data.borrow());

    // --- Rc<RefCell<T>>: shared ownership + interior mutability ---
    println!("--- Rc<RefCell<T>> ---");
    let counter = Rc::new(RefCell::new(0));
    let c1 = Rc::clone(&counter);
    let c2 = Rc::clone(&counter);
    *c1.borrow_mut() += 1;
    *c2.borrow_mut() += 1;
    println!("counter: {}", counter.borrow());
}
