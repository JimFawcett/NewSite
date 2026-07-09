// Vec - demonstrates construction, mutation, slicing, sorting, and iteration of Vec<T>.

fn main() {
    // --- construction ---
    println!("--- construction ---");
    let v1: Vec<i32> = Vec::new();
    let v2 = vec![1, 2, 3, 4, 5];
    let v3: Vec<i32> = Vec::with_capacity(10);
    println!("v1 len={}, v2={v2:?}, v3 capacity={}", v1.len(), v3.capacity());

    // --- push and pop ---
    println!("--- push / pop ---");
    let mut v = vec![1, 2, 3];
    v.push(4);
    v.push(5);
    println!("after push: {v:?}");
    let last = v.pop();
    println!("popped: {last:?}, remaining: {v:?}");

    // --- insert and remove ---
    println!("--- insert / remove ---");
    v.insert(1, 99);
    println!("after insert: {v:?}");
    v.remove(1);
    println!("after remove: {v:?}");

    // --- indexing and get ---
    println!("--- index / get ---");
    println!("v[0] = {}", v[0]);
    println!("v.get(10) = {:?}", v.get(10));

    // --- slicing ---
    println!("--- slice ---");
    let slice = &v[1..3];
    println!("slice [1..3]: {slice:?}");

    // --- iteration ---
    println!("--- iteration ---");
    for n in &v { print!("{n} "); }
    println!();

    // --- sort and dedup ---
    println!("--- sort / dedup ---");
    let mut nums = vec![3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
    nums.sort();
    println!("sorted: {nums:?}");
    nums.dedup();
    println!("deduped: {nums:?}");

    // --- retain ---
    println!("--- retain ---");
    let mut evens = vec![1, 2, 3, 4, 5, 6];
    evens.retain(|n| n % 2 == 0);
    println!("evens: {evens:?}");

    // --- extend ---
    println!("--- extend ---");
    let mut base = vec![1, 2, 3];
    base.extend([4, 5, 6]);
    println!("extended: {base:?}");

    // --- contains and position ---
    println!("--- contains / position ---");
    println!("contains 3: {}", base.contains(&3));
    println!("position of 3: {:?}", base.iter().position(|n| *n == 3));

    // --- len and clear ---
    println!("--- len / clear ---");
    println!("len: {}", base.len());
    base.clear();
    println!("after clear, is_empty: {}", base.is_empty());
}
