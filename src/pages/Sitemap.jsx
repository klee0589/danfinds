import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function Sitemap() {
  useEffect(() => {
    // Fetch sitemap and serve as XML
    const generateAndServe = async () => {
      try {
        const response = await fetch('/api/functions/generateSitemap');
        const xml = await response.text();
        
        // Create blob and download as XML
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        
        // Set page content type and content
        document.documentElement.innerHTML = xml;
        document.contentType = 'application/xml';
      } catch (error) {
        document.body.innerHTML = `<pre>Error generating sitemap: ${error.message}</pre>`;
      }
    };
    
    generateAndServe();
  }, []);

  return null;
}