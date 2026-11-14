// Sending the enquiry form.
//
// This website is static, so it cannot hold a mail key — a key in a file the
// browser downloads is a key anybody has. It posts to the Swingset app instead,
// which holds the key and sends from a domain verified with Resend. Where the
// enquiry lands is set on the app's server, never here. The endpoint accepts
// this site's origin and nothing else, so it cannot be used as a mail relay
// from somebody else's page.

const ENDPOINT =
  location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.protocol === "file:"
    ? "http://localhost:3000/api/enquiry"
    : "https://app.getswingset.com.au/api/enquiry";

const form = document.querySelector("#enquiry-form");
const status = document.querySelector("#form-status");
const button = form?.querySelector("button[type='submit']");

if (form && status && button) {
  const label = button.textContent;
  let sending = false;

  const say = (text, bad) => {
    status.textContent = text;
    status.classList.toggle("bad", !!bad);
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    // A second tap while the first is in flight would send the enquiry twice.
    // Guarded with a flag rather than the disabled attribute: a submit button
    // that disables itself can cancel the submit that was meant to run.
    if (sending) return;

    // Let the browser say which box is wrong before anything is sent.
    if (!form.reportValidity()) return;

    sending = true;
    button.setAttribute("aria-busy", "true");
    button.textContent = "Sending…";
    say("");

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        body: new FormData(form),
      });
      // The endpoint answers with JSON whether it worked or not, so a refusal
      // arrives as a reason rather than as a page that never changes.
      const result = await response.json().catch(() => ({}));

      if (result.success) {
        form.outerHTML = `
          <div class="form-done">
            <h3>Thanks — that's with us.</h3>
            <p>We'll come back to you within one business day.</p>
          </div>`;
        return;
      }

      say(`${result.error || "Something went wrong"}. Please try again in a minute.`, true);
    } catch {
      // No network, or the app is down. Their words are still in the boxes,
      // so trying again costs them nothing.
      say("Couldn't send that just now. Please try again in a minute.", true);
    } finally {
      sending = false;
      button.removeAttribute("aria-busy");
      button.textContent = label;
    }
  });
}
