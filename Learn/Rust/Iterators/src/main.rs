// Iterators - demonstrates creating, adapting, and consuming iterators in Rust.

fn main() {
    let nums = vec![1, 2, 3, 4, 5];

    // --- iter() borrows elements; the vec remains usable afterward ---
    println!("--- iter() ---");
    for n in nums.iter() {
        print!("{n} ");
    }
    println!();

    // --- map: transform each element, producing a new iterator ---
    println!("--- map ---");
    let doubled: Vec<i32> = nums.iter().map(|n| n * 2).collect();
    println!("{doubled:?}");

    // --- filter: keep only elements that satisfy the predicate ---
    println!("--- filter ---");
    let evens: Vec<&i32> = nums.iter().filter(|n| *n % 2 == 0).collect();
    println!("{evens:?}");

    // --- map + filter chained ---
    println!("--- map + filter ---");
    let result: Vec<i32> = nums.iter()
        .filter(|n| *n % 2 != 0)   // odd numbers only
        .map(|n| n * n)             // square them
        .collect();
    println!("{result:?}");

    // --- enumerate: pairs each element with its index ---
    println!("--- enumerate ---");
    let words = vec!["alpha", "beta", "gamma"];
    for (i, w) in words.iter().enumerate() {
        println!("{i}: {w}");
    }

    // --- zip: pair elements from two iterators ---
    println!("--- zip ---");
    let keys   = vec!["a", "b", "c"];
    let values = vec![1, 2, 3];
    let pairs: Vec<(&&str, &i32)> = keys.iter().zip(values.iter()).collect();
    for (k, v) in &pairs {
        println!("{k} -> {v}");
    }

    // --- sum: consume the iterator, accumulate a total ---
    println!("--- sum ---");
    let total: i32 = nums.iter().sum();
    println!("sum = {total}");

    // --- fold: general accumulator (here: compute product) ---
    println!("--- fold ---");
    let product: i32 = nums.iter().fold(1, |acc, n| acc * n);
    println!("product = {product}");

    // --- count: how many elements pass through ---
    println!("--- count ---");
    let n_evens = nums.iter().filter(|n| *n % 2 == 0).count();
    println!("even count = {n_evens}");

    // --- any / all ---
    println!("--- any / all ---");
    let has_large = nums.iter().any(|n| *n > 4);
    let all_pos   = nums.iter().all(|n| *n > 0);
    println!("any > 4: {has_large}, all > 0: {all_pos}");

    // --- range as an iterator ---
    println!("--- range ---");
    let squares: Vec<i32> = (1..=5).map(|n| n * n).collect();
    println!("{squares:?}");
}
