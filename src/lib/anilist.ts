export async function getAnilistBanner(malId: number): Promise<string | null> {
  const query = `
    query ($id: Int) {
      Media (idMal: $id, type: MANGA) {
        bannerImage
        coverImage {
          extraLarge
        }
      }
    }
  `;

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { id: malId }
      }),
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!res.ok) return null;
    
    const data = await res.json();
    return data.data?.Media?.bannerImage || data.data?.Media?.coverImage?.extraLarge || null;
  } catch (error) {
    console.error('Failed to fetch anilist banner:', error);
    return null;
  }
}
