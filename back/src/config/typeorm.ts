import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { registerAs } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';

// 1) Buscar .env en lugares típicos (incluye src/.env como dijiste)
const candidates = [
  path.resolve(process.cwd(), 'src/.env'),      // ✅ donde vos lo tenés
  path.resolve(process.cwd(), '.env'),          // raíz del proyecto
  path.resolve(__dirname, '../.env'),           // si este archivo está en src/config, esto apunta a src/.env
  path.resolve(__dirname, '../../.env'),        // raíz desde src/config
  path.resolve(__dirname, './.env'),            // por si lo mueven junto a este archivo
];
const envPath = candidates.find(p => fs.existsSync(p));

if (!envPath) {
  throw new Error(
    `No encontré archivo .env. Probé:\n${candidates.map(p => ' - ' + p).join('\n')}\n` +
    `Colocá tu .env en "src/.env" o ajustá la lista de rutas.`
  );
}

// 2) Cargar .env y pisar variables del sistema
dotenvConfig({ path: envPath, override: true });

// 3) Tomar variables (forzando tipos)
const DB_HOST = String(process.env.DB_HOST ?? '').trim();
const DB_PORT = Number(process.env.DB_PORT) || 5432;
const DB_USERNAME = String(process.env.DB_USERNAME ?? '').trim();
const DB_PASSWORD = String(process.env.DB_PASSWORD ?? '').trim();
const DB_NAME = String(process.env.DB_NAME ?? '').trim();

// 4) Log de diagnóstico claro
console.log('== DB VARS ==', {
  envPath,
  DB_HOST: DB_HOST || '(vacío)',
  DB_PORT,
  DB_USERNAME: DB_USERNAME || '(vacío)',
  DB_NAME: DB_NAME || '(vacío)',
  hasPassword: !!DB_PASSWORD,
});

// 5) Validación temprana (evita que caiga en usuario del SO "Natalia")
if (!DB_HOST || !DB_USERNAME || !DB_PASSWORD || !DB_NAME) {
  throw new Error(`Faltan variables de DB en ${envPath} (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME)`);
}

// 6) Globs de entidades (sin migraciones)
const isTsRuntime = __filename.endsWith('.ts');
const entitiesGlob = isTsRuntime
  ? path.join(process.cwd(), 'src/**/*.entity.ts')     // nest start (TS)
  : path.join(process.cwd(), 'dist/**/*.entity.js');   // node dist/main.js (JS)

// 7) Config TypeORM (sin autoLoadEntities aquí; eso va en AppModule)
const config: DataSourceOptions = {
  type: 'postgres',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: true,   // solo desarrollo
  logging: true,
  entities: [entitiesGlob],
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config);
