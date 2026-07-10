// Enums - plain enum, enum class, underlying type, switch.

#include <iostream>
#include <string>

// plain enum: names leak into enclosing scope
enum Direction { North, South, East, West };

// scoped enum (preferred): names are in the enum's scope
enum class Color { Red, Green, Blue };

// enum class with explicit underlying type
enum class Status : uint8_t { Ok = 0, NotFound = 1, Error = 2 };

std::string direction_name(Direction d) {
    switch (d) {
        case North: return "North";
        case South: return "South";
        case East:  return "East";
        case West:  return "West";
    }
    return "Unknown";
}

std::string color_name(Color c) {
    switch (c) {
        case Color::Red:   return "Red";
        case Color::Green: return "Green";
        case Color::Blue:  return "Blue";
    }
    return "Unknown";
}

int main() {
    std::cout << "--- Direction (plain enum) ---\n";
    Direction d = North;
    std::cout << direction_name(d) << "\n";
    std::cout << "value: " << d << "\n";  // plain enum converts to int implicitly

    std::cout << "\n--- Color (enum class) ---\n";
    Color c = Color::Green;
    std::cout << color_name(c) << "\n";
    // std::cout << c;  // error: no implicit conversion to int

    std::cout << "\n--- Status ---\n";
    Status s = Status::NotFound;
    std::cout << "status value: " << static_cast<int>(s) << "\n";

    return 0;
}
