// integration_test.rs - tests the public API of the Testing crate as an external user would.

mod common;

use testing::{add, clamp, is_palindrome};

#[test]
fn integration_add_works() {
    assert_eq!(add(100, 200), 300);
}

#[test]
fn integration_palindrome_phrase() {
    assert!(is_palindrome("Never odd or even"));
}

#[test]
fn integration_clamp_boundaries() {
    assert_eq!(clamp(i32::MIN, 0, 100), 0);
    assert_eq!(clamp(i32::MAX, 0, 100), 100);
}

#[test]
fn integration_accumulator_via_helper() {
    let acc = common::accumulator_with(&[1, 2, 3, 4, 5]);
    assert_eq!(acc.total(), 15);
}
