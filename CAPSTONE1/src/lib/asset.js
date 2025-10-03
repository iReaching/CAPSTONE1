export function assetUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path

  // Normalize leading slash
  const normalized = String(path).replace(/^\/+/, '')

  const isDev = window.location.port === '5173'
  const appBase = isDev
    ? 'http://localhost/vitecap1/CAPSTONE1/'
    : `${window.location.origin}${import.meta.env.BASE_URL}`

  // If caller stored a relative path with folders, preserve it
  // Supported roots we save in DB: 'uploads/...', 'php/uploads/...'
  if (normalized.startsWith('uploads/') || normalized.startsWith('php/')) {
    return appBase + normalized
  }

  // Otherwise, assume it's a bare filename intended for php/uploads
  return appBase + 'php/uploads/' + normalized.replace(/^.*[\\/]/, '')
}
