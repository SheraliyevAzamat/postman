const http = require('http');
const url = require('url');

let phones = [
  { id: 1, name: "iPhone 14", brand: "Apple", price: 1200, stock: 10 },
  { id: 2, name: "Galaxy S23", brand: "Samsung", price: 900, stock: 5 },
  { id: 3, name: "Pixel 7", brand: "Google", price: 800, stock: 8 },
];

let cart = [];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;

  res.setHeader('Content-Type', 'application/json');

  const sendResponse = (statusCode, data) => {
    res.statusCode = statusCode;
    res.end(JSON.stringify(data));
  };

  const getRequestBody = (callback) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        callback(JSON.parse(body));
      } catch (err) {
        sendResponse(400, { error: 'Invalid JSON format' });
      }
    });
  };

  if (req.method === 'GET' && pathname === '/phones') {
    let filteredPhones = phones;

    if (query.brand) {
      filteredPhones = filteredPhones.filter(phone => phone.brand === query.brand);
    }

    if (query.maxPrice) {
      filteredPhones = filteredPhones.filter(phone => phone.price <= parseFloat(query.maxPrice));
    }

    sendResponse(200, filteredPhones);
  }

  else if (req.method === 'GET' && pathname.startsWith('/phones/')) {
    const id = parseInt(pathname.split('/')[2]);
    const phone = phones.find(phone => phone.id === id);

    if (!phone) {
      sendResponse(404, { error: 'Phone not found' });
    } else {
      sendResponse(200, phone);
    }
  }

  else if (req.method === 'POST' && pathname === '/phones') {
    getRequestBody((body) => {
      const { name, brand, price, stock } = body;

      if (!name || !brand || price == null || stock == null) {
        sendResponse(400, { error: 'Missing required fields' });
      } else {
        const newPhone = {
          id: phones.length ? phones[phones.length - 1].id + 1 : 1,
          name,
          brand,
          price,
          stock
        };
        phones.push(newPhone);
        sendResponse(201, newPhone);
      }
    });
  }

  else if (req.method === 'PUT' && pathname.startsWith('/phones/')) {
    const id = parseInt(pathname.split('/')[2]);
    const phoneIndex = phones.findIndex(phone => phone.id === id);

    if (phoneIndex === -1) {
      sendResponse(404, { error: 'Phone not found' });
    } else {
      getRequestBody((body) => {
        const { name, brand, price, stock } = body;

        if (!name && !brand && price == null && stock == null) {
          sendResponse(400, { error: 'At least one field must be updated' });
        } else {
          const updatedPhone = { ...phones[phoneIndex], ...body };
          phones[phoneIndex] = updatedPhone;
          sendResponse(200, updatedPhone);
        }
      });
    }
  }

  else if (req.method === 'DELETE' && pathname.startsWith('/phones/')) {
    const id = parseInt(pathname.split('/')[2]);
    const phoneIndex = phones.findIndex(phone => phone.id === id);

    if (phoneIndex === -1) {
      sendResponse(404, { error: 'Phone not found' });
    } else {
      const deletedPhone = phones.splice(phoneIndex, 1);
      sendResponse(200, deletedPhone[0]);
    }
  }

  else {
    sendResponse(404, { error: 'Not Found' });
  }
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
