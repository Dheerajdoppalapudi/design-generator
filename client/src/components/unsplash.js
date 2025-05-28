const ACCESS_KEY = 'tGrMiMDvW-prP8iZcsMaU33HaFSJIoSMEGBsjQWApZI';

export async function fetchUnsplashImage(title) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(title)}&per_page=1&client_id=${ACCESS_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok && data.results.length > 0) {
      return data.results[0].urls.regular;
    } else {
      console.warn('No image found for title:', title);
      return null;
    }
  } catch (err) {
    console.error('Error fetching Unsplash image:', err);
    return null;
  }
}
