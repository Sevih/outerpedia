const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const NEWS_DIR = path.join(process.cwd(), 'src/data/news/legacy');

/**
 * Estimate pixel width for Google SERP (simplified)
 * Average character widths based on Google's display font
 */
function estimatePixelWidth(text) {
  let width = 0;
  for (const char of text) {
    if (char === char.toUpperCase() && /[A-Z]/.test(char)) {
      width += 10; // Uppercase letters
    } else if (char === ' ') {
      width += 4;
    } else if (/[illI\(\)]/.test(char)) {
      width += 4; // Narrow characters
    } else if (/[mwWM]/.test(char)) {
      width += 12; // Wide characters
    } else {
      width += 8; // Average character
    }
  }
  return width;
}

/**
 * Check for word repetition in title
 */
function findWordRepetition(title) {
  const words = title.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3); // Only check words > 3 chars

  const wordCount = {};
  for (const word of words) {
    wordCount[word] = (wordCount[word] || 0) + 1;
  }

  const repeated = Object.entries(wordCount)
    .filter(([word, count]) => count > 1)
    .map(([word]) => word);

  return repeated;
}

/**
 * Audit a single markdown file
 */
function auditMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter } = matter(content);

  const title = frontmatter.title;

  // Calculate with "- Outerplane" suffix (as it will be in production)
  const finalTitle = title.toLowerCase().includes('outerplane')
    ? title
    : `${title} - Outerplane`;

  const pixelWidth = estimatePixelWidth(finalTitle);
  const charLength = finalTitle.length;
  const repeatedWords = findWordRepetition(finalTitle);

  const issues = [];

  if (pixelWidth > 580) {
    issues.push(`TOO_LONG (${pixelWidth}px > 580px)`);
  }

  if (charLength > 60) {
    issues.push(`LONG_CHARS (${charLength} > 60)`);
  }

  if (repeatedWords.length > 0) {
    issues.push(`WORD_REPEAT (${repeatedWords.join(', ')})`);
  }

  return {
    filePath,
    fileName: path.basename(filePath),
    category: frontmatter.category,
    originalTitle: title,
    finalTitle,
    pixelWidth,
    charLength,
    repeatedWords,
    issues,
  };
}

/**
 * Audit all markdown files in directory
 */
function auditDirectory(dirPath) {
  const results = [];

  function walkDir(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const result = auditMarkdownFile(fullPath);
        if (result.issues.length > 0) {
          results.push(result);
        }
      }
    }
  }

  walkDir(dirPath);
  return results;
}

// Main execution
console.log('🔍 Auditing news article titles for SEO issues...\n');

const results = auditDirectory(NEWS_DIR);

// Sort by severity (most pixels first)
results.sort((a, b) => b.pixelWidth - a.pixelWidth);

// Display results
if (results.length === 0) {
  console.log('✅ No SEO issues found! All titles are optimized.\n');
} else {
  console.log(`⚠️  Found ${results.length} titles with SEO issues:\n`);

  for (const result of results) {
    console.log(`📄 ${result.fileName}`);
    console.log(`   Category: ${result.category}`);
    console.log(`   Title: "${result.finalTitle}"`);
    console.log(`   Length: ${result.charLength} chars, ~${result.pixelWidth} pixels`);
    console.log(`   Issues: ${result.issues.join(', ')}`);
    console.log();
  }
}

// Summary by issue type
const issueTypes = {
  tooLong: results.filter(r => r.pixelWidth > 580).length,
  wordRepeat: results.filter(r => r.repeatedWords.length > 0).length,
};

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Summary:');
console.log(`   Too long (>580px): ${issueTypes.tooLong}`);
console.log(`   Word repetition: ${issueTypes.wordRepeat}`);
console.log(`   Total issues: ${results.length}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
