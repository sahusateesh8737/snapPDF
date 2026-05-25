import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.snappdf.shop';

  // List of active routes based on the tools-grid configuration
  const routes = [
    '',
    '/merge-pdf',
    '/split-pdf',
    '/remove-pages',
    '/organize-pdf',
    '/compress-pdf',
    '/jpg-to-pdf',
    '/word-to-pdf',
    '/ppt-to-pdf',
    '/excel-to-pdf',
    '/html-to-pdf',
    '/pdf-to-jpg',
    '/rotate-pdf',
    '/add-page-numbers',
    '/add-watermark',
    '/ocr-pdf',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
