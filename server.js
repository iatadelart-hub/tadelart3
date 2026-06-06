const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets directly (css, js, assets, etc)
app.use(express.static(__dirname));

// Route for clean URLs (e.g. /nosotros -> nosotros.html)
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  
  // Ignore request for files with extensions (handled by express.static)
  if (page.includes('.')) {
    return next();
  }

  const filePath = path.join(__dirname, `${page}.html`);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    // 404 falling back to index or a clean response
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
  }
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
