import { useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dealer: string;
  consent: boolean;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const dealers = ['Northstar Seattle', 'Northstar Bellevue', 'Northstar Tacoma'];
const colors = [
  { name: 'Glacier White', value: '#e9e8e3', price: 0 },
  { name: 'Metallic Blue', value: '#315d88', price: 850 },
  { name: 'Copper Ember', value: '#b45b37', price: 1100 },
];

const initialForm: FormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dealer: '',
  consent: false,
};

function App() {
  const paintLabelDefect = new URLSearchParams(window.location.search).get('a11y-defect') === 'paint-label';
  const [model, setModel] = useState('Northstar E1');
  const [trim, setTrim] = useState('Touring');
  const [paint, setPaint] = useState(colors[0].name);
  const [heatedSeats, setHeatedSeats] = useState(false);
  const [towPackage, setTowPackage] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [dealerQuery, setDealerQuery] = useState('');
  const [dealerOpen, setDealerOpen] = useState(false);
  const [activeDealer, setActiveDealer] = useState(-1);
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dealerInputRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLParagraphElement>(null);

  const filteredDealers = useMemo(
    () => dealers.filter((dealer) => dealer.toLowerCase().includes(dealerQuery.toLowerCase())),
    [dealerQuery],
  );
  const selectedPaint = colors.find((color) => color.name === paint)!;
  const basePrice = model === 'Northstar E1' ? 42_500 : 46_900;
  const trimPrice = trim === 'Sport' ? 2_400 : 0;
  const totalPrice = basePrice + trimPrice + selectedPaint.price + (heatedSeats ? 450 : 0) + (towPackage ? 1_200 : 0);
  const priceText = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(totalPrice);

  function updateForm<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function selectDealer(dealer: string) {
    setDealerQuery(dealer);
    updateForm('dealer', dealer);
    setDealerOpen(false);
    setActiveDealer(-1);
  }

  function handleDealerKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setDealerOpen(true);
      setActiveDealer((current) => Math.min(current + 1, filteredDealers.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveDealer((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter' && dealerOpen && activeDealer >= 0) {
      event.preventDefault();
      selectDealer(filteredDealers[activeDealer]);
    } else if (event.key === 'Escape') {
      setDealerOpen(false);
      setActiveDealer(-1);
    }
  }

  function validateForm() {
    const nextErrors: FormErrors = {};
    if (!form.firstName.trim()) nextErrors.firstName = 'Enter your first name.';
    if (!form.lastName.trim()) nextErrors.lastName = 'Enter your last name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!form.phone.trim()) nextErrors.phone = 'Enter your phone number.';
    if (!form.dealer) nextErrors.dealer = 'Choose a dealer from the suggestions.';
    if (!form.consent) nextErrors.consent = 'Please confirm that we may contact you about this enquiry.';
    setErrors(nextErrors);
    return nextErrors;
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('');
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, model, trim, paint, totalPrice }),
      });
      if (!response.ok) throw new Error('Request failed');
      const result = (await response.json()) as { reference: string };
      setStatus(`Your enquiry has been sent. Your reference is ${result.reference}.`);
    } catch {
      setStatus('We could not send your enquiry. Your details are still here. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function openDialog() {
    setDialogOpen(true);
    requestAnimationFrame(() => dialogRef.current?.showModal());
  }

  function closeDialog() {
    dialogRef.current?.close();
    setDialogOpen(false);
  }

  const fieldError = (key: keyof FormValues) => errors[key] ? `${key}-error` : undefined;

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span>Northstar Motors</span>
        </a>
        <span className="topbar-note">A better way forward</span>
      </header>

      <main id="top" className="page-layout">
        <div className="intro">
          <p className="eyebrow">Build your vehicle</p>
          <h1>Made for your kind of journey.</h1>
          <p className="intro-copy">Choose your Northstar, make it yours, and we’ll help you take the next step.</p>
        </div>

        <div className="config-grid">
          <div className="configuration">
            <section className="panel" aria-labelledby="vehicle-heading">
              <div className="section-heading">
                <span className="step-number" aria-hidden="true">01</span>
                <div><p className="eyebrow">Start with a model</p><h2 id="vehicle-heading">Choose your vehicle</h2></div>
              </div>
              <fieldset className="choice-grid model-grid">
                <legend className="visually-hidden">Vehicle model</legend>
                {['Northstar E1', 'Northstar X2'].map((name, index) => (
                  <label className={`choice-card ${model === name ? 'selected' : ''}`} key={name}>
                    <input type="radio" name="model" value={name} checked={model === name} onChange={() => setModel(name)} />
                    <span className="car-art" aria-hidden="true"><span className={`car-shape car-${index}`} /></span>
                    <span className="choice-copy"><strong>{name}</strong><span>{index === 0 ? 'All-electric SUV' : 'All-electric crossover'}</span></span>
                    <span className="starting-price">From {index === 0 ? '£42,500' : '£46,900'}</span>
                  </label>
                ))}
              </fieldset>
            </section>

            <section className="panel" aria-labelledby="customize-heading">
              <div className="section-heading">
                <span className="step-number" aria-hidden="true">02</span>
                <div><p className="eyebrow">Your configuration</p><h2 id="customize-heading">Make it yours</h2></div>
              </div>

              <fieldset className="field-group">
                <legend>Trim</legend>
                <div className="inline-options">
                  {['Touring', 'Sport'].map((name) => (
                    <label className="pill-option" key={name}>
                      <input type="radio" name="trim" value={name} checked={trim === name} onChange={() => {
                        setTrim(name);
                        if (name === 'Sport') setTowPackage(false);
                      }} />
                      <span>{name}{name === 'Sport' ? ' · +£2,400' : ''}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="field-group">
                <legend>Paint colour</legend>
                <div className="paint-options">
                  {colors.map((color) => (
                    <label className={`paint-option ${paint === color.name ? 'selected' : ''}`} key={color.name}>
                      <input type="radio" name="paint" value={color.name} checked={paint === color.name}  onChange={() => setPaint(color.name)} />
                      <span className="swatch" style={{ backgroundColor: color.value }} aria-hidden="true" />
                      <span aria-hidden={paintLabelDefect || undefined}>{color.name}{color.price ? ` · +£${color.price.toLocaleString('en-GB')}` : ''}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="field-group">
                <legend>Optional packages</legend>
                <label className="package-option">
                  <input type="checkbox" checked={heatedSeats} onChange={(event) => setHeatedSeats(event.target.checked)} />
                  <span><strong>Cold-weather comfort</strong><span>Heated front seats · +£450</span></span>
                </label>
                <label className="package-option">
                  <input type="checkbox" checked={towPackage} disabled={trim === 'Sport'} aria-describedby={trim === 'Sport' ? 'tow-unavailable' : undefined} onChange={(event) => setTowPackage(event.target.checked)} />
                  <span><strong>Touring tow package</strong><span>Enhanced towing capability · +£1,200</span></span>
                </label>
                {trim === 'Sport' && <p className="option-explanation" id="tow-unavailable">This package is unavailable with Sport trim. Choose Touring to add it.</p>}
              </fieldset>
            </section>

            <section className="panel summary-panel" aria-labelledby="summary-heading">
              <div className="section-heading">
                <span className="step-number" aria-hidden="true">03</span>
                <div><p className="eyebrow">Your Northstar</p><h2 id="summary-heading">Configuration summary</h2></div>
              </div>
              <dl className="summary-list">
                <div><dt>Model</dt><dd>{model}</dd></div>
                <div><dt>Trim</dt><dd>{trim}</dd></div>
                <div><dt>Paint</dt><dd>{paint}</dd></div>
                <div><dt>Packages</dt><dd>{[heatedSeats && 'Cold-weather comfort', towPackage && 'Touring tow package'].filter(Boolean).join(', ') || 'None selected'}</dd></div>
              </dl>
              <div className="price-row">
                <div><span className="eyebrow">Estimated vehicle price</span><p className="price" ref={priceRef} aria-live="polite" aria-atomic="true">{priceText}</p></div>
                <span className="price-note">Including selected options</span>
              </div>
            </section>
          </div>

          <aside className="lead-column" aria-labelledby="lead-heading">
            <div className="lead-card">
              <div className="section-heading">
                <span className="step-number" aria-hidden="true">04</span>
                <div><p className="eyebrow">Take the next step</p><h2 id="lead-heading">Talk to a specialist</h2></div>
              </div>
              <p className="lead-intro">Leave your details and your chosen dealer will be in touch to help with your Northstar.</p>

              <form onSubmit={submitLead} noValidate>
                {Object.keys(errors).length > 0 && (
                  <div className="error-summary" role="alert" tabIndex={-1} ref={summaryRef}>
                    <h3>There’s a little more to complete</h3>
                    <p>Please check the highlighted fields below.</p>
                    <ul>{Object.entries(errors).map(([key, message]) => <li key={key}><a href={`#${key}`} onClick={(event) => {
                      event.preventDefault();
                      if (key === 'dealer') dealerInputRef.current?.focus();
                      else document.getElementById(key)?.focus();
                    }}>{message}</a></li>)}</ul>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="firstName">First name</label>
                    <input id="firstName" name="firstName" autoComplete="given-name" value={form.firstName} aria-invalid={Boolean(errors.firstName)} aria-describedby={fieldError('firstName')} onChange={(event) => updateForm('firstName', event.target.value)} />
                    {errors.firstName && <p className="field-error" id="firstName-error">{errors.firstName}</p>}
                  </div>
                  <div className="form-field">
                    <label htmlFor="lastName">Last name</label>
                    <input id="lastName" name="lastName" autoComplete="family-name" value={form.lastName} aria-invalid={Boolean(errors.lastName)} aria-describedby={fieldError('lastName')} onChange={(event) => updateForm('lastName', event.target.value)} />
                    {errors.lastName && <p className="field-error" id="lastName-error">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="email">Email address</label>
                  <input id="email" name="email" type="email" autoComplete="email" value={form.email} aria-invalid={Boolean(errors.email)} aria-describedby={fieldError('email')} onChange={(event) => updateForm('email', event.target.value)} />
                  {errors.email && <p className="field-error" id="email-error">{errors.email}</p>}
                </div>

                <div className="form-field">
                  <label htmlFor="phone">Phone number</label>
                  <input id="phone" name="phone" type="tel" autoComplete="tel" value={form.phone} aria-invalid={Boolean(errors.phone)} aria-describedby={fieldError('phone')} onChange={(event) => updateForm('phone', event.target.value)} />
                  {errors.phone && <p className="field-error" id="phone-error">{errors.phone}</p>}
                </div>

                <div className="form-field dealer-field">
                  <label htmlFor="dealer">Preferred dealer</label>
                  <input
                    id="dealer"
                    ref={dealerInputRef}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={dealerOpen}
                    aria-controls="dealer-options"
                    aria-activedescendant={dealerOpen && activeDealer >= 0 ? `dealer-option-${activeDealer}` : undefined}
                    aria-invalid={Boolean(errors.dealer)}
                    aria-describedby={fieldError('dealer')}
                    autoComplete="off"
                    value={dealerQuery}
                    onFocus={() => setDealerOpen(true)}
                    onChange={(event) => {
                      setDealerQuery(event.target.value);
                      updateForm('dealer', '');
                      setDealerOpen(true);
                      setActiveDealer(-1);
                    }}
                    onKeyDown={handleDealerKeyDown}
                    onBlur={() => window.setTimeout(() => setDealerOpen(false), 120)}
                  />
                  {dealerOpen && filteredDealers.length > 0 && (
                    <ul className="dealer-options" id="dealer-options" role="listbox" aria-label="Dealer suggestions">
                      {filteredDealers.map((dealer, index) => (
                        <li id={`dealer-option-${index}`} role="option" aria-selected={activeDealer === index} key={dealer} onMouseDown={(event) => event.preventDefault()} onClick={() => selectDealer(dealer)}>{dealer}</li>
                      ))}
                    </ul>
                  )}
                  {dealerOpen && filteredDealers.length === 0 && <p className="suggestion-empty" role="status">No matching dealers. Try another search.</p>}
                  {errors.dealer && <p className="field-error" id="dealer-error">{errors.dealer}</p>}
                </div>

                <div className="consent-block">
                  <label className="consent-option">
                    <input id="consent" type="checkbox" checked={form.consent} aria-invalid={Boolean(errors.consent)} aria-describedby={fieldError('consent')} onChange={(event) => updateForm('consent', event.target.checked)} />
                    <span>I agree that Northstar Motors and my selected dealer may contact me about this enquiry.</span>
                  </label>
                  {errors.consent && <p className="field-error consent-error" id="consent-error">{errors.consent}</p>}
                  <button className="text-button" type="button" onClick={openDialog}>Read our contact and privacy information</button>
                </div>

                <button className="submit-button" type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Send my enquiry'}<span aria-hidden="true">↗</span></button>
                <p className="form-note">Your details are used only to respond to this enquiry. This demonstration stores no personal information.</p>
                <p className="submission-status" role="status" aria-live="polite">{status}</p>
              </form>
            </div>
          </aside>
        </div>
      </main>

      <footer className="footer"><span>Northstar Motors</span><span>Designed for the road ahead.</span></footer>

      {dialogOpen && (
        <dialog className="privacy-dialog" ref={dialogRef} aria-labelledby="privacy-heading" onClose={() => setDialogOpen(false)} onCancel={() => setDialogOpen(false)}>
          <div className="dialog-content">
            <p className="eyebrow">Your information</p>
            <h2 id="privacy-heading">Contact and privacy information</h2>
            <p>We’ll use the details you provide to respond to your vehicle enquiry and connect you with your selected dealer. This proof of concept uses synthetic services and does not retain submitted information.</p>
            <button className="submit-button" type="button" onClick={closeDialog}>Close information</button>
          </div>
        </dialog>
      )}
    </div>
  );
}

export default App;
