/////////////////////////////////////////////////////////////
// TypeErasureDataFlowStructure::Executive::main.rs        //
//   - Executive creates and uses all lower level parts    //
// Jim Fawcett, https://JimFawcett.github.io, 04 Mar 2021  //
/////////////////////////////////////////////////////////////
/*
  Note:
    Executive only creates Input instance.  The rest of
    the pipeline self installs, e.g., Input creates Compute,
    and Compute creates Output.
*/
use compute::*;
use input::*;
use output::*;

fn main() {

  print!("\n  -- TypeErasureDataFlowStructure::Executive --\n");

  type Comp = ComputeImpl<OutputImpl>;
  let mut input = Input::<Comp>::new();

  // Use it generically:
  let mut total = 0;
  for path in &[
    "./src/main.rs",
    "../Input/src/lib.rs",
    "../Compute/src/lib.rs",
    "../Output/src/lib.rs",
    "../Fileutils/src/lib.rs"
  ] {
    total += input.do_input(path);
  }

  print!("\n  total lines: {}", total);

  print!("\n\n  That's all Folks!\n\n");
}
