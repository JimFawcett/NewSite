use part1::Part1;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() == 1 {
        println!("Usage: {{project_name}} [options]");
        return;
    }

    let _p = Part1::new();
    // TODO: wire components and drive execution
}
