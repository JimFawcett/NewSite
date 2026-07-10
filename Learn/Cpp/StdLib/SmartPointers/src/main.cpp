// SmartPointers - unique_ptr, shared_ptr, weak_ptr, make_unique, make_shared.

#include <iostream>
#include <memory>
#include <string>

struct Node {
    std::string name;
    explicit Node(std::string n) : name(std::move(n)) {
        std::cout << "Node(" << name << ") created\n";
    }
    ~Node() { std::cout << "Node(" << name << ") destroyed\n"; }
};

int main() {
    // --- unique_ptr: sole ownership ---
    std::cout << "--- unique_ptr ---\n";
    {
        auto p = std::make_unique<Node>("alpha");
        std::cout << "name: " << p->name << "\n";
        // transfer ownership
        auto q = std::move(p);   // p is now null
        std::cout << "p is null: " << (p == nullptr) << "\n";
    }   // q destroyed here -> Node destroyed

    // --- shared_ptr: shared ownership ---
    std::cout << "\n--- shared_ptr ---\n";
    {
        auto s1 = std::make_shared<Node>("beta");
        {
            auto s2 = s1;   // both own the same Node
            std::cout << "use count: " << s1.use_count() << "\n";  // 2
        }   // s2 goes out of scope
        std::cout << "use count: " << s1.use_count() << "\n";  // 1
    }   // s1 goes out of scope -> Node destroyed

    // --- weak_ptr: non-owning observer ---
    std::cout << "\n--- weak_ptr ---\n";
    std::weak_ptr<Node> weak;
    {
        auto strong = std::make_shared<Node>("gamma");
        weak = strong;
        std::cout << "expired: " << weak.expired() << "\n";  // 0 (false)
    }   // strong destroyed
    std::cout << "expired: " << weak.expired() << "\n";   // 1 (true)

    // --- make_unique with array ---
    std::cout << "\n--- unique_ptr array ---\n";
    auto arr = std::make_unique<int[]>(5);
    for (int i = 0; i < 5; ++i) arr[i] = i * i;
    for (int i = 0; i < 5; ++i) std::cout << arr[i] << " ";
    std::cout << "\n";

    return 0;
}
