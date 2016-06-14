# I suggest we remove importance.txt because it is not general enough. 

import os, re, codecs

f = codecs.open('../extension/js/corpora.js', 'w',"utf-8")
# Write the header
output = """/**
 * Test corpora for markovTextStego.js.
 *
 * @author Zhiyu Li
 */

corpora = {
"""

for file in os.listdir('../corpus2'):
  filename = file[:file.find(".txt")]
  output += "'" + filename + "': JSON.parse('["
  with codecs.open('../corpus2/' + file, 'r',"utf-8") as text_file:
      text = text_file.read()

  startmatch = re.search(r'\*\*\*\s?START OF (THIS|THE) PROJECT GUTENBERG.*?\*\*\*',text)
  start = startmatch.end()

  endmatch = re.search(r'\*\*\*\s?END OF (THIS|THE) PROJECT',text)
  end = endmatch.start()

  print(filename)
  print(start)
  print(end)
    
  paragraphs = text[start:end].splitlines()
  
  for paragraph in paragraphs:
    if paragraph != "":
      paragraph = paragraph.strip()
      output += ('"' + paragraph.replace('\n', ' ').replace("'","\\'").replace('"',"\\'").replace(":","\\:").replace(";","\\;") + '", ')
      output = output[:len(output)-1]

  output = output[:len(output)-1]
  output += "]'),\n"
  
output += "};\n"
f.write(output)  
f.close()
