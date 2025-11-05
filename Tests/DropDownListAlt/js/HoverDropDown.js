// Initialize dropdown menus
function initDropdowns() {
    console.log('initDropdowns called');
    
    // Get all dropdown buttons
    const dropdownButtons = document.querySelectorAll('.dropdown-button');
    console.log('Found ' + dropdownButtons.length + ' dropdown buttons');

    // Add hover event listener to each button to open dropdown
    dropdownButtons.forEach(button => {
        console.log('Adding listeners to button:', button.textContent);
        
        button.addEventListener('mouseenter', function(e) {
            e.stopPropagation();
            console.log('Mouse entered button:', this.textContent);
            
            // Get the dropdown list that is a sibling of this button
            const dropdownList = this.nextElementSibling;
            
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-list').forEach(list => {
                if (list !== dropdownList) {
                    list.classList.remove('show');
                    list.previousElementSibling.classList.remove('active');
                }
            });
            
            // Show the current dropdown
            dropdownList.classList.add('show');
            this.classList.add('active');
        });
        
        // Add click event listener to toggle dropdown
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Button clicked:', this.textContent);
            
            // Get the dropdown list that is a sibling of this button
            const dropdownList = this.nextElementSibling;
            
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-list').forEach(list => {
                if (list !== dropdownList) {
                    list.classList.remove('show');
                    list.previousElementSibling.classList.remove('active');
                }
            });
            
            // Toggle the current dropdown
            dropdownList.classList.toggle('show');
            this.classList.toggle('active');
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-list').forEach(list => {
                list.classList.remove('show');
                list.previousElementSibling.classList.remove('active');
            });
        }
    });

    // Close dropdown when clicking on a link (only if dropdown has 'close-on-click' class)
    document.querySelectorAll('.dropdown-list a').forEach(link => {
        link.addEventListener('click', function() {
            // Check if the parent dropdown has the 'close-on-click' class
            const dropdown = this.closest('.dropdown');
            if (dropdown && dropdown.classList.contains('close-on-click')) {
                document.querySelectorAll('.dropdown-list').forEach(list => {
                    list.classList.remove('show');
                    list.previousElementSibling.classList.remove('active');
                });
            }
        });
    });

    // Close dropdown on mouseleave from the list
    document.querySelectorAll('.dropdown-list').forEach(dropdownList => {
        dropdownList.addEventListener('mouseleave', function() {
            const dropdownButton = this.previousElementSibling;
            
            this.classList.remove('show');
            dropdownButton.classList.remove('active');
        });
    });
    
    console.log('initDropdowns completed');
}

// Call initDropdowns from your load() function
// Add this line to your existing load() function:
//   initDropdowns();