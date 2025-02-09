use std::env;
use std::fs::File;
use std::io::{self, BufRead, BufReader};

fn format_code(file_path: &str, line_number_width: usize, indent_spaces: usize) -> io::Result<()> {
    let file = File::open(file_path)?;
    let reader = BufReader::new(file);

    let mut scope_depth = 0;

    for (line_number, line) in reader.lines().enumerate() {
        let line = line?;
        let trimmed = line.trim();

        // Adjust scope depth before printing the line
        if trimmed.starts_with('}') && scope_depth > 0 {
            scope_depth -= 1;
        }

        // Compute indentation
        let indent = " ".repeat(scope_depth * indent_spaces);
        let formatted_line = format!(
            "{:width$} {}{}",
            line_number + 1,
            indent,
            trimmed,
            width = line_number_width
        );

        println!("{}", formatted_line);

        // Adjust scope depth after printing the line
        if trimmed.ends_with('{') {
            scope_depth += 1;
        }
    }

    Ok(())
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: {} <file_path> [line_number_width] [indent_spaces]", args[0]);
        return;
    }

    let file_path = &args[1];
    let line_number_width = args.get(2).and_then(|s| s.parse().ok()).unwrap_or(4);
    let indent_spaces = args.get(3).and_then(|s| s.parse().ok()).unwrap_or(4);

    if let Err(e) = format_code(file_path, line_number_width, indent_spaces) {
        eprintln!("Error: {}", e);
    }
}
