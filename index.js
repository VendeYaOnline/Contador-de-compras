import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

// Definir __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// * RUTAS
app.post("/api/register-purchase", (req, res) => {
  const { filename } = req.body;
  if (!filename) {
    return res.status(400).send("Falta el nombre del archivo");
  }

  const filePath = path.join(__dirname, "data", "purchases.json");

  fs.readFile(filePath, "utf8", (err, fileData) => {
    let purchases = {};

    if (err) {
      if (err.code !== "ENOENT") {
        // Si hay un error distinto a que el archivo no existe, retornamos un error
        return res.status(500).send("Error al leer el archivo");
      }
      // Si el archivo no existe, continuamos con un objeto vacío
    } else {
      // Si el archivo existe y no está vacío, lo parseamos
      if (fileData) {
        try {
          purchases = JSON.parse(fileData);
        } catch (parseErr) {
          return res.status(500).send("Error al parsear los datos");
        }
      }
    }

    // Actualizamos o creamos la entrada correspondiente
    if (purchases[filename]) {
      purchases[filename] += 1;
    } else {
      purchases[filename] = 1;
    }

    // Guardamos los datos de vuelta en el archivo
    fs.writeFile(filePath, JSON.stringify(purchases, null, 2), (writeErr) => {
      if (writeErr) {
        return res.status(500).send("Error al guardar los datos");
      }
      return res.status(200).send({ [filename]: purchases[filename] });
    });
  });
});

app.get("/api/get-purchases", (_req, res) => {
  const filePath = path.join(__dirname, "data", "purchases.json");

  fs.readFile(filePath, "utf8", (err, fileData) => {
    if (err) {
      if (err.code === "ENOENT") {
        // Si el archivo no existe, devolvemos un objeto vacío
        return res.status(200).json({});
      }
      // Si hay otro error al leer el archivo, devolvemos un error 500
      return res.status(500).send("Error al leer el archivo");
    }

    // Si el archivo existe y no está vacío, lo parseamos
    let purchases = {};
    if (fileData) {
      try {
        purchases = JSON.parse(fileData);
      } catch (parseErr) {
        return res.status(500).send("Error al parsear los datos");
      }
    }

    // Devolvemos los datos como respuesta
    return res.status(200).json(purchases);
  });
});

app.get("download-purchases", (req, res) => {
  const { name } = req.body;
  res.status(201).send("Compra registrada");
});

// * SERVER
app.listen(process.env.PORT || 4000, () => {
  console.log("Server run in port ", process.env.PORT || 4000);
});
