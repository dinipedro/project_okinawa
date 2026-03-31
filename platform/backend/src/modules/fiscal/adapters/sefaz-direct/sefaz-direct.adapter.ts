import { Injectable, NotImplementedException } from '@nestjs/common';
import {
  FiscalAdapter,
  EmitNfceParams,
  FiscalEmissionResult,
  FiscalCancelResult,
  FiscalConsultResult,
} from '../../interfaces/fiscal-adapter.interface';

/**
 * Adapter for direct SEFAZ webservice communication.
 * PHASE 2 -- implement when volume justifies (50+ restaurants, 150k+ invoices/month).
 *
 * This adapter replaces Focus NFe and does everything internally:
 * 1. Builds NFC-e XML per MOC layout (Manual de Orientacao do Contribuinte)
 * 2. Signs XML with restaurant's A1 digital certificate (stored encrypted)
 * 3. Transmits to SEFAZ webservice by state (URL per UF)
 * 4. Processes return (authorization or rejection)
 * 5. Manages offline contingency (contingency emission, retransmission)
 *
 * Additional dependencies (install when implementing):
 * - xml2js or fast-xml-parser (build/parse XML)
 * - node-forge or xml-crypto (digital signature)
 * - SEFAZ URL map by UF (sefaz-urls.config.ts)
 *
 * Cost per invoice: R$ 0.00 (server infrastructure only)
 * Complexity: high (XML signing, certificates, contingency, 27 UFs)
 *
 * FOR NOW: this file is a placeholder. Implement in Phase 2.
 */
@Injectable()
export class SefazDirectAdapter implements FiscalAdapter {
  readonly provider = 'sefaz_direct' as const;

  async emitNfce(
    _params: EmitNfceParams,
  ): Promise<FiscalEmissionResult> {
    throw new NotImplementedException(
      'SEFAZ Direct adapter will be implemented in Phase 2. Use Focus NFe adapter.',
    );
  }

  async cancelNfce(
    _accessKey: string,
    _reason: string,
  ): Promise<FiscalCancelResult> {
    throw new NotImplementedException('Phase 2');
  }

  async consultNfce(_accessKey: string): Promise<FiscalConsultResult> {
    throw new NotImplementedException('Phase 2');
  }

  async invalidateRange(
    _series: number,
    _start: number,
    _end: number,
    _reason: string,
  ): Promise<void> {
    throw new NotImplementedException('Phase 2');
  }
}
