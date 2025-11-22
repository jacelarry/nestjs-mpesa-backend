import { Test, TestingModule } from '@nestjs/testing';
import { MpesaController } from './mpesa.controller';
import { MpesaService } from './mpesa.service';
import { ApiKeyGuard } from '../common/api-key.guard';
import { ExecutionContext } from '@nestjs/common';

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
};

