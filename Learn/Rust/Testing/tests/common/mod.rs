// common/mod.rs - shared setup helpers available to all integration test files.

use testing::Accumulator;

/// Returns an Accumulator pre-loaded with the given values.
pub fn accumulator_with(values: &[i32]) -> Accumulator {
    let mut acc = Accumulator::new();
    for &v in values {
        acc.add(v);
    }
    acc
}
