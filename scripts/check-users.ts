import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'
async function check() {
  const users = await db.user.findMany({ select: { username: true, email: true, password: true, role: true } })
  for (const u of users) {
    const match = u.password ? await bcrypt.compare('admin123', u.password) : false
    console.log(`- ${u.username} | role: ${u.role} | has password: ${!!u.password} | admin123 matches: ${match}`)
  }
}
check().finally(() => process.exit(0))
