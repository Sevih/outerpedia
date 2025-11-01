const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const NEWS_DIR = path.join(process.cwd(), 'src/data/news/legacy');

/**
 * Optimize title by removing redundancy and shortening
 */
function optimizeTitle(title) {
  let optimized = title;

  // Remove "- Outerplane" suffix if present (we add it in the template)
  optimized = optimized.replace(/\s*-\s*Outerplane\s*$/i, '');

  // Replace "OUTERPLANE" with shorter version
  optimized = optimized.replace(/OUTERPLANE/g, 'OP');

  // Simplify common patterns - remove redundant "Event" word
  optimized = optimized
    .replace(/\[Event\]\s+([^-]+?)\s+Event\s*(\(|$)/gi, '[Event] $1 $2')  // "[Event] X Event (" -> "[Event] X ("
    .replace(/\s+Event\s*\(/g, ' (')  // "X Event(" -> "X ("
    .replace(/\[Event\]\s+Event\s+/i, '[Event] ')  // Double "Event" is redundant
    .replace(/\s+- Outerplane/gi, '')  // Remove any remaining "- Outerplane"
    .trim();

  // Shorten common long phrases
  optimized = optimized
    .replace(/Reward Distribution Completed/gi, 'Rewards Sent')
    .replace(/Reward distributed/gi, 'Rewards Sent')
    .replace(/Participation Event/gi, 'Event')
    .replace(/Drop Rate Up/gi, 'Rate Up')
    .replace(/Special Request:/gi, '')
    .replace(/Special Coupon/gi, 'Coupon')
    .replace(/Developer's Note #/g, 'Dev Note #')
    .replace(/Publishing Service Termination/gi, 'Service End')
    .replace(/100th-Day Anniversary Celebration!/gi, '100-Day Anniversary!')
    .replace(/Congratulatory Messages for/gi, 'Congrats to')
    .replace(/-born Heroes!/gi, ' Heroes!')
    .replace(/Personality Test Event/gi, 'Quiz')
    .replace(/Spot the Difference/gi, 'Find Differences')
    .replace(/Dungeon Exploration Balance Game!/gi, 'Dungeon Game:')
    .replace(/What is your choice\?/gi, 'Choose!')
    .replace(/Is It Wrong to Try to Have Nice Meals in a Dungeon\?/gi, 'Dungeon Meals')
    .replace(/Make 2025 Unforgettable! Choose Your Hero/gi, '2025: Choose Your Hero')
    .replace(/Seasonal Limited/gi, 'Limited')
    .replace(/Kitsune of Eternity,/gi, '')
    .replace(/In-game Equipment Reforge and Rico's Secret Shop/gi, 'Equipment & Shop')
    .replace(/Bounty Hunter! Find/gi, 'Find')
    .replace(/Celebrating the Half Year Anniversary!/gi, 'Half Year Anniversary!')
    .replace(/General Event Details/gi, 'Details')
    .replace(/New Event Story Celebration!/gi, 'New Story:')
    .replace(/Favorite Hero Poll/gi, 'Hero Poll')
    .replace(/Choose Your Ideal Christmas Companion!/gi, 'Christmas Companion!')
    .replace(/Celebration! Message Event/gi, 'Message')
    .replace(/GM Lisha's Find Differences Event!/gi, 'Find Differences!')
    .replace(/Kate's Workshop Crafting Gold Discount/gi, 'Crafting Gold Discount')
    .replace(/Recruit Chance/gi, 'Recruit')
    .trim();

  // Remove excessive emojis (keep max 2)
  const emojiMatches = optimized.match(/[\u{1F300}-\u{1F9FF}]/gu) || [];
  if (emojiMatches.length > 2) {
    // Remove all emojis if there are too many
    optimized = optimized.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').replace(/\s+/g, ' ').trim();
  }

  return optimized;
}

/**
 * Process a single markdown file
 */
function processMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content: markdown } = matter(content);

  const originalTitle = frontmatter.title;
  const optimizedTitle = optimizeTitle(originalTitle);

  // Only update if title changed
  if (originalTitle !== optimizedTitle) {
    frontmatter.title = optimizedTitle;

    // Reconstruct the file
    const newContent = matter.stringify(markdown, frontmatter);
    fs.writeFileSync(filePath, newContent, 'utf-8');

    console.log(`✅ Updated: ${path.basename(filePath)}`);
    console.log(`   Before: "${originalTitle}"`);
    console.log(`   After:  "${optimizedTitle}"`);
    console.log();

    return true;
  }

  return false;
}

/**
 * Process all markdown files in a directory recursively
 */
function processDirectory(dirPath) {
  let updatedCount = 0;
  let totalCount = 0;

  function walkDir(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        totalCount++;
        const wasUpdated = processMarkdownFile(fullPath);
        if (wasUpdated) updatedCount++;
      }
    }
  }

  walkDir(dirPath);

  return { totalCount, updatedCount };
}

// Main execution
console.log('🔧 Optimizing news article titles...\n');

const { totalCount, updatedCount } = processDirectory(NEWS_DIR);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✅ Processed ${totalCount} files`);
console.log(`📝 Updated ${updatedCount} titles`);
console.log(`⏭️  Skipped ${totalCount - updatedCount} (no changes needed)`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
