// Tools - demonstrates doc comments, unit tests, and integration with cargo tooling.

/// Adds two integers and returns their sum.
///
/// # Examples
///
/// ```
/// let result = tools_demo::add(2, 3);
/// assert_eq!(result, 5);
/// ```
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

/// Returns `true` if `n` is even.
pub fn is_even(n: i32) -> bool {
    n % 2 == 0
}

/// Clamps `value` to the inclusive range `[lo, hi]`.
pub fn clamp(value: i32, lo: i32, hi: i32) -> i32 {
    if value < lo { lo } else if value > hi { hi } else { value }
}

fn main() {
    println!("add(2, 3)      = {}", add(2, 3));
    println!("is_even(4)     = {}", is_even(4));
    println!("clamp(15,0,10) = {}", clamp(15, 0, 10));
}

// --- unit tests live in a #[cfg(test)] module in the same file ---
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(2, 3), 5);
        assert_eq!(add(-1, 1), 0);
    }

    #[test]
    fn test_is_even() {
        assert!(is_even(4));
        assert!(!is_even(7));
    }

    #[test]
    fn test_clamp() {
        assert_eq!(clamp(15, 0, 10), 10);
        assert_eq!(clamp(-5, 0, 10), 0);
        assert_eq!(clamp(5,  0, 10), 5);
    }

    #[test]
    #[should_panic]
    fn test_index_out_of_bounds() {
        let v = vec![1, 2, 3];
        let _ = v[99];   // panics - #[should_panic] marks this as expected
    }
}
