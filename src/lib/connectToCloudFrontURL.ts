export default function connectToCloudFrontURL(originalURL: string): string {
  const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN ?? ''

  const newURL = `https://${cloudFrontDomain}/${originalURL}`
  return newURL
}
