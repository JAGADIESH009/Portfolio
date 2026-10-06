let isSubmitting = false;

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('portfolio-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
});

async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Prevent duplicate submissions
  if (isSubmitting) return;

  const form = document.getElementById('portfolio-form');
  const submitBtn = document.querySelector('.btn-submit');
  const successOverlay = document.getElementById('form-success');
  const errorOverlay = document.getElementById('form-error');
  
  if (!form || !submitBtn) return;

  // Clear previous errors
  document.querySelectorAll('.inline-error').forEach(el => {
    el.textContent = '';
    el.classList.remove('show');
  });
  document.querySelectorAll('.form-input').forEach(el => el.classList.remove('input-error'));

  // Get field values
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const subjectInput = document.getElementById('subject');
  const messageInput = document.getElementById('message');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const subject = subjectInput ? subjectInput.value.trim() : '';
  const message = messageInput.value.trim();

  let hasError = false;

  // Inline Validation
  if (!name) {
    showError(nameInput, 'Name is required');
    hasError = true;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    showError(emailInput, 'Email is required');
    hasError = true;
  } else if (!emailRegex.test(email)) {
    showError(emailInput, 'Please enter a valid email address');
    hasError = true;
  }

  // Subject is optional, Phone is optional
  
  if (!message) {
    showError(messageInput, 'Message cannot be empty');
    hasError = true;
  }

  // Halt submission if there are validation errors
  if (hasError) return;

  // Proceed with submission (Loading State)
  isSubmitting = true;
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span class="btn-text">SENDING...</span>';

  try {
    // Call secure serverless function
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        email: email,
        phone: phone,
        subject: subject || 'New Inquiry',
        message: message,
        time: new Date().toLocaleString()
      })
    });
    
    if (response.ok) {
      const data = await response.json().catch(() => ({ success: true }));
      if (data.success !== false) {
        if (successOverlay) successOverlay.classList.add('active');
        spawnSuccessParticles(submitBtn);
        form.reset();
        
        // Auto-hide success overlay
        setTimeout(() => {
          if (successOverlay) successOverlay.classList.remove('active');
        }, 5000);
      } else {
        throw new Error(data.error || 'Unable to send your message right now. Please try again.');
      }
    } else {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Unable to send your message right now. Please try again.');
    }
    
  } catch (err) {
    console.error('Email sending failed:', err);
    
    // Show inline error on the submit button area or form level (reusing the messageInput error as a global error)
    if (errorOverlay) {
      errorOverlay.classList.add('active');
      setTimeout(() => {
        if (errorOverlay) errorOverlay.classList.remove('active');
      }, 5000);
    } else {
      showError(messageInput, err.message || 'Unable to send your message right now. Please try again.');
    }
  } finally {
    // Reset submission state
    isSubmitting = false;
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}

// Helper function to show inline errors
function showError(inputElement, message) {
  inputElement.classList.add('input-error');
  const errorId = inputElement.id + '-error';
  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }
}

// Particle confettis for success
function spawnSuccessParticles(targetElement) {
  const rect = targetElement.getBoundingClientRect();
  const containerX = rect.left + rect.width / 2 + window.scrollX;
  const containerY = rect.top + window.scrollY;

  for (let i = 0; i < 40; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.width = `${Math.random() * 8 + 4}px`;
    particle.style.height = particle.style.width;
    const colors = ['#06b6d4', '#8b5cf6', '#3b82f6', '#00f2ff'];
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.borderRadius = '50%';
    particle.style.zIndex = '99999';
    particle.style.pointerEvents = 'none';
    
    document.body.appendChild(particle);

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 4;
    let pX = containerX;
    let pY = containerY;
    let opacity = 1;

    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - 2;

    function animate() {
      pX += vx;
      pY += vy;
      opacity -= 0.02;
      particle.style.left = `${pX}px`;
      particle.style.top = `${pY}px`;
      particle.style.opacity = opacity;

      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        particle.remove();
      }
    }
    requestAnimationFrame(animate);
  }
}
