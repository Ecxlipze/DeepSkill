import { site } from '../data/siteContent';

export function canonical(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${site.url}${normalizedPath === '/' ? '' : normalizedPath}`;
}

export function pageTitle(title) {
  if (!title) return site.title;
  if (title.includes(site.name) || title.includes('deepskills.pk')) return title;
  return `${title} | ${site.name}`;
}

export function absoluteUrl(value = '') {
  if (!value) return canonical('/');
  if (/^https?:\/\//i.test(value)) return value;
  return canonical(value);
}
