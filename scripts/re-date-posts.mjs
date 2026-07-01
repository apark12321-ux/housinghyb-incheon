import { readFileSync, writeFileSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { POSTS } from "../src/data/posts.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// 1) Sort all 60 posts chronologically by their original date, then by ID as a tie-breaker
const sortedPosts = [...POSTS].sort((a, b) => {
  if (a.date !== b.date) {
    return a.date.localeCompare(b.date);
  }
  return a.id.localeCompare(b.id);
});

// 2) Generate exactly 60 sequential dates leading up to and including today
// Since there are 60 posts, having exactly 1 post per day spans exactly 60 days.
// Let's compute these dates.
const now = new Date();
const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9
const endDate = new Date(Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()));
const newDates = [];
for (let i = 59; i >= 0; i--) {
  const d = new Date(endDate);
  d.setDate(endDate.getDate() - i);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  newDates.push(`${yyyy}-${mm}-${dd}`);
}

// Map each post ID to its newly assigned date
const idToNewDate = {};
for (let i = 0; i < sortedPosts.length; i++) {
  idToNewDate[sortedPosts[i].id] = newDates[i];
}

console.log(`[Re-Date] Generated ${newDates.length} sequential dates from ${newDates[0]} to ${newDates[newDates.length - 1]}`);

// 3) Process each post file in src/data/
const dataFiles = [
  "posts-finance.ts",
  "posts-move.ts",
  "posts-rent-heavy.ts",
  "posts-rent.ts",
  "posts-sub-heavy.ts",
  "posts-sub.ts"
];

for (const fileName of dataFiles) {
  const filePath = resolve(ROOT, "src", "data", fileName);
  let content = readFileSync(filePath, "utf-8");

  // Filter posts that belong to this file
  // We can look up which post IDs are mentioned in this file
  const filePosts = sortedPosts.filter(p => content.includes(`id: "${p.id}"`));
  if (filePosts.length === 0) continue;

  // Find the exact span/index of each post in the file
  // We find the starting index of 'id: "..."' for each post in the file
  const postPositions = filePosts.map(p => {
    return {
      id: p.id,
      index: content.indexOf(`id: "${p.id}"`)
    };
  });

  // Sort them by their position in the file to make chunking easy
  postPositions.sort((a, b) => a.index - b.index);

  // Divide the file into chunks
  let updatedContent = "";
  let lastIndex = 0;

  for (let i = 0; i < postPositions.length; i++) {
    const current = postPositions[i];
    const next = postPositions[i + 1];
    
    // Add prefix/spacer text from previous position to the start of this post position
    updatedContent += content.substring(lastIndex, current.index);

    // Get the post-specific chunk (up to the next post's ID position, or the end of the file)
    const chunkEnd = next ? next.index : content.length;
    let postChunk = content.substring(current.index, chunkEnd);

    const newDate = idToNewDate[current.id];

    // Replace the metadata date field: standard styles 'date: "YYYY-MM-DD"' or 'date: 'YYYY-MM-DD''
    postChunk = postChunk.replace(/date:\s*["']\d{4}-\d{2}-\d{2}["']/g, `date: "${newDate}"`);

    // Replace inline update/publication dates inside content field
    postChunk = postChunk.replace(/최종 업데이트:\s*\d{4}-\d{2}-\d{2}/g, `최종 업데이트: ${newDate}`);
    postChunk = postChunk.replace(/발행일:\s*\d{4}-\d{2}-\d{2}/g, `발행일: ${newDate}`);

    updatedContent += postChunk;
    lastIndex = chunkEnd;
  }

  // Append any remaining trailing content (e.g. closing brackets at end of file)
  if (lastIndex < content.length) {
    updatedContent += content.substring(lastIndex);
  }

  writeFileSync(filePath, updatedContent, "utf-8");
  console.log(`[Re-Date] Updated dates in ${fileName} (Processed ${filePosts.length} posts)`);
}

console.log("=== All posts successfully re-dated chronologically up to 2026-06-22 ===");
