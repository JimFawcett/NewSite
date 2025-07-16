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

    case 'clear':
      closeMenus();
      break;

    // case 'controls':
    //   let cnt = document.getElementById('controls');
    //   if(cnt.classList.contains('hidden')) {
    //     cnt.classList.remove('hidden');
    //   } else {
    //     cnt.classList.add('hidden');
    //   }
    //   break;

    case 'about':
      let abt = document.getElementById('about');
      if(abt.classList.contains('hidden')) {
        abt.classList.remove('hidden');
      } else {
        abt.classList.add('hidden');
      }
      break;

    case 'keys':
      let kys = document.getElementById('keys');
      if(kys.classList.contains('hidden')) {
        kys.classList.remove('hidden');
      } else {
        kys.classList.add('hidden');
      }
      break;

    case 'url':
      // alert('url');
      let url = document.getElementById('url');
      if(url.classList.contains('hidden')) {
        url.classList.remove('hidden');
        url.innerHTML='<a href=' + window.location.href + '>' + window.location.href + '</a>';
      } else {
        url.classList.add('hidden');
      }
      // alert('done');
      break;

    case 'goto':
      // alert('url');
      let gtm = document.getElementById('goto');
      if(gtm.classList.contains('hidden')) {
        gtm.classList.remove('hidden');
        // gtm.innerHTML='<a href=' + window.location.href + '>' + window.location.href + '</a>';
        // gtm.innerHTML=
        //   "<div style='display:flex; flex-direction:column; flexwrap:nowrap;'>"
        //    + "<div>This Page:</div>"
        //    + "<div>foobar</div><br>" 
        //    + "</div>";
      } else {
        gtm.classList.add('hidden');
      }
      // alert('done');
      break;
      
    default:
      console.log('no match for message data');
  }
};
