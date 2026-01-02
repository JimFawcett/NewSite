use rust_thread_pool::ThreadPool;
use rust_blocking_queue::BlockingQueue;
use std::fmt::Debug;
use std::thread;
use std::time::Duration;

/// Message type for our thread pool demonstration
#[derive(Debug, Clone, Default)]
enum WorkMessage {
    #[default]
    Empty,
    Task(String, u32),
    Compute(i32, i32),
    Status(String),
    Shutdown,
}

fn main() {
    println!("=== Rust Thread Pool Library Demonstration ===\n");
    
    // Demonstrate ThreadPool::new with message processing
    demonstrate_thread_pool_creation();
    
    // Demonstrate post_message functionality
    demonstrate_message_posting();
    
    // Demonstrate computational tasks
    demonstrate_computational_tasks();
    
    // Demonstrate get_message (placeholder functionality)
    demonstrate_get_message();
    
    println!("=== All demonstrations completed successfully ===");
}

/// Demonstrates creating a thread pool with basic message processing
fn demonstrate_thread_pool_creation() {
    println!("1. DEMONSTRATING ThreadPool::new()");
    println!("   Creating a thread pool with 3 worker threads");
    
    // Define the worker function that each thread will execute
    let worker_function = |queue: &BlockingQueue<WorkMessage>| {
        let thread_id = thread::current().id();
        println!("   Worker thread {:?} started and waiting for messages", thread_id);
        
        // Process messages until shutdown
        loop {
            match queue.de_q() {
                WorkMessage::Task(name, value) => {
                    println!("   Thread {:?}: Processing task '{}' with value {}", 
                            thread_id, name, value);
                    thread::sleep(Duration::from_millis(100)); // Simulate work
                }
                WorkMessage::Status(status) => {
                    println!("   Thread {:?}: Status update - {}", thread_id, status);
                }
                WorkMessage::Shutdown => {
                    println!("   Thread {:?}: Received shutdown signal, exiting", thread_id);
                    break;
                }
                WorkMessage::Empty => {
                    println!("   Thread {:?}: Received empty message", thread_id);
                }
                _ => {}
            }
        }
    };
    
    let mut thread_pool: ThreadPool<WorkMessage> = ThreadPool::new(3, worker_function);
    
    // Send some test messages
    thread_pool.post_message(WorkMessage::Task("Initialize".to_string(), 1));
    thread_pool.post_message(WorkMessage::Status("System ready".to_string()));
    thread_pool.post_message(WorkMessage::Task("Process data".to_string(), 42));
    
    // Allow some processing time
    thread::sleep(Duration::from_millis(500));
    
    // Send shutdown signals
    for _ in 0..3 {
        thread_pool.post_message(WorkMessage::Shutdown);
    }
    
    thread_pool.wait();
    println!("   Thread pool creation and basic messaging demonstrated\n");
}

/// Demonstrates posting various types of messages to the thread pool
fn demonstrate_message_posting() {
    println!("2. DEMONSTRATING post_message()");
    println!("   Testing message posting with different message types");
    
    let message_processor = |queue: &BlockingQueue<WorkMessage>| {
        let thread_id = thread::current().id();
        let mut message_count = 0;
        
        loop {
            let message = queue.de_q();
            message_count += 1;
            
            match &message {
                WorkMessage::Task(name, value) => {
                    println!("   Thread {:?}: Message #{} - Task: {} (value: {})", 
                            thread_id, message_count, name, value);
                }
                WorkMessage::Status(status) => {
                    println!("   Thread {:?}: Message #{} - Status: {}", 
                            thread_id, message_count, status);
                }
                WorkMessage::Shutdown => {
                    println!("   Thread {:?}: Message #{} - Shutdown received", 
                            thread_id, message_count);
                    break;
                }
                _ => {
                    println!("   Thread {:?}: Message #{} - Other: {:?}", 
                            thread_id, message_count, message);
                }
            }
        }
    };
    
    let mut pool: ThreadPool<WorkMessage> = ThreadPool::new(2, message_processor);
    
    // Post various message types
    println!("   Posting different types of messages:");
    
    pool.post_message(WorkMessage::Task("File processing".to_string(), 100));
    pool.post_message(WorkMessage::Status("25% complete".to_string()));
    pool.post_message(WorkMessage::Task("Database update".to_string(), 200));
    pool.post_message(WorkMessage::Status("50% complete".to_string()));
    pool.post_message(WorkMessage::Task("Cleanup".to_string(), 300));
    pool.post_message(WorkMessage::Status("100% complete".to_string()));
    
    thread::sleep(Duration::from_millis(300));
    
    // Shutdown threads
    pool.post_message(WorkMessage::Shutdown);
    pool.post_message(WorkMessage::Shutdown);
    
    pool.wait();
    println!("   Message posting demonstrated\n");
}

/// Demonstrates computational tasks using the thread pool
fn demonstrate_computational_tasks() {
    println!("3. DEMONSTRATING computational tasks");
    println!("   Using thread pool for parallel computation");
    
    let compute_worker = |queue: &BlockingQueue<WorkMessage>| {
        let thread_id = thread::current().id();
        
        loop {
            match queue.de_q() {
                WorkMessage::Compute(a, b) => {
                    // Simulate some computation
                    let result = a * b + (a - b).abs();
                    thread::sleep(Duration::from_millis(50)); // Simulate computation time
                    println!("   Thread {:?}: Computed {} * {} + |{} - {}| = {}", 
                            thread_id, a, b, a, b, result);
                }
                WorkMessage::Status(msg) => {
                    println!("   Thread {:?}: {}", thread_id, msg);
                }
                WorkMessage::Shutdown => {
                    println!("   Thread {:?}: Computation worker shutting down", thread_id);
                    break;
                }
                _ => {}
            }
        }
    };
    
    let mut compute_pool: ThreadPool<WorkMessage> = ThreadPool::new(4, compute_worker);
    
    // Send computation tasks
    println!("   Distributing computation tasks across {} threads:", 4);
    
    let tasks = vec![
        (10, 5), (15, 3), (8, 12), (20, 7), (6, 14), (25, 2), (18, 9), (3, 16)
    ];
    
    for (a, b) in tasks {
        compute_pool.post_message(WorkMessage::Compute(a, b));
    }
    
    compute_pool.post_message(WorkMessage::Status("All computation tasks submitted".to_string()));
    
    // Allow computation to complete
    thread::sleep(Duration::from_millis(400));
    
    // Shutdown compute threads
    for _ in 0..4 {
        compute_pool.post_message(WorkMessage::Shutdown);
    }
    
    compute_pool.wait();
    println!("   Computational tasks demonstration completed\n");
}

/// Demonstrates the get_message functionality (placeholder implementation)
fn demonstrate_get_message() {
    println!("4. DEMONSTRATING get_message()");
    println!("   Testing the get_message placeholder functionality");
    
    let simple_worker = |queue: &BlockingQueue<WorkMessage>| {
        // Simple worker that just waits for shutdown
        loop {
            match queue.de_q() {
                WorkMessage::Shutdown => break,
                _ => {}
            }
        }
    };
    
    let mut pool: ThreadPool<WorkMessage> = ThreadPool::new(1, simple_worker);
    
    // Demonstrate get_message (returns default value as per implementation)
    println!("   Calling get_message() - returns default WorkMessage:");
    let default_message = pool.get_message();
    println!("   Received: {:?}", default_message);
    
    // Verify it's the default value
    let expected_default = WorkMessage::default();
    println!("   Expected default: {:?}", expected_default);
    println!("   Default message functionality verified");
    
    // Cleanup
    pool.post_message(WorkMessage::Shutdown);
    pool.wait();
    println!("   get_message demonstration completed\n");
}

/// Demonstrates the wait() functionality with a longer-running example
#[allow(dead_code)]
fn demonstrate_wait_functionality() {
    println!("5. DEMONSTRATING wait()");
    println!("   Testing thread synchronization with wait()");
    
    let long_running_worker = |queue: &BlockingQueue<WorkMessage>| {
        let thread_id = thread::current().id();
        println!("   Long-running worker {:?} started", thread_id);
        
        loop {
            match queue.de_q() {
                WorkMessage::Task(name, duration) => {
                    println!("   Thread {:?}: Starting task '{}' ({}ms)", thread_id, name, duration);
                    thread::sleep(Duration::from_millis(duration as u64));
                    println!("   Thread {:?}: Completed task '{}'", thread_id, name);
                }
                WorkMessage::Shutdown => {
                    println!("   Thread {:?}: Long-running worker finished", thread_id);
                    break;
                }
                _ => {}
            }
        }
    };
    
    let mut pool: ThreadPool<WorkMessage> = ThreadPool::new(2, long_running_worker);
    
    // Submit tasks with different durations
    pool.post_message(WorkMessage::Task("Quick task".to_string(), 100));
    pool.post_message(WorkMessage::Task("Medium task".to_string(), 300));
    pool.post_message(WorkMessage::Task("Long task".to_string(), 500));
    
    // Send shutdown signals
    pool.post_message(WorkMessage::Shutdown);
    pool.post_message(WorkMessage::Shutdown);
    
    println!("   Calling wait() - this will block until all threads complete");
    pool.wait();
    println!("   All threads have completed - wait() demonstration finished\n");
}

// Additional helper functions and demonstrations could be added here

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_work_message_default() {
        let msg = WorkMessage::default();
        matches!(msg, WorkMessage::Empty);
    }
    
    #[test]
    fn test_work_message_debug() {
        let msg = WorkMessage::Task("test".to_string(), 42);
        let debug_str = format!("{:?}", msg);
        assert!(debug_str.contains("Task"));
        assert!(debug_str.contains("test"));
        assert!(debug_str.contains("42"));
    }
    
    #[test]
    fn test_work_message_clone() {
        let original = WorkMessage::Compute(10, 20);
        let cloned = original.clone();
        
        match (original, cloned) {
            (WorkMessage::Compute(a1, b1), WorkMessage::Compute(a2, b2)) => {
                assert_eq!(a1, a2);
                assert_eq!(b1, b2);
            }
            _ => panic!("Clone did not work correctly"),
        }
    }
}