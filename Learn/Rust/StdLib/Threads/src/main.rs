// Threads - demonstrates spawn, join, move closures, and Arc<Mutex<T>>.

use std::thread;
use std::sync::{Arc, Mutex};
use std::time::Duration;

fn main() {
    // --- spawn and join ---
    println!("--- spawn and join ---");
    let handle = thread::spawn(|| {
        for i in 0..3 {
            println!("thread: {i}");
            thread::sleep(Duration::from_millis(1));
        }
    });
    for i in 0..3 {
        println!("main:   {i}");
        thread::sleep(Duration::from_millis(1));
    }
    handle.join().unwrap();

    // --- move closure: transfer ownership into the thread ---
    println!("--- move closure ---");
    let data = vec![1, 2, 3];
    let handle = thread::spawn(move || {
        println!("thread sees: {data:?}");
    });
    handle.join().unwrap();

    // --- Arc<Mutex<T>>: shared mutable state across threads ---
    println!("--- Arc<Mutex<T>> ---");
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];
    for _ in 0..5 {
        let c = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            *c.lock().unwrap() += 1;
        }));
    }
    for h in handles { h.join().unwrap(); }
    println!("counter: {}", *counter.lock().unwrap());

    // --- collecting return values from threads ---
    println!("--- return values ---");
    let results: Vec<i32> = (0..4)
        .map(|i| thread::spawn(move || i * i))
        .collect::<Vec<_>>()
        .into_iter()
        .map(|h| h.join().unwrap())
        .collect();
    println!("{results:?}");
}
