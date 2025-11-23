// Utility function to get favicon URL from website URL
export const getFaviconUrl = (url: string, size: number = 64): string => {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?sz=${size}&domain=${domain}`
  } catch {
    console.error('Invalid URL:', url)
    return `https://www.google.com/s2/favicons?sz=${size}&domain=example.com`
  }
}

// Interface for website data with icon
export interface Website {
  url: string
  icon: string
}

// Helper function to create website object with auto-generated favicon
export const createWebsite = (url: string): Website => ({
  url,
  icon: getFaviconUrl(url),
})

// Helper function to convert URL object to Website object
export const createWebsiteFromUrls = (urls: Record<string, string>): Record<string, Website> => {
  const websites: Record<string, Website> = {}
  for (const [key, url] of Object.entries(urls)) {
    websites[key] = createWebsite(url)
  }
  return websites
}
