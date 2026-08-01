## Sample Writing Tone

The following text from *Basic Bites: Memory, Section 1.0 Virtual Memory* represents the author's voice.

---

Programs that run on a modern operating system are given a view into platform random access memory (RAM) that appears to be linear, but in fact is not. The operating system needs to support multiple concurrent users and a large number of active programs in RAM, often requiring much more than the available fast RAM.

It does that by using blocks for memory contents that can be swapped out to a Page Table, in a very large but slower drive. The blocks are implemented as memory-mapped files, which the OS uses, along with other memory-mapped files holding control and contents for Disk Files and other Devices, to implement each program's operations.

Figure 1. shows a structure for memory-mapping. There is a Virtual Address Space provided as a view into memory for each running program. Program binaries are broken into 512 or 1024 sized blocks and loaded into physical memory and the page table, based on availability of physical memory. When a process starts, its binary code is mapped into physical memory on an available memory page basis. Any blocks that have no available space are mapped into the page table.

Two processes may share the same block of physical RAM in order to share its contents. That must be protected from writers clashing with readers by using system-wide synchronization constructs like named mutexes.

As new processes start, the OS may map some of the pages of a running process into the page table, allowing a newly created process to use them for its binary. Each OS has its own algorithms for deciding when a block of physical RAM should have its contents written to the page file and when it should be swapped back in. This swapping process is also used for large files and devices.

The event of initiating a page swap is called a page fault. A page fault will occur, for example, when code in an active page attempts to reference a page that has been swapped out to the page table. The rate of page faults has a significant impact on process performance.

Page mapping is supported by a symbiosis of OS and hardware processing.

---

## Prompt

When given the command "fix_voice in file [path]":

1. Read the specified file.
2. Copy the original file to an `archive/` subdirectory alongside the file, preserving the filename. If `archive/` does not exist create one then copy. If a file with the same name exists in /archive overwrite it.
3. Identify all prose text - skip code, HTML tags, and structured data.
4. Revise the prose to match the author's voice shown in the sample above. Favor active voice. Preserve all technical details and key terms exactly. Keep sentences concise and direct. Do not add content beyond what is in the original.
5. Update the about block with new revised date
6. Do not use emdashes.  Use dashes instead.
7. Write the revised text back to the file, preserving all non-prose content unchanged.
