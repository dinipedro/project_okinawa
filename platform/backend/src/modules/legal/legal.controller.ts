import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { LegalService, LegalDocument, LegalContacts } from './legal.service';

@ApiTags('legal')
@Controller('legal')
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  @Get('privacy-policy')
  @Public()
  @ApiOperation({ summary: 'Get privacy policy content' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language code (pt-BR, en-US, es-ES). Defaults to pt-BR.',
    enum: ['pt-BR', 'en-US', 'es-ES'],
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the privacy policy document',
  })
  getPrivacyPolicy(@Query('lang') lang?: string): LegalDocument {
    return this.legalService.getPrivacyPolicy(lang);
  }

  @Get('versions')
  @Public()
  @ApiOperation({ summary: 'Get current versions of all legal documents' })
  @ApiResponse({
    status: 200,
    description: 'Returns current versions of terms and privacy policy',
  })
  getCurrentVersions(): { termsVersion: string; privacyVersion: string } {
    return this.legalService.getCurrentVersions();
  }

  @Get('terms-of-service')
  @Public()
  @ApiOperation({ summary: 'Get terms of service content' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language code (pt-BR, en-US, es-ES). Defaults to pt-BR.',
    enum: ['pt-BR', 'en-US', 'es-ES'],
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the terms of service document',
  })
  getTermsOfService(@Query('lang') lang?: string): LegalDocument {
    return this.legalService.getTermsOfService(lang);
  }

  @Get('contacts')
  @Public()
  @ApiOperation({ summary: 'Get official contact channels (DPO, support, legal)' })
  @ApiResponse({
    status: 200,
    description: 'Returns official contact information for LGPD and legal inquiries',
  })
  getContacts(): LegalContacts {
    return this.legalService.getContacts();
  }
}
