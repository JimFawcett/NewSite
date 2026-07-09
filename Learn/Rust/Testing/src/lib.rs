// Testing/lib.rs - public API used by unit tests here and integration tests in tests/.

/// Returns the sum of two integers.
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

/// Returns true if the string reads the same forwards and backwards,
/// ignoring ASCII case and non-alphabetic characters.
pub fn is_palindrome(s: &str) -> bool {
    let letters: Vec<char> = s.chars()
        .filter(|c| c.is_alphabetic())
        .map(|c| c.to_ascii_lowercase())
        .collect();
    letters == letters.iter().rev().cloned().collect::<Vec<_>>()
}

/// Clamps value to the inclusive range [lo, hi].
pub fn clamp(value: i32, lo: i32, hi: i32) -> i32 {
    if value < lo { lo } else if value > hi { hi } else { value }
}

/// A simple accumulator that tracks a running total.
pub struct Accumulator {
    total: i32,
}

impl Accumulator {
    pub fn new() -> Self {
        Accumulator { total: 0 }
    }

    pub fn add(&mut self, n: i32) {
        self.total += n;
    }

    pub fn total(&self) -> i32 {
        self.total
    }

    // Private helper - only testable from within this crate's unit tests.
    #[allow(dead_code)]
    fn reset(&mut self) {
        self.total = 0;
    }
}

// ---------------------------------------------------------------------------
// Unit tests: compiled only during `cargo test`; can access private items.
// ---------------------------------------------------------------------------
#[cfg(test)]
mod tests {
    use super::*;

    // --- add ---
    #[test]
    fn add_positive_numbers() {
        assert_eq!(add(2, 3), 5);
    }

    #[test]
    fn add_with_negative() {
        assert_eq!(add(-4, 4), 0);
    }

    // --- is_palindrome ---
    #[test]
    fn palindrome_simple() {
        assert!(is_palindrome("racecar"));
    }

    #[test]
    fn palindrome_ignores_case_and_spaces() {
        assert!(is_palindrome("A man a plan a canal Panama"));
    }

    #[test]
    fn not_a_palindrome() {
        assert!(!is_palindrome("hello"));
    }

    // --- clamp ---
    #[test]
    fn clamp_above_range() {
        assert_eq!(clamp(20, 0, 10), 10);
    }

    #[test]
    fn clamp_below_range() {
        assert_eq!(clamp(-5, 0, 10), 0);
    }

    #[test]
    fn clamp_within_range() {
        assert_eq!(clamp(5, 0, 10), 5);
    }

    // --- Accumulator ---
    #[test]
    fn accumulator_adds_values() {
        let mut acc = Accumulator::new();
        acc.add(3);
        acc.add(7);
        assert_eq!(acc.total(), 10);
    }

    #[test]
    fn accumulator_reset_is_private_but_testable_here() {
        let mut acc = Accumulator::new();
        acc.add(5);
        acc.reset();   // private: only accessible from within this module
        assert_eq!(acc.total(), 0);
    }

    // --- assert_ne! and custom failure messages ---
    #[test]
    fn add_returns_nonzero_for_nonzero_inputs() {
        assert_ne!(add(1, 2), 0, "1 + 2 should never be zero");
    }

    // --- #[should_panic] ---
    #[test]
    #[should_panic(expected = "index out of bounds")]
    fn vec_index_panics() {
        let v: Vec<i32> = vec![];
        let _ = v[0];
    }

    // --- #[ignore] skips a test unless --ignored is passed ---
    #[test]
    #[ignore = "slow: requires network"]
    fn slow_integration_placeholder() {
        // not run by default
    }
}
