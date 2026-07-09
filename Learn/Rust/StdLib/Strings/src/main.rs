// Strings - demonstrates String vs &str, construction, common methods, and conversion.

fn main() {
    // --- String vs &str ---
    println!("--- String vs &str ---");
    let s: &str   = "hello";
    let t: String = String::from(s);
    println!("&str: {s}, String: {t}");

    // --- construction ---
    println!("--- construction ---");
    let a = String::from("Rust");
    let b = "world".to_string();
    let c = format!("{a} {b}");
    println!("{c}");

    // --- concatenation with + moves the left operand ---
    println!("--- concatenation ---");
    let s1 = String::from("Hello, ");
    let s2 = String::from("world!");
    let s3 = s1 + &s2;
    println!("{s3}");

    // --- common query methods ---
    println!("--- query methods ---");
    let msg = String::from("  Hello, Rust!  ");
    println!("len:         {}", msg.len());
    println!("contains:    {}", msg.contains("Rust"));
    println!("starts_with: {}", msg.trim().starts_with("Hello"));
    println!("ends_with:   {}", msg.trim().ends_with("!"));

    // --- transformation ---
    println!("--- transform ---");
    println!("trim:         '{}'", msg.trim());
    println!("to_uppercase: {}", msg.trim().to_uppercase());
    println!("to_lowercase: {}", msg.trim().to_lowercase());
    println!("replace:      {}", msg.trim().replace("Rust", "World"));

    // --- split and collect ---
    println!("--- split ---");
    let csv = "one,two,three,four";
    let parts: Vec<&str> = csv.split(',').collect();
    println!("{parts:?}");

    // --- chars: iterate over Unicode scalar values ---
    println!("--- chars ---");
    let word = "Rust";
    for ch in word.chars() { print!("{ch} "); }
    println!();
    println!("char count: {}", word.chars().count());

    // --- deref coercion: &String -> &str ---
    println!("--- conversion ---");
    let owned   = String::from("owned");
    let borrowed: &str = &owned;
    println!("borrowed: {borrowed}");

    // --- parse: &str to numeric type ---
    println!("--- parse ---");
    let n: i32 = "42".parse().unwrap();
    println!("parsed: {n}");
}
