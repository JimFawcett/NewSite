 1 use std::env;
 2 use std::fs::File;
 3 use std::io::{self, BufRead, BufReader};
 4 
 5 fn format_code(file_path: &str, line_number_width: usize, indent_spaces: usize) -> io::Result<()> {
 6   let file = File::open(file_path)?;
 7   let reader = BufReader::new(file);
 8   
 9   let mut scope_depth = 0;
10   
11   for (line_number, line) in reader.lines().enumerate() {
12     let line = line?;
13     let trimmed = line.trim();
14     
15     // Adjust scope depth before printing the line
16     if trimmed.starts_with('}') && scope_depth > 0 {
17       scope_depth -= 1;
18     }
19     
20     // Compute indentation
21     let indent = " ".repeat(scope_depth * indent_spaces);
22     let formatted_line = format!(
23       "{:width$} {}{}",
24       line_number + 1,
25       indent,
26       trimmed,
27       width = line_number_width
28     );
29     
30     println!("{}", formatted_line);
31     
32     // Adjust scope depth after printing the line
33     if trimmed.ends_with('{') {
34       scope_depth += 1;
35     }
36   }
37   
38   Ok(())
39 }
40 
41 fn main() {
42   let args: Vec<String> = env::args().collect();
43   if args.len() < 2 {
44     eprintln!("Usage: {} <file_path> [line_number_width] [indent_spaces]", args[0]);
45     return;
46   }
47   
48   let file_path = &args[1];
49   let line_number_width = args.get(2).and_then(|s| s.parse().ok()).unwrap_or(4);
50   let indent_spaces = args.get(3).and_then(|s| s.parse().ok()).unwrap_or(4);
51   
52   if let Err(e) = format_code(file_path, line_number_width, indent_spaces) {
53     eprintln!("Error: {}", e);
54   }
55 }
