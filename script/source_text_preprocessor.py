# I suggest we remove importance.txt because it is not general enough. 

import os, re, codecs, json

f = codecs.open('../extension/js/corpora_new.js', 'w', "utf-8")
# Write the header
f.write("""/**
 * Test corpora for markovTextStego.js.
 *
 * @author Zhiyu Li
 */

$.extend(corpora, {
""")

for file in os.listdir('../corpus'):
  filename = file[:file.find(".txt")]
  f.write("'" + filename + "': JSON.parse(")
  with codecs.open('../corpus/' + file, 'r',"utf-8") as text_file:
      text = text_file.read()

  startmatch = re.search(r'\*\*\*\s?START OF (THIS|THE) PROJECT GUTENBERG.*?\*\*\*',text)
  start = startmatch.end()

  endmatch = re.search(r'\*\*\*\s?END OF (THIS|THE) PROJECT',text)
  end = endmatch.start()

  print("working on..."+filename)
    
  paragraphs = text[start:end].split("\n\n")

  paragraphs = [p.strip() for p in paragraphs if p != ""]
  f.write(json.dumps(json.dumps(paragraphs)))
  
  f.write("),\n")
  
f.write("});\n")
f.close()
