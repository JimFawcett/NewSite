// FileIO - demonstrates reading and writing files using std::fs and std::io.

use std::fs::{self, File};
use std::io::{self, BufRead, BufReader, Write};

fn write_sample(path: &str) -> io::Result<()> {
    let mut file = File::create(path)?;
    writeln!(file, "line one")?;
    writeln!(file, "line two")?;
    writeln!(file, "line three")?;
    Ok(())
}

fn read_whole(path: &str) -> io::Result<String> {
    fs::read_to_string(path)
}

fn read_lines(path: &str) -> io::Result<Vec<String>> {
    let file   = File::open(path)?;
    let reader = BufReader::new(file);
    reader.lines().collect()
}

fn main() {
    let path = "sample.txt";

    // --- write a file ---
    println!("--- write ---");
    write_sample(path).expect("write failed");
    println!("wrote {path}");

    // --- read entire file into a String ---
    println!("--- read_to_string ---");
    let content = read_whole(path).expect("read failed");
    print!("{content}");

    // --- read line by line ---
    println!("--- read lines ---");
    let lines = read_lines(path).expect("read failed");
    for (i, line) in lines.iter().enumerate() {
        println!("{i}: {line}");
    }

    // --- append to a file ---
    println!("--- append ---");
    {
        let mut file = fs::OpenOptions::new()
            .append(true)
            .open(path)
            .expect("open failed");
        writeln!(file, "line four").expect("append failed");
    }
    println!("line count: {}", read_lines(path).unwrap().len());

    // --- check existence and remove ---
    println!("--- exists / remove ---");
    println!("exists: {}", fs::metadata(path).is_ok());
    fs::remove_file(path).expect("remove failed");
    println!("exists after remove: {}", fs::metadata(path).is_ok());
}
