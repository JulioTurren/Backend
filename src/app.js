const express = require("express");
const cors = require("cors");
require("dotenv").config();

const usuarioRoutes = require("./routes/usuarioRoutes");
const snailPayRoutes = require("./routes/snailPayRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "API funcionando correctamente"
    });
});

app.use("/api/auth", usuarioRoutes);
app.use("/api/snailpay", snailPayRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});