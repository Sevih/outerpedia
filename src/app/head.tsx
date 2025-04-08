export default function Head() {
  return (
    <>
      {/* Pas de balise <title> ici pour laisser Next.js utiliser celle du composant Head spécifique à la page */}
      <meta name="description" content="Outerplane Wiki & Guide" />
      <link rel="icon" href="/favicon.ico" />
      <link
        href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
    </>
  )
}
