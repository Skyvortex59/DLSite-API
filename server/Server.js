const express = require('express');
const NetworkUtil = require("../api/NetworkUtil"); // Importez votre classe NetworkUtil personnalisée ici
const axios = require("axios")

class Server {
  constructor() {
    this.app = express();

    this.port = 8080; // Choisissez le port que vous souhaitez utiliser

    this.server = null; // Variable pour stocker l'instance du serveur

    this.networkUtil = new NetworkUtil(); // Créez une instance de votre classe NetworkUtil

    this.initialize();
  }

  initialize() {
    this.configureMiddleware();
    this.configureRoutes();
    this.startListening();
  }


  configureMiddleware() {
    this.app.use(express.json());
    // Ajoutez ici d'autres middlewares selon vos besoins
  }

  configureRoutes() {
    this.app.post('/api', async (req, res) => {
      const {
        code,
        request
      } = req.body;

      // Utilisez votre instance de NetworkUtil pour traiter la requête
      const data = await this.networkUtil.initialize(code, request);

      res.json(data); // Renvoyez les données en réponse à la requête
    });

    // Ajoutez ici d'autres routes selon vos besoins
  }

  // configureRoutes() {
  //   this.app.get('/', (req, res) => {
  //     res.send('Hello, world!');
  //   });

  //   // Ajoutez ici d'autres routes selon vos besoins
  // }

  startListening() {
    this.app.listen(this.port, () => {
      console.log(`Server is listening on port ${this.port}`);
    });

    process.on('SIGINT', () => {
      this.stopListening();
    });
  }
}

module.exports = Server;