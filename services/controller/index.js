//Importações básicas
const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const cors = require('cors');

//Configuração dos caminhos
const PROTO_PATH = path.resolve(__dirname, '../../proto');

//Configuração Inventory
const inventoryPackageDefinition = protoLoader.loadSync(
    path.join(PROTO_PATH, 'inventory.proto'),
    { 
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
);

const inventoryProto = grpc.loadPackageDefinition(inventoryPackageDefinition);
const inventoryClient = new inventoryProto.InventoryService( // ← Forma correta sem package
    'localhost:3002',
    grpc.credentials.createInsecure()
);

//Configuração Shipping
const shippingPackageDefinition = protoLoader.loadSync(
    path.join(PROTO_PATH, 'shipping.proto'),
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
);

const shippingProto = grpc.loadPackageDefinition(shippingPackageDefinition);
const shippingClient = new shippingProto.ShippingService(
    'localhost:3001',
    grpc.credentials.createInsecure()
);


//Configuração do express
const app = express();
app.use(cors());

//Rotas
app.get('/products', (req, res) => {
    inventoryClient.SearchAllProducts({}, (err, data) => {
        if (err) {
            console.error('Erro no InventoryService:', err);
            return res.status(500).json({ error: 'Falha ao buscar produtos' });
        }
        res.json(data.products);
    });
});

app.get('/shipping/:cep', (req, res) => {
    shippingClient.GetShippingRate(
        { cep: req.params.cep },
        (err, data) => {
            if (err) {
                console.error('Erro no ShippingService:', err);
                return res.status(500).json({ error: 'Falha ao calcular frete' });
            }
            res.json({
                cep: req.params.cep,
                value: data.value
            });
        }
    );
});

app.get('/product/:id', (req, res, next) => {
    //Chama método do microsserviço
    inventoryClient.SearchProductByID({ id: req.params.id }, (err, product) => {
        //Se ocorrer algum erro de comunicação com o microsserviço, retorna para o navegador.
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'algo falhou :(' });
        } else {
            //Caso contrário, retorna resultado microsserviço (um arquivo JSON) com os dados do produto pesquisado
            res.json(product);
        }
    });
});


//Inicialização
app.listen(3000, () => {
    console.log('Controller Service rodando em http://127.0.0.1:3000');
    console.log('Endpoints disponíveis:');
    console.log('GET /products');
    console.log('GET /product/:id');
    console.log('GET /shipping/:cep');
});