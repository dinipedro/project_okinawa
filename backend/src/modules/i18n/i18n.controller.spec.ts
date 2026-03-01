import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { I18nController } from './i18n.controller';
import { I18nService } from 'nestjs-i18n';

describe('I18nController', () => {
  let controller: I18nController;
  let i18nService: jest.Mocked<I18nService>;

  beforeEach(async () => {
    const mockI18nService = {
      translate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [I18nController],
      providers: [{ provide: I18nService, useValue: mockI18nService }],
    }).compile();

    controller = module.get<I18nController>(I18nController);
    i18nService = module.get(I18nService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSupportedLanguages', () => {
    it('should return list of supported languages with default', () => {
      const result = controller.getSupportedLanguages();

      expect(result.languages).toBeDefined();
      expect(result.languages.length).toBeGreaterThan(0);
      expect(result.default).toBe('pt');

      // Check structure
      const ptLang = result.languages.find((l) => l.code === 'pt');
      expect(ptLang).toBeDefined();
      expect(ptLang?.name).toBe('Portuguese');
      expect(ptLang?.nativeName).toBe('Português');
    });

    it('should include pt, en, and es languages', () => {
      const result = controller.getSupportedLanguages();
      const codes = result.languages.map((l) => l.code);

      expect(codes).toContain('pt');
      expect(codes).toContain('en');
      expect(codes).toContain('es');
    });
  });

  describe('getTranslations', () => {
    it('should return translations for valid language', () => {
      i18nService.translate.mockReturnValue({ hello: 'Olá' });

      const result = controller.getTranslations('pt');

      expect(result.language).toBe('pt');
      expect(result.translations).toBeDefined();
    });

    it('should throw BadRequestException for unsupported language', () => {
      expect(() => controller.getTranslations('fr')).toThrow(BadRequestException);
    });

    it('should return empty object for namespace that fails to load', () => {
      i18nService.translate.mockImplementation((namespace: string) => {
        if (namespace === 'common') return { test: 'value' };
        throw new Error('Namespace not found');
      });

      const result = controller.getTranslations('pt');

      expect(result.translations.common).toEqual({ test: 'value' });
    });
  });

  describe('getNamespaceTranslations', () => {
    it('should return translations for specific namespace', () => {
      i18nService.translate.mockReturnValue({ welcome: 'Bem-vindo' });

      const result = controller.getNamespaceTranslations('pt', 'auth');

      expect(result.language).toBe('pt');
      expect(result.namespace).toBe('auth');
      expect(result.translations).toEqual({ welcome: 'Bem-vindo' });
    });

    it('should throw BadRequestException for unsupported language', () => {
      expect(() => controller.getNamespaceTranslations('de', 'common')).toThrow(BadRequestException);
    });

    it('should return empty object when namespace not found', () => {
      i18nService.translate.mockImplementation(() => {
        throw new Error('Namespace not found');
      });

      const result = controller.getNamespaceTranslations('pt', 'nonexistent');

      expect(result.translations).toEqual({});
    });
  });

  describe('getCurrentLanguage', () => {
    it('should return the language from request', () => {
      const result = controller.getCurrentLanguage('en');

      expect(result.language).toBe('en');
    });

    it('should handle default language', () => {
      const result = controller.getCurrentLanguage('pt');

      expect(result.language).toBe('pt');
    });
  });
});
