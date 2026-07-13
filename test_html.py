import urllib.request
import re

html = urllib.request.urlopen("http://localhost:3000/kashmiri-food").read().decode("utf-8")
print("Length of HTML:", len(html))

if 'chapter-dial' in html:
    print("chapter-dial IS IN HTML!")
    idx = html.find('chapter-dial')
    print("Snippet:", html[max(0, idx-100):min(len(html), idx+300)])
else:
    print("chapter-dial IS NOT IN HTML!")
