# Project Tree — Spec_driven_TextFinder

```
Spec_driven_TextFinder/
├── Constitution.md
├── Prompts_Constitution.md
├── Prompts_Fix_Constitution.md
├── Spec_TextFinder.md
├── Prompts_Spec_TextFinder.md
├── Prompts_Fix_Spec_TextFinder.md
├── Project_Tree.md
└── Cpp_Spec_driven_TextFinder/
    ├── Cpp_TextFinder_Structure.md
    ├── Prompts_Cpp_TextFinder_Structure.md
    ├── Prompts_Fix_Cpp_TextFinder_Structure.md
    ├── Prompts_Fix_Spec_Cpp_TextFinder.md
    ├── Prompts_Build_Cpp_TextFinder.md
    ├── CMakeLists.txt
    ├── Cpp_Spec_driven_TextFinder_Entry/
    │   ├── Spec_Cpp_TextFinder_Entry.md
    │   ├── Prompts_Spec_Cpp_TextFinder_Entry.md
    │   ├── Prompts_Fix_Spec_Cpp_TextFinder_Entry.md
    │   ├── CMakeLists.txt
    │   └── src/
    │       └── main.cpp
    ├── Cpp_Spec_driven_Cmdline/
    │   ├── Spec_Cpp_TextFinder_Cmdline.md
    │   ├── Prompts_Spec_Cpp_TextFinder_Cmdline.md
    │   ├── Prompts_Fix_Spec_Cpp_TextFinder_Cmdline.md
    │   ├── CMakeLists.txt
    │   └── src/
    │       └── Cpp_TextFinder_Cmdline.ixx
    ├── Cpp_Spec_driven_Dirnav/
    │   ├── Spec_Cpp_TextFinder_Dirnav.md
    │   ├── Prompts_Spec_Cpp_TextFinder_Dirnav.md
    │   ├── Prompts_Fix_Spec_Cpp_TextFinder_Dirnav.md
    │   ├── CMakeLists.txt
    │   └── src/
    │       └── Cpp_TextFinder_Dirnav.ixx
    └── Cpp_Spec_driven_Output/
        ├── Spec_Cpp_TextFinder_Output.md
        ├── Prompts_Spec_Cpp_TextFinder_Output.md
        ├── Prompts_Fix_Spec_Cpp_TextFinder_Output.md
        ├── CMakeLists.txt
        └── src/
            └── Cpp_TextFinder_Output.ixx
```

## Legend

- `Constitution.md` — governing rules for this project (`Spec_driven_TextFinder/` and its children)
- `Spec_*.md` — behavioral specifications; authoritative source for code
- `*Structure.md` — project/component structure; authoritative source for code
- `Prompts_*.md` — records of the spec-driven design conversations; not inputs to code
- `Prompts_Fix_*.md` — records of subsequent refinement conversations for the same artifact
- `Prompts_Fix_Spec_Cpp_TextFinder.md` — refinements reaching across every C++ component and the project spec
- `Prompts_Build_Cpp_TextFinder.md` — record of turning the C++ specifications into working code
- `src/` — implementation of the sibling `Spec_*.md`, one per component
- `CMakeLists.txt` — build definition; the top-level one configures the whole project
