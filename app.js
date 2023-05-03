const inicioDebug = require('debug')('app:inicio'); //iMPORTAR EL PAQUETE DEBUG
                                                    //El parametro indica el archivo y el entorno de depuracion 
const dbDebug = require('debug')('app:db');
const express = require('express'); // Importa el paquete express
const config = require('config');   // Importa el paquete config
const joi = require('joi');         
const app = express();              // Crea una instancia de express
const morgan = require('morgan');
// const logger = require('./logger')

// Cuáles son los métodos a implementar con su ruta
// app.get();      // Consulta
// app.post();     // Envio de datos al servidor (insertar datos en la base)
// app.put();      // Actualización
// app.delete(),;   // Eliminación

app.use(express.json());                        // Le decimos a express que use este middleware
app.use(express.urlencoded({extended:true}));   // Define el uso de la libreria qs para separar la información codificada en el url 
app.use(express.static('public'));              // Nombre de la carpeta que tendrá los archivos (recursos estáticos)

console.log(`Aplicación ${config.get('nombre')}`);
console.log(`BD Server ${config.get('configDB.host')}`);

if (app.get('env') === 'development'){ 
    app.use(morgan('tiny'));                        // Para ver las peticiones del lado del cliente
    inicioDebug('Morgan está habilitado')           // Muestra mensaje de depuración
}

dbDebug('Conectando con la base de datos...');

// app.use(logger);                                // Logger ya hacé referencia a la funciín log de logger.js debido al exports
// app.use(function(req, res, next){
//     console.log('Autenticando');
//     next();
// });
// Los tres app.use son middleware y se llaman antes de las funciones de ruta
// GET, POST, PUT, DELETE para que éstas puedan trabajar


const usuarios = [
    {id: 1, nombre: 'Juan'},
    {id: 2, nombre: 'Karen'},
    {id: 3, nombre: 'Diego'},
    {id: 4, nombre: 'María'}
];

/**Funciones de validadion */
function existeUsuario(id) {
    return (usuarios.find( u => u.id === parseInt(id)));
}

function validarUsuario(nom) {
    const schema = joi.object({
        nombre: joi.string().min(3).required
    });
    return (schema.validate({nombre: nom}));
}

// Consulta en la ruta raíz del sitio
// Toda petición siempre va a recibir dos parámetro
// req: la información que recibe el servidor desde el cliente
// res: la informacipon que el servidor va a responder al cliente
app.get('/', (req, res) => {
    res.send('Hola mundo');     //Método send del objeto res
});

app.get('/api/usuarios', (req, res) => {
    res.send(['Jorge', 'Ana', 'Karen', 'Luis']);
});

// Con los : adelante de id Express sabe que es un 
// parametro a recibir en la ruta
app.get('/api/usuarios/:id', (req, res) => {
    // En el cuerpo del objeto req está la propieda params,
    // que guarda los parámetros enviados
    // Los parametros en req.paramns se reciben como string
    // parseInt, hace el casteo a valores enteros directamente
    // const id = parseInt(req.params.id)
    // // Devuelve el primer usuario que cumpla con el prédicado
    // const usuario = usuarios.find(u => u.id === id);
    const id = req.params.id;
    let usuario = existeUsuario(id);
    if (!usuario){
        res.status(404).send(`El usuario ${id} no se encuentra`);
        return;
    }
    res.send(usuario);
    return;
});

// Recibiendo varios parametros
// Se pasan dos parámetros year y month
// Query string
// localhost:5000/api/usuarios/1990/2/?nombre=xxx&single=y
app.get('/api/usuarios/:year/:month', (req, res) => {
    // res.send(req.params);   // Muestra los parametros enviados mediante la ruta
    // En el cuerpo de req está el parametro Query, que guarda los parámetro QUERY String
    res.send(req.query);
});

// La ruta tiene el mismo nombre que la petición GET
// Exprress hace la diferencia dependiendo del tipo de petición
// La petición POST la vamos a utilizar para insertar un nuevo usuario
app.post('/api/usuarios', (req, res) => {
    // El objeto request tiene la propiedad body
    // que va a venir en formato JSON
    const {error, value} = validarUsuario(req.body.nombre)
    if (!error) {
        const usuario = {
            id: usuarios.length + 1,
            nombre: req.body.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    } else {
        // Código 400: Bad request
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return; // Es necesario para que no continúe el método
    }
    return;
});

// Petición para modificar datos existentes
// Este método debe de recibir un parámetro
// id para saber que usurio modificar
app.put('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id);
    if (!usuario) {
        res.status(404).send('El usuario no se encuentra'); // Devuelve el estado HTTp
        return;
    }
    // Validar si el dato recibido es correcto
    const {error, value} = validarUsuario(req.body.nombre);
    if (!error) {
        // Actualiza el nombre 
        usuario.nombre = value.nombre;
        res.send(usuario);
    } else {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
    return;
});

// Recibe como parametro el id del usuario que se va a eliminar
app.delete('/api/usuarios/:id', (req, res) => {
    const usuario = existeUsuario(req.params.id);
    if (!usuario) {
        res.status(404).send('El usuario no se encuentra'); // Devuelve el estado HTTP
        return;
    }
    // Encontrar el indice del ususario dentro del arreglo
    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1);      // Elimina el usuario en el índice
    res.send(usuario);              // Se responde con el usuario eliminado
    return;
});

app.get('/api/productos', (req, res) => {
    res.send(['Alcohol', 'TV']);
});

// El módulo process contiene información del sistema
// El objeto ENV contiene información de las variables de entorno
// Si la variable PORT no existe, que tome un valor fijo definido por nosotros (3000)
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}`);
});

/**
 * FUNCIONES MIDDLEWARE
 * 
 * El middleware es un bloque de código que se ejecuta entre las peticiones del usuario (request)
 * y la peticion que llega al servidor. Es un enlace entre la petición del usuario y el servidor, 
 * antes de que este pueda dar con la respuesta
 * Estas funciones son funciones que tienen acceso al objeto de solicitud (request), al objeto de respuesta (req)
 * y a la siguiente funcion de middleware en el ciclo de solicitud respuesta de la app.
 * La siguiente función de middlewware se denota normalmente con una variable denominada next
 * 
 * Las funciones de middleware pueden realizar las siguientes tareas
 * - Ejecutar cualquier código
 * - Realizar camnios en la solicitud y objetos de la respuesta
 * - Finalizar el cilco de solicitud respuesta
 * - Invocar la siguiente función de middleware en la pila
 * 
 *  Express es un framework de direccionamiento y uso de middleware que permite que la app tenga funcionalidad
 * minima propia
 * Ya hemos usado algunos middleware, como son express.json que tranforma el body del req a formato JSON
 * 
 *            ---------------------------
 * request ---|--->json() --> route() --|---> response
 *            ---------------------------
 * 
 * route() --> Función GET, POST, PUT, DELETE
 * 
 * Una aplicación Express puede utilizar los siguientes tipos de middleware:
 * - Middleware de nivel de app
 * - Middleware de nivel de dirección
 * - Middleware de manejo de errores
 * - Middleware incorporado
 * - Middleware de terceros
 * 
 */

/** RECURSOS ESTÁTICOS
 * Los recursos estáticos hacen referencia a archivos, img, documentos que se ubican el 
 * servidor. 
 * Vamos a usar un middleware para poder acceder a estos recursos. 
 */