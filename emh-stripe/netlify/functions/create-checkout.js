const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { items, lang } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return { statusCode: 400, body: 'No items in cart' };
  }

  const isEN = lang === 'en';

  const frameLabels = {
    da: { oak: 'Egetræ', white: 'Hvid', black: 'Sort' },
    en: { oak: 'Oak', white: 'White', black: 'Black' },
  };

  const line_items = items.map((item) => {
    const frameLabel = (frameLabels[lang] || frameLabels.da)[item.frame] || item.frame;
    const sizeLabel = item.size.replace('x', '×') + ' cm';
    const description = isEN
      ? `Size: ${sizeLabel} · Frame: ${frameLabel} · Fine Art Print`
      : `Størrelse: ${sizeLabel} · Ramme: ${frameLabel} · Kunsttryk`;

    return {
      price_data: {
        currency: isEN ? 'eur' : 'dkk',
        unit_amount: item.price * 100,
        product_data: {
          name: item.title,
          description: description,
          images: [],
        },
      },
      quantity: 1,
    };
  });

  const origin = event.headers.origin || event.headers.referer || 'https://emhphotography.netlify.app';
  const baseUrl = origin.endsWith('/') ? origin.slice(0, -1) : origin;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${baseUrl}/?payment=success`,
      cancel_url: `${baseUrl}/?payment=cancelled`,
      locale: isEN ? 'en' : 'da',
      consent_collection: {
        terms_of_service: 'required',
      },
      custom_text: {
        terms_of_service_acceptance: {
          message: isEN
            ? 'I have read and accept the <a href="https://emhphotography.netlify.app/handelsbetingelser">terms and conditions</a>. I understand all products are custom-made and cannot be returned.'
            : 'Jeg har læst og accepterer <a href="https://emhphotography.netlify.app/handelsbetingelser">handelsbetingelserne</a>. Jeg er bekendt med, at alle produkter er specialfremstillede og ikke kan returneres.',
        },
      },
      shipping_address_collection: {
        allowed_countries: ['DK', 'SE', 'NO', 'DE', 'NL', 'FR', 'GB', 'US', 'CH', 'AT'],
      },
      phone_number_collection: { enabled: true },
      custom_fields: [
        {
          key: 'special_instructions',
          label: { type: 'custom', custom: isEN ? 'Special instructions (optional)' : 'Særlige ønsker (valgfrit)' },
          type: 'text',
          optional: true,
        },
      ],
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('Stripe error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
