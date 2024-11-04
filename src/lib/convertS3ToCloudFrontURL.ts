export default function convertS3ToCloudFrontURL(originalURL: string): string {
  const s3Domain = process.env.NEXT_PUBLIC_S3_DOMAIN ?? ''
  const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN ?? ''

  if (originalURL.includes(s3Domain)) {
    return originalURL.replace(s3Domain, cloudFrontDomain)
  }
  return originalURL
}
