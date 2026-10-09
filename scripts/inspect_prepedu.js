const https = require('https');

https.get('https://prepedu.com/vi/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    const fonts = data.match(/font-family:[^;\"'}]+/gi) || [];
    const fontNames = data.match(/family=([a-zA-Z0-9+_:]+)/gi) || [];
    const cssFiles = data.match(/https:\/\/[^\"']+\.css/gi) || data.match(/\/_next\/static\/css\/[^\"']+\.css/gi) || [];
    console.log('CSS font declarations:', fonts);
    console.log('Google font families:', fontNames);
    console.log('CSS files:', cssFiles.slice(0, 5));
    
    // Check if Plus Jakarta Sans, Inter, SVN-Gilroy, Montserrat, Quicksand, Epilogue, Nunito, Roboto...
    const candidates = ['Jakarta', 'Gilroy', 'Montserrat', 'Inter', 'Mulish', 'Lexend', 'Epilogue', 'Quicksand', 'Nunito', 'Averta', 'Be Vietnam', 'Sarabun'];
    for (const c of candidates) {
      if (data.toLowerCase().includes(c.toLowerCase())) {
        console.log('Found keyword in HTML:', c);
      }
    }
  });
}).on('error', err => console.error(err));
