const express = require('express');
const NetworkUtil = require("../api/NetworkUtil"); // Importez votre classe NetworkUtil personnalisée ici
const axios = require("axios")

class Server {
  constructor() {
    this.app = express();

    this.port; // Choisissez le port que vous souhaitez utiliser

    this.server = null; // Variable pour stocker l'instance du serveur

    this.networkUtil = new NetworkUtil(); // Créez une instance de votre classe NetworkUtil

    this.initialize();
  }

  initialize() {
    this.configureMiddleware();
    this.configureRoutes();
    this.findAvailablePort()
      .then(port => {
        this.port = port;
        this.sendPortToApi(port);
        this.startListening();
      })
      .catch(error => {
        console.error('Erreur lors de la recherche du port disponible :', error);
      });
  }


  configureMiddleware() {
    this.app.use(express.json());
    // Ajoutez ici d'autres middlewares selon vos besoins
  }

  //   configureRoutes() {
  //     this.app.post('/api', async (req, res) => {
  //       const { code, treatment } = req.body;

  //       // Utilisez votre instance de NetworkUtil pour traiter la requête
  //       const data = await this.networkUtil.initialize(code, treatment);

  //       res.json(data); // Renvoyez les données en réponse à la requête
  //     });

  //     // Ajoutez ici d'autres routes selon vos besoins
  //   }

  configureRoutes() {
    this.app.get('/', (req, res) => {
      res.send('Hello, world!');
    });

    // Ajoutez ici d'autres routes selon vos besoins
  }

  findAvailablePort() {
    return new Promise((resolve, reject) => {
      const server = this.app.listen(0, () => {
        const port = server.address().port;
        if (port) {
          resolve(port);
        } else {
          reject('Impossible de trouver un port disponible.');
        }
        server.close(() => {});
      });

      server.on('error', error => {
        reject(error);
      });
    });
  }


  async sendPortToApi(port) {
    const apiUrl = 'http://localhost/API_php/api/port/';

    const data = {
        port: port
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
    console.log(options);

    try {
        const response = await fetch(apiUrl, options);
        if (response.ok) {
            console.log('Port sent to API successfully');
            const responseData = await response.json();
            console.log('API response:', responseData);
        } else {
            console.error('Failed to send port to API');
            throw new Error('API request failed');
        }
    } catch (error) {
        console.error('An error occurred while sending port to API:', error);
    }
  }





  startListening() {
    this.app.listen(this.port, () => {
      console.log(`Server is listening on port ${this.port}`);
    });

    process.on('SIGINT', () => {
      this.stopListening();
    });
  }

  stopListening() {
    if (this.server) {
      this.server.close(() => {
        console.log(`Server has stopped listening on port ${this.port}`);
        process.exit(0);
      });
    }
  }
}

module.exports = Server;