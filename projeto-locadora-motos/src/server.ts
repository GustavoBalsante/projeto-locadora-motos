import express, { Request, Response, NextFunction } from 'express';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ==========================================
// ⚙️ CONFIGURAÇÕES E DIRETÓRIOS
// ==========================================
const JWT_SECRET = 'CHAVE_SECRETA_SUPER_SEGURA';
const UPLOADS_DIR = './uploads';

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Configuração estruturada do Multer para upload de imagens da frota
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ==========================================
// 🗄️ CONEXÃO COM O BANCO DE DADOS (MySQL)
// ==========================================
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Gbn341523@',
  database: 'db_locadora'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erro crítico de conexão no MySQL:', err.message);
    return;
  }
  console.log('✅ Banco de dados db_locadora conectado e sincronizado com sucesso!');
});

// ==========================================
// 🛡️ TIPAGENS E MIDDLEWARES DE SEGURANÇA
// ==========================================
interface TokenPayload {
  id: number;
  role: string;
}

// Extensão da interface Request do Express para suportar a sessão do piloto autenticado
interface AutenticadoRequest extends Request {
  usuarioLogado?: TokenPayload;
}

const verificarToken = (req: AutenticadoRequest, res: Response, next: NextFunction) => {
  const tokenHeader = req.headers['authorization'];
  if (!tokenHeader) {
    return res.status(401).json({ erro: 'Acesso negado. Token de autenticação ausente.' });
  }

  const token = tokenHeader.split(' ')[1] || tokenHeader;
  try {
    const verificado = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.usuarioLogado = verificado;
    next();
  } catch (err) {
    res.status(401).json({ erro: 'Sessão inválida ou expirada. Efetue login novamente.' });
  }
};

const verificarAdmin = (req: AutenticadoRequest, res: Response, next: NextFunction) => {
  if (req.usuarioLogado && req.usuarioLogado.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ erro: 'Acesso negado. Operação restrita a administradores do cockpit.' });
  }
};

// ==========================================
// 👤 ROTAS DE AUTENTICAÇÃO & USUÁRIOS
// ==========================================

// 📝 Cadastro de Usuários/Operadores
app.post('/usuarios', async (req: Request, res: Response) => {
  const { nome, email, senha } = req.body;
  
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Todos os campos operacionais são obrigatórios.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);
     
    const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
    db.query(sql, [nome, email, senhaHash], (err) => {
      if (err) {
        return res.status(400).json({ erro: 'Falha no registro. Este e-mail já está em uso.' });
      }
      res.status(201).json({ mensagem: 'Usuário homologado com sucesso!' });
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno ao processar hash de segurança.' });
  }
});

// 🔐 Login Corporativo (Autenticação com envio de perfil de acesso)
app.post('/login', (req: Request, res: Response) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios para autenticação.' });
  }
  
  const sql = 'SELECT * FROM usuarios WHERE email = ?';
  db.query(sql, [email], async (err, results: any) => {
    if (err) return res.status(500).json({ erro: 'Erro interno na comunicação com o banco.' });
    if (results.length === 0) return res.status(400).json({ erro: 'Credenciais inválidas ou inexistentes.' });

    const usuario = results[0];
    const senhaValira = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValira) return res.status(400).json({ erro: 'Senha incorreta.' });

    const token = jwt.sign(
      { id: usuario.id, role: usuario.role }, 
      JWT_SECRET, 
      { expiresIn: '2h' }
    );
    
    res.json({ 
      mensagem: 'Login realizado com sucesso! Painel liberado.', 
      token,
      role: usuario.role 
    });
  });
});

// ==========================================
// 🏍️ ROTAS DE MOTOS (FROTA E FICHA TÉCNICA)
// ==========================================

// Listar todas as motos da frota
app.get('/motos', (req: Request, res: Response) => {
  const sql = 'SELECT * FROM motos';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

// Cadastrar nova moto com especificações completas de telemetria
app.post('/motos', verificarToken, verificarAdmin, upload.single('imagem'), (req: AutenticadoRequest, res: Response) => {
  const { modelo, marca, preco_diaria, cc, cv, torque, tipo } = req.body;

  if (!modelo || !marca || !preco_diaria) {
    return res.status(400).json({ erro: 'Modelo, marca e valor da diária são campos obrigatórios.' });
  }

  const imagemPath = req.file ? `/uploads/${req.file.filename}` : null;
  const sql = 'INSERT INTO motos (modelo, marca, preco_diaria, disponivel, imagem, cc, cv, torque, tipo) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?)';
  
  db.query(sql, [modelo, marca, preco_diaria, imagemPath, cc, cv, torque, tipo], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(201).json({ mensagem: 'Nova máquina integrada ao hangar com sucesso!' });
  });
});

// Atualizar especificações ou imagem de uma moto existente
app.put('/motos/:id/editar', verificarToken, verificarAdmin, upload.single('imagem'), (req: AutenticadoRequest, res: Response) => {
  const { id } = req.params;
  const { modelo, marca, preco_diaria, cc, cv, torque, tipo } = req.body;

  let sql = `
    UPDATE motos 
    SET modelo = ?, marca = ?, preco_diaria = ?, cc = ?, cv = ?, torque = ?, tipo = ?
    WHERE id = ?
  `;
  let params = [modelo, marca, preco_diaria, cc, cv, torque, tipo, id];

  if (req.file) {
    sql = `
      UPDATE motos 
      SET modelo = ?, marca = ?, preco_diaria = ?, cc = ?, cv = ?, torque = ?, tipo = ?, imagem = ?
      WHERE id = ?
    `;
    params = [modelo, marca, preco_diaria, cc, cv, torque, tipo, `/uploads/${req.file.filename}`, id];
  }

  db.query(sql, params, (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ mensagem: 'Especificações da máquina atualizadas com sucesso! ⚡' });
  });
});

// ==========================================
// 📊 ROTAS ADMINISTRATIVAS (MÉTRICAS GLOBAL)
// ==========================================

// Buscar métricas de faturamento e status consolidados da locadora
app.get('/admin/dashboard', verificarToken, verificarAdmin, (req: Request, res: Response) => {
  const sqlStats = `
    SELECT 
      (SELECT COUNT(*) FROM motos) as total_motos,
      (SELECT COUNT(*) FROM reservas WHERE status = 'confirmada') as ativos,
      (SELECT IFNULL(SUM(valor_total), 0) FROM reservas) as faturamento_total
  `;
  
  db.query(sqlStats, (err, results: any) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results[0]);
  });
});

// Listar todos os contratos ativos no sistema global
app.get('/admin/alugueis-ativos', verificarToken, verificarAdmin, (req: Request, res: Response) => {
  const sql = `
    SELECT 
      r.id as reserva_id,
      u.nome as cliente_nome, 
      u.email as cliente_email, 
      m.marca, 
      m.modelo, 
      r.valor_total, 
      r.documento_condutor, 
      DATE_FORMAT(r.data_inicio, '%d/%m/%Y') as data_inicio, 
      DATE_FORMAT(r.data_fim, '%d/%m/%Y') as data_fim
    FROM reservas r
    JOIN motos m ON r.moto_id = m.id
    JOIN usuarios u ON r.usuario_id = u.id
    WHERE r.status = 'confirmada'
    ORDER BY r.id DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

// ==========================================
// 🔑 ROTAS DE OPERAÇÃO DE LOCAÇÃO (RESERVAS)
// ==========================================

// Efetuar reserva de veículo com trava de segurança por CPF ativo
app.put('/motos/:id/alugar', verificarToken, (req: AutenticadoRequest, res: Response) => {
  const { id } = req.params; 
  const { dias, valor_total, documento_condutor } = req.body; 
  const piloto = req.usuarioLogado; 

  if (!piloto || !piloto.id) return res.status(401).json({ erro: "Usuário não identificado ou sessão encerrada." });
  if (!documento_condutor) return res.status(400).json({ erro: "O CPF do condutor é estritamente obrigatório." });

  const sqlCheckCPF = "SELECT * FROM reservas WHERE documento_condutor = ? AND status = 'confirmada'";
  
  db.query(sqlCheckCPF, [documento_condutor], (errCheck, rows: any) => {
    if (errCheck) return res.status(500).json({ erro: errCheck.message });
    if (rows.length > 0) {
      return res.status(400).json({ erro: "Atenção: Este CPF já possui uma locação em andamento no sistema. Finalize a anterior primeiro." });
    }

    const sqlMoto = 'UPDATE motos SET disponivel = 0 WHERE id = ?';
    db.query(sqlMoto, [id], (err) => {
      if (err) return res.status(500).json({ erro: err.message });

      const sqlReserva = `
        INSERT INTO reservas (usuario_id, moto_id, data_inicio, data_fim, valor_total, documento_condutor, status) 
        VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, ?, 'confirmada')
      `;
      db.query(sqlReserva, [piloto.id, id, Number(dias), valor_total, documento_condutor], (errReserva) => {
        if (errReserva) return res.status(500).json({ erro: errReserva.message });
        res.json({ mensagem: 'Locação aprovada! Máquina liberada para pista! 🏁' });
      });
    });
  });
});

// Devolver veículo (Recolhimento para a garagem e encerramento de contrato)
app.put('/motos/:id/devolver', verificarToken, (req: AutenticadoRequest, res: Response) => {
  const { id } = req.params;
  const usuario_id = req.usuarioLogado?.id;

  const sqlMoto = 'UPDATE motos SET disponivel = 1 WHERE id = ?';
  db.query(sqlMoto, [id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });

    const sqlReserva = `
      UPDATE reservas 
      SET status = 'finalizada' 
      WHERE usuario_id = ? AND moto_id = ? AND status = 'confirmada'
    `;
    db.query(sqlReserva, [usuario_id, id], (errReserva) => {
      if (errReserva) return res.status(500).json({ erro: errReserva.message });
      res.json({ mensagem: 'Veículo recolhido para a garagem. Contrato encerrado! 🏁' });
    });
  });
});

// Buscar contratos em andamento do usuário logado
app.get('/meus-alugueis', verificarToken, (req: AutenticadoRequest, res: Response) => {
  const usuario_id = req.usuarioLogado?.id;
  const sql = `
    SELECT m.id, m.marca, m.modelo, m.preco_diaria, r.valor_total, r.documento_condutor
    FROM reservas r
    JOIN motos m ON r.moto_id = m.id
    WHERE r.usuario_id = ? AND r.status = 'confirmada'
  `;
  db.query(sql, [usuario_id], (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

// Buscar histórico de contratos concluídos do usuário logado
app.get('/historico-alugueis', verificarToken, (req: AutenticadoRequest, res: Response) => {
  const usuario_id = req.usuarioLogado?.id;
  const sql = `
    SELECT m.marca, m.modelo, r.valor_total, r.data_inicio, r.data_fim, r.documento_condutor
    FROM reservas r
    JOIN motos m ON r.moto_id = m.id
    WHERE r.usuario_id = ? AND r.status = 'finalizada'
  `;
  db.query(sql, [usuario_id], (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

// ==========================================
// 🚀 INICIALIZAÇÃO DO SERVIDOR
// ==========================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Balsante Motos rodando redondo na porta ${PORT}!`);
});