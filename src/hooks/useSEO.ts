import { useEffect } from 'react'

interface SEOProps {
  title: string
  description?: string
  image?: string
  url?: string
}

export function useSEO({ title, description, image, url }: SEOProps) {
  useEffect(() => {
    // 1. Update Title
    const fullTitle = `${title} | Karang Taruna`
    document.title = fullTitle

    // Helper to set or create meta tags
    const setMetaTag = (attr: string, attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attr}="${attrValue}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attr, attrValue)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    // 2. Update Standard Meta
    if (description) {
      setMetaTag('name', 'description', description)
      setMetaTag('property', 'og:description', description)
      setMetaTag('name', 'twitter:description', description)
    }

    // 3. Update Open Graph Meta
    setMetaTag('property', 'og:title', fullTitle)
    setMetaTag('name', 'twitter:title', fullTitle)
    
    if (image) {
      setMetaTag('property', 'og:image', image)
      setMetaTag('name', 'twitter:image', image)
      setMetaTag('name', 'twitter:card', 'summary_large_image')
    }

    if (url) {
      setMetaTag('property', 'og:url', url)
    } else {
      setMetaTag('property', 'og:url', window.location.href)
    }

    // Cleanup function (optional, but good for SPA to revert to defaults)
    return () => {
      document.title = 'Karang Taruna'
    }
  }, [title, description, image, url])
}
