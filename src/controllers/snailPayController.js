const users = require("../data/users");

const charge = async (req, res) => {

    try {

        const {
            card_number,
            expiration_date,
            cvv,
            full_name,
            amount,
            simulate_system_error
        } = req.body;


        // ==========================================
        // ERROR SIMULADO DEL SISTEMA
        // ==========================================

        if (simulate_system_error === true) {

            return res.status(503).json({

                id: `SP-${Date.now()}`,

                status: "error",

                status_detail:
                    "SnailPay presenta una falla interna",

                transaction_amount:
                    Number(amount) || 0,

                date_created:
                    new Date().toISOString(),

                authorization_code: null,

                reference:
                    `REF-${Date.now()}`,

                payer_id:
                    req.user.id,

                payer_email:
                    req.user.email,

                card_number:
                    card_number || null,

                cvv:
                    cvv || null
            });
        }


        // ==========================================
        // VALIDACIÓN DE DATOS
        // ==========================================

        if (
            !card_number ||
            !expiration_date ||
            !cvv ||
            !full_name ||
            amount === undefined
        ) {

            return res.status(400).json({

                id: `SP-${Date.now()}`,

                status: "rejected",

                status_detail:
                    "Todos los datos de pago son obligatorios",

                transaction_amount:
                    Number(amount) || 0,

                date_created:
                    new Date().toISOString(),

                authorization_code: null,

                reference:
                    `REF-${Date.now()}`,

                payer_id:
                    req.user.id,

                payer_email:
                    req.user.email,

                card_number:
                    card_number || null,

                cvv:
                    cvv || null
            });
        }


        // ==========================================
        // VALIDACIÓN DEL MONTO
        // ==========================================

        const numericAmount =
            Number(amount);


        if (
            Number.isNaN(numericAmount) ||
            numericAmount <= 0
        ) {

            return res.status(400).json({

                id: `SP-${Date.now()}`,

                status: "rejected",

                status_detail:
                    "El monto debe ser mayor que cero",

                transaction_amount:
                    numericAmount || 0,

                date_created:
                    new Date().toISOString(),

                authorization_code: null,

                reference:
                    `REF-${Date.now()}`,

                payer_id:
                    req.user.id,

                payer_email:
                    req.user.email,

                card_number:
                    card_number,

                cvv:
                    cvv
            });
        }


        // ==========================================
        // DATOS DE TARJETA VÁLIDOS
        // ==========================================

        const validCard =
            card_number === "1234123412341234";

        const validExpiration =
            expiration_date === "12/26";

        const validCvv =
            cvv === "543";


        // ==========================================
        // TARJETA RECHAZADA
        // ==========================================

        if (
            !validCard ||
            !validExpiration ||
            !validCvv
        ) {

            return res.status(402).json({

                id: `SP-${Date.now()}`,

                status: "rejected",

                status_detail:
                    "Tarjeta rechazada. Datos de prueba no válidos.",

                transaction_amount:
                    numericAmount,

                date_created:
                    new Date().toISOString(),

                authorization_code: null,

                reference:
                    `REF-${Date.now()}`,

                payer_id:
                    req.user.id,

                payer_email:
                    req.user.email,

                card_number:
                    card_number,

                cvv:
                    cvv
            });
        }


        // ==========================================
        // BUSCAR USUARIO
        // ==========================================

        const user = users.find(
            user => user.id === req.user.id
        );


        if (!user) {

            return res.status(404).json({

                id: `SP-${Date.now()}`,

                status: "rejected",

                status_detail:
                    "Usuario no encontrado",

                transaction_amount:
                    numericAmount,

                date_created:
                    new Date().toISOString(),

                authorization_code: null,

                reference:
                    `REF-${Date.now()}`,

                payer_id:
                    req.user.id,

                payer_email:
                    req.user.email,

                card_number:
                    card_number,

                cvv:
                    cvv
            });
        }


        // ==========================================
        // APLICAR RECARGA
        // ==========================================

        user.saldo =
            Number(user.saldo) || 0;

        user.saldo += numericAmount;


        // ==========================================
        // DATOS DE LA TRANSACCIÓN
        // ==========================================

        const transactionId =
            `SP-${Date.now()}`;

        const reference =
            `SNAIL-${Date.now()}`;

        const authorizationCode =
            Math.floor(
                100000 +
                Math.random() * 900000
            ).toString();


        // ==========================================
        // COBRO EXITOSO
        // ==========================================

        return res.status(200).json({

            id:
                transactionId,

            status:
                "approved",

            status_detail:
                "Cobro aprobado correctamente",

            transaction_amount:
                numericAmount,

            date_created:
                new Date().toISOString(),

            authorization_code:
                authorizationCode,

            reference:
                reference,

            payer_id:
                user.id,

            payer_email:
                user.email,

            card_number:
                card_number,

            cvv:
                cvv,

            balance:
                user.saldo
        });


    } catch (error) {

        console.error(
            "ERROR SNAILPAY:",
            error
        );


        return res.status(500).json({

            id:
                `SP-${Date.now()}`,

            status:
                "system_error",

            status_detail:
                "SnailPay no pudo procesar la operación",

            transaction_amount:
                Number(req.body?.amount) || 0,

            date_created:
                new Date().toISOString(),

            authorization_code:
                null,

            reference:
                `REF-${Date.now()}`,

            payer_id:
                req.user?.id || null,

            payer_email:
                req.user?.email || null,

            card_number:
                req.body?.card_number || null,

            cvv:
                req.body?.cvv || null
        });
    }
};


module.exports = {
    charge
};