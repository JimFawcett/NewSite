// Initialize dropdown menus
// Initialize dropdown menus
function initDropdowns() {
    console.log('initDropdowns called');
    
    // Get all dropdowns (parent containers)
    const dropdowns = document.querySelectorAll('.dropdown');
    console.log('Found ' + dropdowns.length + ' dropdowns');

    dropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('.dropdown-button');
        const dropdownList = dropdown.querySelector('.dropdown-list');
        
        if (!button || !dropdownList) {
            console.error('Missing button or list in dropdown');
            return;
        }
        
        console.log('Setting up dropdown:', button.textContent);
        
        // Hover on entire dropdown container opens it
        dropdown.addEventListener('mouseenter', function(e) {
            console.log('Mouse entered dropdown:', button.textContent);
            
            // Close all other dropdowns
            document.querySelectorAll('.dropdown').forEach(dd => {
                if (dd !== dropdown) {
                    const list = dd.querySelector('.dropdown-list');
                    const btn = dd.querySelector('.dropdown-button');
                    if (list) list.classList.remove('show');
                    if (btn) btn.classList.remove('active');
                }
            });
            
            // Calculate position for fixed positioning
            const buttonRect = button.getBoundingClientRect();
            dropdownList.style.top = (buttonRect.bottom + 5) + 'px';
            dropdownList.style.left = buttonRect.left + 'px';
            
            // Show this dropdown
            dropdownList.classList.add('show');
            button.classList.add('active');
        });
        
        // Mouse leave from dropdown container closes it
        dropdown.addEventListener('mouseleave', function() {
            console.log('Mouse left dropdown');
            dropdownList.classList.remove('show');
            button.classList.remove('active');
        });
        
        // Optional: Keep dropdown open when clicking links
        dropdownList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function(e) {
                // Dropdown stays open - navigation will happen naturally
                console.log('Link clicked:', this.textContent);
            });
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                const list = dropdown.querySelector('.dropdown-list');
                const btn = dropdown.querySelector('.dropdown-button');
                if (list) list.classList.remove('show');
                if (btn) btn.classList.remove('active');
            });
        }
    });
    
    console.log('initDropdowns completed');
}
// Call initDropdowns from your load() function