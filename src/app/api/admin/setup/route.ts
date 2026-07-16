import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

const OWNER_USERNAME = 'GADMIx'
const OWNER_EMAIL = 'owner@games-arabic.com'
const OWNER_PASSWORD = 'GA@dm!n2026#S3cure'

export async function POST() {
  try {
    const existingUser = await db.user.findFirst({
      where: { role: 'owner' },
    })

    if (existingUser) {
      return NextResponse.json({ message: 'Owner account already exists' })
    }

    const passwordHash = await hashPassword(OWNER_PASSWORD)

    await db.user.create({
      data: {
        username: OWNER_USERNAME,
        email: OWNER_EMAIL,
        password: passwordHash,
        role: 'owner',
        bio: 'مالك و مؤسس منصة ألعاب بالعربي',
        joinedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Owner account created',
      credentials: {
        username: OWNER_USERNAME,
        password: OWNER_PASSWORD,
      },
    })
  } catch (err) {
    console.error('[setup] failed:', err)
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}
