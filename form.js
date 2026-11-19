// Sending the enquiry form.
//
// The site is static, so enquiries go through FormSubmit (formsubmit.co), which
// emails each one to INBOX. No account or key: the first enquiry sends a
// one-time "activate" email to INBOX, and nothing arrives until that's clicked.

const INBOX = "business@getswingset.com.au";
const ENDPOINT = `https://formsubmit.co/ajax/${INBOX}`;

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
    // Stops a double tap sending the enquiry twice.
    if (sending) return;
    if (!form.reportValidity()) return;

    sending = true;
    button.setAttribute("aria-busy", "true");
    button.textContent = "Sending…";
    say("");

    const data = new FormData(form);
    const company = data.get("company") || "a company";
    data.set("_subject", `Swingset enquiry from ${company}`);
    data.set("_template", "table");
    data.set("_captcha", "false");
    // Lets you hit Reply in your inbox and answer the person directly.
    data.set("_replyto", data.get("email") || "");

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok && String(result.success) === "true") {
        form.outerHTML = `
          <div class="form-done">
            <h3>Thanks — that's with us.</h3>
            <p>We'll come back to you within one business day.</p>
          </div>`;
        return;
      }

      say(`Something went wrong. You can email us directly at ${INBOX}.`, true);
    } catch {
      say(`Couldn't send that just now. Please email us at ${INBOX}.`, true);
    } finally {
      sending = false;
      button.removeAttribute("aria-busy");
      button.textContent = label;
    }
  });
}
