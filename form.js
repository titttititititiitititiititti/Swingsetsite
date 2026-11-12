// Sending the enquiry form.
//
// This website is static, so it cannot hold a mail key — a key in a file the
// browser downloads is a key anybody has. It posts to the GRB app instead,
// which holds the key and sends from a domain verified with Resend. That
// endpoint accepts this site's origin and nothing else, so it cannot be used
// as a mail relay from somebody else's page.

const ENDPOINT =
  location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.protocol === "file:"
    ? "http://localhost:3000/api/enquiry"
    : "https://app.grbmining.com.au/api/enquiry";

// Somewhere to go when the form itself will not work. Worth having in the page
// rather than only in a support inbox: a prospect who hits an error and finds
// no way through simply leaves.
const FALLBACK = "bailey@grb.com.au";

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

      say(
        `${result.error || "Something went wrong"}. You can email us directly at ${FALLBACK}.`,
        true,
      );
    } catch {
      // No network, or the app is down. Either way the person still has a way
      // of reaching us, which is the only thing that matters here.
      say(`Couldn't send that just now. Please email us at ${FALLBACK}.`, true);
    } finally {
      sending = false;
      button.removeAttribute("aria-busy");
      button.textContent = label;
    }
  });
}
