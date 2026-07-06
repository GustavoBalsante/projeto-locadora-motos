import React, { useState, useEffect } from 'react';
import type { Moto } from './types';
import { AdminPanel } from './components/AdminPanel';
import { ModalCheckout } from './components/ModalCheckout';

function App() {
  // 🏍️ Estados da Frota
  const [motos, setMotos] = useState<Moto[]>([]);
  const [motoSelecionada, setMotoSelecionada] = useState<Moto | null>(null);
  const [historicoFinalizado, setHistoricoFinalizado] = useState<any[]>([]);
  
  // 🧭 Estados de Navegação e Filtros Avançados
  const [view, setView] = useState<'catalogo' | 'login' | 'cadastro' | 'meus-alugueis' | 'admin'>('catalogo');
  const [busca, setBusca] = useState('');
  const [filtroMarca, setFiltroMarca] = useState('');
  const [filtroPrecoMax, setFiltroPrecoMax] = useState<number>(1500);
  const [filtrarDisponiveis, setFiltrarDisponiveis] = useState(false);
  const [carregando, setCarregando] = useState<boolean>(false);
  
  // 👤 Estados de Autenticação
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('token'));
  const [usuario, setUsuario] = useState<string | null>(sessionStorage.getItem('usuario'));
  const [historicoAlugueis, setHistoricoAlugueis] = useState<any[]>([]);
  
  // 📊 Estados do Painel Admin
  const [role, setRole] = useState<string | null>(sessionStorage.getItem('role'));
  const [metricas, setMetricas] = useState<{ total_motos: number; ativos: number; faturamento_total: number } | null>(null);
  const [alugueisAtivosGlobais, setAlugueisAtivosGlobais] = useState<any[]>([]);
  
  // 📝 Campos do Formulário Admin (Cadastro/Edição)
  const [novoModelo, setNovoModelo] = useState('');
  const [novaMarca, setNovaMarca] = useState('');
  const [novoPrecoDiaria, setNovoPrecoDiaria] = useState('');
  const [novoCc, setNovoCc] = useState('');
  const [novoCv, setNovoCv] = useState('');
  const [novoTorque, setNovoTorque] = useState('');
  const [novoTipo, setNovoTipo] = useState('');
  const [novaImagem, setNovaImagem] = useState<File | null>(null);
  const [motoEmEdicao, setMotoEmEdicao] = useState<Moto | null>(null);
  
  // 🔢 Estados do Aluguel
  const [diasAluguel, setDiasAluguel] = useState<number>(1);
  const [docCondutor, setDocCondutor] = useState<string>('');

  // 💳 Estados do Simulador de Pagamento
  const [etapaCheckout, setEtapaCheckout] = useState<'dados' | 'pagamento'>('dados');
  const [metodoPagamento, setMetodoPagamento] = useState<'pix' | 'cartao'>('pix');
  const [numCartao, setNumCartao] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [validadeCartao, setValidadeCartao] = useState('');
  const [cvvCartao, setCvvCartao] = useState('');

  // 🔔 Controle de Notificações
  const [notificacao, setNotificacao] = useState<{ messaging: string; tipo: 'sucesso' | 'erro' } | null>(null);

  // 🛰️ Efeito de Telemetria Simulada (Oscilação de RPM na marcha lenta)
  const [rpm, setRpm] = useState<number>(1100);
  useEffect(() => {
    const interval = setInterval(() => {
      setRpm(Math.floor(Math.random() * (1230 - 1070 + 1)) + 1070);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // 🛡️ Renderizador de Logos Reais com Fallback Inteligente
  const renderLogoMarca = (marca: string) => {
    const m = marca.toUpperCase();
    let logoPath = '';
    if (m.includes('BMW')) logoPath = '/logos/bmw.png';
    else if (m.includes('HONDA')) logoPath = '/logos/honda.png';
    else if (m.includes('YAMAHA')) logoPath = '/logos/yamaha.png';
    else if (m.includes('DUCATI')) logoPath = '/logos/ducati.png';
    else if (m.includes('HARLEY')) logoPath = '/logos/harley.png';
    else if (m.includes('SUZUKI')) logoPath = '/logos/suzuki.png';
    else if (m.includes('TRIUMPH')) logoPath = '/logos/triumph.png';

    if (logoPath) {
      return (
        <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', filter: 'brightness(0.9) contrast(1.1)' }}>
          <img src={logoPath} alt={`Logo ${marca}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </div>
      );
    }

    return (
      <div style={{ backgroundColor: '#0D0D0E', color: '#10B981', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold', border: '1px solid rgba(16, 185, 129, 0.3)', fontFamily: 'monospace' }}>
        {m.substring(0, 2)}
      </div>
    );
  };

  const dispararAviso = (mensagem: string, tipo: 'sucesso' | 'erro') => {
    setNotificacao({ messaging: mensagem, tipo });
    setTimeout(() => setNotificacao(null), 4000);
  };

  const formatarCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
  };

  const validarCPF = (cpf: string): boolean => {
    const limpo = cpf.replace(/\D/g, '');
    if (limpo.length !== 11 || /^(\d)\1{10}$/.test(limpo)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(limpo.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    let digito1 = resto === 10 || resto === 11 ? 0 : resto;
    if (digito1 !== parseInt(limpo.charAt(9))) return false;
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(limpo.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    let digito2 = resto === 10 || resto === 11 ? 0 : resto;
    return digito2 === parseInt(limpo.charAt(10));
  };

  const calcularDataDevolucao = (dias: number) => {
    const data = new Date();
    data.setDate(data.getDate() + dias);
    return data.toLocaleDateString('pt-BR');
  };

  const fecharModal = () => {
    setMotoSelecionada(null); setDocCondutor(''); setDiasAluguel(1);
    setEtapaCheckout('dados'); setMetodoPagamento('pix');
    setNumCartao(''); setNomeCartao(''); setValidadeCartao(''); setCvvCartao('');
  };

  const handleCopiarPix = () => {
    const chaveFicticia = "00020101021226830014br.gov.bcb.pix0136balsantemotos-checkout-simulado-prod2026-v4";
    navigator.clipboard.writeText(chaveFicticia);
    dispararAviso('Código Pix Copia e Cola copiado com sucesso! 📋', 'sucesso');
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setToken(null); setUsuario(null); setRole(null);
    setHistoricoAlugueis([]); setHistoricoFinalizado([]);
    setView('catalogo');
    dispararAviso('Sessão encerrada com segurança!', 'sucesso');
  };

  const verificarRespostaSegura = (res: Response) => {
    if (res.status === 401 || res.status === 403) {
      handleLogout();
      throw new Error('Sessão violada ou expirada. Efetuando logout tático...');
    }
    return res.json();
  };

  const buscarMotos = () => {
    fetch('http://localhost:3000/motos')
      .then((response) => response.json())
      .then((data) => setMotos(data))
      .catch((error) => console.error('Erro ao buscar motos:', error));
  };

  const buscarMeusAlugueis = () => {
    if (!token) return;
    fetch('http://localhost:3000/meus-alugueis', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(verificarRespostaSegura)
      .then(data => { if (Array.isArray(data)) setHistoricoAlugueis(data); })
      .catch(err => console.error(err));
  };

  const buscarHistoricoFinalizado = () => {
    if (!token) return;
    fetch('http://localhost:3000/historico-alugueis', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(verificarRespostaSegura)
      .then(data => { if (Array.isArray(data)) setHistoricoFinalizado(data); })
      .catch(err => console.error(err));
  };

  const buscarMetricas = () => {
    if (!token) return;
    fetch('http://localhost:3000/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(verificarRespostaSegura)
      .then(data => setMetricas(data))
      .catch(err => console.error('Erro ao buscar métricas:', err));
  };

  const buscarAlugueisAtivosGlobais = () => {
    if (!token) return;
    fetch('http://localhost:3000/admin/alugueis-ativos', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(verificarRespostaSegura)
      .then(data => { if (Array.isArray(data)) setAlugueisAtivosGlobais(data); })
      .catch(err => console.error('Erro ao buscar aluguéis globais:', err));
  };

  useEffect(() => {
    buscarMotos();
    buscarMeusAlugueis();
    buscarHistoricoFinalizado();
    if (role === 'ADMIN') {
      buscarMetricas();
      buscarAlugueisAtivosGlobais();
    }
  }, [token, role]);

  const getDetalhesMoto = (modelo: string) => {
    const mod = modelo.toLowerCase();
    if (mod.includes('s1000rr')) {
      return { img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800', cc: '999 cc', cv: '207 cv', torque: '11.5 kgfm', tipo: 'Superesportiva' };
    }
    if (mod.includes('africa') || mod.includes('twin')) {
      return { img: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=800', cc: '1.084 cc', cv: '102 cv', torque: '10.7 kgfm', tipo: 'Big Trail / Adventure' };
    }
    if (mod.includes('gs') && mod.includes('1200')) {
      return { img: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800', cc: '1.170 cc', cv: '125 cv', torque: '12.7 kgfm', tipo: 'Maxi Trail' };
    }
    if (mod.includes('iron') || mod.includes('883')) {
      return { img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800', cc: '883 cc', cv: '52 cv', torque: '6.9 kgfm', tipo: 'Custom / Cruiser' };
    }
    if (mod.includes('diavel')) {
      return { img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800', cc: '1.158 cc', cv: '168 cv', torque: '12.8 kgfm', tipo: 'Custom / Street' };
    }
    if (mod.includes('panigale')) {
      return { img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800', cc: '1.103 cc', cv: '215 cv', torque: '12.6 kgfm', tipo: 'Superesportiva' };
    }
    if (mod.includes('tiger')) {
      return { img: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800', cc: '1.160 cc', cv: '150 cv', torque: '13.2 kgfm', tipo: 'Big Trail / Adventure' };
    }
    if (mod.includes('hayabusa')) {
      return { img: 'https://images.unsplash.com/photo-1615887023516-9b6bcd559e87?w=800', cc: '1.340 cc', cv: '190 cv', torque: '15.3 kgfm', tipo: 'Sport Touring / Lenda' };
    }
    if (mod.includes('mt-09') || mod.includes('mt09')) {
      return { img: 'https://images.unsplash.com/photo-1471444149959-1ec85c189b8e?w=800', cc: '890 cc', cv: '119 cv', torque: '9.5 kgfm', tipo: 'Naked / Hyper Naked' };
    }
    if (mod.includes('fat boy') || mod.includes('fatboy')) {
      return { img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', cc: '1.868 cc', cv: '94 cv', torque: '16.1 kgfm', tipo: 'Custom / Cruiser' };
    }
    if (mod.includes('hornet')) {
      return { img: 'https://images.unsplash.com/photo-1558981858-a5580a6c2386?w=800', cc: '599 cc', cv: '102 cv', torque: '6.53 kgfm', tipo: 'Naked / Esportiva' };
    }
    if (mod.includes('xj6')) {
      return { img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', cc: '600 cc', cv: '77.5 cv', torque: '6.1 kgfm', tipo: 'Naked / Urbana' };
    }
    return { img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', cc: '650 cc', cv: '75 cv', torque: '6.5 kgfm', tipo: 'Custom / Street' };
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    })
    .then(res => {
      if (!res.ok) throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
      return res.json();
    })
    .then(data => {
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('role', data.role);
      const nick = email.split('@')[0];
      sessionStorage.setItem('usuario', nick);
    
      setToken(data.token); setRole(data.role); setUsuario(nick); setView('catalogo');
      setEmail(''); setSenha('');
      dispararAviso(`Bem-vindo de volta, ${nick}! 🏍️`, 'sucesso');
    })
    .catch(err => dispararAviso(err.message, 'erro'));
  };

  const handleCadastro = (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmarSenha) {
      dispararAviso('As senhas não coincidem!', 'erro');
      return;
    }
    fetch('http://localhost:3000/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha })
    })
    .then(res => {
      if (!res.ok) throw new Error('Erro ao cadastrar. E-mail já pode estar em uso.');
      return res.json();
    })
    .then(() => {
      dispararAviso('Conta criada com sucesso! Faça seu login. 🏁', 'sucesso');
      setView('login'); setNome(''); setSenha(''); setConfirmarSenha('');
    })
    .catch(err => dispararAviso(err.message, 'erro'));
  };

  const handleAvancarParaPagamento = () => {
    if (!token) {
      dispararAviso('Você precisa entrar na sua conta para alugar!', 'erro');
      setView('login'); fecharModal();
      return;
    }
    if (!docCondutor || !docCondutor.trim()) {
      dispararAviso('Por favor, informe o CPF do condutor!', 'erro');
      return;
    }
    if (!validarCPF(docCondutor)) {
      dispararAviso('O CPF informado é inválido! Digite um CPF correto.', 'erro');
      return;
    }
    setEtapaCheckout('pagamento');
  };

  const handleFinalizarLocacaoComPagamento = (moto: Moto) => {
    if (metodoPagamento === 'cartao' && (!numCartao || !numCartao.trim() || !nomeCartao || !validadeCartao || !cvvCartao)) {
      dispararAviso('Preencha todas as credenciais do cartão de crédito simulado!', 'erro');
      return;
    }

    setCarregando(true);
    const precoTotal = Number(moto.preco_diaria) * diasAluguel;

    fetch(`http://localhost:3000/motos/${moto.id}/alugar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ dias: diasAluguel, valor_total: precoTotal, documento_condutor: docCondutor })
    })
    .then(verificarRespostaSegura)
    .then(data => {
      if (data.erro) {
        dispararAviso(data.erro, 'erro');
      } else {
        dispararAviso('Transação aprovada! Máquina liberada para pista! 🏁', 'sucesso');
        fecharModal(); buscarMotos(); buscarMeusAlugueis(); buscarHistoricoFinalizado();
      }
    })
    .catch(() => dispararAviso('Erro ao liquidar pagamento no servidor.', 'erro'))
    .finally(() => setCarregando(false));
  };

  const handleDevolver = (idMoto: number) => {
    fetch(`http://localhost:3000/motos/${idMoto}/devolver`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    .then(async res => {
      if (res.status === 401 || res.status === 403) { handleLogout(); return; }
      if (res.ok) {
        dispararAviso('Moto recolhida com sucesso para a garagem! 🏁', 'sucesso');
        buscarMotos(); buscarMeusAlugueis(); buscarHistoricoFinalizado();
      } else {
        const data = await res.json().catch(() => ({}));
        dispararAviso(data.erro || 'Erro ao processar a devolução.', 'erro');
      }
    })
    .catch(() => dispararAviso('Erro ao conectar com o servidor para devolver.', 'erro'));
  };

  const handleCadastrarMoto = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('modelo', novoModelo);
    formData.append('marca', novaMarca);
    formData.append('preco_diaria', novoPrecoDiaria);
    formData.append('cc', novoCc);
    formData.append('cv', novoCv);
    formData.append('torque', novoTorque);
    formData.append('tipo', novoTipo);
    if (novaImagem) formData.append('imagem', novaImagem);

    const url = motoEmEdicao ? `http://localhost:3000/motos/${motoEmEdicao.id}/editar` : 'http://localhost:3000/motos';
    const metodo = motoEmEdicao ? 'PUT' : 'POST';

    fetch(url, {
      method: metodo,
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
    .then(verificarRespostaSegura)
    .then(data => {
      if (data.erro) {
        dispararAviso(data.erro, 'erro');
      } else {
        dispararAviso(motoEmEdicao ? 'Máquina atualizada com sucesso! ⚡' : 'Nova máquina integrada! 🏍️', 'sucesso');
        setNovoModelo(''); setNovaMarca(''); setNovoPrecoDiaria(''); setNovoCc(''); setNovoCv(''); setNovoTorque(''); setNovoTipo('');
        setNovaImagem(null); setMotoEmEdicao(null);
        const fileInput = document.getElementById('input-foto') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        buscarMotos(); buscarMetricas(); buscarAlugueisAtivosGlobais();
      }
    })
    .catch(() => dispararAviso('Erro ao conectar com o servidor.', 'erro'));
  };

  const activarModoEdicao = (moto: Moto) => {
    setMotoEmEdicao(moto); setNovoModelo(moto.modelo); setNovaMarca(moto.marca);
    setNovoPrecoDiaria(moto.preco_diaria.toString()); setNovoCc(moto.cc || '');
    setNovoCv(moto.cv || ''); setNovoTorque(moto.torque || ''); setNovoTipo(moto.tipo || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const marcasDisponiveisNoBanco = Array.from(new Set(motos.map(m => m.marca.toUpperCase())));

  const motosFiltradas = motos.filter(moto => {
    const bateTexto = moto.modelo.toLowerCase().includes(busca.toLowerCase()) || moto.marca.toLowerCase().includes(busca.toLowerCase());
    const bateMarca = filtroMarca === '' || moto.marca.toUpperCase() === filtroMarca.toUpperCase();
    const batePreco = Number(moto.preco_diaria) <= filtroPrecoMax;
    const bateDisponivel = filtrarDisponiveis ? moto.disponivel === 1 : true;
    return bateTexto && bateMarca && batePreco && bateDisponivel;
  });

  return (
    <div style={{ backgroundColor: '#0D0D0E', color: '#FFFFFF', minHeight: '100vh', fontFamily: '"Inter", sans-serif', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      {/* 🚀 ENGINE DE ANIMAÇÃO INTEGRADA: TODOS OS EFEITOS ATIVOS */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* 1. WARP LINES EFFECT (Rastro de partículas/velocidade no Hero) */
        @keyframes warpVelocity {
          0% { background-position: 0px 0px; }
          100% { background-position: -400px 400px; }
        }
        .warp-speed-bg {
          background-image: linear-gradient(45deg, rgba(16, 185, 129, 0.04) 25%, transparent 25%, transparent 50%, rgba(16, 185, 129, 0.04) 50%, rgba(16, 185, 129, 0.04) 75%, transparent 75%, transparent);
          background-size: 40px 40px;
          animation: warpVelocity 8s linear infinite;
        }

        /* 2. LASER TELEMETRY SWEEP (Linha laser escaneando o painel) */
        @keyframes laserScanner {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
        .laser-scanner-line {
          position: absolute; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #10B981, transparent);
          box-shadow: 0 0 12px #10B981, 0 0 4px #10B981;
          animation: laserScanner 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          pointer-events: none;
        }

        /* 3. NEON BREATHING EFFECT (Pulsar de brilho orgânico) */
        @keyframes neonBreath {
          0%, 100% { text-shadow: 0 0 4px rgba(16, 185, 129, 0.4); filter: brightness(1); }
          50% { text-shadow: 0 0 20px #10B981, 0 0 30px rgba(16, 185, 129, 0.6); filter: brightness(1.2); }
        }
        .neon-pulse-text {
          animation: neonBreath 3s ease-in-out infinite;
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 4px rgba(16,185,129,0.3); }
          50% { box-shadow: 0 0 16px rgba(16,185,129,0.7); border-color: #10B981; }
        }
        .neon-pulse-badge {
          animation: badgePulse 2s ease-in-out infinite;
        }

        /* 4. PLASMA BORDER OVERRIDE (Facho laser correndo as bordas) */
        @keyframes plasmaMovement {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .plasma-border-container {
          position: relative; border-radius: 24px; padding: 1px;
          background: linear-gradient(90deg, rgba(16,185,129,0.1), #10B981, rgba(16,185,129,0.1), #10B981);
          background-size: 300% 300%;
          animation: plasmaMovement 6s ease infinite;
        }

        /* 5. CYBER IGNITION GLITCH EFFECT (Distorção rápida eletrônica no hover) */
        @keyframes cyberGlitch {
          0% { transform: translate(0); text-shadow: none; }
          20% { transform: translate(-2px, 2px); text-shadow: -2px 0 #10B981, 2px 0 #f43f5e; }
          40% { transform: translate(-2px, -2px); text-shadow: 2px 0 #10B981, -2px 0 #f43f5e; }
          60% { transform: translate(2px, 2px); text-shadow: -1px 0 #10B981, 1px 0 #f43f5e; }
          80% { transform: translate(2px, -2px); text-shadow: 2px 0 #10B981, -2px 0 #f43f5e; }
          100% { transform: translate(0); text-shadow: none; }
        }
        .cyber-glitch-hover:hover {
          animation: cyberGlitch 0.3s linear infinite;
          color: #ffffff !important;
        }

        .anim-card {
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .glow-effect { 
          position: relative; z-index: 1; 
          border: 1px solid rgba(255,255,255,0.03) !important; 
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
          background-color: #1A1A1C !important;
        }
        .glow-effect::after {
          content: ''; position: absolute; inset: 0; border-radius: 16px;
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.15); opacity: 0;
          transition: opacity 0.4s ease; pointer-events: none; z-index: -1;
        }
        .glow-effect:hover {
          border-color: #10B981 !important;
          transform: translateY(-6px);
        }
        .glow-effect:hover::after { opacity: 1; }

        .tactical-select {
          background-color: #0D0D0E; color: #ffffff; border: 1px solid rgba(255,255,255,0.08);
          padding: 12px 16px; border-radius: 8px; fontSize: 14px; outline: none; cursor: pointer; transition: 0.2s;
        }
        .tactical-select:focus { border-color: #10B981; box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }
      `}</style>

      {/* 🧭 NAV CARBON COCKPIT (Com Efeito 5: Glitch no Logo) */}
      <nav style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '20px 50px', backgroundColor: 'rgba(13, 13, 14, 0.94)', 
        backdropFilter: 'blur(20px)', borderBottom: '1px solid #10B981', 
        position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 4px 30px rgba(0,0,0,0.5)'
      }}>
        <div className="cyber-glitch-hover" style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: '0.2s' }} onClick={() => setView('catalogo')}>
          <svg width="38" height="38" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))' }}>
            <path d="M15 25L50 45L85 25L50 85L15 25Z" stroke="#10B981" strokeWidth="7" strokeLinejoin="round"/>
            <path d="M30 35L50 47L70 35L50 68L30 35Z" fill="#10B981"/>
            <circle cx="50" cy="47" r="4" fill="#ffffff" />
          </svg>
          <h1 style={{ fontSize: '21px', margin: 0, fontWeight: 900, letterSpacing: '3px', color: '#ffffff', textTransform: 'uppercase', fontFamily: '"Impact", sans-serif' }}>
            BALSANTE <span style={{ color: '#10B981', fontWeight: 300, fontFamily: '"Inter", sans-serif' }}>MOTOS</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '35px', alignItems: 'center' }}>
          <span style={{ cursor: 'pointer', color: view === 'catalogo' ? '#10B981' : '#A1A1AA', fontWeight: '700', fontSize: '13px', letterSpacing: '1px', transition: '0.2s' }} onClick={() => setView('catalogo')}>CATÁLOGO</span>
          {token && <span style={{ cursor: 'pointer', color: view === 'meus-alugueis' ? '#10B981' : '#A1A1AA', fontWeight: '700', fontSize: '13px', letterSpacing: '1px', transition: '0.2s' }} onClick={() => setView('meus-alugueis')}>MEUS ALUGUÉIS <span style={{ fontSize: '10px', backgroundColor: '#10B981', padding: '2px 7px', borderRadius: '4px', color: '#000000', fontWeight: 'bold', marginLeft: '6px' }}>{historicoAlugueis.length}</span></span>}
          
          {token && role === 'ADMIN' && (
            <span style={{ cursor: 'pointer', color: '#ffffff', background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, transparent 100%)', padding: '9px 20px', borderRadius: '4px', border: '1px solid #10B981', fontWeight: 'bold', fontSize: '12px', letterSpacing: '0.8px', transition: '0.2s' }} onClick={() => { buscarMetricas(); buscarAlugueisAtivosGlobais(); setView('admin'); }}>🛡️ PAINEL ADMIN</span>
          )}
          
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '24px' }}>
            {usuario ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <span style={{ fontSize: '14px', color: '#E4E4E7' }}>Piloto: <strong style={{ color: '#10B981', fontWeight: '700' }}>{usuario}</strong></span>
                <button onClick={handleLogout} style={{ backgroundColor: 'rgba(244, 63, 94, 0.05)', color: '#fda4af', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Sair</button>
              </div>
            ) : <button onClick={() => setView('login')} className="cyber-glitch-hover" style={{ backgroundColor: '#10B981', color: '#000000', border: 'none', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', letterSpacing: '0.8px', boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)' }}>ENTRAR</button>}
          </div>
        </div>
      </nav>

      {/* PAINEL CENTRAL CONTEÚDO */}
      <main style={{ padding: '40px 50px', maxWidth: '1400px', margin: '0 auto', flex: 1, width: '100%', boxSizing: 'border-box' }}>
        
        {/* VISTA DO CATÁLOGO CARBON COCKPIT */}
        {view === 'catalogo' && (
          <>
            {/* HERO COCKPIT (Modificado com Efeito 4: Plasma Border Container) */}
            <div className="plasma-border-container" style={{ marginBottom: '40px' }}>
              
              {/* Container interno (Recebe Efeito 1: Warp Background e Efeito 2: Laser Scanner) */}
              <div className="warp-speed-bg" style={{ 
                position: 'relative', padding: '65px 40px', 
                backgroundColor: '#1A1A1C', borderRadius: '23px', 
                overflow: 'hidden', textAlign: 'center',
                boxShadow: 'inset 0 0 80px rgba(0,0,0,0.8)'
              }}>
                
                {/* Efeito 2: Linha Laser ativa cortando verticalmente */}
                <div className="laser-scanner-line" />

                {/* HUD / TELEMETRIA EM TEMPO REAL */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '25px', opacity: 0.95, position: 'relative', zIndex: 2 }}>
                  <div style={{ backgroundColor: '#0D0D0E', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '6px 16px', fontSize: '12px', fontFamily: 'monospace' }}>
                    <span style={{ color: '#A1A1AA' }}>ENGINE:</span> <span style={{ color: '#10B981', fontWeight: 'bold' }}>READY TO LAUNCH</span>
                  </div>
                  <div style={{ backgroundColor: '#0D0D0E', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '6px 16px', fontSize: '12px', fontFamily: 'monospace' }}>
                    <span style={{ color: '#A1A1AA' }}>TCS:</span> <span style={{ color: '#ffffff' }}>SPORT MAP</span>
                  </div>
                  {/* Badge RPM com Efeito 3: Neon Breath */}
                  <div className="neon-pulse-badge" style={{ backgroundColor: '#0D0D0E', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '6px 16px', fontSize: '12px', fontFamily: 'monospace', minWidth: '105px', transition: 'all 0.2s' }}>
                    <span style={{ color: '#A1A1AA' }}>RPM:</span> <span style={{ color: '#10B981', fontWeight: 'bold' }}>{rpm}</span>
                  </div>
                </div>

                <div style={{ width: '200px', height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '0 auto 30px', borderRadius: '10px', overflow: 'hidden', position: 'relative', zIndex: 2 }}>
                  <div style={{ height: '100%', animation: 'greenDashboardSweep 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards' }} />
                </div>

                {/* Título com Efeito 3: Pulsar de Brilho Neon */}
                <h2 style={{ color: '#ffffff', fontSize: '40px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '14px', textTransform: 'uppercase', fontFamily: '"Impact", sans-serif', position: 'relative', zIndex: 2 }}>
                  A Máquina Muda. <span className="neon-pulse-text" style={{ color: '#10B981' }}>A Alma do Piloto</span> Continua a Mesma.
                </h2>
              </div>
            </div>

            {/* 🎛️ CENTRAL DE FILTROS AVANÇADOS COMBINADOS */}
            <div style={{ backgroundColor: '#1A1A1C', padding: '24px 30px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.12)', marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 15px 40px rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>🛠️ Módulo de Busca e Telemetria de Frota</span>
                <span style={{ fontSize: '12px', color: '#A1A1AA', fontFamily: 'monospace' }}>{motosFiltradas.length} máquinas encontradas</span>
              </div>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                
                {/* Filtro 1 */}
                <div style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: 'bold', textTransform: 'uppercase' }}>Pesquisa Direta</label>
                  <input 
                    type="text" 
                    placeholder="Buscar por modelo ou montadora (Ex: RR, Hornet, XJ6)..." 
                    value={busca} 
                    onChange={e => setBusca(e.target.value)} 
                    style={{ padding: '12px 18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', backgroundColor: '#0D0D0E', color: '#ffffff', fontSize: '14px', outline: 'none', transition: '0.2s' }} 
                  />
                </div>

                {/* Filtro 2 */}
                <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: 'bold', textTransform: 'uppercase' }}>Montadora</label>
                  <select 
                    value={filtroMarca} 
                    onChange={e => setFiltroMarca(e.target.value)}
                    className="tactical-select"
                    style={{ width: '100%' }}
                  >
                    <option value="">TODAS AS MARCAS</option>
                    {marcasDisponiveisNoBanco.map((marca: string, i: number) => (
                      <option key={i} value={marca}>{marca}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro 3 */}
                <div style={{ flex: '2 1 240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: 'bold', textTransform: 'uppercase' }}>Teto do Orçamento</label>
                    <span style={{ color: '#10B981', fontSize: '13px', fontWeight: '900', fontFamily: 'monospace' }}>Até R$ {filtroPrecoMax.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', height: '44px' }}>
                    <input 
                      type="range" 
                      min="350" 
                      max="1500" 
                      step="50"
                      value={filtroPrecoMax} 
                      onChange={e => setFiltroPrecoMax(Number(e.target.value))} 
                      style={{ flex: 1, accentColor: '#10B981', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                {/* Filtro 4 */}
                <div style={{ flex: '1 1 auto' }}>
                  <button 
                    onClick={() => setFiltrarDisponiveis(!filtrarDisponiveis)} 
                    style={{ width: '100%', height: '46px', padding: '0 20px', backgroundColor: filtrarDisponiveis ? '#10B981' : '#0D0D0E', color: filtrarDisponiveis ? '#000000' : '#ffffff', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', letterSpacing: '0.5px', textTransform: 'uppercase', transition: '0.2s', border: filtrarDisponiveis ? 'none' : '1px solid rgba(255,255,255,0.06)' }}
                  >
                    {filtrarDisponiveis ? '🏆 SÓ DISPONÍVEIS' : '🔄 TODOS OS STATUS'}
                  </button>
                </div>

              </div>
            </div>

            {/* GRID DE CARDS STEALTH */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '35px' }}>
              {motosFiltradas.map((moto, index) => {
                const detalhes = getDetalhesMoto(moto.modelo);
                const urlImagemFinal = moto.imagem ? `http://localhost:3000${moto.imagem}` : detalhes.img;
                return (
                  <div 
                    key={moto.id} 
                    className="anim-card glow-effect"
                    style={{ 
                      borderRadius: '16px', overflow: 'hidden', 
                      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      animationDelay: `${index * 0.05}s`
                    }} 
                  >
                    <div>
                      <div style={{ height: '220px', backgroundImage: `url(${urlImagemFinal})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #1A1A1C 0%, rgba(0,0,0,0) 50%)' }} />
                        <span style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: moto.disponivel ? '#10B981' : 'rgba(239, 68, 68, 0.9)', color: moto.disponivel ? '#000000' : '#ffffff', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {moto.disponivel ? 'DISPONÍVEL' : 'EM PISTA'}
                        </span>
                      </div>
                      
                      <div style={{ padding: '18px 26px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          {renderLogoMarca(moto.marca)}
                          <span style={{ color: '#10B981', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            {moto.marca}
                          </span>
                        </div>

                        <h3 style={{ margin: '4px 0 16px', fontSize: '23px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>{moto.modelo}</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ backgroundColor: '#0D0D0E', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', color: '#E4E4E7', fontWeight: '600', border: '1px solid rgba(16, 185, 129, 0.12)' }}>{moto.cc || detalhes.cc}</span>
                          <span style={{ backgroundColor: '#0D0D0E', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', color: '#E4E4E7', fontWeight: '600', border: '1px solid rgba(16, 185, 129, 0.12)' }}>{moto.tipo || detalhes.tipo}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '0 26px 26px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '18px' }}>
                        <div>
                          <span style={{ color: '#A1A1AA', fontSize: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TARIFA</span>
                          <h4 style={{ margin: 0, fontSize: '24px', color: '#ffffff', fontWeight: '900', fontFamily: 'monospace' }}>R$ {Number(moto.preco_diaria).toFixed(2)}<span style={{ fontSize: '12px', color: '#A1A1AA', fontWeight: '400' }}>/dia</span></h4>
                        </div>
                        {/* Botão de Ação com Efeito 5: Cyber Glitch no hover */}
                        <button onClick={() => setMotoSelecionada(moto)} className="cyber-glitch-hover" style={{ backgroundColor: '#10B981', color: '#000000', border: 'none', padding: '12px 22px', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '13px', letterSpacing: '0.5px', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)', transition: '0.15s' }}>RESERVAR</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* VISTA DOS MEUS ALUGUÉIS */}
        {view === 'meus-alugueis' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', animation: 'fadeUp 0.5s ease both' }}>
            <div>
              <h2 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '900', borderBottom: '1px solid #10B981', paddingBottom: '16px', marginBottom: '30px', letterSpacing: '-0.5px' }}>Minhas Reservas Ativas</h2>
              {historicoAlugueis.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#1A1A1C', borderRadius: '16px', border: '1px dashed rgba(16, 185, 129, 0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                  <p style={{ color: '#A1A1AA', fontSize: '16px' }}>Nenhuma máquina sob seu comando nas ruas atualmente.</p>
                  <button onClick={() => setView('catalogo')} style={{ marginTop: '20px', backgroundColor: '#10B981', color: '#000000', border: 'none', padding: '12px 26px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Explorar Catálogo</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '25px' }}>
                  {historicoAlugueis.map((reserva, index) => (
                    <div key={index} style={{ backgroundColor: '#1A1A1C', padding: '25px', borderRadius: '14px', border: '1px solid #10B981', boxShadow: '0 4px 25px rgba(16, 185, 129, 0.15)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, color: '#ffffff', fontSize: '21px', fontWeight: '800' }}>{reserva.marca} {reserva.modelo}</h3>
                        <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '5px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CONTRATO ATIVO</span>
                      </div>
                      <div style={{ marginBottom: '22px', color: '#E4E4E7', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#0D0D0E', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.02)' }}>
                        <span><strong>Código do Veículo:</strong> #{reserva.id}</span>
                        <span><strong>CPF do Condutor:</strong> {reserva.documento_condutor}</span>
                        <span><strong>Total Liquidado:</strong> <strong style={{ color: '#10B981', fontFamily: 'monospace' }}>R$ {Number(reserva.valor_total).toFixed(2)}</strong></span>
                      </div>
                      <button onClick={() => handleDevolver(reserva.id)} style={{ width: '100%', padding: '13px', backgroundColor: 'transparent', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>Encerrar Locação & Devolver</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', marginBottom: '20px', borderLeft: '4px solid #10B981', paddingLeft: '14px', letterSpacing: '-0.3px' }}>Histórico de Viagens Concluídas</h3>
              {historicoFinalizado.length === 0 ? <p style={{ color: '#A1A1AA', fontStyle: 'italic' }}>Nenhuma viagem concluída gravada no painel.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {historicoFinalizado.map((h, i) => (
                    <div key={i} style={{ backgroundColor: '#1A1A1C', padding: '20px 26px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.75 }}>
                      <div><h5 style={{ margin: 0, fontSize: '17px', color: '#ffffff', fontWeight: '700' }}>{h.marca} {h.modelo}</h5><span style={{ fontSize: '12px', color: '#A1A1AA' }}>Condutor Autenticado: {h.documento_condutor}</span></div>
                      <div style={{ textAlign: 'right' }}><span style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: '600', textTransform: 'uppercase' }}>Faturado</span><strong style={{ color: '#10B981', fontSize: '17px', fontFamily: 'monospace' }}>R$ {Number(h.valor_total).toFixed(2)}</strong></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )} 

        {/* PAINEL DO ADMINISTRADOR */}
        {view === 'admin' && (
          <div style={{ animation: 'fadeUp 0.5s ease both' }}>
            <AdminPanel 
              metricas={metricas} alugueisAtivosGlobais={alugueisAtivosGlobais} motos={motos} motoEmEdicao={motoEmEdicao} setMotoEmEdicao={setMotoEmEdicao}
              novaMarca={novaMarca} setNovaMarca={setNovaMarca} novoModelo={novoModelo} setNovoModelo={setNovoModelo} novoPrecoDiaria={novoPrecoDiaria} setNovoPrecoDiaria={setNovoPrecoDiaria}
              novoTipo={novoTipo} setNovoTipo={setNovoTipo} novoCc={novoCc} setNovoCc={setNovoCc} novoCv={novoCv} setNovoCv={setNovoCv} novoTorque={novoTorque} setNovoTorque={setNovoTorque}
              setNovaImagem={setNovaImagem} handleCadastrarMoto={handleCadastrarMoto} activarModoEdicao={activarModoEdicao}
            />
          </div>
        )}

        {/* LOGIN / CADASTRO STEALTH FORM */}
        {(view === 'login' || view === 'cadastro') && (
          <div style={{ maxWidth: '420px', margin: '60px auto', backgroundColor: '#1A1A1C', padding: '45px', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.2)', boxShadow: '0 25px 50px rgba(0,0,0,0.6)', animation: 'fadeUp 0.5s ease both' }}>
            <h2 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '35px', fontSize: '26px', fontWeight: '900', letterSpacing: '-0.8px' }}>{view === 'login' ? 'Acessar Cockpit' : 'Criar Credenciais'}</h2>
            <form onSubmit={view === 'login' ? handleLogin : handleCadastro} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {view === 'cadastro' && <input required type="text" placeholder="Nome Completo" value={nome} onChange={e => setNome(e.target.value)} style={{ padding: '15px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#0D0D0E', color: '#ffffff', fontSize: '15px', outline: 'none' }} />}
              <input required type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '15px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#0D0D0E', color: '#ffffff', fontSize: '15px', outline: 'none' }} />
              <input required type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} style={{ padding: '15px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#0D0D0E', color: '#ffffff', fontSize: '15px', outline: 'none' }} />
              {view === 'cadastro' && <input required type="password" placeholder="Confirmar Senha" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} style={{ padding: '15px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#0D0D0E', color: '#ffffff', fontSize: '15px', outline: 'none' }} />}
              <button type="submit" className="cyber-glitch-hover" style={{ padding: '15px', backgroundColor: '#10B981', color: '#000000', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '12px', letterSpacing: '0.5px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)', transition: '0.2s' }}>{view === 'login' ? 'AUTENTICAR' : 'REGISTRAR OPERADOR'}</button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '30px', color: '#A1A1AA', fontSize: '14px' }}>
              {view === 'login' ? <p>Não possui chaves de acesso? <span style={{ color: '#10B981', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setView('cadastro')}>Cadastre-se</span></p> : <p>Já possui cadastro homologado? <span style={{ color: '#10B981', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setView('login')}>Efetuar Login</span></p>}
            </div>
          </div>
        )}

      </main>

      {/* ==================== 🛠️ FOOTER INSTITUCIONAL STEALTH BLACK ==================== */}
      <footer style={{ backgroundColor: '#09090A', borderTop: '1px solid #10B981', padding: '60px 80px 30px', width: '100%', boxSizing: 'border-box', marginTop: 'auto', boxShadow: '0 -10px 40px rgba(0,0,0,0.5)' }}>
        
        {/* Top Row */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: '45px', borderBottom: '1px solid rgba(255,255,255,0.02)', marginBottom: '45px' }}>
          <h4 style={{ color: '#ffffff', fontSize: '25px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', fontFamily: '"Impact", sans-serif', margin: '0 0 6px' }}>
            ENTRE NO MODO PERFORMANCE
          </h4>
          <p style={{ color: '#A1A1AA', fontSize: '14px', margin: '0 0 25px', maxWidth: '400px', lineHeight: '1.5' }}>
            Receba novidades exclusivas de pista, atualizações de telemetria da frota e lançamentos.
          </p>
          <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '500px' }}>
            <input type="email" placeholder="Seu e-mail operacional..." style={{ flex: 1, padding: '14px 18px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#0D0D0E', color: '#ffffff', fontSize: '14px', outline: 'none' }} />
            <button onClick={() => dispararAviso('Inscrição homologada com sucesso! 🏁', 'sucesso')} style={{ backgroundColor: '#10B981', color: '#000000', border: 'none', padding: '0 30px', borderRadius: '4px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', textTransform: 'uppercase', transition: '0.2s' }}>Cadastrar</button>
          </div>
        </div>

        {/* Middle Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '50px', marginBottom: '45px', textAlign: 'left' }}>
          <div>
            <h5 style={{ color: '#ffffff', fontSize: '13px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '20px' }}>NOSSA ESSÊNCIA</h5>
            <p style={{ color: '#A1A1AA', fontSize: '14px', lineHeight: '1.6', margin: 0, maxWidth: '550px' }}>
              Nascemos da busca cega pela tangência perfeita das curvas, do cheiro de pneu aquecido e do estalar metálico dos blocos de motor resfriando na garagem. Da fúria milimetricamente calculada de uma <strong>S1000RR</strong> à soberania imbatível de gigantes como a <strong>GS 1200</strong> ou a <strong>Africa Twin</strong>, a Balsante Motos entrega mais que locações de alta performance: nós libertamos a verdadeira alma do motociclismo de pista.
            </p>
          </div>

          <div>
            <h5 style={{ color: '#ffffff', fontSize: '13px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '20px' }}>INFORMAÇÕES</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '14px' }}>
              <li><span style={{ color: '#A1A1AA', cursor: 'pointer', transition: '0.2s' }} onClick={() => setView('catalogo')}>Hangar de Máquinas</span></li>
              <li><span style={{ color: '#A1A1AA', cursor: 'pointer' }} onClick={() => dispararAviso('Diretrizes operacionais e termos de pista v2026.1', 'sucesso')}>Termos e Contratos</span></li>
              <li><span style={{ color: '#A1A1AA', cursor: 'pointer' }} onClick={() => dispararAviso('Suporte de Pista e Acionamento Imediato de Garagem', 'sucesso')}>Suporte de Garagem</span></li>
              <li><span style={{ color: '#A1A1AA', cursor: 'pointer' }} onClick={() => dispararAviso('Políticas de Privacidade e Criptografia SSL homologadas', 'sucesso')}>Segurança de Dados</span></li>
            </ul>
          </div>

          <div>
            <h5 style={{ color: '#ffffff', fontSize: '13px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '20px' }}>SITE SEGURO</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0D0D0E', padding: '10px 14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize: '16px' }}>🛡️</span>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#A1A1AA' }}>
                  <strong style={{ color: '#ffffff', display: 'block' }}>GOOGLE SAFE SECURE</strong>
                  Verificação Homologada Active
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0D0D0E', padding: '10px 14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize: '16px' }}>📡</span>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#A1A1AA' }}>
                  <strong style={{ color: '#10B981', display: 'block' }}>TELEMETRIA INTEGRADA</strong>
                  Marcha Lenta: {rpm} RPM
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.02)', paddingTop: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', fontSize: '12px', color: '#71717a' }}>
          <div>
            Balsante Motos ® {new Date().getFullYear()} - Todos os direitos reservados de pista.
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#0D0D0E', padding: '4px 14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)' }}>
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#71717a', marginRight: '4px', letterSpacing: '0.5px' }}>LIQUIDAÇÃO:</span>
            <span style={{ backgroundColor: '#1A1A1C', color: '#10B981', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', fontFamily: 'monospace' }}>PIX</span>
            <span style={{ backgroundColor: '#1A1A1C', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>VISA</span>
            <span style={{ backgroundColor: '#1A1A1C', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>MASTER</span>
          </div>

          <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#52525b' }}>
            Criado por: <span style={{ color: '#ffffff', fontWeight: '600' }}>&lt;Gustavo Balsante&gt;</span>
          </div>
        </div>
      </footer>

      {/* MODAL DE CHECKOUT */}
      {motoSelecionada && (
        <ModalCheckout 
          motoSelecionada={motoSelecionada} fecharModal={fecharModal} getDetalhesMoto={getDetalhesMoto} diasAluguel={diasAluguel} setDiasAluguel={setDiasAluguel}
          calcularDataDevolucao={calcularDataDevolucao} docCondutor={docCondutor} setDocCondutor={setDocCondutor} formatarCPF={formatarCPF} etapaCheckout={etapaCheckout}
          setEtapaCheckout={setEtapaCheckout} metodoPagamento={metodoPagamento} setMetodoPagamento={setMetodoPagamento} handleCopiarPix={handleCopiarPix}
          numCartao={numCartao} setNumCartao={setNumCartao} nomeCartao={nomeCartao} setNomeCartao={setNomeCartao} validadeCartao={validadeCartao} setValidadeCartao={setValidadeCartao}
          cvvCartao={cvvCartao} setCvvCartao={setCvvCartao} handleAvancarParaPagamento={handleAvancarParaPagamento} handleFinalizarLocacaoComPagamento={handleFinalizarLocacaoComPagamento}
          carregando={carregando}
        />
      )}

      {/* NOTIFICAÇÃO FLUTUANTE LUXO */}
      {notificacao && (
        <div style={{ 
          position: 'fixed', bottom: '35px', right: '35px', 
          backgroundColor: notificacao.tipo === 'sucesso' ? '#10B981' : '#f43f5e', 
          color: notificacao.tipo === 'sucesso' ? '#000000' : '#ffffff', padding: '18px 32px', borderRadius: '12px', 
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)', zIndex: 9999, 
          fontWeight: '700', fontSize: '15px', display: 'flex', 
          alignItems: 'center', gap: '14px', borderLeft: '6px solid rgba(0,0,0,0.15)',
          animation: 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both'
        }}>
          <span>{notificacao.tipo === 'sucesso' ? '🏆' : '🔴'}</span>
          <span>{notificacao.messaging}</span>
        </div>
      )}

    </div>
  );
}

export default App;