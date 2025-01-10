/* toggle left panel */

function setToggleLeftPanel() {
  // JavaScript for toggling the left panel
  const toggleButton = document.getElementById('toggleButton');
  const mainGrid = document.getElementById('mainGrid');

  toggleButton.addEventListener('click', () => {
    // Check the current grid layout
    const currentTemplate = getComputedStyle(mainGrid).gridTemplateColumns;

    if (currentTemplate.startsWith('0px')) {
      // Hide the left panel by setting its column width to 0
      mainGrid.style.gridTemplateColumns = 'var(--lpanelw) 1fr';
    } else {
      // Show the left panel by restoring its original width
      mainGrid.style.gridTemplateColumns = '0px 1fr';
    }
  });
}

// This works!
// function setToggleLeftPanel() {

//   const toggleButton = document.getElementById('toggleButton');
//   const mainGrid = document.querySelector(".main");
//   // const mainGrid = document.getElementById('mainGrid');

//   toggleButton.addEventListener('click', () => {
//     // Check the current grid layout
//     const currentTemplate = getComputedStyle(mainGrid).gridTemplateColumns;

//     if (currentTemplate.startsWith('0px')) {
//       // Hide the left panel by setting its column width to 0
//       mainGrid.style.gridTemplateColumns = 'var(--lpanelw) 1fr';
//     } else {
//       // Show the left panel by restoring its original width
//       mainGrid.style.gridTemplateColumns = '0px 1fr';
//     }
//   });

//   if (currentTemplate.startsWith('var(--lpanelw)')) {
//     // Hide the left panel by setting its column width to 0
//     mainGrid.style.gridTemplateColumns = '0 1fr';
//   } else {
//     // Show the left panel by restoring its original width
//     mainGrid.style.gridTemplateColumns = 'var(--lpanelw) 1fr';
//   }
// });

  // const toggleButton = document.getElementById('toggleButton');
  // const leftPanel = document.getElementById('leftPanel');
  // const mainGrid = document.querySelector(".main");

  // toggleButton.addEventListener('click', () => {
  //   if (leftPanel.classList.contains('hidden')) {
  //     leftPanel.classList.remove('hidden');
  //     mainGrid.style.gridTemplateColumns = 'var(--lpanelw) 1fr'; // Reset grid
  //   } else {
  //     leftPanel.classList.add('hidden');
  //     mainGrid.style.gridTemplateColumns = '0 1fr'; // Expand right panel
  //   }
  // });
//}