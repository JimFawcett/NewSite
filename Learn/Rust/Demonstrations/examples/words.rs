// words.rs - demonstrates word_count and unique_words from the demonstrations library.
// Run with: cargo run --example words

use demonstrations::{word_count, unique_words};

fn main() {
    println!("=== words example ===");

    let text = "the quick brown fox jumps over the lazy dog the fox";

    println!("text:         \"{text}\"");
    println!("word_count:   {}", word_count(text));
    println!("unique words: {:?}", unique_words(text));
}
