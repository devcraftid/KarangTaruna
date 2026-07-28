const fs = require('fs');
const path = require('path');

function walk(d) {
  let r = [];
  fs.readdirSync(d).forEach(f => {
    let p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) r = r.concat(walk(p));
    else if (p.endsWith('.tsx') || p.endsWith('.jsx')) r.push(p);
  });
  return r;
}

const files = walk('src/pages');
let modifiedCount = 0;

files.forEach(f => {
  let original = fs.readFileSync(f, 'utf8');
  let content = original;

  // Grid conversions
  // Be careful not to replace already responsive grids like "md:grid-cols-2"
  content = content.replace(/(?<!md:|lg:|sm:|xl:|\w-)grid-cols-2\b/g, 'grid-cols-1 md:grid-cols-2');
  content = content.replace(/(?<!md:|lg:|sm:|xl:|\w-)grid-cols-3\b/g, 'grid-cols-1 md:grid-cols-3');
  content = content.replace(/(?<!md:|lg:|sm:|xl:|\w-)grid-cols-4\b/g, 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4');
  content = content.replace(/(?<!md:|lg:|sm:|xl:|\w-)grid-cols-5\b/g, 'grid-cols-2 md:grid-cols-5');
  
  // Flex layout items
  // This is a bit tricky to not over-replace. Let's just fix the width, padding, gap.
  content = content.replace(/(?<!md:|lg:|sm:|xl:|\w-)w-1\/2\b/g, 'w-full md:w-1/2');
  content = content.replace(/(?<!md:|lg:|sm:|xl:|\w-)w-1\/3\b/g, 'w-full md:w-1/3');
  content = content.replace(/(?<!md:|lg:|sm:|xl:|\w-)w-2\/3\b/g, 'w-full md:w-2/3');
  
  // Padding & gap
  content = content.replace(/(?<!md:|lg:|sm:|xl:|\w-)p-8\b/g, 'p-4 md:p-8');
  content = content.replace(/(?<!md:|lg:|sm:|xl:|\w-)gap-8\b/g, 'gap-4 md:gap-8');
  content = content.replace(/(?<!md:|lg:|sm:|xl:|\w-)gap-6\b/g, 'gap-4 md:gap-6');

  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log('Fixed:', f);
    modifiedCount++;
  }
});

console.log(`\nModified ${modifiedCount} files.`);
