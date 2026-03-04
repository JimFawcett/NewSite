### ------------------------------------------------------------
## rust_cmd_line project notes
### project setup using claude code in VS Code
1. created TextFinder1 project folder
2. copied RustTextfinder repo code into folder
3. changed the name of the library from default lib.rs to cmd_line_lib and name of package to rust_cmd_line.
4. debugged and fixed the name changes.
### create specification markdown
5. prompted claude code to create a specification file that matched the code in rust_cmd_line_lib.rs
6. It successfully created markdown file  RustCmdLine_Spec.md
7. claude displayed the rendered markdown
8. I asked claude to move the file into the project 
directory holding cargo.toml.
9. It did that successfully
### verify code meets specification
10. I prompted claude to verify that the library code matched the specification.
11. It found three minor discrepancies
### fix verification errors
12. I prompted claude to fix the errors.  It did and successfully modified the library file
13. I built the library, ran its unit tests, and built and ran its /examples/test1.rs
### ------------------------------------------------------------
### summary of spec for RustCmdLine
1. copied project files to working directory
2. selected the RustCmdLine part, renamed lib and package, built and tested.
3. created a spec from the existing code
4. debugged the spec
5. used that to modify the cmd line code.
6. rebuilt modified library and tested with no problems.
### ------------------------------------------------------------
### The purposes of the spec are to:
  - build code from spec
  - modify code by modifying spec and asking claude to change files to match
  - translate to another language by instructing claude to use a new language, e.g., C++ 
### ------------------------------------------------------------
### Observations:
1. building spec is almost as hard as building the code
2. When starting from scratch it seems plausible to:
   - write a little package code
   - ask claude to build a spec for that beginning
   - verify code and spec match
   - add more code
   - ask claude to modify the spec
   - verify
   - continue until package is complete
### ------------------------------------------------------------
