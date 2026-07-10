// Memory - stack vs heap, pointers, references, new/delete, RAII.

#include <iostream>
#include <string>

// RAII example: resource tied to object lifetime
class FileHandle {
public:
    FileHandle(const std::string& name) : name_(name) {
        std::cout << "opened: " << name_ << "\n";
    }
    ~FileHandle() {
        std::cout << "closed: " << name_ << "\n";
    }
private:
    std::string name_;
};

int main() {
    // --- stack vs heap ---
    std::cout << "--- stack vs heap ---\n";
    int stack_val = 42;          // on the stack; freed automatically
    int* heap_val = new int(42); // on the heap; must be freed manually
    std::cout << "stack: " << stack_val << "\n";
    std::cout << "heap:  " << *heap_val << "\n";
    delete heap_val;             // free heap memory
    heap_val = nullptr;          // avoid dangling pointer

    // --- pointers ---
    std::cout << "\n--- pointers ---\n";
    int x = 10;
    int* p = &x;            // p holds the address of x
    std::cout << "x=" << x << " *p=" << *p << "\n";
    *p = 20;                // modify x through pointer
    std::cout << "x=" << x << " (modified via pointer)\n";

    // --- references ---
    std::cout << "\n--- references ---\n";
    int a = 5;
    int& ref = a;           // ref is an alias for a; cannot be rebound
    ref = 99;
    std::cout << "a=" << a << " (modified via reference)\n";

    // --- RAII ---
    std::cout << "\n--- RAII ---\n";
    {
        FileHandle fh("log.txt");   // constructor prints "opened"
        // use fh...
    }   // destructor prints "closed" automatically here

    return 0;
}
