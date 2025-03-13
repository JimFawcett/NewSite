window.onmessage = function (event) {
  console.log("Message received in iframe:" + event.data.key + ", " + event.data.value);
  switch(event.data.key) {
    case 'up':
      window.sectionNavigator.up();
      break;
    case 'down':
      window.sectionNavigator.down();
      break;
    case 'next':
      window.pageNavigator.down();
      break;
    case 'prev':
      window.pageNavigator.up();
      break;
    case 'sections':
      let sections = document.getElementById('sections');
      if(sections.classList.contains('hidden')) {
        sections.classList.remove('hidden');
        setCookie('sections', true, 10);
        let pages = document.getElementById('pages');
        pages.classList.add('hidden');
        setCookie('pages', false, 10);
      } else {
        sections.classList.add('hidden');
        setCookie('sections', false, 10);
      }
      break;
    case 'pages':
      let pages = document.getElementById('pages');
      if(pages.classList.contains('hidden')) {
        pages.classList.remove('hidden');
        setCookie('pages', true, 10);
        let sections = document.getElementById('sections');
        sections.classList.add('hidden');
        setCookie('sections', false, 10);
      } else {
        pages.classList.add('hidden');
        setCookie('pages', false, 10);
      }
      break;
      case 'about':
        let abt = document.getElementById('about');
        if(abt.classList.contains('hidden')) {
          abt.classList.remove('hidden');
        } else {
          abt.classList.add('hidden');
        }
        break;
        case 'about':

      case 'keys':
        let kys = document.getElementById('keys');
        if(kys.classList.contains('hidden')) {
          kys.classList.remove('hidden');
        } else {
          kys.classList.add('hidden');
        }
        break;
  
      default:
      console.log('no match for message data');
  }
};
