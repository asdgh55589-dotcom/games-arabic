import { db } from '../src/lib/db'

async function main() {
  const cols = await db.$queryRaw`PRAGMA table_info(Mod)`
  console.log('Mod columns:')
  for (const c of cols as any[]) {
    console.log(`  ${c.name} (${c.type})`)
  }
  const count = await db.mod.count()
  console.log('mod count:', count)
  if (count > 0) {
    const first = await db.mod.findFirst()
    console.log('first mod keys:', Object.keys(first || {}))
    console.log('has series?', (first as any)?.series !== undefined)
    console.log('has translationType?', (first as any)?.translationType !== undefined)
  }
}

main().catch(console.error).finally(() => db.$disconnect())
