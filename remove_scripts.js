const fs = require('fs');
let js = fs.readFileSync('frontend/app/explore/ExploreClient.js', 'utf8');

let startIndex = js.indexOf('<script>');
if (startIndex !== -1) {
  // we want to cut from <script> until the end of the return statement before the final closing tags
  let endIndex = js.lastIndexOf('</div>');
  let trimmedJs = js.substring(0, startIndex) + '\n' + js.substring(endIndex);
  fs.writeFileSync('frontend/app/explore/ExploreClient.js', trimmedJs);
}
