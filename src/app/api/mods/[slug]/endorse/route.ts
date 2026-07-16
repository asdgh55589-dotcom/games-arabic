import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { EndorseResponse, ApiError } from '@/lib/types'

// POST /api/mods/[slug]/endorse - toggle endorsement
//
// Uses a transaction to avoid the race condition where two parallel requests
// both pass the "existing endorsement" check and both try to create one,
// which would hit the unique constraint and return a 500.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const body = await req.json().catch(() => ({}))
  const userId: string | undefined = body?.userId

  if (!userId || typeof userId !== 'string') {
    return NextResponse.json<ApiError>(
      { error: 'userId is required' },
      { status: 400 }
    )
  }

  try {
    const result = await db.$transaction(async (tx) => {
      // Ensure user exists (auto-create demo user)
      let user = await tx.user.findUnique({ where: { id: userId } })
      if (!user) {
        try {
          user = await tx.user.create({
            data: {
              id: userId,
              username: `guest_${userId.slice(-6)}`,
              email: `${userId}@guest.local`,
            },
          })
        } catch (e: unknown) {
          // Another concurrent request created this user — refetch
          user = await tx.user.findUnique({ where: { id: userId } })
          if (!user) throw e
        }
      }

      const mod = await tx.mod.findUnique({ where: { slug } })
      if (!mod) {
        return { notFound: true as const }
      }

      const existing = await tx.endorsement.findUnique({
        where: { userId_modId: { userId: user.id, modId: mod.id } },
      })

      if (existing) {
        // Toggle off
        await tx.endorsement.delete({ where: { id: existing.id } })
        const updated = await tx.mod.update({
          where: { id: mod.id },
          data: { endorsements: { decrement: 1 } },
          select: { endorsements: true },
        })
        return {
          notFound: false as const,
          endorsed: false,
          endorsements: updated.endorsements,
        }
      } else {
        // Toggle on — create may fail with P2002 if a concurrent request
        // already created it. Let the transaction roll back in that case.
        await tx.endorsement.create({
          data: { userId: user.id, modId: mod.id, value: 'up' },
        })
        const updated = await tx.mod.update({
          where: { id: mod.id },
          data: { endorsements: { increment: 1 } },
          select: { endorsements: true },
        })
        return {
          notFound: false as const,
          endorsed: true,
          endorsements: updated.endorsements,
        }
      }
    })

    if ('notFound' in result && result.notFound) {
      return NextResponse.json<ApiError>(
        { error: 'Mod not found' },
        { status: 404 }
      )
    }

    return NextResponse.json<EndorseResponse>({
      endorsed: result.endorsed,
      endorsements: result.endorsements,
    })
  } catch (err: unknown) {
    // P2002 = unique constraint violation (concurrent endorse). The endorsement
    // already exists, so we treat it as already-endorsed and refetch the real
    // count from the DB (the transaction was rolled back so we can't trust any
    // count from inside it).
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      const freshMod = await db.mod.findUnique({
        where: { slug },
        select: { endorsements: true },
      })
      return NextResponse.json<EndorseResponse>(
        { endorsed: true, endorsements: freshMod?.endorsements ?? 0 },
        { status: 200 }
      )
    }
    console.error('[endorse] failed:', err)
    return NextResponse.json<ApiError>(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
