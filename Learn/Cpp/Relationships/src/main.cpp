// Relationships - Inheritance, Composition, Aggregation, Using.

#include <iostream>
#include <string>
#include <vector>
#include <memory>

// --- inheritance: base and derived ---
class Shape {
public:
    std::string color;
    explicit Shape(std::string c) : color(std::move(c)) {}
    virtual double area() const { return 0.0; }
    virtual void describe() const {
        std::cout << color << " shape, area=" << area() << "\n";
    }
    virtual ~Shape() = default;
};

class Circle : public Shape {
public:
    double radius;
    Circle(std::string c, double r) : Shape(std::move(c)), radius(r) {}
    double area() const override { return 3.14159 * radius * radius; }
};

class Rect : public Shape {
public:
    double w, h;
    Rect(std::string c, double w, double h) : Shape(std::move(c)), w(w), h(h) {}
    double area() const override { return w * h; }
};

// --- composition: Engine owned by Car ---
class Engine {
public:
    int hp;
    explicit Engine(int h) : hp(h) {}
};

class Car {
public:
    Engine engine;       // owned; destroyed with Car
    std::string model;
    Car(std::string m, int hp) : model(std::move(m)), engine(hp) {}
};

// --- aggregation: Department uses non-owning pointer to Manager ---
class Manager {
public:
    std::string name;
    explicit Manager(std::string n) : name(std::move(n)) {}
};

class Department {
public:
    const Manager* head;   // non-owning; Manager outlives Department
    std::string dept;
    Department(std::string d, const Manager* m) : dept(std::move(d)), head(m) {}
};

// --- using: function depends on Shape but does not own it ---
void print_area(const Shape& s) {
    std::cout << s.color << " area=" << s.area() << "\n";
}

int main() {
    std::cout << "--- inheritance + polymorphism ---\n";
    std::vector<std::unique_ptr<Shape>> shapes;
    shapes.push_back(std::make_unique<Circle>("red", 3.0));
    shapes.push_back(std::make_unique<Rect>("blue", 4.0, 5.0));
    for (const auto& s : shapes)
        s->describe();

    std::cout << "\n--- composition ---\n";
    Car car("Sedan", 200);
    std::cout << car.model << " " << car.engine.hp << "hp\n";

    std::cout << "\n--- aggregation ---\n";
    Manager mgr("Alice");
    Department dept("Engineering", &mgr);
    std::cout << dept.dept << " head: " << dept.head->name << "\n";

    std::cout << "\n--- using ---\n";
    Circle c("green", 2.0);
    print_area(c);

    return 0;
}
