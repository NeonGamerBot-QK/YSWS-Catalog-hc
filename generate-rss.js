const fs = require('fs');
const jsyaml = require('js-yaml');
const path = require('path');

function generateRSS(programs) {
  const host = 'https://ysws.hackclub.com';
  const now = new Date().toUTCString();
  
  const activePrograms = Object.values(programs)
    .flat()
    .filter(program => program.status === 'active')
    .sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });

  let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Hack Club YSWS Programs</title>
  <link>${host}</link>
  <description>Active "You Ship, We Ship" programs from Hack Club</description>
  <language>en-us</language>
  <lastBuildDate>${now}</lastBuildDate>
  <atom:link href="${host}/feed.xml" rel="self" type="application/rss+xml" />
`;

  activePrograms.forEach(program => {
    const pubDate = program.pubDate ? new Date(program.pubDate).toUTCString() : now;
    const deadline = program.deadline ? 
      `<p><strong>Deadline:</strong> ${new Date(program.deadline).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      })}</p>` : '';
    
    const channelRef = program.slackChannel ? program.slackChannel.replace(/^#+/, '#') : '';
    
    rss += `
  <item>
    <title>${escapeXML(program.name)}</title>
    <link>${program.website || host}</link>
    <guid isPermaLink="false">${program.name}-${Date.now()}</guid>
    <pubDate>${pubDate}</pubDate>
    <description><![CDATA[
      <p>${escapeXML(program.description)}</p>
      ${deadline}
      ${program.detailedDescription ? `<p>${escapeXML(program.detailedDescription)}</p>` : ''}
      ${channelRef ? `<p>Join the discussion in <a href="${program.slack}">${channelRef}</a></p>` : ''}
    ]]></description>
  </item>`;
  });

  rss += `
</channel>
</rss>`;

  return rss;
}

function escapeXML(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function main() {
  try {
    const dataFile = path.join(__dirname, 'data.yml');
    const fileContent = fs.readFileSync(dataFile, 'utf8');
    const data = jsyaml.load(fileContent);
    
    const rssFeed = generateRSS(data);
    
    fs.writeFileSync(path.join(__dirname, 'feed.xml'), rssFeed);
    console.log('RSS feed generated successfully!');
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    process.exit(1);
  }
}

main();
