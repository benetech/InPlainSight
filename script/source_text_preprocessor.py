# I suggest we remove importance.txt because it is not general enough. 

import os

def should_filter_text(str):
  if not str or str.startswith(" "):
    return True
  if str.startswith("Chapter") or str.startswith("CHAPTER"):
    return True
  if not any(c.islower() for c in str):
    return True
  return False

f = open('../markovTextStego.js/demo/js/corpora_new.js', 'w')
# Write the header
output = """/**
 * Test corpora for markovTextStego.js.
 *
 * @author Zhiyu Li
 */

corpora = {
"""

for file in os.listdir('../corpus'):
  filename = file[:file.find(".txt")]
  output += "'" + filename + "': JSON.parse('["
  with open('../corpus/' + file, 'r') as text_file:
      text = text_file.read()
  start = text.find("*** START OF THIS PROJECT GUTENBERG")
  end1 = text.find("End of Project Gutenberg")
  end2 = text.find("*** END OF THE PROJECT")
  end = 0
  if end1 < 0:
    end = end2
  elif end2 < 0:
    end = end1
  else:
    end = min(end1, end2)

  paragraphs = text[start:end].split("\n\n")
  for paragraph in paragraphs:
    paragraph = paragraph.strip()
    if not should_filter_text(paragraph):
      output += ('"' + paragraph.replace('\n', ' ') + '", ')
  output = output[:len(output)-2]
  output += "]'),\n"

output += "};\n"
f.write(output)
