import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { isSupabaseConfigured, testSupabaseConnection } from '../server/config/supabase';
import { SupabaseRepository } from '../server/db/supabaseRepository';

dotenv.config();

async function main() {
  console.log('=====================================================');
  console.log('Muhammad Akram Portfolio — Supabase Migration Utility');
  console.log('=====================================================');

  if (!isSupabaseConfigured()) {
    console.error('❌ [ERROR] Supabase credentials not found in environment.');
    console.error('Please configure SUPABASE_URL and SUPABASE_SECRET_KEY in your .env or Render dashboard.');
    process.exit(1);
  }

  console.log('Testing connection to Supabase...');
  const testConn = await testSupabaseConnection();
  if (!testConn.success) {
    console.error(`❌ [ERROR] Supabase connection failed: ${testConn.message}`);
    process.exit(1);
  }
  console.log(`✅ ${testConn.message}`);

  const repo = new SupabaseRepository();
  const dbDir = path.resolve(process.cwd(), 'data', 'db');

  // 1. Migrate Published Portfolio
  const publishedPath = path.join(dbDir, 'published.json');
  if (fs.existsSync(publishedPath)) {
    try {
      console.log('Importing published portfolio data into Supabase...');
      const publishedData = JSON.parse(fs.readFileSync(publishedPath, 'utf-8'));
      await repo.savePublished(publishedData, 'migration_runner');
      console.log(`✅ Published portfolio imported successfully (v${publishedData.version || 1}).`);
    } catch (pubErr: any) {
      console.error('⚠️ Warning importing published data:', pubErr.message || pubErr);
    }
  }

  // 2. Migrate Draft Portfolio
  const draftPath = path.join(dbDir, 'draft.json');
  if (fs.existsSync(draftPath)) {
    try {
      console.log('Importing working draft portfolio data into Supabase...');
      const draftData = JSON.parse(fs.readFileSync(draftPath, 'utf-8'));
      await repo.saveDraft(draftData, 'migration_runner');
      console.log(`✅ Draft portfolio imported successfully.`);
    } catch (draftErr: any) {
      console.error('⚠️ Warning importing draft data:', draftErr.message || draftErr);
    }
  }

  // 3. Migrate Version History
  const versionsPath = path.join(dbDir, 'versions.json');
  if (fs.existsSync(versionsPath)) {
    try {
      console.log('Importing historical snapshots into version_history...');
      const versions = JSON.parse(fs.readFileSync(versionsPath, 'utf-8'));
      if (Array.isArray(versions)) {
        for (const v of versions) {
          try {
            await repo.addVersion(v);
          } catch (vErr) {
            // Ignore duplicates
          }
        }
        console.log(`✅ ${versions.length} version history records processed.`);
      }
    } catch (vErr: any) {
      console.error('⚠️ Warning importing versions:', vErr.message || vErr);
    }
  }

  // 4. Migrate Media Vault
  const mediaPath = path.join(dbDir, 'media.json');
  if (fs.existsSync(mediaPath)) {
    try {
      console.log('Importing media library records into Supabase media table...');
      const mediaList = JSON.parse(fs.readFileSync(mediaPath, 'utf-8'));
      if (Array.isArray(mediaList)) {
        for (const m of mediaList) {
          try {
            await repo.addMediaItem(m);
          } catch (mErr) {
            // Ignore duplicates
          }
        }
        console.log(`✅ ${mediaList.length} media records imported.`);
      }
    } catch (mErr: any) {
      console.error('⚠️ Warning importing media library:', mErr.message || mErr);
    }
  }

  console.log('=====================================================');
  console.log('🎉 Migration completed successfully!');
  console.log('=====================================================');
}

main().catch((err) => {
  console.error('Fatal error executing Supabase migration:', err);
  process.exit(1);
});
