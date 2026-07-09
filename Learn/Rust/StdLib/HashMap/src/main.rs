// HashMap - demonstrates construction, lookup, the entry API, and iteration.

use std::collections::HashMap;

fn main() {
    // --- construction ---
    println!("--- construction ---");
    let mut scores: HashMap<String, u32> = HashMap::new();
    scores.insert(String::from("Alice"), 90);
    scores.insert(String::from("Bob"),   75);
    scores.insert(String::from("Carol"), 88);
    println!("{scores:?}");

    // --- get: returns Option<&V> ---
    println!("--- get ---");
    if let Some(s) = scores.get("Alice") {
        println!("Alice: {s}");
    }
    println!("Dave: {:?}", scores.get("Dave"));

    // --- contains_key ---
    println!("--- contains_key ---");
    println!("has Bob: {}", scores.contains_key("Bob"));

    // --- remove ---
    println!("--- remove ---");
    scores.remove("Bob");
    println!("after remove Bob: {} entries", scores.len());

    // --- entry: insert only if absent ---
    println!("--- entry or_insert ---");
    scores.entry(String::from("Dave")).or_insert(70);
    scores.entry(String::from("Alice")).or_insert(0);  // Alice exists; unchanged
    println!("Dave: {}, Alice: {}", scores["Dave"], scores["Alice"]);

    // --- entry: mutate existing value ---
    println!("--- entry modify ---");
    let alice = scores.entry(String::from("Alice")).or_insert(0);
    *alice += 5;
    println!("Alice after +5: {}", scores["Alice"]);

    // --- sorted iteration ---
    println!("--- iteration ---");
    let mut pairs: Vec<(&String, &u32)> = scores.iter().collect();
    pairs.sort_by_key(|(k, _)| k.as_str());
    for (name, score) in pairs {
        println!("{name}: {score}");
    }

    // --- word frequency (classic entry pattern) ---
    println!("--- word count ---");
    let text = "the quick brown fox jumps over the lazy dog the fox";
    let mut freq: HashMap<&str, u32> = HashMap::new();
    for word in text.split_whitespace() {
        *freq.entry(word).or_insert(0) += 1;
    }
    let mut fv: Vec<(&&str, &u32)> = freq.iter().collect();
    fv.sort_by_key(|(w, _)| **w);
    for (word, count) in fv {
        println!("  {word}: {count}");
    }
}
