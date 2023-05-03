const express = require('express');
const joi = require('joi');
const ruta = express.Router();

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

const usuarios = [
    {id: 1, nombre: 'Juan'},
    {id: 2, nombre: 'Karen'},
    {id: 3, nombre: 'Diego'},
    {id: 4, nombre: 'María'}
];

ruta.get('/', (req, res) => {
    res.send(['Jorge', 'Ana', 'Karen', 'Luis']);
});

// Con los : adelante de id Express sabe que es un 
// parametro a recibir en la ruta
ruta.get('/:id', (req, res) => {
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
// localhost:5000//1990/2/?nombre=xxx&single=y
// ruta.get('//:year/:month', (req, res) => {
//     // res.send(req.params);   // Muestra los parametros enviados mediante la ruta
//     // En el cuerpo de req está el parametro Query, que guarda los parámetro QUERY String
//     res.send(req.query);
// });

// La ruta tiene el mismo nombre que la petición GET
// Exprress hace la diferencia dependiendo del tipo de petición
// La petición POST la vamos a utilizar para insertar un nuevo usuario
ruta.post('/', (req, res) => {
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
ruta.put('/:id', (req, res) => {
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
ruta.delete('/:id', (req, res) => {
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

module.exports = ruta;      //Se exporta el objeto ruta
