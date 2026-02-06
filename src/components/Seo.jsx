import { useEffect } from 'react';

const SITE_URL = 'https://books.christfaculty.org';

const ensureMeta = (nameOrProperty, value, isProperty = false) => {
  const selector = isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`;
  let el = document.head.querySelector(selector);

  if (value === undefined) return;

  if (value === null) {
    if (el) el.remove();
    return;
  }

  if (!el) {
    el = document.createElement('meta');
    if (isProperty) el.setAttribute('property', nameOrProperty);
    else el.setAttribute('name', nameOrProperty);
    document.head.appendChild(el);
  }

  el.setAttribute('content', value);
};

const ensureLink = (rel, href) => {
  if (!href) return;

  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

const ensureJsonLd = (id, jsonLd) => {
  const existing = document.getElementById(id);

  if (!jsonLd) {
    if (existing) existing.remove();
    return;
  }

  const text = JSON.stringify(jsonLd);

  if (existing) {
    existing.textContent = text;
    return;
  }

  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.text = text;
  document.head.appendChild(script);
};

const Seo = ({
  title,
  description,
  canonicalPath,
  ogImage,
  ogImageAlt,
  type = 'website',
  jsonLd,
  robots,
}) => {
  useEffect(() => {
    if (title) document.title = title;

    const path = typeof canonicalPath === 'string'
      ? canonicalPath
      : `${window.location.pathname}${window.location.search}`;

    const canonicalUrl = path.startsWith('http') ? path : `${SITE_URL}${path}`;

    ensureMeta('description', description);
    ensureLink('canonical', canonicalUrl);

    ensureMeta('robots', robots);

    ensureMeta('og:site_name', 'Pneuma BookStore', true);
    ensureMeta('og:type', type, true);
    ensureMeta('og:title', title || 'Pneuma BookStore', true);
    ensureMeta('og:description', description, true);
    ensureMeta('og:url', canonicalUrl, true);
    ensureMeta('og:image', ogImage || `${SITE_URL}/icon.png`, true);
    ensureMeta('og:image:alt', ogImageAlt, true);

    ensureMeta('twitter:card', 'summary_large_image');
    ensureMeta('twitter:title', title || 'Pneuma BookStore');
    ensureMeta('twitter:description', description);
    ensureMeta('twitter:image', ogImage || `${SITE_URL}/icon.png`);
    ensureMeta('twitter:image:alt', ogImageAlt);

    ensureJsonLd('seo-jsonld-page', jsonLd);

    return () => {
      ensureJsonLd('seo-jsonld-page', null);
    };
  }, [title, description, canonicalPath, ogImage, ogImageAlt, type, jsonLd, robots]);

  return null;
};

export default Seo;
