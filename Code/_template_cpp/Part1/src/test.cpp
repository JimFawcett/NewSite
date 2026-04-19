import part1;
import std;

bool test_placeholder()
{
    Part1 p;
    (void)p;
    return true;
}

int main()
{
    bool ok = true;
    ok &= test_placeholder();
    std::cout << (ok ? "all tests passed\n" : "tests FAILED\n");
    return ok ? 0 : 1;
}
