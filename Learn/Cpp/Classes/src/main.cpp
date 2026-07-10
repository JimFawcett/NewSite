// Classes - data grouping, constructors, member functions, access specifiers.

#include <iostream>
#include <string>
#include <cmath>

class Point {
public:
    double x, y;

    Point(double x, double y) : x(x), y(y) {}

    double distance_to(const Point& other) const {
        double dx = x - other.x;
        double dy = y - other.y;
        return std::sqrt(dx * dx + dy * dy);
    }

    void print() const {
        std::cout << "(" << x << ", " << y << ")";
    }
};

class BankAccount {
public:
    explicit BankAccount(double initial_balance)
        : balance_(initial_balance) {}

    void deposit(double amount)  { balance_ += amount; }
    bool withdraw(double amount) {
        if (amount > balance_) return false;
        balance_ -= amount;
        return true;
    }
    double balance() const { return balance_; }

private:
    double balance_;  // private: only accessible through public methods
};

int main() {
    std::cout << "--- Point ---\n";
    Point p1{1.0, 2.0};
    Point p2{4.0, 6.0};
    p1.print(); std::cout << " to "; p2.print();
    std::cout << " = " << p1.distance_to(p2) << "\n";

    std::cout << "\n--- BankAccount ---\n";
    BankAccount acct{100.0};
    acct.deposit(50.0);
    std::cout << "balance: " << acct.balance() << "\n";

    bool ok = acct.withdraw(200.0);
    std::cout << "withdraw 200: " << (ok ? "ok" : "insufficient") << "\n";

    ok = acct.withdraw(75.0);
    std::cout << "withdraw 75:  " << (ok ? "ok" : "insufficient") << "\n";
    std::cout << "balance: " << acct.balance() << "\n";

    return 0;
}
