import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import namingConvention from 'eslint-plugin-naming-convention';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'naming-convention': namingConvention,
    },
    languageOptions: {
      parserOptions: {
        project: true, // TypeScript 프로젝트 설정을 자동으로 찾음
      },
    },
    rules: {
      // 1-5. Naming Convention
      '@typescript-eslint/naming-convention': [
        'warn',
        { selector: 'function', format: ['camelCase'] }, // 함수명 smallCamelCase
        { selector: 'class', format: ['PascalCase'] }, // 클래스명 PascalCase
        { selector: 'interface', format: ['PascalCase'] }, // 인터페이스 PascalCase
        { selector: 'typeAlias', format: ['PascalCase'] }, // 타입명 PascalCase
        // 상수명 UPPER_SNAKE_CASE (전역 상수는 필수, 지역은 선택적 허용 가능)
        {
          selector: 'variable',
          modifiers: ['const', 'global'],
          format: ['UPPER_CASE'],
        },
      ],

      // 6. 객체 구조 정의 시 인터페이스 사용
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],

      // 7. any 사용 금지
      '@typescript-eslint/no-explicit-any': 'warn',

      // Language Convention
      'no-var': 'error', // var 금지
      'prefer-const': 'error', // const 권장
      'prefer-destructuring': [
        // 객체 분해 할당 권장
        'error',
        { object: true, array: false },
      ],

      // Primitive wrapper 금지 (String, Number 등)
      '@typescript-eslint/no-wrapper-object-types': 'error',
    },
  },
  {
    // 특정 폴더 제외 설정
    ignores: ['node_modules/', 'dist/', 'build/', 'src/app.ts'],
  },
);
