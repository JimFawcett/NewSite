pub struct Part1;

impl Part1 {
    pub fn new() -> Self {
        Part1
    }
}

impl Default for Part1 {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_placeholder() {
        let _p = Part1::new();
    }
}
