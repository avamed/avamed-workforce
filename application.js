const form = document.getElementById('application-form');
const status = document.getElementById('form-status');
const submit = document.getElementById('submit-application');
const resume = document.getElementById('resume');
const title = document.getElementById('title');
const phone = document.getElementById('phone');
const roleSearch = document.getElementById('role-search');
const roleCount = document.getElementById('role-count');
const roleCards = [...document.querySelectorAll('.classification-card')];
const roleButtons = [...document.querySelectorAll('.classification-role')];
const clearSearch = document.getElementById('clear-role-search');
function filterRoles() {
 const terms = roleSearch.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
 let count = 0;
 for (const card of roleCards) {
  let visible = 0;
  for (const button of card.querySelectorAll('.classification-role')) {
   const text = `${card.querySelector('h3').textContent} ${button.dataset.role}`.toLowerCase();
   const matches = terms.every(term => text.includes(term));
   button.closest('li').hidden = !matches;
   if (matches) visible++;
  }
  card.hidden = visible === 0;
  count += visible;
 }
 roleCount.textContent = count ? `${count} healthcare ${count === 1 ? 'classification' : 'classifications'}` : 'No matching roles. Try another title or choose Other healthcare role on the résumé form.';
 clearSearch.hidden = roleSearch.value.length === 0;
}
roleSearch.addEventListener('input', filterRoles);
clearSearch.addEventListener('click', () => { roleSearch.value = ''; filterRoles(); roleSearch.focus(); });
for (const button of roleButtons) button.addEventListener('click', event => {
 event.preventDefault();
 title.value = button.dataset.role;
 form.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
 document.getElementById('full-name').focus({ preventScroll: true });
});
filterRoles();
function fileError() {
 const file = resume.files[0];
 if (!file) return 'Please choose your résumé.';
 if (!/\.(pdf|doc|docx)$/i.test(file.name)) return 'Please choose a PDF, DOC, or DOCX file.';
 if (!file.size || file.size > 5 * 1024 * 1024) return 'Please choose a non-empty résumé no larger than 5 MB.';
 return '';
}
resume.addEventListener('change', () => resume.setCustomValidity(fileError()));
phone.addEventListener('input', () => phone.setCustomValidity(''));
form.addEventListener('submit', async event => {
 event.preventDefault();
 if (submit.disabled) return;
 resume.setCustomValidity(fileError());
 phone.setCustomValidity(phone.value.replace(/\D/g, '').length >= 7 ? '' : 'Please enter a phone number with at least 7 digits.');
 if (!form.reportValidity()) return;
 const data = new FormData(form);
 submit.disabled = true;
 status.className = '';
 status.textContent = 'Uploading your résumé…';
 try {
  const isNetlify = form.dataset.submission === 'netlify';
  const response = await fetch(isNetlify ? '/' : '/api/applications', {
   method: 'POST', body: data,
   ...(isNetlify ? {} : { headers: { 'Accept': 'application/json' } })
  });
  let reference = '';
  if (!response.ok) throw new Error('Submission failed');
  if (!isNetlify) {
   if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Unexpected response');
   const result = await response.json();
   if (typeof result.reference !== 'string' || !result.reference) throw new Error('Missing confirmation');
   reference = result.reference;
  }
  status.className = 'form-success';
  status.textContent = `Your application and résumé have been received.${reference ? ` Reference: ${reference}.` : ' Our recruiting team can contact you about opportunities.'}`;
  form.reset(); resume.setCustomValidity('');
 } catch(error) {
  status.className = 'form-error';
  status.textContent = 'We could not confirm receipt of your résumé. Please try again, or email your résumé to jobs@avamed.org. Your entries have been kept here.';
 } finally { submit.disabled = false; status.focus(); }
});
