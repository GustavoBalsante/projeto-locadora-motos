import React from 'react';
import type { Moto } from '../types';

interface ModalCheckoutProps {
  motoSelecionada: Moto;
  fecharModal: () => void;
  getDetalhesMoto: (modelo: string) => any;
  diasAluguel: number;
  setDiasAluguel: React.Dispatch<React.SetStateAction<number>>;
  calcularDataDevolucao: (dias: number) => string;
  docCondutor: string;
  setDocCondutor: React.Dispatch<React.SetStateAction<string>>;
  formatarCPF: (v: string) => string;
  etapaCheckout: 'dados' | 'pagamento';
  setEtapaCheckout: React.Dispatch<React.SetStateAction<'dados' | 'pagamento'>>;
  metodoPagamento: 'pix' | 'cartao';
  setMetodoPagamento: React.Dispatch<React.SetStateAction<'pix' | 'cartao'>>;
  handleCopiarPix: () => void;
  numCartao: string; setNumCartao: (v: string) => void;
  nomeCartao: string; setNomeCartao: (v: string) => void;
  validadeCartao: string; setValidadeCartao: (v: string) => void;
  cvvCartao: string; setCvvCartao: (v: string) => void;
  handleAvancarParaPagamento: () => void;
  handleFinalizarLocacaoComPagamento: (moto: Moto) => void;
  carregando: boolean;
}

export function ModalCheckout({
  motoSelecionada, fecharModal, getDetalhesMoto, diasAluguel, setDiasAluguel,
  calcularDataDevolucao, docCondutor, setDocCondutor, formatarCPF, etapaCheckout,
  setEtapaCheckout, metodoPagamento, setMetodoPagamento, handleCopiarPix,
  numCartao, setNumCartao, nomeCartao, setNomeCartao, validadeCartao, setValidadeCartao,
  cvvCartao, setCvvCartao, handleAvancarParaPagamento, handleFinalizarLocacaoComPagamento,
  carregando
}: ModalCheckoutProps) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 10, 12, 0.85)', backdropFilter: 'blur(8px)', zIndex: 100, padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: '#1c1c1e', borderRadius: '12px', width: '100%', maxWidth: '850px', display: 'flex', overflow: 'hidden', position: 'relative', border: '1px solid #2c2c2e', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
        
        <button onClick={fecharModal} style={{ position: 'absolute', top: '20px', right: '20px', background: '#2c2c2e', border: 'none', color: '#a8a8b3', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2, fontSize: '14px' }}>✕</button>

        <div style={{ flex: 1, backgroundImage: `url(${motoSelecionada.imagem ? `http://localhost:3000${motoSelecionada.imagem}` : getDetalhesMoto(motoSelecionada.modelo).img})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '480px' }} />
        
        <div style={{ flex: 1, padding: '35px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          {etapaCheckout === 'dados' && (
            <div>
              <span style={{ color: '#00b37e', fontWeight: 'bold', fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{motoSelecionada.marca}</span>
              <h2 style={{ margin: '5px 0 20px', fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>{motoSelecionada.modelo}</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {[
                  { label: '⚡ CATEGORIA', value: motoSelecionada.tipo || getDetalhesMoto(motoSelecionada.modelo).tipo, highlight: false },
                  { label: '🔥 CILINDRADA', value: motoSelecionada.cc || getDetalhesMoto(motoSelecionada.modelo).cc, highlight: true },
                  { label: '🐎 POTÊNCIA', value: motoSelecionada.cv || getDetalhesMoto(motoSelecionada.modelo).cv, highlight: true },
                  { label: '⚙️ TORQUE', value: motoSelecionada.torque || getDetalhesMoto(motoSelecionada.modelo).torque, highlight: false }
                ].map((spec, i) => (
                  <div key={i} style={{ backgroundColor: '#121214', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #00b37e' }}>
                    <span style={{ color: '#7c7c8a', fontSize: '9px', fontWeight: 'bold', display: 'block' }}>{spec.label}</span>
                    <strong style={{ display: 'block', color: spec.highlight ? '#00b37e' : '#fff', fontSize: '14px', marginTop: '2px' }}>{spec.value}</strong>
                  </div>
                ))}
              </div>

              <div style={{ backgroundColor: '#121214', padding: '14px', borderRadius: '8px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <label style={{ color: '#c4c4cc', fontSize: '14px', fontWeight: '600' }}>🗓️ Dias de Aluguel:</label>
                  <input type="number" min="1" value={diasAluguel} onChange={e => setDiasAluguel(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: '65px', padding: '6px', borderRadius: '4px', border: '1px solid #29292e', backgroundColor: '#1c1c1e', color: '#fff', textAlign: 'center', fontSize: '15px', fontWeight: 'bold' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8d8d99' }}>
                  <span>Retirada: <strong style={{ color: '#fff' }}>{new Date().toLocaleDateString('pt-BR')}</strong></span>
                  <span>Devolução: <strong style={{ color: '#00b37e' }}>{calcularDataDevolucao(diasAluguel)}</strong></span>
                </div>
              </div>

              <div>
                <label style={{ color: '#c4c4cc', fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>🪪 CPF do Condutor:</label>
                <input type="text" placeholder="000.000.000-00" maxLength={14} value={docCondutor} onChange={e => setDocCondutor(formatarCPF(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #29292e', backgroundColor: '#121214', color: '#fff', fontSize: '14px', outline: 'none' }} />
              </div>
            </div>
          )}

          {etapaCheckout === 'pagamento' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <span style={{ color: '#8d8d99', fontSize: '12px', fontWeight: 'bold' }}>PASSO FINAL</span>
                <h3 style={{ color: '#fff', fontSize: '24px', margin: '4px 0 0' }}>Selecione a Forma de Pagamento</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', backgroundColor: '#121214', padding: '4px', borderRadius: '6px' }}>
                <button onClick={() => setMetodoPagamento('pix')} style={{ padding: '10px', border: 'none', borderRadius: '4px', color: '#fff', fontWeight: 'bold', backgroundColor: metodoPagamento === 'pix' ? '#202024' : 'transparent', borderBottom: metodoPagamento === 'pix' ? '2px solid #00b37e' : 'none', cursor: 'pointer' }}>📱 Pix Imediato</button>
                <button onClick={() => setMetodoPagamento('cartao')} style={{ padding: '10px', border: 'none', borderRadius: '4px', color: '#fff', fontWeight: 'bold', backgroundColor: metodoPagamento === 'cartao' ? '#202024' : 'transparent', borderBottom: metodoPagamento === 'cartao' ? '2px solid #00b37e' : 'none', cursor: 'pointer' }}>💳 Cartão de Crédito</button>
              </div>

              {metodoPagamento === 'pix' && (
                <div style={{ textAlign: 'center', backgroundColor: '#121214', padding: '20px', borderRadius: '8px', border: '1px solid #29292e' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>📱</div>
                  <h4 style={{ color: '#fff', margin: '0 0 5px' }}>Pague via Pix em segundos</h4>
                  <p style={{ color: '#8d8d99', fontSize: '12px', margin: '0 0 15px' }}>O código vence em 10 minutos. A aprovação é processada instantaneamente.</p>
                  <button type="button" onClick={handleCopiarPix} style={{ width: '100%', padding: '10px', backgroundColor: '#202024', color: '#00b37e', border: '1px solid #00b37e', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>📋 Copiar Código Pix Copia e Cola</button>
                </div>
              )}

              {metodoPagamento === 'cartao' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ color: '#c4c4cc', fontSize: '12px', fontWeight: 'bold' }}>Número do Cartão:</label>
                    <input type="text" placeholder="4444 5555 6666 7777" maxLength={19} value={numCartao} onChange={e => setNumCartao(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #29292e', backgroundColor: '#121214', color: '#fff', fontSize: '14px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ color: '#c4c4cc', fontSize: '12px', fontWeight: 'bold' }}>Nome do Titular (Igual no Cartão):</label>
                    <input type="text" placeholder="EX: BALSANTE MOTOS" value={nomeCartao} onChange={e => setNomeCartao(e.target.value.toUpperCase())} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #29292e', backgroundColor: '#121214', color: '#fff', fontSize: '14px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ color: '#c4c4cc', fontSize: '12px', fontWeight: 'bold' }}>Validade:</label>
                      <input type="text" placeholder="MM/AA" maxLength={5} value={validadeCartao} onChange={e => setValidadeCartao(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #29292e', backgroundColor: '#121214', color: '#fff', fontSize: '14px', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ color: '#c4c4cc', fontSize: '12px', fontWeight: 'bold' }}>CVV:</label>
                      <input type="password" placeholder="123" maxLength={3} value={cvvCartao} onChange={e => setCvvCartao(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #29292e', backgroundColor: '#121214', color: '#fff', fontSize: '14px', outline: 'none' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ paddingTop: '20px', borderTop: '1px solid #2c2c2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
            <div>
              <span style={{ color: '#8d8d99', fontSize: '12px', display: 'block' }}>TOTAL DA LOCAÇÃO</span>
              <h3 style={{ margin: 0, fontSize: '28px', color: '#00b37e', fontWeight: 'bold' }}>R$ {(Number(motoSelecionada.preco_diaria) * diasAluguel).toFixed(2)}</h3>
            </div>

            {etapaCheckout === 'dados' ? (
              <button 
                onClick={handleAvancarParaPagamento}
                disabled={motoSelecionada.disponivel === 0}
                style={{ padding: '14px 24px', backgroundColor: motoSelecionada.disponivel ? '#00b37e' : '#2c2c2e', color: motoSelecionada.disponivel ? '#fff' : '#7c7c8a', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: motoSelecionada.disponivel ? 'pointer' : 'not-allowed' }}
              >
                {motoSelecionada.disponivel ? 'Ir para Pagamento 💳' : 'Indisponível'}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setEtapaCheckout('dados')} style={{ padding: '14px', backgroundColor: '#29292e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Voltar</button>
                <button 
                  onClick={() => handleFinalizarLocacaoComPagamento(motoSelecionada)}
                  disabled={carregando}
                  style={{ padding: '14px 24px', backgroundColor: '#00b37e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
                >
                  {carregando ? 'Liquidando... ⚙️' : 'Pagar e Confirmar 🏁'}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}