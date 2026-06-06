document.addEventListener('DOMContentLoaded', () => {
  
  /* 1. SCROLL-DRIVEN PROGRESS BAR & PREDICTIVE HEADER */
  const progressBar = document.querySelector('.progress-bar');
  const header = document.querySelector('header');
  
  const handleScrollEffects = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // Mathematically link top progress bar width to scroll position
    if (scrollHeight > 0 && progressBar) {
      const progressPercent = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = `${progressPercent}%`;
    }
    
    // Predictive header glassmorphism transition
    if (header) {
      if (scrollTop > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  };

  window.addEventListener('scroll', handleScrollEffects);
  handleScrollEffects(); // run once on load

  /* 2. MOBILE NAVIGATION HAMBURGER MENU */
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  /* 3. SCROLLYTELLING PINNED DIAPOSITIVES */
  const scrollyContainer = document.querySelector('.scrolly-container');
  if (scrollyContainer) {
    const slides = scrollyContainer.querySelectorAll('.scrolly-slide');
    const numSlides = slides.length;

    const updateScrollytelling = () => {
      const containerTop = scrollyContainer.offsetTop;
      const containerHeight = scrollyContainer.offsetHeight;
      const viewHeight = window.innerHeight;
      const scrollTop = window.scrollY;

      const scrollRange = containerHeight - viewHeight;
      if (scrollRange <= 0) return;

      // Calculate relative progress (0 to 1) inside scrollytelling container
      let progress = (scrollTop - containerTop) / scrollRange;
      progress = Math.max(0, Math.min(1, progress));

      // Determine active slide index
      let activeIndex = Math.floor(progress * numSlides);
      if (activeIndex >= numSlides) activeIndex = numSlides - 1;

      slides.forEach((slide, idx) => {
        if (idx === activeIndex) {
          slide.classList.add('active');
          
          // Apply extra physical movement on-scroll internally to make it dynamic
          const slideProgress = (progress * numSlides) - idx; // 0 to 1 within this slide
          const content = slide.querySelector('.slide-content');
          
          // Subtle zoom effect on scroll for a premium feel, avoiding any spatial displacement
          const scale = 1.05 - (0.05 * Math.max(0, Math.min(1, slideProgress)));
          slide.style.transform = `scale(${scale})`;
        } else {
          slide.classList.remove('active');
          slide.style.transform = '';
        }
      });
    };

    window.addEventListener('scroll', updateScrollytelling);
    window.addEventListener('resize', updateScrollytelling);
    updateScrollytelling(); // run once on load
  }

  /* 4. INTERACTIVE BEFORE-AFTER SLIDER */
  const sliders = document.querySelectorAll('.before-after-container');
  
  sliders.forEach(slider => {
    const afterImg = slider.querySelector('.image-after');
    const handle = slider.querySelector('.slider-handle');
    let isDragging = false;

    const setPosition = (clientX) => {
      const rect = slider.getBoundingClientRect();
      const positionX = clientX - rect.left;
      let percentage = (positionX / rect.width) * 100;
      
      // Keep boundaries between 0% and 100%
      percentage = Math.max(0, Math.min(100, percentage));
      
      // Update clip-path and handle position
      afterImg.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
      handle.style.left = `${percentage}%`;
    };

    // Mouse events
    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      setPosition(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch events for mobile responsiveness
    handle.addEventListener('touchstart', (e) => {
      isDragging = true;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      if (e.touches.length > 0) {
        setPosition(e.touches[0].clientX);
      }
    });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Support clicking on the container to move the slider
    slider.addEventListener('click', (e) => {
      if (e.target !== handle && !handle.contains(e.target)) {
        setPosition(e.clientX);
      }
    });
  });

  /* 5. FORM GOOGLE CONNECTION & POPUPS */
  // Create hidden iframe for Google Forms submission
  const iframe = document.createElement('iframe');
  iframe.name = 'gform_iframe';
  iframe.id = 'gform_iframe';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  // Helper to add the mandatory privacy checkbox dynamically
  const addPrivacyCheckbox = (form) => {
    // Remove existing checkbox containers to avoid duplication
    const existing = form.querySelector('.privacy-checkbox-wrapper, .form-group-checkbox, .form-privacy-checkbox');
    if (existing) {
      existing.remove();
    }
    
    const wrapper = document.createElement('div');
    wrapper.className = 'privacy-checkbox-wrapper';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'flex-start';
    wrapper.style.gap = '8px';
    wrapper.style.marginTop = '12px';
    wrapper.style.marginBottom = '15px';
    wrapper.style.textAlign = 'left';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.required = true;
    checkbox.id = 'privacy_' + Math.random().toString(36).substr(2, 9);
    checkbox.style.width = 'auto';
    checkbox.style.marginTop = '4px';
    checkbox.style.cursor = 'pointer';
    
    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.innerText = 'usaremos estos datos únicamente para ponernos en contacto por los servicios interesados.';
    label.style.fontSize = '11px';
    label.style.color = '#ccc';
    label.style.lineHeight = '1.3';
    label.style.cursor = 'pointer';
    
    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    
    const submitBtn = form.querySelector('button[type="submit"], button:not([type="button"])');
    if (submitBtn) {
      form.insertBefore(wrapper, submitBtn);
    } else {
      form.appendChild(wrapper);
    }
  };

  // Helper to show custom popup modals
  const showCustomModal = (message, isDownload = false) => {
    const existing = document.querySelector('.custom-modal-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'custom-modal-overlay';
    
    const content = document.createElement('div');
    content.className = 'custom-modal-content';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'custom-modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 400);
    };
    
    const msg = document.createElement('div');
    msg.className = 'custom-modal-message';
    msg.innerText = message;
    
    content.appendChild(closeBtn);
    
    if (isDownload) {
      const title = document.createElement('h3');
      title.innerText = 'Tu guía está lista';
      title.style.marginBottom = '20px';
      title.style.fontFamily = 'var(--font-subtitle)';
      title.style.textTransform = 'uppercase';
      content.appendChild(title);
      
      const btn = document.createElement('a');
      btn.className = 'custom-modal-btn';
      btn.innerText = 'Descarga la guía gratuita';
      btn.href = 'Guía de Precios.pdf';
      btn.download = 'Guía de Precios.pdf';
      btn.onclick = () => {
        setTimeout(() => {
          overlay.classList.remove('active');
          setTimeout(() => overlay.remove(), 400);
        }, 1000);
      };
      content.appendChild(btn);
    } else {
      content.appendChild(msg);
      
      const btn = document.createElement('button');
      btn.className = 'custom-modal-btn';
      btn.innerText = 'Aceptar';
      btn.onclick = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 400);
      };
      content.appendChild(btn);
    }
    
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      overlay.classList.add('active');
    }, 50);
  };

  // Configure form mappings & behaviors
  const formsList = document.querySelectorAll('form');
  formsList.forEach(form => {
    let formType = '';
    
    if (form.classList.contains('lead-form')) {
      formType = 'lead';
      form.action = 'https://docs.google.com/forms/d/e/1FAIpQLScXt4YYgjvcWYlt4nP8-fJCvJEfRSDcsytKSW5V4inzsGYkbQ/formResponse';
      
      const textInput = form.querySelector('input[type="text"]');
      if (textInput) {
        textInput.name = 'entry.997645229';
        textInput.required = true;
      }
    } 
    else if (form.querySelector('#join-role')) {
      formType = 'candidate';
      form.action = 'https://docs.google.com/forms/d/e/1FAIpQLSdJ7-wEVBYvUNSLGJ0AHi_LcQ_sVFAh_D1w2tN2s8aBhQJrlg/formResponse';
      
      const name = form.querySelector('#join-name');
      if (name) { name.name = 'entry.1652273970'; name.required = true; }
      
      const contact = form.querySelector('#join-contact');
      if (contact) { contact.name = 'entry.1535491410'; contact.required = true; }
      
      const role = form.querySelector('#join-role');
      if (role) { role.name = 'entry.262148178'; role.required = true; }
      
      const msg = form.querySelector('#join-msg');
      if (msg) { msg.name = 'entry.1969336787'; msg.required = true; }
    } 
    else if (form.querySelector('#c-budget')) {
      formType = 'contact_page';
      form.action = 'https://docs.google.com/forms/d/e/1FAIpQLSfqmsBPKdG0KJbKLL_vSh1Z_tnLBV63Vd6gtk3wDcNzq8o84g/formResponse';
      
      const name = form.querySelector('#c-name');
      if (name) { name.name = 'entry.1079688453'; name.required = true; }
      
      const phone = form.querySelector('#c-phone');
      if (phone) { phone.name = 'entry.672232064'; phone.required = true; }
      
      const email = form.querySelector('#c-email');
      if (email) { email.name = 'entry.681741124'; }
      
      const budget = form.querySelector('#c-budget');
      if (budget) { budget.name = 'entry.88726842'; }
      
      const msg = form.querySelector('#c-msg');
      if (msg) { msg.name = 'entry.629796201'; }
    } 
    else {
      formType = 'contact_section';
      form.action = 'https://docs.google.com/forms/d/e/1FAIpQLSfaS3fzk3zd5_e_cB5tNKd2u6xI4JSUDDFXEXC9MZASKewlMg/formResponse';
      
      const nameInput = form.querySelector('input[id*="name"], input[placeholder*="Juan"]');
      if (nameInput) {
        nameInput.name = 'entry.1731645459';
        nameInput.required = true;
      }
      
      const contactInput = form.querySelector('input[id*="contact"], input[placeholder*="juan@email.com"], input[placeholder*="600000000"]');
      if (contactInput) {
        contactInput.name = 'entry.732917638';
        contactInput.required = true;
      }
      
      const typeSelect = form.querySelector('select');
      if (typeSelect) {
        typeSelect.name = 'entry.714157714';
        typeSelect.required = true;
      }
      
      const msgTextarea = form.querySelector('textarea');
      if (msgTextarea) {
        msgTextarea.name = 'entry.1615714854';
      }
    }
    
    form.method = 'POST';
    form.target = 'gform_iframe';
    
    // Add privacy checkbox
    addPrivacyCheckbox(form);
    
    // Handle submission event
    form.addEventListener('submit', (e) => {
      if (formType === 'lead') {
        showCustomModal('Tu guía se está descargando...', true);
      } 
      else if (formType === 'candidate') {
        showCustomModal('Gracias por ponerte en contacto con nosotros, puedes adjuntar tu CV a nuestro WhatsApp.');
      } 
      else {
        showCustomModal('Gracias por ponerte en contacto con nosotros en menos de 24h nos pondremos en contacto contigo.');
      }
      
      // Reset form after short delay
      setTimeout(() => {
        form.reset();
      }, 500);
    });
  });
  
});
