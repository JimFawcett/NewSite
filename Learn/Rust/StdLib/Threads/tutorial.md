# Threads

## S9.0 What This Teaches

Rust's ownership model makes data-race-free concurrency a compile-time guarantee rather
than a runtime hope. This tutorial covers:

- Spawning a thread with `thread::spawn`
- Waiting for a thread with `join`
- Moving data into a thread with `move` closures
- Sharing mutable state safely with `Arc<Mutex<T>>`
- Collecting return values from multiple threads

---

## S9.1 spawn and join

`thread::spawn` takes a closure and runs it on a new OS thread. It returns a
`JoinHandle` that you call `.join()` on to wait for completion:

```rust
use std::thread;

let handle = thread::spawn(|| {
    println!("hello from the new thread");
});

println!("hello from main");
handle.join().unwrap();   // blocks until the spawned thread finishes
```

Without `join`, the main thread may exit before the spawned thread finishes, silently
dropping its output.

---

## S9.2 move Closures

Threads must own any data they use - a reference to stack data on the calling thread
would dangle if the caller returned first. The `move` keyword transfers ownership:

```rust
let data = vec![1, 2, 3];
let handle = thread::spawn(move || {
    println!("{data:?}");   // data is owned by this thread
});
handle.join().unwrap();
// data is no longer usable in the calling thread here
```

The compiler requires `move` whenever the spawned closure would otherwise borrow
something that might not live long enough.

---

## S9.3 Arc\<Mutex\<T\>\> - Shared Mutable State

`Arc<T>` (atomic reference count) enables shared ownership across threads.
`Mutex<T>` ensures only one thread modifies the value at a time. The combination
gives safe shared mutable state:

```rust
use std::sync::{Arc, Mutex};

let counter = Arc::new(Mutex::new(0));
let mut handles = vec![];

for _ in 0..5 {
    let c = Arc::clone(&counter);
    handles.push(thread::spawn(move || {
        *c.lock().unwrap() += 1;   // lock blocks until the mutex is free
    }));
}

for h in handles { h.join().unwrap(); }
println!("{}", *counter.lock().unwrap());   // 5
```

`lock()` returns a `MutexGuard` that holds the lock while in scope. The lock is
released automatically when the guard is dropped - no need to unlock explicitly.

---

## S9.4 Collecting Return Values

`JoinHandle<T>` is generic over the thread's return value. `.join()` returns
`Result<T, _>`:

```rust
let results: Vec<i32> = (0..4)
    .map(|i| thread::spawn(move || i * i))
    .collect::<Vec<_>>()
    .into_iter()
    .map(|h| h.join().unwrap())
    .collect();
println!("{results:?}");   // [0, 1, 4, 9]
```

---

## S9.5 Expected Output

Thread and main output may interleave in different orders on each run - the OS
scheduler decides. The exact sequence of the `spawn and join` section varies.

```
--- spawn and join ---
main:   0
thread: 0
main:   1
thread: 1
main:   2
thread: 2
--- move closure ---
thread sees: [1, 2, 3]
--- Arc<Mutex<T>> ---
counter: 5
--- return values ---
[0, 1, 4, 9]
```

---

## S9.6 Exercise

1. Spawn 4 threads, each printing its index (0-3). Join all of them. Note that the
   print order may vary.

2. Use `Arc<Mutex<Vec<i32>>>` to collect results from 5 threads into a shared vec,
   where thread `i` pushes `i * 10`. After joining all threads, sort and print the vec.

3. Spawn a thread that computes the sum of integers 1 to 1000 and returns the result
   via the `JoinHandle`. Print the returned value in the main thread.

---

## S9.7 Common Mistakes

**Not joining threads**

```rust
for _ in 0..5 {
    thread::spawn(|| println!("work"));
}
// main exits here; threads may never run
```

Always join threads unless you explicitly want fire-and-forget behavior. Dropped
`JoinHandle` values detach the thread but do not wait for it.

**Using Rc instead of Arc across threads**

```rust
let r = Rc::new(42);
thread::spawn(move || println!("{r}"));   // error: Rc is not Send
```

`Rc` uses non-atomic reference counting and is not safe to share across threads.
Use `Arc`.

**Holding a MutexGuard across an await or over a long operation**

Holding a `MutexGuard` (the value returned by `lock()`) for too long blocks other
threads waiting on the same mutex. Keep the critical section as short as possible:
drop the guard immediately after the operation completes, either by using a `{ }`
block or by not binding it to a long-lived variable.

**Panicking inside a thread poisons the Mutex**

If a thread panics while holding a `Mutex` lock, the mutex becomes "poisoned". Other
threads calling `lock()` on a poisoned mutex get an `Err`. Use `.lock().unwrap_or_else(|e| e.into_inner())`
to recover, or design threads to not panic while holding locks.

---

## S9.8 Key Terms

| Term | Meaning |
|------|---------|
| `thread::spawn` | Creates a new OS thread running the given closure |
| `JoinHandle<T>` | Handle to a spawned thread; `.join()` waits and returns the thread's return value |
| `move` closure | Takes ownership of all captured variables, required for most thread closures |
| `Arc<T>` | Atomically reference-counted pointer; like `Rc` but safe across threads |
| `Mutex<T>` | Mutual exclusion lock; only one thread holds the lock at a time |
| `lock()` | Acquires the `Mutex`; returns a `MutexGuard` that releases the lock on drop |
| `MutexGuard` | RAII guard holding the mutex lock; lock is released when the guard is dropped |
| data race | Two threads accessing the same data concurrently with at least one write - impossible in safe Rust |
| `Send` | Marker trait: types that can be transferred across thread boundaries |
| `Sync` | Marker trait: types that can be referenced from multiple threads simultaneously |
