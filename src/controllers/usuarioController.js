const bcrypt = require("bcryptjs");
const users = require("../data/users");


const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        const {
            nombre,
            email,
            password,
            confirmPassword
        } = req.body;

      
        if (!nombre || !email || !password || !confirmPassword) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios"
            });
        }

        //validacion de contraseña
        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Las contraseñas no coinciden"
            });
        }

        
        if (password.length < 6) {
            return res.status(400).json({
                message: "La contraseña debe tener mínimo 6 caracteres"
            });
        }

        
        const userExists = users.find(
            user => user.email === email.toLowerCase()
        );

        if (userExists) {
            return res.status(409).json({
                message: "El correo ya está registrado"
            });
        }

        // Encriptacion de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: users.length + 1,
            nombre: nombre.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            saldo: 0
        };

        users.push(newUser);

        return res.status(201).json({
            message: "Usuario registrado correctamente",
            user: {
                id: newUser.id,
                nombre: newUser.nombre,
                email: newUser.email,
                saldo: newUser.saldo
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        
        if (!email || !password) {
            return res.status(400).json({
                message: "Correo y contraseña son obligatorios"
            });
        }

       
        const user = users.find(
            user => user.email === email.toLowerCase().trim()
        );

        if (!user) {
            return res.status(401).json({
                message: "Correo o contraseña incorrectos"
            });
        }

        // comparacion contraseña con el hash
        const passwordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordCorrect) {
            return res.status(401).json({
                message: "Correo o contraseña incorrectos"
            });
        }

        const token = jwt.sign({
            id: user.id,
            email: user.email
        },
        process.env.JWT_SECRET,{
            expiresIn: "2h"
        }
        );

        return res.status(200).json({
            message: "Inicio de sesión exitoso",
            token: token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                saldo: user.saldo
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }

};
const getProfile = (req, res) => {
    try {
        const user = users.find(
            user => user.id === req.user.id
        );

        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        return res.status(200).json({
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                saldo: Number(user.saldo) || 0
            }
        });

    } catch (error) {

        console.error("Error en getProfile: ", error);

        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
};

const addBalance = (req, res) => {
    try {

        console.log("Usuario del token: ", req.user);
        console.log("Body recibido: ", req.body);
        console.log("Usuarios actuales: ", users);

        const { amount } = req.body;

        if (amount === undefined || amount === null || amount === "") {
            return res.status(400).json({
                message: "El monto es obligatorio"
            });
        }

        const numericAmount = Number(amount);

        if (Number,isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({
                message: "El monto debe ser mayor a 0"
            });
        }

        if(!req.user || !req.user.id){
            return res.status(401).json({
                message: "Token invalido: no contiene usuario"
            });
        }

        const user = users.find( user => user.id === req.user.id);

        if(!user){
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        /*if(typeof user.saldo !== "numbre"){
            user.saldo = 0;
        }*/

        user.saldo = Number(user.saldo)|| 0;

        user.saldo += numericAmount;

        return res.status(200).json({
            message: "Saldo cargado correctamente",
            saldo: user.saldo,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                saldo: user.saldo
            }
        });

    } catch (error) {

        console.error("Error en addBalance: ", error);

        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    addBalance
};