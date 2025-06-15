export default function Head() {
  const siteUrl = 'https://outerpedia.com';
  const title = 'Outerplane Tier List, Character Builds, Guides & Database – Outerpedia';
  const description = 'Explore characters, builds, gear, tier lists and join our Discord community for Outerplane!';

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Canonical */}
      <link rel="canonical" href={siteUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content="Outerpedia" />
      <meta property="og:image" content="https://outerpedia.com/images/ui/og_home.jpg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://outerpedia.com/images/ui/og_home.jpg" />
    </>
  );
}
