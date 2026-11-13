(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})();

// Tax switch: toggles between the base price and the price including 18% GST.
// The choice is remembered so it stays on when changing filters or searching.
(() => {
  'use strict'

  const taxSwitch = document.getElementById('taxSwitch')
  if (!taxSwitch) return

  const STORAGE_KEY = 'wanderlust-show-tax'

  const applyTax = (showTax) => {
    document.querySelectorAll('.price-base').forEach(el => el.classList.toggle('d-none', showTax))
    document.querySelectorAll('.price-total').forEach(el => el.classList.toggle('d-none', !showTax))
  }

  let saved = false
  try {
    saved = localStorage.getItem(STORAGE_KEY) === 'true'
  } catch (e) { /* storage unavailable, default to off */ }

  taxSwitch.checked = saved
  applyTax(saved)

  taxSwitch.addEventListener('change', () => {
    applyTax(taxSwitch.checked)
    try {
      localStorage.setItem(STORAGE_KEY, String(taxSwitch.checked))
    } catch (e) { /* ignore */ }
  })
})();
