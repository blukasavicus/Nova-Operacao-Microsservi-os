// Importa a biblioteca gRPC principal
const grpc = require('@grpc/grpc-js');

// Importa a biblioteca para carregar arquivos .proto
const protoLoader = require('@grpc/proto-loader');

//Carrega e processa o arquivo shipping.proto, que define o serviço e as mensagens
const packageDefinition = protoLoader.loadSync('proto/inventory.proto', {
    keepCase: true, //mantem os nomes dos campos como estão no .proto
    longs: String, //converte tipos longos para String
    enums: String, //converte enums para String
    arrays: true //Interpreta campos repeated como arrays
});

//Cria uma instância do serviço InventoryService com base na definição carregada
const InventoryService = grpc.loadPackageDefinition(packageDefinition).InventoryService;

//Cria um cliente gRPC para o serviço de inventário, apontando para o endereço onde o serviço está rodando
const client = new InventoryService('127.0.0.1:3002', grpc.credentials.createInsecure());

//Exporta o cliente para que possa ser usado em outras partes da aplicação
module.exports = client;