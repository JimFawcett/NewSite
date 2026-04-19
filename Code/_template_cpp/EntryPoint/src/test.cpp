import std;

bool test_placeholder()
{
    return true;
}

int main()
{
    bool ok = true;
    ok &= test_placeholder();
    std::cout << (ok ? "all tests passed\n" : "tests FAILED\n");
    return ok ? 0 : 1;
}
