import { DB } from 'https://deno.land/x/sqlite@v3.8/mod.ts';

type Movie = {
  oficial_title: string;
  imdbScore: number;
  page_url: string;
  magnet_dubbed?: string;
  magnet_subtitled?: string;
  magnet_dual_audio?: string;
};

(() => {
  const db = new DB('movies.db');
  const movies: Array<Movie> = [];
  db.queryEntries<Movie>(
    `SELECT 
      oficial_title, 
      imdbScore, 
      page_url, 
      magnet_dubbed, 
      magnet_subtitled, 
      magnet_dual_audio
    FROM 
      movies 
    WHERE 
      updated = TRUE 
    AND 
      (magnet_dubbed IS NOT NULL OR magnet_subtitled IS NOT NULL OR magnet_dual_audio IS NOT NULL)
    ORDER BY 
      imdbScore DESC;`
  ).forEach((row: Movie) => {
    movies.push(row);
  });
  Deno.writeTextFileSync('movies.json', JSON.stringify(movies, null, 2));
  let count = db.query<[number]>(
    'SELECT COUNT(*) FROM movies WHERE updated = FALSE'
  );
  console.log(`Total of outdated records: `, count[0][0]);
  count = db.query<[number]>(
    'SELECT COUNT(*) FROM movies WHERE updated = TRUE AND (magnet_dubbed IS NOT NULL OR magnet_subtitled IS NOT NULL OR magnet_dual_audio IS NOT NULL)'
  );
  console.log(`Total of updated records: `, count[0][0]);
  db.close();
})();
