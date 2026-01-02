use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use std::collections::VecDeque;

// Mock implementation of BlockingQueue since it's a dependency
#[derive(Debug)]
pub struct BlockingQueue<T> {
    queue: Arc<Mutex<VecDeque<T>>>,
}

impl<T> BlockingQueue<T> 
where 
    T: Clone + std::fmt::Debug + Send + 'static,
{
    pub fn new() -> Self {
        BlockingQueue {
            queue: Arc::new(Mutex::new(VecDeque::new())),
        }
    }

    pub fn enqueue(&self, item: T) {
        let mut queue = self.queue.lock().unwrap();
        queue.push_back(item);
    }

    pub fn dequeue(&self) -> Option<T> {
        let mut queue = self.queue.lock().unwrap();
        queue.pop_front()
    }

    pub fn blocking_dequeue(&self) -> T {
        loop {
            if let Some(item) = self.dequeue() {
                return item;
            }
            thread::sleep(Duration::from_millis(10));
        }
    }
}

impl<T> Clone for BlockingQueue<T> {
    fn clone(&self) -> Self {
        BlockingQueue {
            queue: Arc::clone(&self.queue),
        }
    }
}

// ThreadPool implementation based on the interface
pub struct ThreadPool<M> 
where 
    M: std::fmt::Debug + Clone + Send + 'static,
{
    threads: Vec<thread::JoinHandle<()>>,
    queue: BlockingQueue<M>,
    result_queue: BlockingQueue<M>,
}

impl<M> ThreadPool<M>
where
    M: std::fmt::Debug + Clone + Send + 'static + Default,
{
    /// Constructs a new threadpool with specified number of threads and processing function
    pub fn new<F>(nt: u8, f: F) -> ThreadPool<M>
    where
        F: FnOnce(&BlockingQueue<M>) -> () + Send + 'static + Copy,
    {
        let queue = BlockingQueue::new();
        let result_queue = BlockingQueue::new();
        let mut threads = Vec::new();

        for i in 0..nt {
            let queue_clone = queue.clone();
            let result_queue_clone = result_queue.clone();
            
            let handle = thread::spawn(move || {
                println!("Thread {} started", i);
                f(&queue_clone);
                println!("Thread {} finished", i);
            });
            
            threads.push(handle);
        }

        ThreadPool {
            threads,
            queue,
            result_queue,
        }
    }

    /// Waits for all threads in the pool to finish execution
    pub fn wait(&mut self) {
        while let Some(handle) = self.threads.pop() {
            if let Err(e) = handle.join() {
                eprintln!("Thread panicked: {:?}", e);
            }
        }
    }

    /// Posts a message to the ThreadPool's blocking queue for processing
    pub fn post_message(&mut self, msg: M)
    where
        M: std::fmt::Debug + Clone,
    {
        println!("Posting message: {:?}", msg);
        self.queue.enqueue(msg);
    }

    /// Returns results from the threadpool (currently returns default value - incomplete implementation)
    pub fn get_message(&mut self) -> M
    where
        M: std::fmt::Debug + Clone + Default,
    {
        // As noted in the interface, this is an incomplete implementation
        // In a real scenario, this would dequeue from result_queue
        if let Some(result) = self.result_queue.dequeue() {
            println!("Retrieved result: {:?}", result);
            result
        } else {
            println!("No results available, returning default");
            M::default()
        }
    }
}

// Custom message types for demonstration
#[derive(Debug, Clone, Default, PartialEq)]
enum TaskMessage {
    #[default]
    Empty,
    Process(String),
    Calculate(i32, i32),
    Terminate,
}

#[derive(Debug, Clone, Default)]
struct WorkItem {
    id: u32,
    data: String,
    priority: u8,
}

fn main() {
    println!("=== ThreadPool Library Demonstration ===\n");

    // Demonstration 1: Basic ThreadPool creation and message processing
    println!("1. Creating ThreadPool with task processing function");
    println!("   - Creating pool with 3 threads");
    
    let task_processor = |queue: &BlockingQueue<TaskMessage>| {
        let thread_id = thread::current().id();
        loop {
            match queue.blocking_dequeue() {
                TaskMessage::Process(data) => {
                    println!("   Thread {:?}: Processing data: {}", thread_id, data);
                    thread::sleep(Duration::from_millis(100)); // Simulate work
                }
                TaskMessage::Calculate(a, b) => {
                    let result = a + b;
                    println!("   Thread {:?}: Calculated {} + {} = {}", thread_id, a, b, result);
                    thread::sleep(Duration::from_millis(50));
                }
                TaskMessage::Terminate => {
                    println!("   Thread {:?}: Received termination signal", thread_id);
                    break;
                }
                TaskMessage::Empty => {
                    println!("   Thread {:?}: Received empty message", thread_id);
                }
            }
        }
    };

    let mut pool = ThreadPool::new(3, task_processor);
    println!("   ThreadPool created successfully!\n");

    // Demonstration 2: post_message function
    println!("2. Demonstrating post_message function");
    println!("   - Posting various types of messages to the thread pool");
    
    pool.post_message(TaskMessage::Process("Hello World".to_string()));
    pool.post_message(TaskMessage::Calculate(15, 25));
    pool.post_message(TaskMessage::Process("Data processing task".to_string()));
    pool.post_message(TaskMessage::Calculate(100, 200));
    pool.post_message(TaskMessage::Process("Final task".to_string()));
    
    // Allow some time for processing
    thread::sleep(Duration::from_millis(300));
    println!("   All messages posted and processing...\n");

    // Demonstration 3: get_message function
    println!("3. Demonstrating get_message function");
    println!("   - Attempting to retrieve results (note: incomplete implementation)");
    
    let result1 = pool.get_message();
    let result2 = pool.get_message();
    println!("   Retrieved results: {:?}, {:?}\n", result1, result2);

    // Send termination signals
    println!("4. Sending termination signals to threads");
    for i in 0..3 {
        pool.post_message(TaskMessage::Terminate);
        println!("   Sent termination signal {}", i + 1);
    }

    // Demonstration 4: wait function
    println!("\n5. Demonstrating wait function");
    println!("   - Waiting for all threads to complete...");
    
    pool.wait();
    println!("   All threads have finished execution!\n");

    // Demonstration with custom WorkItem type
    println!("6. Advanced demonstration with custom WorkItem type");
    println!("   - Creating a new ThreadPool for WorkItem processing");

    let work_processor = |queue: &BlockingQueue<WorkItem>| {
        let thread_id = thread::current().id();
        let mut processed_count = 0;
        
        loop {
            let item = queue.blocking_dequeue();
            if item.id == 999 { // Special termination ID
                println!("   Thread {:?}: Terminating after processing {} items", 
                        thread_id, processed_count);
                break;
            }
            
            processed_count += 1;
            println!("   Thread {:?}: Processing WorkItem {{ id: {}, data: '{}', priority: {} }}", 
                    thread_id, item.id, item.data, item.priority);
            
            // Simulate work based on priority (higher priority = more work)
            thread::sleep(Duration::from_millis(item.priority as u64 * 20));
        }
    };

    let mut work_pool = ThreadPool::new(2, work_processor);

    // Post work items
    let work_items = vec![
        WorkItem { id: 1, data: "High priority task".to_string(), priority: 5 },
        WorkItem { id: 2, data: "Medium priority task".to_string(), priority: 3 },
        WorkItem { id: 3, data: "Low priority task".to_string(), priority: 1 },
        WorkItem { id: 4, data: "Another high priority".to_string(), priority: 5 },
        WorkItem { id: 5, data: "Quick task".to_string(), priority: 1 },
    ];

    for item in work_items {
        work_pool.post_message(item);
    }

    thread::sleep(Duration::from_millis(500));

    // Test get_message with WorkItem
    println!("\n7. Testing get_message with WorkItem type");
    let work_result = work_pool.get_message();
    println!("   Work result: {:?}", work_result);

    // Send termination signals for work pool
    for _ in 0..2 {
        work_pool.post_message(WorkItem { id: 999, data: "terminate".to_string(), priority: 0 });
    }

    println!("\n8. Waiting for work processing threads to complete");
    work_pool.wait();
    println!("   Work processing complete!\n");

    // Demonstration of error handling scenarios
    println!("9. Demonstrating error handling scenarios");
    println!("   - Creating ThreadPool with single thread for quick demonstration");
    
    let simple_processor = |queue: &BlockingQueue<String>| {
        let item = queue.blocking_dequeue();
        if item == "panic" {
            panic!("Intentional panic for demonstration");
        }
        println!("   Processed: {}", item);
    };

    let mut error_pool = ThreadPool::new(1, simple_processor);
    error_pool.post_message("normal_task".to_string());
    
    // Allow processing time
    thread::sleep(Duration::from_millis(100));
    error_pool.wait();

    println!("   Error handling demonstration complete\n");

    println!("=== All ThreadPool functions demonstrated successfully! ===");
    println!("\nSummary of demonstrated functions:");
    println!("✓ ThreadPool::new() - Created thread pools with different configurations");
    println!("✓ post_message() - Posted various message types to thread pools");
    println!("✓ get_message() - Retrieved results (showing incomplete implementation)");
    println!("✓ wait() - Waited for thread completion multiple times");
    println!("\nDemonstration includes:");
    println!("- Multiple message types (TaskMessage, WorkItem, String)");
    println!("- Different thread pool sizes (1, 2, 3 threads)");
    println!("- Concurrent processing simulation");
    println!("- Proper cleanup and termination");
    println!("- Error handling scenarios");
}