/* 
1. Use the inquirer npm package to get user input.
2. Use the qr-image npm package to turn the user entered URL into a QR code image.
3. Create a txt file to save the user input using the native fs node module.
*/

import inquirer from 'inquirer';
import validUrl from 'valid-url';
import qr from 'qr-image';
import fs from 'fs';

const validateURL = (value) => {
   if (validUrl.isUri(value)){
        return true;
   }
   else {
       return 'URL not valid';
   }

};

inquirer
  .prompt([
    /* Pass your questions in here */
    {
        type: 'input',
        message: 'Please enter the URL.',
        name: 'url',
        validate: validateURL,
    }
  ])
  .then((answers) => {
    // log user entered url in console
    console.log(answers);
    const url = answers.url;
    // convert user entered url into QR code image
    var qr_png = qr.image(url);
    qr_png.pipe(fs.createWriteStream('qr1.png'));
    // save user input into a text file
    fs.writeFile('URL.txt',url,(err) => {
      if (err) throw err;
      console.log("saved user entered url into text file");
    });

  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else went wrong
    }
  });