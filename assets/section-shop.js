/**
 * Shop grid cards post to /cart/add via a plain <form> by default (works
 * with JS disabled, redirects to /cart). This upgrades that to an AJAX
 * call + a `cart:add` custom event so a cart drawer/notification component
 * can listen for it - intentionally NOT wired directly to Dawn's own
 * cart-notification markup here, since that file wasn't part of the five
 * in-scope sections. Flagged in docs/build-notes.md as an integration point.
 */
(function () {
  class ProductFormCard extends HTMLElement {
    connectedCallback() {
      var form = this.querySelector('form');
      if (!form) return;
      form.addEventListener('submit', this.onSubmit.bind(this));
    }

    onSubmit(evt) {
      evt.preventDefault();
      var form = evt.target;
      var button = form.querySelector('button[type="submit"]');
      var formData = new FormData(form);

      if (button) button.disabled = true;

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.status) {
            // Shopify returns { status: 422, description: '...' } on failure
            throw new Error(data.description || 'Could not add to cart');
          }
          document.dispatchEvent(new CustomEvent('cart:add', { detail: data, bubbles: true }));
        })
        .catch(function () {
          // graceful fallback: submit the form for real, which still works
          HTMLFormElement.prototype.submit.call(form);
        })
        .finally(function () {
          if (button) button.disabled = false;
        });
    }
  }

  if (!customElements.get('product-form-card')) {
    customElements.define('product-form-card', ProductFormCard);
  }
})();
