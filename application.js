const form = document.getElementById('application-form');
const status = document.getElementById('form-status');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Submitting...';
    const data = new FormData(form);
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString()
      });
      if (res.ok) {
        window.location.href = '/thank-you.html';
      } else {
        status.textContent = 'Error submitting form. Please try again.';
      }
    } catch (err) {
      status.textContent = 'Network error. Please try again.';
    }
  });
}
