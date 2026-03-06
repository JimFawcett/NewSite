### ------------------------------------------------------------
## TextFinder1 project notes
### project setup using claude code in VS Code
1. created TextFinder1 project folder
2. copied RustTextfinder repo code into folder
### cmd_line processing
1. opened subfolder RustCmdLine to work on command line processing.
2. changed the name of the command line parser library from default lib.rs to cmd_line_lib and name of package to rust_cmd_line.
3. debugged and fixed the name changes.
### create specification markdown
1. prompted claude code to create a specification file that matched the code in rust_cmd_line_lib.rs
2. It successfully created markdown file  RustCmdLine_Spec.md
3. claude displayed the rendered markdown
4. I asked claude to move the file into the project 
directory holding cargo.toml.
5. It did that successfully
### verify code meets specification
1. I prompted claude to verify that the library code matched the specification.
2. It found three minor discrepancies
### fix verification errors
1. I prompted claude to fix the errors.  It did and successfully modified the library file
2. I built the library, ran its unit tests, and built and ran its /examples/test1.rs
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
1. building spec before code is almost as hard as building the code
2. When starting without code it seems plausible to:
   - write a little specification
   - ask claude to build a package code for that beginning
   - verify code and spec match
   - add more spec features
   - ask claude to modify the code
   - verify
   - continue until package is complete
3. Completed spec is readable, close to README documentation, but much more detailed.
### ------------------------------------------------------------
### directory processing
1. selected the RustDirNav part, renamed lib and package and tested.
2. asked claude to build a specification for dir_nav_lib.rs. That succeeded.
3. I asked claude to verify that the spec and code were equivalent and that succeeded.
4. I cleaned, rebuilt the library and --examples code, tested lib and ran /examples/test1 - all successful.
### ------------------------------------------------------------
### summary of RustDirNav
1. built and tested library and example code successfully
2. asked claude to create specification
3. that succeeded and lib and code were verified to be consistent
4. rebuilt library and example code and tested successfully.
### ------------------------------------------------------------
### application processing
1. selected the RustTextFinder part, renamed main.rs to text_finder.rs, made corresponding change to cargo.
2. attempted to build but encountered several package name errors in the text_finder code.
3. Asked claude to fix those and it did successfully.
4. Testing was complicated by text_finder searching the Target directory.  I asked claude to implement a black-list of directory names.
5. It did that by making changes to dir_nav_lib.rs and text_finder.rs
6. text-finder now excludes black-list dirs.
7. I asked claude if RustDirNav_Spec.md was updated.  It said no and offered to make that change. I accepted the change.
8. I asked claude to create a specification for text_finder.rs
9. I cleaned and rebuilt text_finder and test1 and ran them successfully.
10. posted changes to github
11. asked claude to modify specification of text_finder to display help string if run with no arguments. I'm testing claude's ability to update files when their specs are updated.
12. That succeeded and claude noted that this is just prescriptive, i.e., no code was changed.
13. claude asked if I wanted to make the corresponding changes.  I said yes. One change was implemented in text_finder.rs.
14. I cleaned, rebuilt, and ran text_finder successfully verifying the change and remaining behaviors
### ------------------------------------------------------------
### Summary of application processing changes
1. text_finder and its helper packages cmd_line_lib and dir_nav_lib were cleaned up by making needed package and file name changes, for maintainability.
2. specifications were created from code by claude for each of the packages and spec/code verified to match.
3. two changes were made to the SPECIFICATIONS to:
    - provide black-list of directories not to enter, e.g., Target
    - return help string without scanning if no arguments are supplied to text_finder.
4. Claude changed two of the three code files to support the spec changes.
5. new text_finder features tested successfully.

