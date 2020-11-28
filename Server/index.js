const nunjucks = require("nunjucks"); //Template Engine

const express = require("express"); // lib express
const { query } = require("express");

const Pool = require("pg").Pool; // PostGres Pool mantém uma conexão com o banco de dados

const db = new Pool({
  user: "postgres",
  password: "1818",
  host: "localhost",
  port: 5432,
  database: "Doe",
});

const server = express();

//middleware para exibir arquivos estáticos (css,imagens,scripts)
server.use(express.static("public"));

//middleware para habilitar o formulario
server.use(express.urlencoded({ extended: true }));

// O nunjucks pede como parâmetro o diretório e o objeto, aqui é a conf da template engine
nunjucks.configure("./", {
  express: server,
  noCache: true,
});

server.listen(3000, () => {
  console.log("SERVER [OK]");
});

server.get("/index.html", (req, res) => {
  console.log("GET [OK]");

  db.query("SELECT * FROM donors", (err, result) => {
    if (err) return res.send("Erro de banco de dados");

    const donors = result.rows;
    return res.render("Html/index.html", { donors });
  });
});

server.post("/index.html", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const blood = req.body.blood;

  if (name == "" || email == "" || blood == "") {
    return res.send("Todos campos são obrigatórios");
  }

  const query = `INSERT INTO donors ("name","email","blood") VALUES ($1,$2,$3)`;
  const values = [name, email, blood];

  db.query(query, values, (err) => {
    if (err) return res.send("Erro no banco de dados");

    return res.redirect("/index.html");
  });
});
