function switchTab(id, btn) {
  document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
  document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
}

function toggleFaq(el) {
  var q = el;
  var a = el.nextElementSibling;
  var isOpen = q.classList.contains('open');
  document.querySelectorAll('.faq-q.open').forEach(function (openQ) {
    openQ.classList.remove('open');
    openQ.nextElementSibling.classList.remove('open');
  });
  if (!isOpen) {
    q.classList.add('open');
    a.classList.add('open');
  }
}

function showResult(id) {
  var r = document.getElementById(id);
  r.style.display = 'block';
  r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
