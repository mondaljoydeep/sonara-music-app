import type { Track } from "@/types/music";
import { searchSaavn } from "./saavnService";
import { searchAudius } from "./audiusService";
import { searchYouTube } from "./youtubeService";

export type ArtistCategory =
  | "Bollywood Playback"
  | "Hindi Indie / I-Pop"
  | "Hindi Hip-Hop / Rap"
  | "Punjabi & Haryanvi"
  | "Tamil"
  | "Telugu"
  | "Malayalam"
  | "Kannada"
  | "Bengali"
  | "Bhojpuri"
  | "Global";

export interface Artist {
  slug: string;
  name: string;
  region: "indian" | "global";
  category: ArtistCategory;
  image?: string | null;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const make = (name: string, category: ArtistCategory): Artist => ({
  slug: slugify(name),
  name,
  region: category === "Global" ? "global" : "indian",
  category,
});

export const TOP_ARTISTS: Artist[] = [
  // 🟠 Bollywood Playback
  ...[
    "Arijit Singh","Pritam","Shreya Ghoshal","A.R. Rahman","Sachin-Jigar",
    "Vishal Mishra","Jubin Nautiyal","Armaan Malik","Atif Aslam","Rahat Fateh Ali Khan",
    "Sonu Nigam","Kumar Sanu","Udit Narayan","Mohammed Rafi","Kishore Kumar",
    "Alka Yagnik","Lata Mangeshkar","Asha Bhosle","Mithoon","Vishal-Shekhar",
    "Tanishk Bagchi","Himesh Reshammiya","Neha Kakkar","Tony Kakkar","Tulsi Kumar",
    "Palak Muchhal","Kanika Kapoor","Asees Kaur","Sachet-Parampara",
  ].map((n) => make(n, "Bollywood Playback")),

  // Hindi Indie / I-Pop
  ...[
    "Kushagra","Aditya Rikhari","Faheem Abdullah","Anuv Jain","Jasleen Royal",
    "Ritviz","Ankur Tewari","Hanita Bhambri","Zaeden","When Chai Met Toast",
    "Parekh & Singh","The Local Train","Peter Cat Recording Co.",
  ].map((n) => make(n, "Hindi Indie / I-Pop")),

  // Hindi Hip-Hop / Rap
  ...[
    "Divine","Raftaar","MC Stan","Badshah","Yo Yo Honey Singh",
    "Emiway Bantai","Dino James","Ikka","Dee MC",
  ].map((n) => make(n, "Hindi Hip-Hop / Rap")),

  // Punjabi & Haryanvi
  ...[
    "Karan Aujla","Diljit Dosanjh","AP Dhillon","Shubh","Sidhu Moosewala",
    "B Praak","Gurnam Bhullar","Ammy Virk","Hardy Sandhu","Parmish Verma",
    "Jassie Gill","Ninja","Kulwinder Billa","Garry Sandhu","Nooran Sisters",
    "Masoom Sharma","Kaka","Sapna Choudhary",
  ].map((n) => make(n, "Punjabi & Haryanvi")),

  // Tamil
  ...[
    "Anirudh Ravichander","Sid Sriram","Harris Jayaraj","Yuvan Shankar Raja",
    "Vijay Antony","D. Imman","G.V. Prakash Kumar","Santhosh Narayanan",
    "Dhanush","Haricharan","Karthik","Benny Dayal","Shakthisree Gopalan",
    "Chinmayi Sripada","Andrea Jeremiah","Jonita Gandhi",
  ].map((n) => make(n, "Tamil")),

  // Telugu
  ...[
    "S.S. Thaman","Devi Sri Prasad","Manisharma","Harika Narayan",
    "Ramajogayya Sastry","Kaala Bhairava","Yazin Nizar","Revanth",
    "Rahul Sipligunj","Anurag Kulkarni","Geetha Madhuri",
  ].map((n) => make(n, "Telugu")),

  // Malayalam
  ...[
    "Vidyasagar","Vineeth Sreenivasan","Harisankar K.S.","Sithara Krishnakumar",
    "Najim Arshad","K.S. Chithra","M.G. Sreekumar","Shaan Rahman",
    "Govind Vasantha","Chethan Cheruvathur",
  ].map((n) => make(n, "Malayalam")),

  // Kannada
  ...[
    "Arjun Janya","Ravi Basrur","V. Harikrishna","Rajesh Krishnan",
    "Anuradha Bhat","Deepika Das","Vijay Prakash",
  ].map((n) => make(n, "Kannada")),

  // Bengali
  ...[
    "Nachiketa Chakraborty","Usha Uthup","Lopamudra Mitra","Rupankar Bagchi",
    "Anupam Roy","Srikanta Acharya","Indraadip Dasgupta","Iman Chakraborty",
    "Chandrabindoo",
  ].map((n) => make(n, "Bengali")),

  // Bhojpuri
  ...[
    "Pawan Singh","Khesari Lal Yadav","Dinesh Lal Yadav Nirahua","Ritesh Pandey",
    "Pramod Premi Yadav","Neelkamal Singh",
  ].map((n) => make(n, "Bhojpuri")),

  // Global
  ...[
    "Taylor Swift","The Weeknd","Bad Bunny","Drake","Ed Sheeran",
    "Billie Eilish","Harry Styles","BTS","BLACKPINK","Coldplay",
    "Justin Bieber","Post Malone","Eminem","Dua Lipa","Charlie Puth",
    "Shawn Mendes","Bruno Mars","The Beatles","Michael Jackson","Alan Walker",
    "Rihanna","Beyoncé","Adele",
  ].map((n) => make(n, "Global")),
];

export function findArtistBySlug(slug: string): Artist | undefined {
  return TOP_ARTISTS.find((a) => a.slug === slug);
}

// Saavn artist image search
const SAAVN_HOST = "https://saavn-api-eight.vercel.app";
const imageCache = new Map<string, string | null>();

// Verified working image URLs (used as primary source — guarantees correct face).
const IMAGE_FALLBACKS: Record<string, string> = {
  "atif aslam":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Atif_Aslam_at_Badlapur_%28cropped%29.jpg/500px-Atif_Aslam_at_Badlapur_%28cropped%29.jpg",
  "arijit singh":
    "https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_500x500.jpg",
  "shreya ghoshal":
    "https://c.saavncdn.com/artists/Shreya_Ghoshal_007_20241101074144_500x500.jpg",
  "a.r. rahman":
    "https://c.saavncdn.com/artists/AR_Rahman_002_20210120084455_500x500.jpg",
  "ar rahman":
    "https://c.saavncdn.com/artists/AR_Rahman_002_20210120084455_500x500.jpg",
  "diljit dosanjh":
    "https://c.saavncdn.com/artists/Diljit_Dosanjh_005_20231025073054_500x500.jpg",
  "neha kakkar":
    "https://c.saavncdn.com/artists/Neha_Kakkar_007_20241212115832_500x500.jpg",
  "ap dhillon":
    "https://c.saavncdn.com/artists/AP_Dhillon_004_20251023102150_500x500.jpg",
  "anirudh ravichander":
    "https://c.saavncdn.com/artists/Anirudh_Ravichander_003_20260121134149_500x500.jpg",
  "pritam":
    "https://c.saavncdn.com/artists/Pritam_Chakraborty-20170711073326_500x500.jpg",
  "sid sriram":
    "https://c.saavncdn.com/artists/Sid_Sriram_005_20240425180600_500x500.jpg",
  "sonu nigam":
    "https://c.saavncdn.com/artists/Sonu_Nigam_500x500.jpg",
  "yo yo honey singh":
    "https://c.saavncdn.com/artists/Yo_Yo_Honey_Singh_002_20221216102650_500x500.jpg",
  "badshah":
    "https://c.saavncdn.com/artists/Badshah_006_20241118064015_500x500.jpg",
  "taylor swift":
    "https://c.saavncdn.com/artists/Taylor_Swift_003_20200226074119_500x500.jpg",
  "the weeknd":
    "https://c.saavncdn.com/artists/The_Weeknd_002_20241003071400_500x500.jpg",
  "drake":
    "https://c.saavncdn.com/artists/Drake_005_20220704120432_500x500.jpg",
  "bts":
    "https://c.saavncdn.com/artists/BTS_005_20260406070015_500x500.jpg",
  "blackpink":
    "https://c.saavncdn.com/artists/BlackPink_005_20260319191032_500x500.jpg",
  "billie eilish":
    "https://c.saavncdn.com/artists/Billie_Eilish_20190211151539_500x500.jpg",
  "dua lipa":
    "https://c.saavncdn.com/artists/Dua_Lipa_004_20231120090922_500x500.jpg",
  "ed sheeran":
    "https://c.saavncdn.com/artists/Ed_Sheeran_002_20250625073038_500x500.jpg",
  "bruno mars":
    "https://c.saavncdn.com/artists/Bruno_Mars_003_20260324060413_500x500.jpg",
  "rihanna":
    "https://c.saavncdn.com/artists/Rihanna_002_20250102114144_500x500.jpg",
  "beyoncé":
    "https://c.saavncdn.com/artists/Beyonce_500x500.jpg",
  "beyonce":
    "https://c.saavncdn.com/artists/Beyonce_500x500.jpg",
  "coldplay":
    "https://c.saavncdn.com/artists/Coldplay_002_20241003070447_500x500.jpg",
  "adele":
    "https://c.saavncdn.com/artists/Adele_500x500.jpg",
  "post malone":
    "https://c.saavncdn.com/artists/Post_Malone_004_20190911070147_500x500.jpg",
  "bad bunny":
    "https://c.saavncdn.com/artists/Bad_Bunny_001_20250207055513_500x500.jpg",
};

function isValidImg(u?: string | null): u is string {
  return !!u && !u.includes("artist-default") && !u.includes("default-music");
}

async function searchSaavnArtist(query: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${SAAVN_HOST}/api/search/artists?query=${encodeURIComponent(query)}&limit=5`
    );
    const data = await res.json();
    const arr = data?.data?.results || [];
    for (const r of arr) {
      const img = r?.image;
      let u: string | null = null;
      if (Array.isArray(img)) {
        u = img.find((i: any) => i.quality === "500x500")?.url || img[img.length - 1]?.url || null;
      } else if (typeof img === "string") {
        u = img;
      }
      if (isValidImg(u)) return u;
    }
  } catch {}
  return null;
}

export async function getArtistImage(name: string): Promise<string | null> {
  const key = name.toLowerCase().trim();
  if (imageCache.has(key)) return imageCache.get(key)!;

  if (IMAGE_FALLBACKS[key]) {
    imageCache.set(key, IMAGE_FALLBACKS[key]);
    return IMAGE_FALLBACKS[key];
  }

  let url = await searchSaavnArtist(name);

  if (!isValidImg(url)) {
    try {
      const songs = await searchSaavn(name, 1);
      url = songs[0]?.artwork || null;
    } catch {}
  }

  imageCache.set(key, isValidImg(url) ? url : null);
  return isValidImg(url) ? url : null;
}

export async function getArtistTopSongs(name: string, limit = 30): Promise<Track[]> {
  const [js, yt, au] = await Promise.allSettled([
    searchSaavn(name, limit),
    searchYouTube(`${name} songs`, 10),
    searchAudius(name, 10),
  ]);
  const all: Track[] = [];
  if (js.status === "fulfilled") all.push(...js.value);
  if (yt.status === "fulfilled") all.push(...yt.value);
  if (au.status === "fulfilled") all.push(...au.value);
  const seen = new Set<string>();
  return all.filter((t) => {
    const k = `${t.title.toLowerCase()}__${t.artist.toLowerCase()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
