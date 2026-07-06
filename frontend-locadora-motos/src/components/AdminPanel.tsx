import React from 'react';
import type { Moto } from '../types';

interface AdminPanelProps {
  metricas: { total_motos: number; ativos: number; faturamento_total: number } | null;
  alugueisAtivosGlobais: any[];
  motos: Moto[];
  motoEmEdicao: Moto | null;
  setMotoEmEdicao: React.Dispatch<React.SetStateAction<Moto | null>>;
  novaMarca: string; setNovaMarca: (v: string) => void;
  novoModelo: string; setNovoModelo: (v: string) => void;
  novoPrecoDiaria: string; setNovoPrecoDiaria: (v: string) => void;
  novoTipo: string; setNovoTipo: (v: string) => void;
  novoCc: string; setNovoCc: (v: string) => void;
  novoCv: string; setNovoCv: (v: string) => void;
  novoTorque: string; setNovoTorque: (v: string) => void;
  setNovaImagem: (f: File | null) => void;
  handleCadastrarMoto: (e: React.FormEvent) => void;
  activarModoEdicao: (moto: Moto) => void;
}

export function AdminPanel({
  metricas, alugueisAtivosGlobais, motos, motoEmEdicao, setMotoEmEdicao,
  novaMarca, setNovaMarca, novoModelo, setNovoModelo, novoPrecoDiaria, setNovoPrecoDiaria,
  novoTipo, setNovoTipo, novoCc, setNovoCc, novoCv, setNovoCv, novoTorque, setNovoTorque,
  setNovaImagem, handleCadastrarMoto, activarModoEdicao
}: AdminPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <div>
        <h2 style={{ color: '#fff', marginBottom: '20px' }}>Métricas Operacionais</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div style={{ backgroundColor: '#202024', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #00b37e' }}>
            <span style={{ color: '#8d8d99', fontSize: '12px', fontWeight: 'bold' }}>🏍️ TOTAL DA FROTA</span>
            <strong style={{ display: 'block', color: '#fff', fontSize: '28px', marginTop: '5px' }}>{metricas?.total_motos || 0} Máquinas</strong>
          </div>
          <div style={{ backgroundColor: '#202024', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #00b37e' }}>
            <span style={{ color: '#8d8d99', fontSize: '12px', fontWeight: 'bold' }}>🏁 ALUGUÉIS ATIVOS</span>
            <strong style={{ display: 'block', color: '#00b37e', fontSize: '28px', marginTop: '5px' }}>{metricas?.ativos || 0} Em Pista</strong>
          </div>
          <div style={{ backgroundColor: '#202024', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #00b37e' }}>
            <span style={{ color: '#8d8d99', fontSize: '12px', fontWeight: 'bold' }}>💰 FATURAMENTO TOTAL</span>
            <strong style={{ display: 'block', color: '#fff', fontSize: '28px', marginTop: '5px', fontFamily: 'monospace' }}>R$ {Number(metricas?.faturamento_total || 0).toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#202024', padding: '35px', borderRadius: '8px', border: motoEmEdicao ? '1px solid #00b37e' : '1px solid #29292e', maxWidth: '700px' }}>
        <h3 style={{ color: '#fff', fontSize: '22px', marginBottom: '5px' }}>{motoEmEdicao ? `✍️ Editando: ${motoEmEdicao.marca} ${motoEmEdicao.modelo}` : 'Incluir Nova Máquina na Frota'}</h3>
        <p style={{ color: '#8d8d99', fontSize: '14px', marginBottom: '25px' }}>{motoEmEdicao ? 'Modifique os dados técnicos ou troque a imagem real da moto.' : 'Preencha as informações operacionais abaixo.'}</p>
        
        <form onSubmit={handleCadastrarMoto} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#c4c4cc', fontSize: '14px', fontWeight: 'bold' }}>Marca:</label>
              <input required type="text" placeholder="Ex: BMW" value={novaMarca} onChange={e => setNovaMarca(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #29292e', backgroundColor: '#121214', color: '#fff' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#c4c4cc', fontSize: '14px', fontWeight: 'bold' }}>Modelo:</label>
              <input required type="text" placeholder="Ex: S1000RR" value={novoModelo} onChange={e => setNovoModelo(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #29292e', backgroundColor: '#121214', color: '#fff' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#c4c4cc', fontSize: '14px', fontWeight: 'bold' }}>Diária (R$):</label>
              <input required type="number" placeholder="Ex: 400" value={novoPrecoDiaria} onChange={e => setNovoPrecoDiaria(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #29292e', backgroundColor: '#121214', color: '#fff' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#c4c4cc', fontSize: '14px', fontWeight: 'bold' }}>Categoria/Tipo:</label>
              <input type="text" placeholder="Ex: Superesportiva" value={novoTipo} onChange={e => setNovoTipo(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #29292e', backgroundColor: '#121214', color: '#fff' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#c4c4cc', fontSize: '14px', fontWeight: 'bold' }}>Cilindrada (cc):</label>
              <input type="text" placeholder="Ex: 999 cc" value={novoCc} onChange={e => setNovoCc(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #29292e', backgroundColor: '#121214', color: '#fff' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#c4c4cc', fontSize: '14px', fontWeight: 'bold' }}>Potência (cv):</label>
              <input type="text" placeholder="Ex: 207 cv" value={novoCv} onChange={e => setNovoCv(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #29292e', backgroundColor: '#121214', color: '#fff' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#c4c4cc', fontSize: '14px', fontWeight: 'bold' }}>Torque:</label>
              <input type="text" placeholder="Ex: 11.5 kgfm" value={novoTorque} onChange={e => setNovoTorque(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #29292e', backgroundColor: '#121214', color: '#fff' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#c4c4cc', fontSize: '14px', fontWeight: 'bold' }}>📸 Foto da Máquina (Deixe em branco para manter a atual):</label>
            <input id="input-foto" type="file" accept="image/*" onChange={e => setNovaImagem(e.target.files ? e.target.files[0] : null)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #29292e', backgroundColor: '#121214', color: '#fff' }} />
          </div>
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button type="submit" style={{ flex: 1, padding: '14px', backgroundColor: '#00b37e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>{motoEmEdicao ? '💾 Salvar Alterações' : '🚀 Adicionar Veículo'}</button>
            {motoEmEdicao && (
              <button type="button" onClick={() => { setMotoEmEdicao(null); setNovoModelo(''); setNovaMarca(''); setNovoPrecoDiaria(''); setNovoCc(''); setNovoCv(''); setNovoTorque(''); setNovoTipo(''); }} style={{ padding: '14px', backgroundColor: '#29292e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h3 style={{ fontSize: '22px', color: '#fff', marginBottom: '5px', borderLeft: '4px solid #00b37e', paddingLeft: '10px' }}>Monitoramento de Pista (Locações Ativas)</h3>
        <p style={{ color: '#8d8d99', fontSize: '14px', marginBottom: '20px' }}>Controle global e faturamento das máquinas operando nas ruas.</p>
        {alugueisAtivosGlobais.length === 0 ? (
          <div style={{ padding: '30px', backgroundColor: '#202024', borderRadius: '8px', textAlign: 'center', border: '1px dashed #29292e' }}><p style={{ color: '#8d8d99', margin: 0, fontStyle: 'italic' }}>Nenhuma máquina em pista no momento. Frota recolhida.</p></div>
        ) : (
          <div style={{ overflowX: 'auto', backgroundColor: '#202024', borderRadius: '8px', border: '1px solid #29292e' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #29292e', backgroundColor: '#121214' }}>
                  <th style={{ padding: '15px', color: '#8d8d99' }}>ID / MOTO</th>
                  <th style={{ padding: '15px', color: '#8d8d99' }}>PILOTO (CLIENTE)</th>
                  <th style={{ padding: '15px', color: '#8d8d99' }}>CONDUTOR (CPF)</th>
                  <th style={{ padding: '15px', color: '#8d8d99' }}>PERÍODO</th>
                  <th style={{ padding: '15px', color: '#00b37e', fontWeight: 'bold', textAlign: 'right', fontFamily: 'monospace' }}>VALOR TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {alugueisAtivosGlobais.map((aluguel, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #29292e' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#1c1c1e'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '15px', color: '#fff' }}><strong style={{ color: '#00b37e' }}>{aluguel.marca}</strong> {aluguel.modelo}</td>
                    <td style={{ padding: '15px' }}><span style={{ display: 'block', color: '#fff', fontWeight: '500' }}>{aluguel.cliente_nome}</span><span style={{ fontSize: '12px', color: '#8d8d99' }}>{aluguel.cliente_email}</span></td>
                    <td style={{ padding: '15px', color: '#c4c4cc', fontFamily: 'monospace' }}>{aluguel.documento_condutor}</td>
                    <td style={{ padding: '15px', color: '#c4c4cc' }}><span>{aluguel.data_inicio} até {aluguel.data_fim}</span></td>
                    <td style={{ padding: '15px', color: '#00b37e', fontWeight: 'bold', textAlign: 'right', fontFamily: 'monospace' }}>R$ {Number(aluguel.valor_total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: '22px', color: '#fff', marginBottom: '5px', borderLeft: '4px solid #7c7c8a', paddingLeft: '10px' }}>Gerenciamento de Imagens e Dados da Frota</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {motos.map(m => (
            <div key={m.id} style={{ backgroundColor: '#202024', borderRadius: '8px', padding: '15px', border: '1px solid #29292e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div><strong style={{ color: '#fff', display: 'block' }}>{m.marca} {m.modelo}</strong><span style={{ fontSize: '12px', color: '#8d8d99' }}>ID: #{m.id} | R$ {Number(m.preco_diaria).toFixed(2)}</span></div>
              <button onClick={() => activarModoEdicao(m)} style={{ backgroundColor: '#29292e', color: '#00b37e', border: '1px solid #00b37e', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Editar 📸</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}