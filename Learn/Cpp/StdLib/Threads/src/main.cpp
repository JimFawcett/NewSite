// Threads - std::thread, join, mutex, lock_guard, shared data.

#include <iostream>
#include <thread>
#include <mutex>
#include <vector>
#include <string>

std::mutex g_mutex;

void worker(int id, int& shared_count) {
    std::lock_guard<std::mutex> lock(g_mutex);
    ++shared_count;
    std::cout << "thread " << id << " incremented count to " << shared_count << "\n";
}

void print_range(int start, int end, const std::string& label) {
    for (int i = start; i < end; ++i) {
        std::lock_guard<std::mutex> lock(g_mutex);
        std::cout << label << ": " << i << "\n";
    }
}

int main() {
    // --- basic thread: join ---
    std::cout << "--- join ---\n";
    {
        int count = 0;
        std::vector<std::thread> threads;
        for (int i = 0; i < 4; ++i)
            threads.emplace_back(worker, i, std::ref(count));
        for (auto& t : threads)
            t.join();
        std::cout << "final count: " << count << "\n";
    }

    // --- passing a lambda ---
    std::cout << "\n--- lambda thread ---\n";
    {
        int x = 10;
        std::thread t([&x]() {
            std::lock_guard<std::mutex> lock(g_mutex);
            x *= 2;
            std::cout << "x in thread: " << x << "\n";
        });
        t.join();
        std::cout << "x after join: " << x << "\n";
    }

    // --- multiple threads with interleaved output (guarded) ---
    std::cout << "\n--- two threads ---\n";
    {
        std::thread t1(print_range, 0, 3, "A");
        std::thread t2(print_range, 0, 3, "B");
        t1.join();
        t2.join();
    }

    return 0;
}
