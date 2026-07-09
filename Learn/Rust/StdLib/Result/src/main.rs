// Result - demonstrates Ok/Err, match, the ? operator, and common Result methods.

use std::num::ParseIntError;

fn parse_positive(s: &str) -> Result<u32, String> {
    let n: i32 = s.parse().map_err(|e: ParseIntError| e.to_string())?;
    if n < 0 {
        Err(format!("{n} is negative"))
    } else {
        Ok(n as u32)
    }
}

fn double_positive(s: &str) -> Result<u32, String> {
    let n = parse_positive(s)?;
    Ok(n * 2)
}

fn main() {
    // --- match on Result ---
    println!("--- match ---");
    for input in &["42", "-5", "abc"] {
        match parse_positive(input) {
            Ok(n)  => println!("ok: {n}"),
            Err(e) => println!("err: {e}"),
        }
    }

    // --- ? operator ---
    println!("--- ? operator ---");
    println!("{:?}", double_positive("7"));
    println!("{:?}", double_positive("bad"));

    // --- unwrap_or ---
    println!("--- unwrap_or ---");
    let val = parse_positive("oops").unwrap_or(0);
    println!("unwrap_or: {val}");

    // --- expect ---
    println!("--- expect ---");
    let val = parse_positive("10").expect("should parse");
    println!("expect: {val}");

    // --- map ---
    println!("--- map ---");
    let doubled = parse_positive("8").map(|n| n * 2);
    println!("map: {doubled:?}");

    // --- map_err ---
    println!("--- map_err ---");
    let result = parse_positive("xyz")
        .map_err(|e| format!("parse failed: {e}"));
    println!("map_err: {result:?}");

    // --- and_then: chain a second fallible operation ---
    println!("--- and_then ---");
    let result = parse_positive("20")
        .and_then(|n| if n < 100 { Ok(n) } else { Err(String::from("too large")) });
    println!("and_then: {result:?}");

    // --- is_ok / is_err ---
    println!("--- is_ok / is_err ---");
    println!("is_ok:  {}", parse_positive("5").is_ok());
    println!("is_err: {}", parse_positive("x").is_err());
}
