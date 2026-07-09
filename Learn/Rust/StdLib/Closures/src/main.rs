// Closures - demonstrates closure syntax, capture modes, and Fn/FnMut/FnOnce bounds.

fn apply<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 { f(x) }
fn apply_mut<F: FnMut() -> i32>(mut f: F) -> i32  { f() }
fn apply_once<F: FnOnce() -> String>(f: F) -> String { f() }

fn make_adder(n: i32) -> impl Fn(i32) -> i32 {
    move |x| x + n   // n is moved into the closure
}

fn main() {
    // --- basic closure syntax ---
    println!("--- basic ---");
    let double = |x: i32| x * 2;
    println!("double(5) = {}", double(5));

    let clamp = |x: i32, lo: i32, hi: i32| {
        if x < lo { lo } else if x > hi { hi } else { x }
    };
    println!("clamp(15, 0, 10) = {}", clamp(15, 0, 10));

    // --- Fn: capture by shared reference ---
    println!("--- Fn (shared ref) ---");
    let threshold = 5;
    let above = |x: i32| x > threshold;
    println!("above(3): {}, above(7): {}", above(3), above(7));

    // --- FnMut: capture by mutable reference ---
    println!("--- FnMut (mut ref) ---");
    let mut count = 0;
    let mut increment = || { count += 1; count };
    println!("{}", increment());
    println!("{}", increment());
    println!("{}", increment());

    // --- Fn trait bound ---
    println!("--- Fn bound ---");
    println!("apply square: {}", apply(|x| x * x, 7));

    // --- FnMut trait bound ---
    println!("--- FnMut bound ---");
    let mut total = 0;
    println!("apply_mut: {}", apply_mut(|| { total += 10; total }));

    // --- FnOnce: moves a captured value, callable only once ---
    println!("--- FnOnce ---");
    let greeting = String::from("hello");
    let consume = move || greeting.to_uppercase();
    println!("once: {}", apply_once(consume));

    // --- returning a closure ---
    println!("--- returning closure ---");
    let add5  = make_adder(5);
    let add10 = make_adder(10);
    println!("add5(3)={}, add10(3)={}", add5(3), add10(3));

    // --- closures with iterators ---
    println!("--- closure + iterator ---");
    let nums = vec![1, 2, 3, 4, 5];
    let sum: i32 = nums.iter()
        .filter(|&&x| x % 2 != 0)
        .map(|&x| x * x)
        .sum();
    println!("sum of odd squares: {sum}");
}
