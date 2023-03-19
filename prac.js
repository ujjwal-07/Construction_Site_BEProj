var fs = require('fs')
// Set this up someplace 
var idToSearchFor = 2;
// read the file
fs.readFile('Attendancedata.csv', 'utf8', function(err, data)
{
    if (err)
    {
        // check and handle err
    }
    // Get an array of comma separated lines`
    let linesExceptFirst = data.split('\n').slice(1);
    // Turn that into a data structure we can parse (array of arrays)
    console.log(linesExceptFirst)
    let linesArr = linesExceptFirst.map(line=>line.split(','));
    console.log(linesArr)
    // Use filter to find the matching ID then return only those that don't matching
    // deleting the found match
    // Join then into a string with new lines
    let output = linesArr.filter(line=>parseInt(line[0]) !== idToSearchFor).join("\n");
    console.log(output)
    // Write out new file
    fs.writeFileSync('new.csv', output);
});