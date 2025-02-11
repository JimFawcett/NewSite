use arboard::Clipboard;
use std::io;

fn format_code(code: &str, line_number_width: usize, indent_spaces: usize) -> String {
    let mut formatted_code = String::new();
    let mut scope_depth = 0;

    for (line_number, line) in code.lines().enumerate() {
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

        formatted_code.push_str(&formatted_line);
        formatted_code.push('\n');

        // Adjust scope depth after printing the line
        if trimmed.ends_with('{') {
            scope_depth += 1;
        }
    }

    formatted_code
}

fn main() -> io::Result<()> {
    // Read from clipboard
    let mut clipboard = Clipboard::new().expect("Failed to access clipboard");
    let input_code = clipboard.get_text().expect("Failed to get text from clipboard");

    let line_number_width = 2; // Default width
    let indent_spaces = 2; // Default indent

    // Format the code
    let formatted_code = format_code(&input_code, line_number_width, indent_spaces);

    // Print output and copy back to clipboard
    println!("{}", formatted_code);
    clipboard.set_text(formatted_code).expect("Failed to copy to clipboard");

    Ok(())
}
