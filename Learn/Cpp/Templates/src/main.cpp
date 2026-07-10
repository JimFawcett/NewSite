// Templates - function templates, class templates, type deduction.

#include <iostream>
#include <vector>
#include <string>

// function template: works for any type supporting >
template<typename T>
T max_of(T a, T b) { return a > b ? a : b; }

// function template with two type parameters
template<typename T, typename U>
void print_pair(T first, U second) {
    std::cout << first << ", " << second << "\n";
}

// class template
template<typename T>
class Stack {
public:
    void push(const T& val) { data_.push_back(val); }
    void pop()              { data_.pop_back(); }
    const T& top() const    { return data_.back(); }
    bool empty() const      { return data_.empty(); }
    size_t size() const     { return data_.size(); }
private:
    std::vector<T> data_;
};

// template function with multiple specializations via if constexpr (C++17)
template<typename T>
std::string type_label() {
    if constexpr (std::is_integral_v<T>)       return "integral";
    else if constexpr (std::is_floating_point_v<T>) return "floating point";
    else                                        return "other";
}

int main() {
    std::cout << "--- function template ---\n";
    std::cout << "max_of(3, 7)        = " << max_of(3, 7)         << "\n";
    std::cout << "max_of(2.5, 1.8)    = " << max_of(2.5, 1.8)     << "\n";
    std::cout << "max_of(\"apple\",\"fig\") = " << max_of(std::string("apple"), std::string("fig")) << "\n";

    std::cout << "\n--- two-parameter template ---\n";
    print_pair(42, 3.14);
    print_pair(std::string("name"), 100);

    std::cout << "\n--- class template Stack<T> ---\n";
    Stack<int> si;
    si.push(1); si.push(2); si.push(3);
    while (!si.empty()) {
        std::cout << si.top() << " ";
        si.pop();
    }
    std::cout << "\n";

    Stack<std::string> ss;
    ss.push("alpha"); ss.push("beta");
    std::cout << "top: " << ss.top() << "\n";

    std::cout << "\n--- if constexpr ---\n";
    std::cout << "int:    " << type_label<int>()    << "\n";
    std::cout << "double: " << type_label<double>() << "\n";
    std::cout << "string: " << type_label<std::string>() << "\n";

    return 0;
}
