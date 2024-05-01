const fs = require("fs");
const http = require("http");
const url = require("url");

const data = fs.readFileSync("./data.json", "utf-8");
const dataObj = JSON.parse(data).products;

const cardTemplate = `
    <div class="product-card">
        <h3>$Title$</h3>
        <img src="$img_src$" alt='product-image'/>
        <p>$Description$</p>
        <p>$Price$</p>
        <p>$Rating$</p>
        <a href="/product?id=$ID$"> More info</a>
    </div>
`;

const generateProductCards = (products) => {
    return products.map((product, index) => {
        return cardTemplate
            .replace("$Title$", product.title)
            .replace("$img_src$", product.thumbnail)
            .replace("$Description$", product.description)
            .replace("$Price$", product.price)
            .replace("$Rating$", product.rating)
            .replace("$ID$", index);
    }).join('');
};

const htmlTemplate = `
<!DOCTYPE HTML>
<html>
<head>
    <title>DETAILS</title>
    <style>
    body {
      background-color: black;
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
  }

  .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
  }

  nav {
      background-color: #333;
      color: #fff;
      padding: 10px;
      width: 100%;
      text-align: center;
  }

  nav h1 {
      margin: 0;
      padding: 0;
      font-size: 24px;
  }

  nav ul {
      padding: 0;
      margin: 10px 0;
      list-style: none;
  }

  nav ul li {
      display: inline-block;
      margin-right: 20px;
  }

  nav ul li a {
      color: #fff;
      text-decoration: none;
      font-size: 18px;
  }

  .product-card {
      max-width: 300px;
      margin: 20px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background-color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      display: inline-block;
        vertical-align: top;

  }

  .product-card h3 {
      margin-top: 0;
  }

  .product-card img {
      width: 100%;
      border-radius: 5px;
      height: 200px; 
    object-fit: cover; 
  }

  .product-card p {
      margin: 10px 0;
  }

  .product-card a {
      display: block;
      text-align: center;
      margin-top: 10px;
      background-color: #333;
      color: #fff;
      text-decoration: none;
      padding: 10px;
      border-radius: 5px;
  }

  .product-card a:hover {
      background-color: #555;
  }

  footer {
      background-color: #333;
      color: #fff;
      text-align: center;
      padding: 20px 0;
      width: 100%;
  }
</style>
    </style>
</head>
<body>

<div class="container">
    <nav>
        <h1>E-Commerce</h1>
        <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="#">Products</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li>
            <li>
                <form action="/search" method="GET">
                    <input type="text" name="query" placeholder="Search products...">
                    <button type="submit">Search</button>
                </form>
            </li>
        </ul>
    </nav>

    <main>
        ${generateProductCards(dataObj)}
    </main>
</div>

<footer>
    <p>&copy; 2024 Let's Shop. All Rights Reserved.</p>
</footer>

</body>
</html>
`;

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });

    const { pathname, query } = url.parse(req.url, true);

    if (pathname === '/home') {
        res.end(htmlTemplate);
    } else if (pathname === '/product' && query.id !== undefined) {
        const id = parseInt(query.id);
        if (id >= 0 && id < dataObj.length) {
            const product = dataObj[id];
            const productPageContent = `
                <div class="product-page">
                    <h1>${product.title}</h1>
                    <img src="${product.thumbnail}" alt='product-image'/>
                    <p>${product.description}</p>
                    <p>Price: ${product.price}</p>
                    <p>Rating: ${product.rating}</p>
                    <p>Stock: ${product.stock}</p>
                    <p>Brand: ${product.brand}</p>
                    <p>Category: ${product.category}</p>
                    <a href="/home">Home</a>
                </div>
            `;
            res.end(productPageContent);
        } else {
            res.end('Product not found');
        }
    } else if (pathname === '/search') {
        const queryTerm = query.query.toLowerCase(); // Get the search query from the request
        // Perform search logic
        const searchResults = dataObj.filter(product => {
            // Check if the product title or description contains the search query
            return product.title.toLowerCase().includes(queryTerm) || product.description.toLowerCase().includes(queryTerm);
        });

        // Generate HTML for search results
        const searchResultHtml = generateProductCards(searchResults);

        // Generate HTML for search result page
        const searchPageContent = `
            <div class="search-results">
                <h1>Search Results for "${queryTerm}"</h1>
                ${searchResultHtml}
                <a href="/home">Back to Home</a>
            </div>
        `;

        res.end(searchPageContent);
    } else {
        res.end('Not found');
    }
});

server.listen(1400, () => {
    console.log("Server is running on port 1400");
});





