import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';

/**
 * NfeXmlParserService — Parses NF-e (modelo 55) XML files.
 *
 * Input: XML string from NF-e
 * Output: Structured NfeParsedData with emitter, items, taxes, totals
 *
 * Handles namespaces, both <nfeProc> and <NFe> root elements.
 * Validates that destinatario.cnpj matches the restaurant's CNPJ.
 */

export interface NfeParsedItem {
  sequencia: number;
  descricao: string;
  ncm: string;
  cfop: string;
  quantidade: number;
  unidade: string;
  valor_unitario: number;
  valor_total: number;
  codigo_produto?: string;
}

export interface NfeParsedData {
  emitente: {
    cnpj: string;
    razao_social: string;
    nome_fantasia?: string;
    uf?: string;
  };
  destinatario: {
    cnpj: string;
  };
  numero_nfe: number;
  serie: number;
  chave_acesso: string;
  data_emissao: string;
  valor_total: number;
  items: NfeParsedItem[];
}

@Injectable()
export class NfeXmlParserService {
  private readonly logger = new Logger(NfeXmlParserService.name);
  private readonly parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      removeNSPrefix: true,
      parseTagValue: true,
      parseAttributeValue: true,
      trimValues: true,
    });
  }

  /**
   * Parse NF-e XML string into structured data.
   * Supports both <nfeProc> and <NFe> root elements.
   */
  parse(xmlContent: string): NfeParsedData {
    try {
      const parsed = this.parser.parse(xmlContent);

      // Navigate to infNFe — handles both nfeProc and NFe roots
      const nfeProc = parsed.nfeProc || parsed;
      const nfe = nfeProc.NFe || nfeProc;
      const infNFe = nfe.infNFe;

      if (!infNFe) {
        throw new BadRequestException('XML inválido: elemento infNFe não encontrado');
      }

      // Extract identification (ide)
      const ide = infNFe.ide || {};
      const numero_nfe = Number(ide.nNF) || 0;
      const serie = Number(ide.serie) || 0;
      const data_emissao = ide.dhEmi || ide.dEmi || '';

      // Extract access key from protNFe or infNFe attribute
      let chave_acesso = '';
      if (nfeProc.protNFe?.infProt?.chNFe) {
        chave_acesso = String(nfeProc.protNFe.infProt.chNFe);
      } else if (infNFe['@_Id']) {
        chave_acesso = String(infNFe['@_Id']).replace('NFe', '');
      }

      // Extract emitter (emit)
      const emit = infNFe.emit || {};
      const emitente = {
        cnpj: String(emit.CNPJ || '').padStart(14, '0'),
        razao_social: emit.xNome || '',
        nome_fantasia: emit.xFant || undefined,
        uf: emit.enderEmit?.UF || undefined,
      };

      // Extract recipient (dest)
      const dest = infNFe.dest || {};
      const destinatario = {
        cnpj: String(dest.CNPJ || '').padStart(14, '0'),
      };

      // Extract items (det — can be array or single object)
      const detArray = Array.isArray(infNFe.det) ? infNFe.det : [infNFe.det].filter(Boolean);

      const items: NfeParsedItem[] = detArray.map((det: any) => {
        const prod = det.prod || {};
        return {
          sequencia: Number(det['@_nItem']) || 0,
          descricao: prod.xProd || '',
          ncm: String(prod.NCM || ''),
          cfop: String(prod.CFOP || ''),
          quantidade: Number(prod.qCom || prod.qTrib || 0),
          unidade: String(prod.uCom || prod.uTrib || 'UN'),
          valor_unitario: Number(prod.vUnCom || prod.vUnTrib || 0),
          valor_total: Number(prod.vProd || 0),
          codigo_produto: prod.cProd ? String(prod.cProd) : undefined,
        };
      });

      // Extract totals
      const total = infNFe.total?.ICMSTot || {};
      const valor_total = Number(total.vNF || total.vProd || 0);

      const result: NfeParsedData = {
        emitente,
        destinatario,
        numero_nfe,
        serie,
        chave_acesso,
        data_emissao: typeof data_emissao === 'string' ? data_emissao.split('T')[0] : '',
        valor_total,
        items,
      };

      this.logger.log(
        `NF-e parsed: emitente=${emitente.razao_social}, ` +
          `nfe=${numero_nfe}/${serie}, items=${items.length}, ` +
          `total=R$${valor_total.toFixed(2)}`,
      );

      return result;
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      const error = err as Error;
      this.logger.error(`NF-e XML parsing failed: ${error.message}`);
      throw new BadRequestException(`Falha ao parsear XML da NF-e: ${error.message}`);
    }
  }

  /**
   * Validate that the NF-e is addressed to the correct restaurant.
   */
  validateDestinatario(parsed: NfeParsedData, restaurantCnpj: string): void {
    const destCnpj = parsed.destinatario.cnpj.replace(/\D/g, '');
    const expectedCnpj = restaurantCnpj.replace(/\D/g, '');

    if (destCnpj !== expectedCnpj) {
      throw new BadRequestException(
        `NF-e destinada ao CNPJ ${destCnpj}, mas o restaurante tem CNPJ ${expectedCnpj}`,
      );
    }
  }
}
