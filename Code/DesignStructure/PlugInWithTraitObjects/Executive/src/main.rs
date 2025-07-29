/////////////////////////////////////////////////////////////
// PluginWithTraitObjects::Executive::main.rs              //
//   - Executive creates and uses all lower level parts    //
// Jim Fawcett, https://JimFawcett.github.io, 04 Mar 2021  //
/////////////////////////////////////////////////////////////
/*
  Note:
    Executive creates Input and Output instances.  Comp
    instance is created by Inupt.

    cargo run -- console
      or
    cargo run -- file <file name>, e.g., file count.txt

    The file name must not be an existing source code file
*/
use compute::ComputeImpl;
use compute::Output as ComputeOutput;
use input::InputImpl;
use std::env;

fn main() {
  // 1) Choose plugin via CLI: e.g. `--output=file out.txt` or `--output=console`
  let mut args = env::args().skip(1);
  let plugin = args.next().unwrap_or_else(|| "console".into());

  // 2) Instantiate the right boxed Output
  let out: Box<dyn ComputeOutput> = match plugin.as_str() {
    "console" => Box::new(console_output::ConsoleOutput::new()),
    "file" => {
      let path = args
        .next()
        .expect("usage: executive --output=file <out-path> <files>...");
      Box::new(file_output::FileOutput::new(&path).expect("failed to create FileOutput"))
    }
    other => {
      eprintln!("unknown output plugin “{}”", other);
      std::process::exit(1);
    }
  };

  // 3) Wire Compute and Input
  let compute = Box::new(ComputeImpl::new(out));
  let mut input = InputImpl::new(compute);

  let mut total = 0;
  for path in &[
    "./src/main.rs",
    "../Input/src/lib.rs",
    "../Compute/src/lib.rs",
    "../ConsoleOutput/src/lib.rs",
    "../FileOutput/src/lib.rs",
    "../Fileutils/src/lib.rs",
  ] {
    total += input.do_input(path);
  }
  println!("\ntotal lines: {:?}\n", total);
}
