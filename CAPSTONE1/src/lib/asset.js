export function assetUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path

  // Normalize leading slash
  const normalized = path.replace(/^\/+/, '')

  const isDev = window.location.port === '5173'

  // If the path already starts with 'uploads/', serve it from the app base (not php/uploads)
  if (normalized.startsWith('uploads/')) {
    const basePath = isDev
      ? 'http://localhost/vitecap1/CAPSTONE1/'
      : `${window.location.origin}${import.meta.env.BASE_URL}`
    return basePath + normalized
  }

  // Otherwise, treat it as a filename in php/uploads
  const filename = normalized.replace(/^.*[\\/]/, '')
  const phpUploadsBase = isDev
    ? 'http://localhost/vitecap1/CAPSTONE1/php/uploads/'
    : `${window.location.origin}${import.meta.env.BASE_URL}php/uploads/`

  return phpUploadsBase + filename
}
