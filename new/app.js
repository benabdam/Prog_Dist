const express = require('express');
const app = express();
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const session = require('express-session');
const FileStore = require('session-file-store')(session);


app.use(express.json());



const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'db',  
  database: process.env.DB_NAME || 'fripperie',
  password: process.env.DB_PASSWORD || '0753861857',
  port: 5432,
});


app.use(session({
  secret: '0123456789',
  resave: false,
  saveUninitialized: true
}));

const connectWithRetry = () => {
  pool.connect()
    .then(() => {
      console.log('Connexion réussie à la base de données PostgreSQL');
    })
    .catch(err => {
      console.error('Erreur de connexion à la base de données PostgreSQL:', err.message);
      console.log('Réessayer dans 8 secondes...');
      setTimeout(connectWithRetry, 8000); 
    });
};


connectWithRetry();
//Verification de la connexion à la base de donnée
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête :', err);
    } else {
      console.log('Résultat de la requête :', res.rows);
    }
});
  


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const mediaPath = path.resolve(__dirname, 'media');
app.use('/media', express.static(mediaPath));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});

app.get('/', (req, res) => {
  res.render('welcome');
});


app.get('/inscription', (req, res) => {
  res.render('inscription', { errorMessage: null });
});


app.get('/connexion', (req, res) => {
  res.render('connexion');
});

app.get('/final', (req, res) => {
  res.render('final');
});

app.get('/validation', (req, res) => {
  res.render('validation',{ errorMessage: null });
});

async function fetchProducts() {
  const { rows: products } = await pool.query(`
    SELECT p.*, s.taille, s.nb_stock
    FROM products p
    JOIN stocks s ON p.id = s.id_prod;
  `);

  const processedProducts = {};

  products.forEach((product) => {
    const { id, p_name, img, descrip, price, taille, nb_stock } = product;

    if (!processedProducts[id]) {
      processedProducts[id] = {
        id,
        p_name,
        img,
        descrip,
        price,
        stocks: [],
      };
    }

    processedProducts[id].stocks.push({ taille, nb_stock });
  });

  const finalProducts = Object.values(processedProducts);

  return finalProducts;
}


app.get('/main_page', async (req, res) => {
  try {
    const products = await fetchProducts();
    const userId = req.session.userId || Date.now(); 
    req.session.userId = userId; 

    const productsInCart = req.session.productsInCart || [];
    res.render('main_page', { products, productsInCart });
  } catch (error) {
    console.error(error);
  }
});

app.get('/gerant', async (req, res) => {
  // Logique spécifique pour l'interface du gérant
  const products = await fetchProducts();
  const notification = req.query.notification; 
  res.render('gerant', { products, notification }); 
});

app.post('/gerant/supprimer', async (req, res) => {
  const orderId = req.body.orderId;
  try {
    const { rowCount } = await pool.query('SELECT id FROM orders WHERE id = $1', [orderId]);
    if (rowCount === 0) {
      res.redirect('/gerant?notification=Cette commande n\'existe pas.');
    } else {
      await pool.query('DELETE FROM order_items WHERE order_id=$1',[orderId]);
      await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
      res.redirect('/gerant?notification=La commande a été supprimée avec succès.');
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande :', error);
    res.redirect('/gerant?notification=Une erreur s\'est produite lors de la suppression de la commande.');
  }
});


app.post('/gerant/ajouter', async (req, res) => {
  const { id_prod, nb_stock, taille } = req.body;

  try {
    // Vérifier si une entrée avec la même combinaison id_prod et taille existe déjà dans la table stocks
    const checkExistingStock = await pool.query('SELECT * FROM stocks WHERE id_prod = $1 AND taille = $2', [id_prod, taille]);

    if (checkExistingStock.rows.length > 0) {
      // Une entrée avec la même combinaison id_prod et taille existe déjà, mettre à jour la quantité
      const currentStock = checkExistingStock.rows[0].nb_stock;
      const updatedStock = currentStock + parseInt(nb_stock);
      await pool.query('UPDATE stocks SET nb_stock = $1 WHERE id_prod = $2 AND taille = $3', [updatedStock, id_prod, taille]);
    }
    // Rediriger vers la page du gérant avec un message de succès
    res.redirect('/gerant?notification=Les éléments ont été ajoutés au stock avec succès.');
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'éléments au stock :', error);
    // Rediriger vers la page du gérant avec un message d'erreur
    res.redirect('/gerant?notification=Une erreur s\'est produite lors de l\'ajout d\'éléments au stock.');
  }
});




app.post('/inscription', (req, res) => {
  const { email, pwd } = req.body;

  const query = {
    text: 'SELECT username FROM clients WHERE email = $1 AND pwd = $2',
    values: [email, pwd],
  };

  pool.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erreur interne du serveur');
    } else if (result.rows.length > 0) {
      const username = result.rows[0].username;
      res.redirect(`/profil/${username}`);
    } else {
      res.render('inscription', { errorMessage: 'Informations de connexion non valides.' });
    }
  });
});

app.get('/getCartCount', (req, res) => {
  const userId = req.session.userId; 

  const query = 'SELECT COUNT(*) AS cartCount FROM panier WHERE user_id = $1';
  const values = [userId];
  pool.query(query, values)
    .then(result => {
      const cartCount = result.rows[0].cartcount;
      res.json({ cartCount }); 
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while retrieving the cart count' });
    });
});





app.post('/addToCart', (req, res) => {
  const { productId } = req.body;
  const size = req.body.size;
  const quantite = req.body.quantite;
  const userId = req.session.userId; 

  const stockQuery = 'SELECT nb_stock FROM stocks WHERE id_prod = $1 AND taille = $2';
  const stockValues = [productId, size];

  pool.query(stockQuery, stockValues)
    .then(stockResult => {
      if (stockResult.rows.length === 0 || stockResult.rows[0].nb_stock < quantite) {
        // Le stock n'est pas disponible
        res.status(400).json({ error: 'Stock not available' });
      } else {
        // Le stock est disponible, insérer les données dans la table 'panier'
        const insertQuery = 'INSERT INTO panier (user_id, product_id, size, quantite) VALUES ($1, $2, $3, $4)';
        const insertValues = [userId, productId, size, quantite];

        pool.query(insertQuery, insertValues)
          .then(() => {
            res.json({ message: 'Product added to cart' });
          })
          .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while adding the product to the cart' });
          });
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while checking the stock' });
    });
});

app.post('/addToFav', (req, res) => {
  const { productId } = req.body;
  const size = req.body.size;
  const quantite = req.body.quantite;
  const userId = req.session.userId;

  // Vérifier le stock disponible
  const stockQuery = 'SELECT nb_stock FROM stocks WHERE id_prod = $1 AND taille = $2';
  const stockValues = [productId, size];

  pool.query(stockQuery, stockValues)
    .then(stockResult => {
      if (stockResult.rows.length === 0 || stockResult.rows[0].nb_stock < quantite) {
        // Le stock n'est pas disponible
        res.status(400).json({ error: 'Stock not available' });
      } else {
        // Le stock est disponible, insérer les données dans la table 'panier'
        const insertQuery = 'INSERT INTO favori (id, p_id, size, quantite) VALUES ($1, $2, $3, $4)';
        const insertValues = [userId, productId, size, quantite];

        pool.query(insertQuery, insertValues)
          .then(() => {
            res.json({ message: 'Product added tofav' });
          })
          .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while adding the product to the fav' });
          });
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while checking the stock' });
    });
});

app.get('/getFavCount', (req, res) => {
  const userId = req.session.userId; 

  const query = 'SELECT COUNT(*) AS favCount FROM favori WHERE id = $1';
  const values = [userId];

  pool.query(query, values)
    .then(result => {
      const favCount = result.rows[0].favcount;
      res.json({ favCount }); // Renvoyer le nombre d'articles du panier au client
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while retrieving the cart count' });
    });
});


let code=1;
app.get('/panier', async (req, res) => {
  try {
    const userId = req.session.userId;
    const query = `
  SELECT pa.product_id, p.p_name, p.price, p.img, pa.size, p.descrip, s.nb_stock, t.total_price,t.total_quantite
  FROM panier pa
  JOIN products p ON pa.product_id = p.id
  JOIN stocks s ON pa.product_id = s.id_prod AND pa.size = s.taille
  JOIN (
    SELECT SUM(p.price * pa.quantite) AS total_price, SUM(pa.quantite) AS total_quantite
    FROM panier pa
    JOIN products p ON pa.product_id = p.id
    WHERE pa.user_id = $1
  ) t ON 1=1
  WHERE pa.user_id = $1 AND s.taille = pa.size;
`;
   

    const values = [userId];
    const { rows: products } = await pool.query(query, values);

    const totalArticles = products.length;
    if(totalArticles>0){
    const totalPrice = (products[0].total_price * code).toFixed(2);
    const reduction=(products[0].total_price - totalPrice).toFixed(2); 
    res.render('panier', { products, totalArticles, price: totalPrice, reduction: reduction,first:products[0].total_price });
    }else{
      res.render('panier', { products, totalArticles});
    }
  } catch (error) {
    console.error(error);
    res.render('error_page');
  }
});

app.get('/favorite', async (req, res) => {
  try {
    const userId = req.session.userId;
    const query = `
    SELECT pa.p_id, p.p_name, p.price, p.img, pa.size, p.descrip
    FROM favori pa
    JOIN products p ON pa.p_id = p.id
    WHERE pa.id = $1;
    `;
    const values = [userId];
    const { rows: products } = await pool.query(query, values);
    const totalArticles = products.length;
    res.render('favorite', { products, totalArticles});
  } catch (error) {
    console.error(error);
    res.render('error_page');
  }
});

app.post('/removeFromCart', (req, res) => {
  const { productId } = req.body;
  const userId = req.session.userId; 

  const query = 'DELETE FROM panier WHERE user_id = $1 AND product_id = $2';
  const values = [userId, productId];
  pool.query(query, values, (error, result) => {
    if (error) {
      console.error('Erreur lors de la suppression de l\'article du panier :', error);
      res.status(500).json({ message: 'Une erreur est survenue lors de la suppression de l\'article du panier.' });
    } else {
      res.status(200).json({ message: 'L\'article a été supprimé du panier avec succès.' });
    }
  });
});

app.post('/removeFromFav', (req, res) => {
  const { productId } = req.body;
  const userId = req.session.userId; 
  const query = 'DELETE FROM favori WHERE id = $1 AND p_id = $2';
  const values = [userId, productId];
  pool.query(query, values, (error, result) => {
    if (error) {
      console.error('Erreur lors de la suppression de l\'article de favori  :', error);
      res.status(500).json({ message: 'Une erreur est survenue lors de la suppression de l\'article du favori.' });
    } else {
      res.status(200).json({ message: 'L\'article a été supprimé du panier avec succès.' });
    }
  });
});

app.post('/MoveItem', async(req, res) => {
  const { productId } = req.body;
  const userId = req.session.userId; 
  const addToCartQuery = 'INSERT INTO panier (user_id, product_id, size, quantite) SELECT id, p_id, size, quantite FROM favori WHERE id = $1 AND p_id = $2';
  const addToCartValues = [userId, productId];
  await pool.query(addToCartQuery, addToCartValues);
  const query = 'DELETE FROM favori WHERE id = $1 AND p_id = $2';
  const values = [userId, productId];
  pool.query(query, values, (error, result) => {
    if (error) {
      console.error('Erreur lors de la suppression de l\'article de favori  :', error);
      res.status(500).json({ message: 'Une erreur est survenue lors de la suppression de l\'article du favori.' });
    } else {
      res.status(200).json({ message: 'L\'article a été supprimé du panier avec succès.' });
    }
  });
});

app.post('/updateCartItemQuantity', (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.session.userId; 
  const query = 'UPDATE panier SET quantite = $1 WHERE user_id = $2 AND product_id = $3';
  const values = [quantity, userId, productId];

  pool.query(query, values, (error, result) => {
    if (error) {
      console.error('Erreur lors de la mise à jour de la quantité dans la table panier :', error);
      res.status(500).json({ message: 'Une erreur est survenue lors de la mise à jour de la quantité dans la table panier.' });
    } else {
      res.status(200).json({ message: 'La quantité a été mise à jour dans la table panier'});
    }
  });
});

app.post('/reduction', async (req, res) => {
  try {
    const receivedCode = req.body.code; 
    if (receivedCode === "LESBEAUXJOURS") {
      if(code===1){
      code = 0.9;
      }else{
        code=1;
      } 
    }
    res.send({ success: true }); // Répondre avec succès au client
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, error: 'Erreur lors du traitement de la requête' });
  }
});


app.post('/validation', async(req, res) => {
  const clientId = req.session.userId; 
  const orderData = req.body; 
  const query3 = `
  SELECT SUM(p.price * pa.quantite) AS total_price, SUM(pa.quantite) AS total_quantite
  FROM panier pa
  JOIN products p ON pa.product_id = p.id
  WHERE pa.user_id = $1`;

  const values = [clientId];
  const { rows: products } =await  pool.query(query3, values);
  const total_price = products[0].total_price * code;
  const total_quantite = products[0].total_quantite;

  const query4 = `SELECT * FROM panier`;
  const { rows: cartItems } = await pool.query(query4);

  for (const product of cartItems) {
    const productId = product.product_id;
    const quantityOrdered = product.quantite;
    const size = product.size;
    const selectQuery = `
      SELECT nb_stock
      FROM stocks
      WHERE id_prod = $1 AND taille = $2
    `;
    const selectValues = [productId, size];
    const { rows: p } = await pool.query(selectQuery, selectValues);
    const nbStock = p[0].nb_stock;
    const newStock = nbStock - quantityOrdered;
    const updateQuery = `
      UPDATE stocks
      SET nb_stock = $1
      WHERE id_prod = $2 AND taille = $3
      RETURNING *
    `;
    const updateValues = [newStock, productId, size];
    const { rowCount } = await pool.query(updateQuery, updateValues);

    if (rowCount === 0) {
      console.error("Erreur lors de la mise à jour du stock pour le produit", productId);
    }
  }
    // Créer un nouvel order dans la table orders
    pool.query('INSERT INTO orders (email,rue,zip,city, total_price, total_quantity, phone, id_client) VALUES ($1, $2, $3, $4, $5,$6,$7,$8) RETURNING id',
      [orderData.email,orderData.address,orderData.zipcode,orderData.city, total_price, total_quantite, orderData.phone, clientId],
      (err, result) => {
        if (err) {
          console.error('Erreur lors de la création de l\'order:', err);
          res.status(500).send('Une erreur est survenue lors de la validation de la commande.');
        } else {
          const orderId = result.rows[0].id; // ID du nouvel order

          // Déplacer les produits du panier vers la table order_items
          pool.query('INSERT INTO order_items (order_id, product_id, quantity) SELECT $1, product_id, quantite FROM panier WHERE user_id = $2',
            [orderId, clientId],
            (err) => {
              if (err) {
                console.error('Erreur lors du déplacement des produits du panier:', err);
                res.status(500).send('Une erreur est survenue lors de la validation de la commande.');
              } else {
                // Vider le panier une fois la commande validée
                pool.query('DELETE FROM panier WHERE user_id = $1', [clientId], (err) => {
                  if (err) {
                    console.error('Erreur lors de la suppression des produits du panier:', err);
                    res.status(500).send('Une erreur est survenue lors de la validation de la commande.');
                  } else {
                    // Rediriger vers une page de confirmation de commande
                    if(code===0.9){
                      code=1
                    }
                    res.status(200).json({ success: true, orderId: orderId });
                  }
                });
              }
            }
          );
        }
      }
    );
});

