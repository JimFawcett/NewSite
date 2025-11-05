// Initialize dropdown menus
function initDropdowns() {
    console.log('initDropdowns called');
    
    // Get all dropdown buttons
    const dropdownButtons = document.querySelectorAll('.dropdown-button');
    console.log('Found ' + dropdownButtons.length + ' dropdown buttons');

    // Add hover event listener to each button to open dropdown
    dropdownButtons.forEach(button => {
        console.log('Adding listeners to button:', button.textContent);
        
        // Store reference to dropdown list on the button
        const dropdownList = button.nextElementSibling;
        button._dropdownList = dropdownList;
        
        button.addEventListener('mouseenter', function(e) {
            e.stopPropagation();
            console.log('Mouse entered button:', this.textContent);
            
            // Get the dropdown list from stored reference
            const dropdownList = this._dropdownList;
            console.log('dropdownList found:', dropdownList);
            
            if (!dropdownList) {
                console.error('No dropdown list found for button');
                return;
            }
            
            console.log('dropdownList classes before:', dropdownList.className);
            
            // Store close-on-click preference from parent dropdown
            const parentDropdown = button.closest('.dropdown');
            if (parentDropdown && parentDropdown.classList.contains('close-on-click')) {
                dropdownList.setAttribute('data-close-on-click', 'true');
            }
            
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-button').forEach(btn => {
                if (btn !== this && btn._dropdownList) {
                    btn._dropdownList.classList.remove('show');
                    btn.classList.remove('active');
                }
            });
            
            // Move dropdown to body to escape stacking context
            if (dropdownList.parentElement !== document.body) {
                // Store original parent for later
                dropdownList.setAttribute('data-original-parent', dropdownList.parentElement.id || 'menu-bar');
                document.body.appendChild(dropdownList);
            }
            
            // Calculate position for fixed positioning
            const buttonRect = this.getBoundingClientRect();
            dropdownList.style.top = (buttonRect.bottom + 5) + 'px';
            dropdownList.style.left = buttonRect.left + 'px';
            
            // Show the current dropdown
            dropdownList.classList.add('show');
            this.classList.add('active');
            console.log('dropdownList classes after:', dropdownList.className);
            console.log('dropdownList display style:', window.getComputedStyle(dropdownList).display);
            
            // Debug position and size
            const rect = dropdownList.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(dropdownList);
            console.log('Dropdown position - top:', rect.top, 'left:', rect.left, 'bottom:', rect.bottom);
            console.log('Dropdown size - width:', rect.width, 'height:', rect.height);
            console.log('Viewport height:', window.innerHeight);
            console.log('Is dropdown visible in viewport?', rect.top >= 0 && rect.bottom <= window.innerHeight);
            console.log('Computed styles:');
            console.log('  display:', computedStyle.display);
            console.log('  visibility:', computedStyle.visibility);
            console.log('  opacity:', computedStyle.opacity);
            console.log('  z-index:', computedStyle.zIndex);
            console.log('  position:', computedStyle.position);
            console.log('  background-color:', computedStyle.backgroundColor);
            console.log('  pointer-events:', computedStyle.pointerEvents);
            
            // Check what element is actually at the dropdown position
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const elementAtPoint = document.elementFromPoint(centerX, centerY);
            console.log('Element at dropdown center:', elementAtPoint);
            console.log('Is it the dropdown list?', elementAtPoint === dropdownList || dropdownList.contains(elementAtPoint));
            
            // Check iframe z-index
            if (elementAtPoint && elementAtPoint.tagName === 'IFRAME') {
                const iframeStyle = window.getComputedStyle(elementAtPoint);
                console.log('Iframe z-index:', iframeStyle.zIndex);
                const frameDiv = document.getElementById('frame');
                if (frameDiv) {
                    console.log('Frame div z-index:', window.getComputedStyle(frameDiv).zIndex);
                }
            }
        });
        
        // Add click event listener to toggle dropdown
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Button clicked:', this.textContent);
            
            // Get the dropdown list from stored reference
            const dropdownList = this._dropdownList;
            
            if (!dropdownList) {
                console.error('No dropdown list found for button');
                return;
            }
            
            // Store close-on-click preference from parent dropdown
            const parentDropdown = this.closest('.dropdown');
            if (parentDropdown && parentDropdown.classList.contains('close-on-click')) {
                dropdownList.setAttribute('data-close-on-click', 'true');
            }
            
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-button').forEach(btn => {
                if (btn !== this && btn._dropdownList) {
                    btn._dropdownList.classList.remove('show');
                    btn.classList.remove('active');
                }
            });
            
            // Move dropdown to body to escape stacking context
            if (dropdownList.parentElement !== document.body) {
                dropdownList.setAttribute('data-original-parent', dropdownList.parentElement.id || 'menu-bar');
                document.body.appendChild(dropdownList);
            }
            
            // Calculate position for fixed positioning
            const buttonRect = this.getBoundingClientRect();
            dropdownList.style.top = (buttonRect.bottom + 5) + 'px';
            dropdownList.style.left = buttonRect.left + 'px';
            
            // Toggle the current dropdown
            dropdownList.classList.toggle('show');
            this.classList.toggle('active');
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown') && !e.target.closest('.dropdown-list')) {
            document.querySelectorAll('.dropdown-button').forEach(btn => {
                if (btn._dropdownList) {
                    btn._dropdownList.classList.remove('show');
                    btn.classList.remove('active');
                }
            });
        }
    });

    // Close dropdown when clicking on a link (only if dropdown has 'close-on-click' class)
    document.querySelectorAll('.dropdown-list a').forEach(link => {
        link.addEventListener('click', function() {
            // Find the parent dropdown or check data attribute
            const dropdownList = this.closest('.dropdown-list');
            if (!dropdownList) return;
            
            const closeOnClick = dropdownList.getAttribute('data-close-on-click') === 'true';
            
            if (closeOnClick) {
                document.querySelectorAll('.dropdown-list').forEach(list => {
                    list.classList.remove('show');
                    // Find associated button
                    const associatedButton = Array.from(dropdownButtons).find(btn => btn._dropdownList === list);
                    if (associatedButton) {
                        associatedButton.classList.remove('active');
                    }
                });
            }
        });
    });

    // Close dropdown on mouseleave from the list
    document.querySelectorAll('.dropdown-list').forEach(dropdownList => {
        dropdownList.addEventListener('mouseleave', function() {
            // Find associated button
            const associatedButton = Array.from(dropdownButtons).find(btn => btn._dropdownList === this);
            
            this.classList.remove('show');
            if (associatedButton) {
                associatedButton.classList.remove('active');
            }
        });
    });
    
    console.log('initDropdowns completed');
}

// Call initDropdowns from your load() function
// Add this line to your existing load() function:
//   initDropdowns();