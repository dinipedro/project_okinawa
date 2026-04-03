import { FC, useState } from 'react';
import { ChevronLeft, FileText, Upload, Shield, AlertCircle, CheckCircle2, Settings } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

export const FiscalSetupScreen: FC = () => {
  const { navigate } = useMobilePreview();
  const [nfce, setNfce] = useState(true);
  const [sat, setSat] = useState(false);
  const [activeSection, setActiveSection] = useState<'dados' | 'certificado' | 'cfop' | 'nfce'>('dados');

  const cfopList = [
    { code: '5.102', desc: 'Venda de mercadoria adquirida', usage: 'Vendas gerais' },
    { code: '5.405', desc: 'Venda de mercadoria em operação com substituição tributária', usage: 'Itens com ST' },
    { code: '5.933', desc: 'Prestação de serviço tributado pelo ISSQN', usage: 'Taxa de serviço' },
    { code: '5.949', desc: 'Outra saída de mercadoria não especificada', usage: 'Cortesias / Perdas' },
  ];

  const sections = [
    { key: 'dados' as const, label: 'Dados Fiscais', icon: FileText },
    { key: 'certificado' as const, label: 'Certificado', icon: Shield },
    { key: 'cfop' as const, label: 'CFOP', icon: Settings },
    { key: 'nfce' as const, label: 'NFC-e/SAT', icon: FileText },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-4 pt-4 pb-3 bg-card border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('restaurant-dashboard')} className="p-2 -ml-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Configuração Fiscal</h1>
            <p className="text-xs text-muted-foreground">NFC-e, certificados e impostos</p>
          </div>
        </div>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {sections.map(s => (
            <button key={s.key} onClick={() => setActiveSection(s.key)} className={`flex-1 py-2 rounded-lg text-[10px] font-medium ${activeSection === s.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>{s.label}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeSection === 'dados' && (
          <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
            <h3 className="font-semibold text-foreground">Dados da Empresa</h3>
            {[
              { l: 'Razão Social', v: 'Bistrô Noowe LTDA' },
              { l: 'Nome Fantasia', v: 'Bistrô Noowe' },
              { l: 'CNPJ', v: '12.345.678/0001-90' },
              { l: 'Inscrição Estadual', v: '123.456.789.000' },
              { l: 'Inscrição Municipal', v: '987.654.321' },
              { l: 'Regime Tributário', v: 'Simples Nacional', select: true },
            ].map(f => (
              <div key={f.l}>
                <label className="text-xs text-muted-foreground">{f.l}</label>
                {f.select ? (
                  <select defaultValue={f.v} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground">
                    <option>Simples Nacional</option>
                    <option>Lucro Presumido</option>
                    <option>Lucro Real</option>
                    <option>MEI</option>
                  </select>
                ) : (
                  <input defaultValue={f.v} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground" />
                )}
              </div>
            ))}
            <div>
              <label className="text-xs text-muted-foreground">Endereço Fiscal</label>
              <textarea defaultValue="Rua das Flores, 123 - Centro - São Paulo/SP - CEP 01001-000" rows={2} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground resize-none" />
            </div>
            <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Salvar Dados</button>
          </div>
        )}

        {activeSection === 'certificado' && (
          <>
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-3">Certificado Digital A1</h3>
              <div className="p-4 rounded-xl border-2 border-dashed border-border bg-muted flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-xs text-muted-foreground text-center">Arraste ou clique para enviar<br />o certificado digital (.pfx)</p>
                <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium">Selecionar Arquivo</button>
              </div>
            </div>

            <div className="bg-success/5 rounded-2xl border border-success/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <p className="text-sm font-semibold text-foreground">Certificado Ativo</p>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Emitido para:</span><span className="text-foreground">Bistrô Noowe LTDA</span></div>
                <div className="flex justify-between"><span>Validade:</span><span className="text-foreground">15/12/2025</span></div>
                <div className="flex justify-between"><span>Certificadora:</span><span className="text-foreground">AC Serasa</span></div>
                <div className="flex justify-between"><span>Tipo:</span><span className="text-foreground">A1 (Arquivo)</span></div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-warning/10 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-xs text-warning">Certificado vence em 253 dias. Renove com antecedência para evitar interrupções.</p>
            </div>
          </>
        )}

        {activeSection === 'cfop' && (
          <>
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-3">CFOPs Configurados</h3>
              <div className="space-y-2">
                {cfopList.map(c => (
                  <div key={c.code} className="p-3 rounded-xl bg-muted">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-primary">{c.code}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{c.usage}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
              <h3 className="font-semibold text-foreground">Adicionar CFOP</h3>
              <div>
                <label className="text-xs text-muted-foreground">Código CFOP</label>
                <input placeholder="Ex: 5.102" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Uso</label>
                <input placeholder="Ex: Vendas gerais" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground" />
              </div>
              <button className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold">Adicionar</button>
            </div>
          </>
        )}

        {activeSection === 'nfce' && (
          <>
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex justify-between items-center mb-4">
                <div><p className="font-semibold text-foreground">Emissão NFC-e</p><p className="text-xs text-muted-foreground">Nota fiscal ao consumidor</p></div>
                <button onClick={() => setNfce(!nfce)} className={`w-12 h-6 rounded-full transition-colors relative ${nfce ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${nfce ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
              {nfce && (
                <div className="space-y-3 pt-3 border-t border-border/50">
                  <div>
                    <label className="text-xs text-muted-foreground">Série NFC-e</label>
                    <input defaultValue="1" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Ambiente</label>
                    <select defaultValue="production" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground">
                      <option value="production">Produção</option>
                      <option value="homologation">Homologação</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">CSC (Código de Segurança)</label>
                    <input defaultValue="••••••••" type="password" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">ID Token CSC</label>
                    <input defaultValue="000001" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground" />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex justify-between items-center">
                <div><p className="font-semibold text-foreground">SAT Fiscal</p><p className="text-xs text-muted-foreground">Equipamento SAT (SP)</p></div>
                <button onClick={() => setSat(!sat)} className={`w-12 h-6 rounded-full transition-colors relative ${sat ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${sat ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-2">Status do Serviço</h3>
              <div className="space-y-2">
                {[
                  { l: 'SEFAZ', status: 'online' },
                  { l: 'Contingência', status: 'standby' },
                  { l: 'Último envio', status: '14:32 - Sucesso' },
                  { l: 'Notas emitidas hoje', status: '47' },
                ].map(s => (
                  <div key={s.l} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{s.l}</span>
                    <span className={`font-medium ${s.status === 'online' ? 'text-success' : 'text-foreground'}`}>{s.status === 'online' ? '● Online' : s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};