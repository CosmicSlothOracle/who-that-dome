import type { Catalog, Decade, Song } from "../lib/types";

type Seed = {
  artist: string;
  title: string;
  album: string;
  year: number;
  city: string;
  spotifyTrackId?: string;
  explicit?: boolean;
  yearNote?: string;
};

function stubTrackId(decade: Decade, index: number): string {
  return `drap${decade}stub${String(index + 1).padStart(12, "0")}`;
}

function pack(decade: Decade, seeds: Seed[]): Song[] {
  return seeds.map((seed, index) => ({
    id: `drap_${decade}_${String(index + 1).padStart(3, "0")}`,
    poolId: `drap-${decade}`,
    edition: "drap",
    decade,
    spotifyTrackId: seed.spotifyTrackId ?? stubTrackId(decade, index),
    title: seed.title,
    artist: seed.artist,
    album: seed.album,
    year: seed.year,
    city: seed.city,
    explicit: seed.explicit ?? false,
    yearNote: seed.yearNote,
  }));
}

const seeds90: Seed[] = [
  { artist: "Die Fantastischen Vier", title: "Die Da?!", album: "4 gewinnt", year: 1992, city: "Stuttgart" },
  { artist: "Fettes Brot", title: "Jein", album: "Außen Top Hits, innen Geschmack", year: 1996, city: "Hamburg" },
  { artist: "Absolute Beginner", title: "Liebes Lied", album: "Bambule", year: 1998, city: "Hamburg" },
  { artist: "Advanced Chemistry", title: "Fremd im eigenen Land", album: "Advanced Chemistry", year: 1992, city: "Heidelberg" },
  { artist: "Rödelheim Hartreim Projekt", title: "Reime", album: "Direkt aus Rödelheim", year: 1994, city: "Frankfurt" },
  { artist: "Tic Tac Toe", title: "Verpiss' Dich", album: "Tic Tac Toe", year: 1996, city: "Bochum" },
  { artist: "Massive Töne", title: "Cruisen", album: "Überfall", year: 1999, city: "Stuttgart" },
  { artist: "Freundeskreis", title: "ANNA", album: "Quadratur des Kreises", year: 1997, city: "Stuttgart" },
  { artist: "5 Sterne Deluxe", title: "Willst Du mit mir gehn", album: "Sillium", year: 1998, city: "Hamburg" },
  { artist: "Dynamite Deluxe", title: "Wie jetzt", album: "Deluxe Soundsystem", year: 1998, city: "Hamburg" },
  { artist: "Blumentopf", title: "Fensterplatz", album: "Kein Zufall", year: 1997, city: "München" },
  { artist: "Eins Zwo", title: "Wortwechsel", album: "Gefährliches Halbwissen", year: 1999, city: "Hamburg" },
  { artist: "Cora E.", title: "Schlüsselkind", album: "Cora E.", year: 1996, city: "Kiel" },
  { artist: "Stieber Twins", title: "Fenster zum Hof", album: "Fenster zum Hof", year: 1997, city: "Heidelberg" },
  { artist: "Main Concept", title: "So schön", album: "Coole Scheiße", year: 1994, city: "Köln" },
  { artist: "Torch", title: "Blauer Samt", album: "Blauer Samt", year: 2000, city: "Heidelberg", yearNote: "Album 2000, Szene 90er" },
  { artist: "Der Tobi & das Bo", title: "Der Frauenflüsterer", album: "Genie und Wahnsinn", year: 1996, city: "Hamburg" },
  { artist: "Die Firma", title: "Spieglein, Spieglein", album: "Das zweite Kapitel", year: 1998, city: "Köln" },
  { artist: "RAG", title: "Kopfhörer", album: "Unter Tage", year: 1998, city: "Recklinghausen" },
  { artist: "Too Strong", title: "Rap hat Recht", album: "Die Lüge der demokratischen Moral", year: 1996, city: "Dortmund" },
  { artist: "Spax", title: "Ich weiß nicht, was soll es bedeuten", album: "Privat", year: 1998, city: "Hannover" },
  { artist: "MC Rene", title: "Rene rilext", album: "Rene rilext", year: 1995, city: "Mannheim" },
  { artist: "Anarchist Academy", title: "Das Böse", album: "Anarchophobia", year: 1996, city: "Heidelberg" },
  { artist: "No Remorze", title: "Reimoffensive", album: "Reimoffensive", year: 1995, city: "Stuttgart" },
];

const seeds00: Seed[] = [
  { artist: "Sido", title: "Mein Block", album: "Maske", year: 2004, city: "Berlin", spotifyTrackId: "drap00stub000000000001", explicit: true },
  { artist: "Bushido", title: "Von der Skyline zum Bordstein zurück", album: "Von der Skyline zum Bordstein zurück", year: 2006, city: "Berlin", spotifyTrackId: "drap00stub000000000002", explicit: true },
  { artist: "Kool Savas", title: "Das Urteil", album: "Der beste Tag meines Lebens", year: 2002, city: "Berlin", spotifyTrackId: "drap00stub000000000003", explicit: true },
  { artist: "Samy Deluxe", title: "Weck mich auf", album: "Samy Deluxe", year: 2001, city: "Hamburg", spotifyTrackId: "drap00stub000000000004" },
  { artist: "Azad", title: "A", album: "Leben", year: 2001, city: "Frankfurt", spotifyTrackId: "drap00stub000000000005", explicit: true },
  { artist: "K.I.Z", title: "Ellenbogengesellschaft", album: "Das Rap Deutschland Kettensägen Massaker", year: 2005, city: "Berlin", spotifyTrackId: "drap00stub000000000006", explicit: true },
  { artist: "Seeed", title: "Dickes B", album: "New Dubby Conquerors", year: 2001, city: "Berlin", spotifyTrackId: "drap00stub000000000007" },
  { artist: "Peter Fox", title: "Haus am See", album: "Stadtaffe", year: 2008, city: "Berlin", spotifyTrackId: "drap00stub000000000008" },
  { artist: "Deichkind", title: "Remmidemmi (Yippie Yippie Yeah)", album: "Aufstand im Schlaraffenland", year: 2006, city: "Hamburg", spotifyTrackId: "drap00stub000000000009" },
  { artist: "Fler", title: "NDW 2005", album: "Neue Deutsche Welle", year: 2005, city: "Berlin", spotifyTrackId: "drap00stub000000000010", explicit: true },
  { artist: "Eko Fresh", title: "Die Abrechnung", album: "L.O.V.E.", year: 2005, city: "Köln", spotifyTrackId: "drap00stub000000000011", explicit: true },
  { artist: "Beginner", title: "Füchse", album: "Blast Action Heroes", year: 2003, city: "Hamburg", spotifyTrackId: "drap00stub000000000012" },
  { artist: "Jan Delay", title: "Klar", album: "Mercedes-Dance", year: 2006, city: "Hamburg", spotifyTrackId: "drap00stub000000000013" },
  { artist: "Culcha Candela", title: "Hamma!", album: "Culcha Candela", year: 2007, city: "Berlin", spotifyTrackId: "drap00stub000000000014" },
  { artist: "Prinz Pi", title: "Würde", album: "Rebell ohne Grund", year: 2007, city: "Berlin", spotifyTrackId: "drap00stub000000000015", explicit: true },
  { artist: "B-Tight", title: "So allein", album: "Neger Neger", year: 2007, city: "Berlin", spotifyTrackId: "drap00stub000000000016", explicit: true },
  { artist: "Dendemann", title: "Da nich für", album: "Die Zentrale Dendemann", year: 2006, city: "Hamburg", spotifyTrackId: "drap00stub000000000017" },
  { artist: "Frauenarzt & Manny Marc", title: "Das geht ab", album: "Atzen Musik Vol.1", year: 2008, city: "Berlin", spotifyTrackId: "drap00stub000000000018", explicit: true },
  { artist: "Marteria", title: "Zum König geboren", album: "Zum König geboren", year: 2008, city: "Rostock", spotifyTrackId: "drap00stub000000000019" },
  { artist: "Curse", title: "Lass uns Freunde sein", album: "Sinnflut", year: 2005, city: "Berlin", spotifyTrackId: "drap00stub000000000020" },
  { artist: "Olli Banjo", title: "Saftpressah", album: "Sparring", year: 2005, city: "Heidelberg", spotifyTrackId: "drap00stub000000000021", explicit: true },
  { artist: "Tony D", title: "Totalschaden", album: "Totalschaden", year: 2007, city: "Berlin", spotifyTrackId: "drap00stub000000000022", explicit: true },
  { artist: "Baba Saad", title: "Wahrer Bericht", album: "Carlo Cokxxx Nutten 2", year: 2005, city: "Saarbrücken", spotifyTrackId: "drap00stub000000000023", explicit: true },
  { artist: "Alpa Gun", title: "Ausländer", album: "Geladen und entsichert", year: 2007, city: "Berlin", spotifyTrackId: "drap00stub000000000024", explicit: true },
];

const seeds10: Seed[] = [
  { artist: "Haftbefehl", title: "Chabos wissen wer der Babo ist", album: "Kanackiş", year: 2012, city: "Offenbach", explicit: true },
  { artist: "Bonez MC & RAF Camora", title: "Palmen aus Plastik", album: "Palmen aus Plastik", year: 2016, city: "Hamburg", explicit: true, yearNote: "RAF Camora: Wien" },
  { artist: "Cro", title: "Easy", album: "Raop", year: 2011, city: "Stuttgart" },
  { artist: "Marteria", title: "Kids (2 Finger an den Kopf)", album: "Zum Glück in die Zukunft II", year: 2014, city: "Rostock" },
  { artist: "SXTN", title: "Von Party zu Party", album: "Asozialisierungsprogramm", year: 2017, city: "Berlin", explicit: true },
  { artist: "Alligatoah", title: "Willst du", album: "Triebwerke", year: 2013, city: "Langenfeld" },
  { artist: "Apache 207", title: "Roller", album: "Platte", year: 2019, city: "Ludwigshafen", explicit: true },
  { artist: "Juju", title: "Bling Bling", album: "Bling Bling", year: 2019, city: "Berlin", explicit: true },
  { artist: "RIN", title: "Dior", album: "Eros", year: 2017, city: "Bietigheim-Bissingen" },
  { artist: "Capital Bra", title: "Melodien", album: "Berlin lebt", year: 2018, city: "Berlin", explicit: true },
  { artist: "Ufo361", title: "Ich bin ein Berliner", album: "Ich bin ein Berliner", year: 2017, city: "Berlin", explicit: true },
  { artist: "Kollegah", title: "Sternenstaub", album: "King", year: 2014, city: "Köln", explicit: true },
  { artist: "Shindy", title: "NWA", album: "NWA", year: 2015, city: "Stuttgart", explicit: true },
  { artist: "K.I.Z", title: "Hurra die Welt geht unter", album: "Hurra die Welt geht unter", year: 2015, city: "Berlin", explicit: true },
  { artist: "Gzuz", title: "Späti", album: "Wolke 7", year: 2016, city: "Hamburg", explicit: true },
  { artist: "MERO", title: "Hobby Hobby", album: "Ya Hero Ya Mero", year: 2018, city: "Berlin", explicit: true },
  { artist: "Nimo", title: "Coco", album: "Nimo", year: 2016, city: "Frankfurt", explicit: true },
  { artist: "KC Rebell", title: "Distance", album: "Abstand", year: 2014, city: "Essen" },
  { artist: "Farid Bang", title: "Asphalt Massaka 3", album: "Asphalt Massaka 3", year: 2016, city: "Düsseldorf", explicit: true },
  { artist: "Trailerpark", title: "Fledermausland", album: "Crackstreet Boys 3", year: 2014, city: "Berlin", explicit: true },
  { artist: "Loredana", title: "Sonnenbrille", album: "King Lori", year: 2018, city: "Luzern", yearNote: "CH/DE-Szene 2010er" },
  { artist: "Luciano", title: "Money", album: "Wolga", year: 2018, city: "Berlin", explicit: true },
  { artist: "Maxwell", title: "Ohne mein Team", album: "Palmen aus Plastik", year: 2016, city: "Berlin", explicit: true },
  { artist: "RAF Camora", title: "Anthrazit", album: "Anthrazit", year: 2017, city: "Wien", explicit: true },
];

export const drapCatalog: Catalog = {
  pools: [
    {
      id: "drap-90",
      name: "Deutschrap 90er",
      description: "Dev-Stub · Editorial-Rohmaterial, finale 24 kommen später",
      edition: "drap",
      decade: "90",
    },
    {
      id: "drap-00",
      name: "Deutschrap 2000er",
      description: "Dev-Stub · Editorial-Rohmaterial, finale 24 kommen später",
      edition: "drap",
      decade: "00",
    },
    {
      id: "drap-10",
      name: "Deutschrap 2010er",
      description: "Dev-Stub · Editorial-Rohmaterial, finale 24 kommen später",
      edition: "drap",
      decade: "10",
    },
  ],
  songs: [...pack("90", seeds90), ...pack("00", seeds00), ...pack("10", seeds10)],
};
